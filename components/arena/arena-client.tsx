'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Stage = 'lobby' | 'name' | 'camera-check' | 'queuing';

interface ArenaClientProps {
  user: { id: string; email?: string; name?: string } | null;
}

// ── Camera Check ─────────────────────────────────────────────────────────────

function CameraCheck({ onPass, onBack }: { onPass: () => void; onBack: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camStatus, setCamStatus] = useState<'requesting' | 'ok' | 'denied'>('requesting');
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamStatus('ok');
        // Simulate scan progress
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

    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

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
      {/* Header */}
      <div className="text-center">
        <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.3em] mb-1">STEP 2 OF 2</p>
        <h2 className="font-sans font-black text-white text-2xl tracking-tight">Camera Check</h2>
        <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.15em] mt-1">MAKE SURE YOUR FULL OUTFIT IS VISIBLE</p>
      </div>

      {/* Camera feed */}
      <div className="relative rounded-2xl overflow-hidden border border-[rgba(255,241,234,0.1)] bg-[#0C0C0E] aspect-[3/4]">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />

        {/* Scan line animation */}
        {camStatus === 'ok' && !done && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(147,51,234,0.8), transparent)',
                top: `${progress}%`,
                boxShadow: '0 0 12px rgba(147,51,234,0.6)',
                transition: 'top 0.2s ease',
              }}
            />
          </div>
        )}

        {/* Done overlay */}
        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(0,0,0,0.65)' }}>
            <div className="w-14 h-14 rounded-2xl border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.1)] flex items-center justify-center">
              <span className="text-[#4ADE80] text-2xl font-bold">✓</span>
            </div>
            <p className="font-mono text-[11px] text-[#4ADE80] tracking-[0.2em] font-bold">OUTFIT DETECTED</p>
          </div>
        )}

        {/* Corner brackets */}
        {['tl','tr','bl','br'].map(c => (
          <div key={c} className={`absolute w-6 h-6 pointer-events-none ${c.includes('t') ? 'top-2' : 'bottom-2'} ${c.includes('l') ? 'left-2' : 'right-2'}`}
            style={{
              borderTop: c.includes('t') ? '2px solid rgba(147,51,234,0.5)' : 'none',
              borderBottom: c.includes('b') ? '2px solid rgba(147,51,234,0.5)' : 'none',
              borderLeft: c.includes('l') ? '2px solid rgba(147,51,234,0.5)' : 'none',
              borderRight: c.includes('r') ? '2px solid rgba(147,51,234,0.5)' : 'none',
              borderRadius: c === 'tl' ? '4px 0 0 0' : c === 'tr' ? '0 4px 0 0' : c === 'bl' ? '0 0 0 4px' : '0 0 4px 0',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="h-1 rounded-full bg-[rgba(255,241,234,0.06)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-200"
            style={{ width: `${progress}%`, background: done ? '#4ADE80' : 'linear-gradient(to right, rgba(147,51,234,0.8), rgba(88,28,235,0.8))' }} />
        </div>
        <div className="flex justify-between">
          {steps.map((s, i) => (
            <span key={s} className="font-mono text-[9px] tracking-[0.2em]"
              style={{ color: i <= stepIndex ? (done ? '#4ADE80' : '#A78BFA') : '#3A3632' }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {done && (
        <button onClick={onPass}
          className="w-full py-4 rounded-full font-mono text-[12px] font-bold tracking-[0.18em] text-[#080809] bg-white hover:opacity-90 transition-opacity"
          style={{ boxShadow: '0 0 24px rgba(255,255,255,0.2)' }}>
          FIND OPPONENT →
        </button>
      )}

      <button onClick={onBack} className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] underline text-center transition-colors">
        cancel
      </button>
    </div>
  );
}

// ── Main Arena Client ────────────────────────────────────────────────────────

export function ArenaClient({ user }: ArenaClientProps) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('lobby');
  const [name, setName] = useState(
    user?.name?.split(' ')[0] || user?.email?.split('@')[0] || ''
  );
  const [queueId, setQueueId] = useState<string | null>(null);
  const [queueSeconds, setQueueSeconds] = useState(0);
  const supabase = createClient();
  const queueTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const leaveQueue = useCallback(async (id: string | null) => {
    if (!id) return;
    await fetch('/api/arena/queue', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queueId: id }),
    });
  }, []);

  // Cleanup on unmount
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

    if (data.matchId) {
      router.push(`/arena/${data.matchId}?role=${data.role}&name=${encodeURIComponent(name.trim())}`);
      return;
    }

    if (data.queueId) {
      setQueueId(data.queueId);
      setStage('queuing');
      setQueueSeconds(0);

      // Timer for queue time display
      queueTimerRef.current = setInterval(() => setQueueSeconds(s => s + 1), 1000);

      // Subscribe to arena_matches inserts for player1 (this user)
      const channel = supabase
        .channel(`queue-watch-${data.queueId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'arena_matches',
          filter: `player1_id=eq.${user.id}`,
        }, (payload) => {
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

  // ── QUEUING ────────────────────────────────────────────────────────────────
  if (stage === 'queuing') {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.3em]">MATCHMAKING</p>
          <h2 className="font-sans font-black text-white text-3xl tracking-tight">Finding Opponent...</h2>
        </div>
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-[rgba(147,51,234,0.15)]" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[rgba(147,51,234,0.8)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border border-[rgba(147,51,234,0.1)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[11px] text-[#6B4FA0] font-bold">{queueSeconds}s</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.12em]">Playing as <span className="text-[#A78BFA]">{name}</span></p>
          <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.1em]">Make sure your full outfit is visible when matched</p>
        </div>
        <button onClick={cancelQueue}
          className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] underline transition-colors">
          cancel
        </button>
      </div>
    );
  }

  // ── CAMERA CHECK ───────────────────────────────────────────────────────────
  if (stage === 'camera-check') {
    return <CameraCheck onPass={joinQueue} onBack={() => setStage('name')} />;
  }

  // ── NAME MODAL ─────────────────────────────────────────────────────────────
  if (stage === 'name') {
    return (
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">⚔️</span>
          <h2 className="font-sans font-black text-white text-2xl tracking-tight">Enter Your Name</h2>
          <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.15em]">THIS IS WHAT YOUR OPPONENT SEES</p>
        </div>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="YOUR NAME"
            maxLength={20}
            className="w-full rounded-2xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-4 font-mono text-[14px] text-[#F5F1EA] placeholder-[#3A3632] outline-none focus:border-[rgba(255,241,234,0.25)] text-center tracking-[0.2em] transition-colors"
          />
          <button
            onClick={() => { if (name.trim()) setStage('camera-check'); }}
            disabled={!name.trim()}
            className="w-full py-4 rounded-full font-mono text-[12px] font-bold tracking-[0.18em] text-[#080809] bg-white disabled:opacity-30 hover:opacity-90 transition-opacity"
            style={{ boxShadow: name.trim() ? '0 0 24px rgba(255,255,255,0.2)' : 'none' }}
          >
            LET'S GO →
          </button>
        </div>
        <button onClick={() => setStage('lobby')}
          className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] underline text-center transition-colors">
          back
        </button>
      </div>
    );
  }

  // ── LOBBY ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.35em]">LIVE MODE</p>
        <h1 className="font-sans font-black text-white leading-none tracking-tight"
          style={{ fontSize: 'clamp(48px, 12vw, 96px)', textShadow: '0 0 50px rgba(147,51,234,0.4), 0 0 100px rgba(147,51,234,0.15)' }}>
          ARENA
        </h1>
        <p className="font-sans text-[#4A4742] text-sm">Live 1v1 fit battles. Get MOGGED or get MOGGING.</p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* 1V1 Arena */}
        <button
          onClick={() => { if (!user) { router.push('/auth?next=/arena'); return; } setStage('name'); }}
          className="relative col-span-2 sm:col-span-1 flex flex-col gap-4 rounded-2xl border p-6 text-left transition-all hover:border-[rgba(147,51,234,0.4)] hover:bg-[rgba(147,51,234,0.05)] group"
          style={{ borderColor: 'rgba(147,51,234,0.25)', background: 'rgba(147,51,234,0.06)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">⚔️</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              <span className="font-mono text-[8px] text-[#4ADE80] tracking-[0.15em]">LIVE</span>
            </div>
          </div>
          <div>
            <p className="font-sans font-black text-white text-xl tracking-tight">1V1 ARENA</p>
            <p className="font-mono text-[10px] text-[#6B4FA0] tracking-[0.12em] mt-0.5">RANDOM MATCHMAKING</p>
          </div>
          <p className="font-sans text-[#8A8680] text-[12px] leading-relaxed">
            Get matched with a stranger. Both fits scanned. One walks away MOGGED.
          </p>
          <div className="font-mono text-[10px] text-[#A78BFA] tracking-[0.14em] group-hover:translate-x-0.5 transition-transform">
            {user ? 'ENTER ARENA →' : 'SIGN IN TO PLAY →'}
          </div>
        </button>

        {/* Private Room */}
        <Link href="/battle"
          className="flex flex-col gap-3 rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.02)] p-5 text-left transition-all hover:border-[rgba(255,241,234,0.15)] hover:bg-[rgba(255,241,234,0.04)]">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-sans font-black text-white text-base tracking-tight">PRIVATE ROOM</p>
            <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.12em] mt-0.5">CHALLENGE A FRIEND</p>
          </div>
          <p className="font-sans text-[#5A5450] text-[11px] leading-relaxed">Send a battle link. No waiting in queue.</p>
        </Link>

        {/* Leaderboard */}
        <Link href="/leaderboard"
          className="flex flex-col gap-3 rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.02)] p-5 text-left transition-all hover:border-[rgba(255,241,234,0.15)] hover:bg-[rgba(255,241,234,0.04)]">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="font-sans font-black text-white text-base tracking-tight">LEADERBOARD</p>
            <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.12em] mt-0.5">TOP 100 MOGGERS</p>
          </div>
          <p className="font-sans text-[#5A5450] text-[11px] leading-relaxed">The highest auras on the planet.</p>
        </Link>
      </div>

      {!user && (
        <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.15em] text-center">
          <Link href="/auth?next=/arena" className="text-[#A78BFA] hover:text-white underline transition-colors">Sign in</Link>
          {' '}to play live arena
        </p>
      )}
    </div>
  );
}
