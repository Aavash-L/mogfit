'use client';

import { useState } from 'react';
import type { AuraResult } from '@/lib/types';

interface FixResult {
  killers: string[];
  fixes: string[];
  swaps: Array<{ out: string; in: string }>;
  direction: string;
}

interface Props {
  result: AuraResult;
  encodedId: string;
  isLoggedIn: boolean;
}

export function FixMyAura({ result, encodedId, isLoggedIn }: Props) {
  const [state, setState] = useState<'locked' | 'loading' | 'unlocked' | 'error'>('locked');
  const [fix, setFix] = useState<FixResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function unlock() {
    if (!isLoggedIn) {
      window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }
    setState('loading');
    try {
      const res = await fetch('/api/fix-aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encodedId }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? 'error'); setState('error'); return; }
      setFix(data.fix);
      setState('unlocked');
    } catch {
      setErrorMsg('Network error');
      setState('error');
    }
  }

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(12,8,24,0.97) 0%, rgba(16,10,32,0.99) 100%)',
        border: '1px solid rgba(139,92,246,0.28)',
        boxShadow: state === 'unlocked'
          ? '0 0 50px -10px rgba(139,92,246,0.35), inset 0 1px 0 rgba(139,92,246,0.12)'
          : '0 0 24px -8px rgba(139,92,246,0.2), inset 0 1px 0 rgba(139,92,246,0.07)',
        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => { if (state === 'locked') (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { if (state === 'locked') (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      {/* Top glow line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.55), rgba(99,102,241,0.35), transparent)' }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[14px]">🔧</span>
            <span className="font-sans font-black text-white text-[15px] tracking-tight">Fix My Aura</span>
          </div>
          <span
            className="font-mono text-[9px] tracking-[0.18em] font-bold px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.22)', color: '#A78BFA' }}
          >
            1 CREDIT
          </span>
        </div>

        {state === 'locked' && <LockedPreview score={result.aura_score} />}
        {state === 'loading' && <LoadingState />}
        {state === 'unlocked' && fix && <UnlockedContent fix={fix} />}
        {state === 'error' && <ErrorState msg={errorMsg} onRetry={() => { setState('locked'); setErrorMsg(''); }} />}

        {state === 'locked' && (
          <button
            onClick={unlock}
            className="relative w-full h-[44px] rounded-xl font-mono text-[11px] font-bold tracking-[0.14em] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
              border: '1px solid rgba(139,92,246,0.45)',
              color: 'white',
              boxShadow: '0 0 18px -5px rgba(139,92,246,0.45)',
              transition: 'box-shadow 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px -4px rgba(139,92,246,0.65), 0 0 60px -14px rgba(99,102,241,0.4)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 18px -5px rgba(139,92,246,0.45)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <span className="relative z-10">
              {isLoggedIn ? 'Unlock Fix — 1 credit ⚡' : 'Sign in to Unlock →'}
            </span>
            <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)', animation: 'shimmer-sweep 3s infinite' }} />
          </button>
        )}
      </div>
    </div>
  );
}

function LockedPreview({ score }: { score: number }) {
  const rows = [
    { icon: '💀', label: "what's killing it" },
    { icon: '⚡', label: 'fix immediately' },
    { icon: '🔄', label: 'swap these' },
    { icon: '🧭', label: 'your direction' },
  ];

  const scoreDelta = score < 700 ? '↑ +150–200 pts possible' : score < 850 ? '↑ +80–120 pts possible' : '↑ polish your edge';

  return (
    <div className="flex flex-col gap-2">
      <p className="font-sans text-[12px] text-[#6B7280]">
        Brutally honest. What to change, what to swap, where you&apos;re heading.
      </p>
      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg"
        style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.12)' }}
      >
        <span className="font-mono text-[10px] text-[#6B7280]">score {score}</span>
        <span className="font-mono text-[10px] font-bold" style={{ color: '#A78BFA' }}>{scoreDelta}</span>
      </div>
      <div className="flex flex-col gap-1 mt-0.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[12px]">{r.icon}</span>
            <span className="font-sans text-[11px] text-[#4B5563]">{r.label}</span>
            <div className="ml-auto flex gap-1">
              {[32, 20, 28].map((w, j) => (
                <div key={j} className="rounded-full" style={{ width: w, height: 5, background: 'rgba(139,92,246,0.13)', filter: 'blur(2px)' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center py-6 gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#A78BFA', animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <p className="font-mono text-[10px] text-[#4B5563] tracking-[0.2em]">ANALYZING YOUR FIT...</p>
    </div>
  );
}

function UnlockedContent({ fix }: { fix: FixResult }) {
  return (
    <div className="flex flex-col gap-2.5" style={{ animation: 'fade-up 0.35s ease both' }}>

      {/* Killers */}
      <Row label="💀 KILLING IT">
        <div className="flex flex-wrap gap-1.5">
          {fix.killers.map((k, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg font-sans text-[11px] font-bold text-[#FCA5A5]"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.14)' }}>
              {k}
            </span>
          ))}
        </div>
      </Row>

      {/* Fixes */}
      <Row label="⚡ DO THIS">
        <div className="flex flex-col gap-1">
          {fix.fixes.map((f, i) => (
            <p key={i} className="font-sans text-[12px] text-[#86EFAC] font-semibold leading-snug">{f}</p>
          ))}
        </div>
      </Row>

      {/* Swaps */}
      <Row label="🔄 SWAP">
        <div className="flex flex-col gap-1">
          {fix.swaps.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[#EF4444] line-through opacity-55 truncate max-w-[110px]">{s.out}</span>
              <span className="font-mono text-[10px] text-[#3A3632] flex-shrink-0">→</span>
              <span className="font-mono text-[10px] text-[#86EFAC] font-bold truncate">{s.in}</span>
            </div>
          ))}
        </div>
      </Row>

      {/* Direction */}
      <div className="px-3 py-2.5 rounded-lg mt-0.5" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.14)' }}>
        <span className="font-mono text-[9px] text-[#5B4A7A] tracking-[0.18em] block mb-1">🧭 DIRECTION</span>
        <p className="font-sans text-[12px] text-[#C4B5FD] leading-snug">{fix.direction}</p>
      </div>

    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <span className="font-mono text-[9px] text-[#4A4742] tracking-[0.18em]">{label}</span>
      {children}
    </div>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  const isNoCredits = msg === 'no_credits';
  return (
    <div className="flex flex-col gap-2">
      <div className="px-3 py-2.5 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.14)' }}>
        <p className="font-mono text-[10px] text-[#FCA5A5] tracking-[0.1em]">
          {isNoCredits ? 'No credits — need 1 to unlock' : msg}
        </p>
      </div>
      <div className="flex gap-2">
        {isNoCredits && (
          <a href="/auth" className="flex-1 h-[38px] flex items-center justify-center rounded-xl font-mono text-[10px] font-bold tracking-[0.12em]"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)', color: 'white' }}>
            GET CREDITS ⚡
          </a>
        )}
        <button onClick={onRetry} className="flex-1 h-[38px] rounded-xl font-mono text-[10px] text-[#8A8680] tracking-[0.1em]"
          style={{ border: '1px solid rgba(255,241,234,0.08)' }}>
          retry
        </button>
      </div>
    </div>
  );
}
