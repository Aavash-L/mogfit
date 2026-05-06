'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getRank, getRankProgress } from '@/lib/arena-rank';

type Stage = 'lobby' | 'name' | 'camera-check' | 'queuing';

interface RankData {
  elo: number;
  wins: number;
  losses: number;
  ties: number;
  globalRank: number;
}

interface ArenaClientProps {
  user: { id: string; email?: string; name?: string } | null;
  rankData: RankData | null;
  onlineCount: number;
}

// ── Rank Card (compact) ──────────────────────────────────────────────────────

function RankCard({ rankData, displayName }: { rankData: RankData; displayName: string }) {
  const rank = getRank(rankData.elo);
  const { progress, eloNeeded, nextRank } = getRankProgress(rankData.elo);

  return (
    <div className="w-full max-w-lg rounded-2xl border p-4 flex flex-col gap-3"
      style={{ borderColor: rank.borderColor, background: `linear-gradient(135deg, ${rank.glow} 0%, rgba(12,12,14,0.95) 60%)` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: rank.color }} />
          <span className="font-mono text-[9px] tracking-[0.2em]" style={{ color: rank.color }}>
            {displayName.toUpperCase()} #{rankData.globalRank}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] font-bold tracking-[0.14em]" style={{ color: rank.color }}>{rank.name}</span>
          <span className="font-mono text-[9px] text-[#4A4742]">·</span>
          <span className="font-mono text-[9px] text-[#6B6460]">{rankData.elo} ELO</span>
          <span className="font-mono text-[9px] text-[#4A4742]">·</span>
          <span className="font-mono text-[9px] text-[#6B6460]">{rankData.wins}W {rankData.losses}L</span>
        </div>
      </div>
      {nextRank && (
        <div className="flex flex-col gap-1">
          <div className="h-1 rounded-full bg-[rgba(255,241,234,0.06)] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(to right, ${rank.color}80, ${rank.color})` }} />
          </div>
          <p className="font-mono text-[8px] text-[#3A3632] text-right tracking-[0.15em]">{eloNeeded} ELO TO {nextRank.name}</p>
        </div>
      )}
    </div>
  );
}

// ── Camera Check ─────────────────────────────────────────────────────────────

