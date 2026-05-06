'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type Stage = 'connecting' | 'ready' | 'countdown' | 'scanning' | 'reveal';

interface MatchRoomProps {
  matchId: string;
  role: 'player1' | 'player2';
  myName: string;
  opponentName: string;
}

interface RevealResult {
  myScore: number;
  myArchetype: string;
  opponentScore: number;
  opponentArchetype: string;
  outcome: 'mogged' | 'chud' | 'tie';
}

export function MatchRoom({ matchId, role, myName, opponentName }: MatchRoomProps) {
  const [stage, setStage] = useState<Stage>('connecting');
  const [countdown, setCountdown] = useState(3);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [iAmReady, setIAmReady] = useState(false);
  const [reveal, setReveal] = useState<RevealResult | null>(null);
  const [scanError, setScanError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  // Capture snapshot from video
  const captureSnapshot = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
  }, []);

  // Submit scan to API
  const submitScan = useCallback(async () => {
    const imageBase64 = captureSnapshot();
    if (!imageBase64) { setScanError('Camera snapshot failed'); return; }

    try {
      const res = await fetch('/api/arena/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, role, imageBase64, mimeType: 'image/jpeg' }),
      });
      if (!res.ok) {
        const d = await res.json();
        setScanError(d.error || 'Scan failed');
      }
    } catch {
      setScanError('Network error during scan');
    }
  }, [matchId, role, captureSnapshot]);

  useEffect(() => {
    let stopped = false;

    async function init() {
      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setScanError('Camera access denied');
        return;
      }

      const channel = supabase.channel(`arena-match-${matchId}`, {
        config: { broadcast: { ack: false } },
      });
      channelRef.current = channel;

      channel
        .on('broadcast', { event: 'connected' }, () => {
          if (!stopped) setOpponentConnected(true);
        })
        .on('broadcast', { event: 'ready' }, () => {
          if (!stopped) setOpponentReady(true);
        })
        .on('broadcast', { event: 'start-countdown' }, () => {
          if (!stopped) {
            setStage('countdown');
            let c = 3;
            setCountdown(c);
            const timer = setInterval(() => {
              c--;
              if (c <= 0) {
                clearInterval(timer);
                setStage('scanning');
                submitScan();
              } else {
                setCountdown(c);
              }
            }, 1000);
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'arena_matches',
          filter: `id=eq.${matchId}`,
        }, (payload) => {
          const m = payload.new as Record<string, unknown>;
          if (m.status === 'complete' && m.winner) {
            const myScore = role === 'player1' ? (m.player1_score as number) : (m.player2_score as number);
            const oppScore = role === 'player1' ? (m.player2_score as number) : (m.player1_score as number);
            const myArch = role === 'player1' ? (m.player1_archetype as string) : (m.player2_archetype as string);
            const oppArch = role === 'player1' ? (m.player2_archetype as string) : (m.player1_archetype as string);
            const winner = m.winner as string;
            const outcome =
              winner === 'tie' ? 'tie'
              : (winner === role) ? 'mogged'
              : 'chud';
            setReveal({ myScore, opponentScore: oppScore, myArchetype: myArch, opponentArchetype: oppArch, outcome });
            setStage('reveal');
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && !stopped) {
            channel.send({ type: 'broadcast', event: 'connected', payload: {} });
            setStage('ready');
          }
        });
    }

    init();

    return () => {
      stopped = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      channelRef.current?.unsubscribe();
    };
  }, [matchId, role, submitScan, supabase]);

  // When both ready, player1 triggers countdown
  useEffect(() => {
    if (iAmReady && opponentReady && role === 'player1') {
      channelRef.current?.send({ type: 'broadcast', event: 'start-countdown', payload: {} });
      setStage('countdown');
      let c = 3;
      setCountdown(c);
      const timer = setInterval(() => {
        c--;
        if (c <= 0) {
          clearInterval(timer);
          setStage('scanning');
          submitScan();
        } else {
          setCountdown(c);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [iAmReady, opponentReady, role, submitScan]);

  function handleReady() {
    setIAmReady(true);
    channelRef.current?.send({ type: 'broadcast', event: 'ready', payload: {} });
  }

  // ── REVEAL ──────────────────────────────────────────────────────────────────
  if (stage === 'reveal' && reveal) {
    const isMogged = reveal.outcome === 'mogged';
    const isTie = reveal.outcome === 'tie';
    return (
      <div className="fixed inset-0 bg-[#07070A] flex flex-col items-center justify-center px-6 gap-8 z-50">
        {/* Glow */}
        <div className="pointer-events-none fixed inset-0"
          style={{ background: isTie ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(147,51,234,0.15) 0%, transparent 60%)' : isMogged ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,107,0,0.18) 0%, transparent 60%)' : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(239,68,68,0.15) 0%, transparent 60%)' }} />

        <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.3em]">AURA VERDICT</p>

        {/* Big verdict */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className="font-sans font-black leading-none tracking-tight"
            style={{
              fontSize: 'clamp(72px, 22vw, 160px)',
              color: isTie ? '#A78BFA' : isMogged ? '#FF6B00' : '#EF4444',
              textShadow: isTie ? '0 0 60px rgba(167,139,250,0.5)' : isMogged ? '0 0 60px rgba(255,107,0,0.5)' : '0 0 60px rgba(239,68,68,0.5)',
            }}
          >
            {isTie ? 'TIE' : isMogged ? 'MOGGED' : 'CHUD'}
          </span>
          <p className="font-mono text-[11px] tracking-[0.2em]" style={{ color: isTie ? '#A78BFA' : isMogged ? '#FF6B00' : '#EF4444' }}>
            {isTie ? 'EQUAL AURA ENERGY' : isMogged ? 'YOU WIN THIS ROUND' : 'THEY OUT-AURAED YOU'}
          </p>
        </div>

        {/* Score comparison */}
        <div className="w-full max-w-sm flex gap-3">
          <div className="flex-1 rounded-2xl border p-4 flex flex-col gap-1 text-center"
            style={{ borderColor: isMogged ? 'rgba(255,107,0,0.25)' : 'rgba(255,241,234,0.08)', background: isMogged ? 'rgba(255,107,0,0.06)' : 'rgba(255,241,234,0.02)' }}>
            <p className="font-mono text-[8px] text-[#4A4742] tracking-[0.2em]">YOU</p>
            <p className="font-sans font-black text-3xl" style={{ color: isMogged ? '#FF6B00' : '#F5F1EA' }}>{reveal.myScore}</p>
            <p className="font-mono text-[9px] text-[#6B6460] truncate">{reveal.myArchetype}</p>
          </div>
          <div className="flex items-center">
            <span className="font-mono text-[11px] text-[#3A3632]">VS</span>
          </div>
          <div className="flex-1 rounded-2xl border p-4 flex flex-col gap-1 text-center"
            style={{ borderColor: !isMogged && !isTie ? 'rgba(255,107,0,0.25)' : 'rgba(255,241,234,0.08)', background: !isMogged && !isTie ? 'rgba(255,107,0,0.06)' : 'rgba(255,241,234,0.02)' }}>
            <p className="font-mono text-[8px] text-[#4A4742] tracking-[0.2em]">{opponentName.toUpperCase()}</p>
            <p className="font-sans font-black text-3xl" style={{ color: !isMogged && !isTie ? '#FF6B00' : '#F5F1EA' }}>{reveal.opponentScore}</p>
            <p className="font-mono text-[9px] text-[#6B6460] truncate">{reveal.opponentArchetype}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <a href="/arena"
            className="px-8 py-3 rounded-full font-mono text-[11px] font-bold tracking-[0.15em] text-[#080809] bg-white hover:opacity-90 transition-opacity">
            PLAY AGAIN →
          </a>
          <a href="/"
            className="px-8 py-3 rounded-full font-mono text-[11px] tracking-[0.15em] text-[#8A8680] border border-[rgba(255,241,234,0.1)] hover:border-[rgba(255,241,234,0.2)] transition-colors">
            HOME
          </a>
        </div>
      </div>
    );
  }

  // ── MATCH ROOM ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#07070A] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,241,234,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-[12px] h-[12px] rounded-[3px] bg-white opacity-80" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.22em] font-bold">MOGFIT</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(255,241,234,0.08)]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: stage === 'connecting' ? '#4A4742' : '#4ADE80' }} />
          <span className="font-mono text-[9px] text-[#8A8680] tracking-[0.15em]">
            {stage === 'connecting' ? 'CONNECTING' : stage === 'ready' ? 'LIVE' : stage === 'countdown' ? 'GET READY' : stage === 'scanning' ? 'SCANNING' : 'DONE'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#4A4742] tracking-[0.12em]">#{matchId}</span>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col sm:flex-row gap-3 p-4 overflow-hidden">
        {/* My camera */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-[rgba(255,241,234,0.08)] bg-[#0C0C0E] min-h-[200px]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Scan overlay during scanning */}
          {stage === 'scanning' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-[#FF6B00] animate-spin" />
              <p className="font-mono text-[11px] text-[#FF6B00] tracking-[0.2em]">SCANNING FIT...</p>
            </div>
          )}

          {/* Countdown overlay */}
          {stage === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <span className="font-sans font-black text-white" style={{ fontSize: 'clamp(80px, 20vw, 120px)', textShadow: '0 0 40px rgba(255,255,255,0.4)' }}>
                {countdown}
              </span>
            </div>
          )}

          {/* Name tag */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,241,234,0.12)' }}>
            <p className="font-mono text-[10px] text-[#F5F1EA] tracking-[0.12em] font-bold">{myName.toUpperCase()} (YOU)</p>
          </div>

          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[rgba(255,107,0,0.5)] rounded-tl pointer-events-none" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[rgba(255,107,0,0.5)] rounded-tr pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[rgba(255,107,0,0.5)] rounded-bl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[rgba(255,107,0,0.5)] rounded-br pointer-events-none" />
        </div>

        {/* VS divider */}
        <div className="flex sm:flex-col items-center justify-center gap-2 sm:px-1">
          <div className="flex-1 sm:flex-none sm:h-16 w-px sm:w-px bg-[rgba(255,241,234,0.06)]" />
          <span className="font-mono text-[11px] text-[#3A3632] font-bold tracking-[0.1em]">VS</span>
          <div className="flex-1 sm:flex-none sm:h-16 w-px sm:w-px bg-[rgba(255,241,234,0.06)]" />
        </div>

        {/* Opponent placeholder */}
        <div className="flex-1 relative rounded-2xl border min-h-[200px] flex flex-col items-center justify-center gap-4"
          style={{ borderColor: 'rgba(255,241,234,0.08)', background: '#0C0C0E' }}>

          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[rgba(147,51,234,0.4)] rounded-tl pointer-events-none" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[rgba(147,51,234,0.4)] rounded-tr pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[rgba(147,51,234,0.4)] rounded-bl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[rgba(147,51,234,0.4)] rounded-br pointer-events-none" />

          {!opponentConnected ? (
            <>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#3A3632] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <p className="font-mono text-[10px] text-[#3A3632] tracking-[0.2em]">WAITING FOR OPPONENT</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl border border-[rgba(147,51,234,0.3)] bg-[rgba(147,51,234,0.08)] flex items-center justify-center">
                <span className="font-sans font-black text-[#A78BFA] text-2xl">
                  {opponentName.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="font-mono text-[11px] text-[#F5F1EA] font-bold tracking-[0.12em]">{opponentName.toUpperCase()}</p>
                {opponentReady
                  ? <p className="font-mono text-[9px] text-[#4ADE80] tracking-[0.15em]">READY ✓</p>
                  : <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em]">CONNECTED</p>
                }
              </div>
            </>
          )}

          {/* Name tag */}
          {opponentConnected && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,241,234,0.12)' }}>
              <p className="font-mono text-[10px] text-[#F5F1EA] tracking-[0.12em] font-bold">{opponentName.toUpperCase()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-5 pb-6 pt-2 flex flex-col items-center gap-3">
        {scanError && (
          <p className="font-mono text-[11px] text-[#EF4444] text-center">{scanError}</p>
        )}

        {stage === 'connecting' && (
          <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.18em]">SETTING UP CAMERAS...</p>
        )}

        {stage === 'ready' && !iAmReady && (
          <button
            onClick={handleReady}
            disabled={!opponentConnected}
            className="px-12 py-4 rounded-full font-mono text-[12px] font-bold tracking-[0.18em] text-[#080809] bg-white disabled:opacity-30 hover:opacity-90 transition-all hover:scale-[1.02]"
            style={{ boxShadow: opponentConnected ? '0 0 30px rgba(255,255,255,0.25)' : 'none' }}
          >
            {opponentConnected ? 'I\'M READY ⚔️' : 'WAITING FOR OPPONENT...'}
          </button>
        )}

        {stage === 'ready' && iAmReady && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
              <p className="font-mono text-[11px] text-[#4ADE80] tracking-[0.15em]">YOU'RE READY</p>
            </div>
            {!opponentReady && (
              <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.15em]">WAITING FOR {opponentName.toUpperCase()}...</p>
            )}
          </div>
        )}

        {stage === 'countdown' && (
          <p className="font-mono text-[12px] text-white tracking-[0.25em] font-bold">HOLD YOUR BEST FIT POSE</p>
        )}

        {stage === 'scanning' && (
          <p className="font-mono text-[11px] text-[#FF6B00] tracking-[0.2em]">AI IS READING YOUR AURA...</p>
        )}

        <p className="font-mono text-[9px] text-[#2A2826] tracking-[0.15em]">
          MAKE SURE YOUR FULL OUTFIT IS VISIBLE
        </p>
      </div>
    </div>
  );
}