function CameraCheck({ onPass, onBack }: { onPass: () => Promise<void>; onBack: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camStatus, setCamStatus] = useState<'requesting' | 'ok' | 'denied'>('requesting');
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamStatus('ok');
        let p = 0;
        const interval = setInterval(() => {
          p += Math.random() * 18 + 6;
          if (p >= 100) {
            p = 100;
            clearInterval(interval);
            setTimeout(() => setDone(true), 400);
          }
          setProgress(Math.min(p, 100));
        }, 200);
      })
      .catch(() => setCamStatus('denied'));
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  async function handleFindOpponent() {
    setLoading(true);
    setError('');
    // Stop camera so match room can open it fresh
    streamRef.current?.getTracks().forEach(t => t.stop());
    try {
      await onPass();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
      // Re-open camera on error
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }).then(s => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      });
    }
  }

  const steps = ['ALIGN', 'SCAN', 'READY'];
  const stepIndex = progress < 40 ? 0 : progress < 80 ? 1 : 2;

  if (camStatus === 'denied') {
    return (
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <p className="font-sans font-black text-white text-xl">Camera blocked</p>
        <p className="font-sans text-[#8A8680] text-sm">Enable camera access in your browser settings, then try again.</p>
        <button onClick={onBack} className="font-mono text-[11px] text-[#8A8680] hover:text-white underline">go back</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-5">
      <div className="text-center">
        <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.3em] mb-1">STEP 2 OF 2</p>
        <h2 className="font-sans font-black text-white text-2xl tracking-tight">Camera Check</h2>
        <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.15em] mt-1">MAKE SURE YOUR FULL OUTFIT IS VISIBLE</p>
      </div>

      {/* Camera feed */}
      <div className="relative rounded-2xl overflow-hidden border border-[rgba(255,241,234,0.1)] bg-[#0C0C0E] aspect-[3/4]">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />

        {/* Scan line */}
        {camStatus === 'ok' && !done && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(to right, transparent, rgba(74,222,128,0.9), transparent)', top: `${progress}%`, boxShadow: '0 0 12px rgba(74,222,128,0.7)', transition: 'top 0.2s ease' }} />
          </div>
        )}

        {/* Done overlay */}
        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(0,0,0,0.55)' }}>
            <div className="w-14 h-14 rounded-2xl border border-[rgba(74,222,128,0.4)] bg-[rgba(74,222,128,0.15)] flex items-center justify-center">
              <span className="text-[#4ADE80] text-2xl font-bold">✓</span>
            </div>
            <p className="font-mono text-[11px] text-[#4ADE80] tracking-[0.2em] font-bold">OUTFIT DETECTED</p>
          </div>
        )}

        {/* Corner brackets */}
        {['tl','tr','bl','br'].map(c => (
          <div key={c} className={`absolute w-6 h-6 pointer-events-none ${c.includes('t') ? 'top-2' : 'bottom-2'} ${c.includes('l') ? 'left-2' : 'right-2'}`}
            style={{ borderTop: c.includes('t') ? '2px solid rgba(147,51,234,0.6)' : 'none', borderBottom: c.includes('b') ? '2px solid rgba(147,51,234,0.6)' : 'none', borderLeft: c.includes('l') ? '2px solid rgba(147,51,234,0.6)' : 'none', borderRight: c.includes('r') ? '2px solid rgba(147,51,234,0.6)' : 'none', borderRadius: c === 'tl' ? '4px 0 0 0' : c === 'tr' ? '0 4px 0 0' : c === 'bl' ? '0 0 0 4px' : '0 0 4px 0' }} />
        ))}
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="h-1 rounded-full bg-[rgba(255,241,234,0.06)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-200"
            style={{ width: `${progress}%`, background: done ? '#4ADE80' : 'linear-gradient(to right, #4ADE80, #22C55E)' }} />
        </div>
        <div className="flex justify-between">
          {steps.map((s, i) => (
            <span key={s} className="font-mono text-[9px] tracking-[0.2em]"
              style={{ color: i <= stepIndex ? (done ? '#4ADE80' : '#86EFAC') : '#3A3632' }}>{s}</span>
          ))}
        </div>
      </div>

      {error && <p className="font-mono text-[11px] text-[#EF4444] text-center">{error}</p>}

      {done && (
        <button
          onClick={handleFindOpponent}
          disabled={loading}
          className="w-full py-4 rounded-full font-mono text-[12px] font-bold tracking-[0.18em] text-[#080809] bg-white disabled:opacity-60 hover:opacity-90 transition-opacity"
          style={{ boxShadow: '0 0 24px rgba(255,255,255,0.2)' }}
        >
          {loading ? 'FINDING OPPONENT...' : 'FIND OPPONENT →'}
        </button>
      )}

      <button onClick={onBack} className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] underline text-center transition-colors">cancel</button>
    </div>
  );
}

// ── Main Arena Client ────────────────────────────────────────────────────────

export function ArenaClient({ user, rankData, onlineCount }: ArenaClientProps) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('lobby');
  const [name, setName] = useState(user?.name?.split(' ')[0] || user?.email?.split('@')[0] || '');
  const [queueId, setQueueId] = useState<string | null>(null);
  const [queueSeconds, setQueueSeconds] = useState(0);
  const supabase = createClient();
  const queueTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const leaveQueue = useCallback(async (id: string | null) => {
    if (!id) return;
    await fetch('/api/arena/queue', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ queueId: id }) });
  }, []);

  useEffect(() => {
    return () => {
      if (queueId) leaveQueue(queueId);
      if (queueTimerRef.current) clearInterval(queueTimerRef.current);
      channelRef.current?.unsubscribe();
    };
  }, [queueId, leaveQueue]);

  async function joinQueue() {
    if (!user) { router.push('/auth?next=/arena'); return; }
    const res = await fetch('/api/arena/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: name.trim() }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to join queue');

    if (data.matchId) {
      router.push(`/arena/${data.matchId}?role=${data.role}&name=${encodeURIComponent(name.trim())}`);
      return;
    }

    if (data.queueId) {
      setQueueId(data.queueId);
      setStage('queuing');
      setQueueSeconds(0);
      queueTimerRef.current = setInterval(() => setQueueSeconds(s => s + 1), 1000);

      const channel = supabase.channel(`queue-watch-${data.queueId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'arena_matches', filter: `player1_id=eq.${user.id}` }, (payload) => {
          const match = payload.new as { id: string };
          if (queueTimerRef.current) clearInterval(queueTimerRef.current);
          router.push(`/arena/${match.id}?role=player1&name=${encodeURIComponent(name.trim())}`);
        })
        .subscribe();
      channelRef.current = channel;
    }
  }

  async function cancelQueue() {
    await leaveQueue(queueId);
    setQueueId(null);
    if (queueTimerRef.current) clearInterval(queueTimerRef.current);
    channelRef.current?.unsubscribe();
    setStage('lobby');
  }

  const displayName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'YOU';
  const rank = rankData ? getRank(rankData.elo) : null;

  // ── QUEUING ──────────────────────────────────────────────────────────────
  if (stage === 'queuing') {
    return (
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
        <div className="flex flex-col items-center gap-2">
          <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.3em]">MATCHMAKING</p>
          <h2 className="font-sans font-black text-white text-3xl tracking-tight">Finding Opponent...</h2>
        </div>
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-[rgba(147,51,234,0.15)]" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[rgba(147,51,234,0.8)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[11px] text-[#6B4FA0] font-bold">{queueSeconds}s</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.12em]">Playing as <span className="text-[#A78BFA]">{name}</span></p>
          {rank && <p className="font-mono text-[9px] tracking-[0.12em]" style={{ color: rank.color }}>{rank.name} · {rankData?.elo} ELO</p>}
          <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.1em] mt-1">Make sure your full outfit is visible when matched</p>
        </div>
        <button onClick={cancelQueue} className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] underline transition-colors">cancel</button>
      </div>
    );
  }

  // ── CAMERA CHECK ──────────────────────────────────────────────────────────
  if (stage === 'camera-check') {
    return <CameraCheck onPass={joinQueue} onBack={() => setStage('name')} />;
  }

  // ── NAME MODAL ────────────────────────────────────────────────────────────
  if (stage === 'name') {
    return (
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">⚔️</span>
          <h2 className="font-sans font-black text-white text-2xl tracking-tight">Enter Your Name</h2>
          <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.15em]">THIS IS WHAT YOUR OPPONENT SEES</p>
        </div>
        <div className="flex flex-col gap-3">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="YOUR NAME" maxLength={20}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setStage('camera-check'); }}
            className="w-full rounded-2xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-4 font-mono text-[14px] text-[#F5F1EA] placeholder-[#3A3632] outline-none focus:border-[rgba(255,241,234,0.25)] text-center tracking-[0.2em] transition-colors" />
          <button onClick={() => { if (name.trim()) setStage('camera-check'); }} disabled={!name.trim()}
            className="w-full py-4 rounded-full font-mono text-[12px] font-bold tracking-[0.18em] text-[#080809] bg-white disabled:opacity-30 hover:opacity-90 transition-opacity"
            style={{ boxShadow: name.trim() ? '0 0 24px rgba(255,255,255,0.2)' : 'none' }}>
            LET'S GO →
          </button>
        </div>
        <button onClick={() => setStage('lobby')} className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] underline text-center transition-colors">back</button>
      </div>
    );
  }

  // ── LOBBY (Omoggle-inspired) ───────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-6 text-center">

      {/* Top badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse" />
        <span className="font-mono text-[9px] text-[#8A8680] tracking-[0.25em]">LIVE 1V1 MOG ARENA</span>
      </div>

      {/* Big title */}
      <h1 className="font-sans font-black text-white leading-none tracking-tight"
        style={{ fontSize: 'clamp(64px, 18vw, 128px)', textShadow: '0 0 60px rgba(255,255,255,0.25), 0 0 120px rgba(147,51,234,0.2)' }}>
        MOGFIT
      </h1>

      {/* Online pill */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.05)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
        <span className="font-mono text-[9px] text-[#4ADE80] tracking-[0.2em]">{onlineCount} ONLINE</span>
      </div>

      {/* Rank card (logged in) */}
      {rankData && (
        <RankCard rankData={rankData} displayName={displayName} />
      )}

      {/* Main action card */}
      <div className="w-full rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.03)] p-8 flex flex-col items-center gap-5">
        <span className="text-4xl">⚔️</span>
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-sans font-black text-white text-2xl sm:text-3xl tracking-tight">ENTER THE ARENA</h2>
          <button
            onClick={() => { if (!user) { router.push('/auth?next=/arena'); return; } setStage('name'); }}
            className="font-mono text-[11px] tracking-[0.2em] transition-all hover:opacity-70"
            style={{ color: '#A78BFA' }}
          >
            {user ? 'START CAMERA CHECK →' : 'SIGN IN TO PLAY →'}
          </button>
        </div>
        <p className="font-sans text-[#3A3632] text-[11px] leading-relaxed max-w-xs">
          By entering the arena you agree to our{' '}
          <Link href="/terms" className="text-[#4A4742] hover:text-[#8A8680] underline transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#4A4742] hover:text-[#8A8680] underline transition-colors">Privacy Policy</Link>
        </p>
      </div>

      {/* 3 Steps */}
      <div className="w-full grid grid-cols-3 gap-2">
        {[
          { n: '1', label: 'CAMERA CHECK', desc: 'Quick camera check to get started.' },
          { n: '2', label: 'AURA SCAN', desc: 'AI scans your fit and scores it.' },
          { n: '3', label: 'COMPETE & CLIMB', desc: 'Win matches, earn ELO, climb ranks.' },
        ].map((step, i) => (
          <div key={step.n} className="relative flex flex-col gap-2 rounded-xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] p-3.5 text-left">
            {i < 2 && (
              <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#3A3632] z-10">›</span>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[rgba(255,241,234,0.08)] flex items-center justify-center font-mono text-[8px] text-[#6B6460]">{step.n}</span>
            </div>
            <p className="font-mono text-[8px] text-[#F5F1EA] tracking-[0.15em] font-bold">{step.label}</p>
            <p className="font-sans text-[#4A4742] text-[10px] leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom links */}
      <div className="w-full grid grid-cols-2 gap-3">
        <Link href="/leaderboard"
          className="flex items-center gap-3 rounded-xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] px-4 py-3.5 text-left hover:border-[rgba(255,241,234,0.14)] hover:bg-[rgba(255,241,234,0.04)] transition-all group">
          <span className="text-xl">🏆</span>
          <div className="flex flex-col gap-0.5 flex-1">
            <p className="font-mono text-[9px] text-[#F5F1EA] tracking-[0.18em] font-bold">VIEW LEADERBOARD</p>
            <p className="font-sans text-[#4A4742] text-[10px]">Top players and rankings.</p>
          </div>
          <span className="font-mono text-[10px] text-[#3A3632] group-hover:text-[#6B6460] transition-colors">›</span>
        </Link>
        <Link href="/how-it-works"
          className="flex items-center gap-3 rounded-xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] px-4 py-3.5 text-left hover:border-[rgba(255,241,234,0.14)] hover:bg-[rgba(255,241,234,0.04)] transition-all group">
          <span className="text-xl">📖</span>
          <div className="flex flex-col gap-0.5 flex-1">
            <p className="font-mono text-[9px] text-[#F5F1EA] tracking-[0.18em] font-bold">HOW IT WORKS</p>
            <p className="font-sans text-[#4A4742] text-[10px]">Credits, scoring, ranks.</p>
          </div>
          <span className="font-mono text-[10px] text-[#3A3632] group-hover:text-[#6B6460] transition-colors">›</span>
        </Link>
      </div>

      {/* Footer note */}
      <p className="font-mono text-[8px] text-[#2A2826] tracking-[0.15em]">
        AI-POWERED FIT SCANNER · FOR ENTERTAINMENT · NOT PROFESSIONAL STYLE ADVICE
      </p>
    </div>
  );
}
