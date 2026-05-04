'use client';

import { useState } from 'react';
import type { AuraResult } from '@/lib/types';

interface FixKiller { item: string; damage: string }
interface FixAction { change: string; impact: string }
interface FixSwap { out: string; in: string; why: string }
interface FixResult {
  killers: FixKiller[];
  fix_immediately: FixAction[];
  style_swaps: FixSwap[];
  vibe_direction: string;
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

      if (!res.ok) {
        if (data.error === 'no_credits') {
          setErrorMsg('no_credits');
          setState('error');
        } else {
          setErrorMsg(data.error ?? 'Something went wrong');
          setState('error');
        }
        return;
      }

      setFix(data.fix);
      setState('unlocked');
    } catch {
      setErrorMsg('Network error');
      setState('error');
    }
  }

  return (
    <div
      className="w-full max-w-sm group"
      style={{ transition: 'transform 0.2s ease', transform: state === 'locked' ? undefined : 'none' }}
      onMouseEnter={e => { if (state === 'locked') (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { if (state === 'locked') (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(10,8,20,0.95) 0%, rgba(14,10,28,0.98) 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          boxShadow: state === 'unlocked'
            ? '0 0 40px -8px rgba(139,92,246,0.4), 0 0 80px -20px rgba(99,102,241,0.2), inset 0 1px 0 rgba(139,92,246,0.1)'
            : '0 0 30px -10px rgba(139,92,246,0.25), inset 0 1px 0 rgba(139,92,246,0.07)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Purple glow top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(99,102,241,0.4), transparent)' }}
        />
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }}
        />

        <div className="relative p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[15px]">🔧</span>
                <span className="font-sans font-black text-white text-[17px] tracking-tight">Fix My Aura</span>
              </div>
              <p className="font-sans text-[12px] text-[#8A8680] mt-0.5">
                Get a brutally honest breakdown of what to change.
              </p>
            </div>
            <div
              className="flex-shrink-0 px-2.5 py-1 rounded-lg font-mono text-[9px] tracking-[0.15em] font-bold"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.25)',
                color: '#A78BFA',
              }}
            >
              PREMIUM
            </div>
          </div>

          {/* Content area */}
          {state === 'locked' && <LockedPreview archetype={result.archetype_name} score={result.aura_score} />}
          {state === 'loading' && <LoadingState />}
          {state === 'unlocked' && fix && <UnlockedContent fix={fix} />}
          {state === 'error' && (
            <ErrorState
              msg={errorMsg}
              onRetry={() => { setState('locked'); setErrorMsg(''); }}
            />
          )}

          {/* CTA */}
          {state === 'locked' && (
            <UnlockButton isLoggedIn={isLoggedIn} onClick={unlock} />
          )}
        </div>
      </div>
    </div>
  );
}

function LockedPreview({ archetype, score }: { archetype: string; score: number }) {
  const items = [
    { label: 'What\'s killing your aura', icon: '💀' },
    { label: 'Fix these immediately', icon: '⚡' },
    { label: 'Style swaps that work', icon: '🔄' },
    { label: 'Your vibe direction', icon: '🧭' },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Score context */}
      <div
        className="rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
        style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}
      >
        <span className="font-mono text-[11px] text-[#6B7280]">Analyzing</span>
        <span className="font-sans font-bold text-[13px] text-[#A78BFA] truncate">{archetype}</span>
        <span className="ml-auto font-mono text-[11px] text-[#4B5563]">score: {score}</span>
      </div>

      {/* Blurred rows */}
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="relative rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="px-3.5 py-2.5 flex items-center gap-2.5">
              <span className="text-[13px] flex-shrink-0">{item.icon}</span>
              <span className="font-sans text-[12px] text-[#6B7280]">{item.label}</span>
              {/* Blurred fake content */}
              <div className="ml-auto flex items-center gap-1.5">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="rounded-full"
                    style={{
                      width: `${28 + j * 14}px`,
                      height: '6px',
                      background: 'rgba(139,92,246,0.15)',
                      filter: 'blur(3px)',
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Overlay shimmer */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.04) 50%, transparent 100%)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function UnlockButton({ isLoggedIn, onClick }: { isLoggedIn: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full h-[46px] rounded-xl font-mono text-[12px] font-bold tracking-[0.15em] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
        border: '1px solid rgba(139,92,246,0.5)',
        color: 'white',
        boxShadow: '0 0 20px -6px rgba(139,92,246,0.5)',
        transition: 'box-shadow 0.2s ease, transform 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 35px -4px rgba(139,92,246,0.7), 0 0 60px -12px rgba(99,102,241,0.4)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px -6px rgba(139,92,246,0.5)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <span className="relative z-10">
        {isLoggedIn ? 'Unlock Fix — 1 credit ⚡' : 'Sign in to Unlock →'}
      </span>
      {/* Shimmer sweep */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
          animation: 'shimmer-sweep 3s infinite',
        }}
      />
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#A78BFA',
              animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-[10px] text-[#6B7280] tracking-[0.2em]">DIAGNOSING YOUR AURA...</p>
    </div>
  );
}

function UnlockedContent({ fix }: { fix: FixResult }) {
  return (
    <div className="flex flex-col gap-4" style={{ animation: 'fade-up 0.4s ease both' }}>

      {/* Killers */}
      <Section icon="💀" label="KILLING YOUR AURA">
        <div className="flex flex-col gap-2">
          {fix.killers.map((k, i) => (
            <div key={i} className="rounded-xl px-3.5 py-2.5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
              <p className="font-sans font-bold text-[13px] text-[#FCA5A5] leading-tight">{k.item}</p>
              <p className="font-sans text-[11px] text-[#6B7280] mt-1 leading-relaxed">{k.damage}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Fix immediately */}
      <Section icon="⚡" label="FIX IMMEDIATELY">
        <div className="flex flex-col gap-2">
          {fix.fix_immediately.map((f, i) => (
            <div key={i} className="rounded-xl px-3.5 py-2.5" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.12)' }}>
              <p className="font-sans font-bold text-[13px] text-[#86EFAC] leading-tight">{f.change}</p>
              <p className="font-sans text-[11px] text-[#6B7280] mt-1 leading-relaxed">{f.impact}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Style swaps */}
      <Section icon="🔄" label="STYLE SWAPS">
        <div className="flex flex-col gap-2">
          {fix.style_swaps.map((s, i) => (
            <div key={i} className="rounded-xl px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-[#EF4444] line-through opacity-70">{s.out}</span>
                <span className="font-mono text-[10px] text-[#4A4742]">→</span>
                <span className="font-mono text-[10px] text-[#86EFAC] font-bold">{s.in}</span>
              </div>
              <p className="font-sans text-[11px] text-[#6B7280] leading-relaxed">{s.why}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Vibe direction */}
      <Section icon="🧭" label="YOUR DIRECTION">
        <div className="rounded-xl px-3.5 py-3" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <p className="font-sans text-[12px] text-[#C4B5FD] leading-relaxed">{fix.vibe_direction}</p>
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px]">{icon}</span>
        <span className="font-mono text-[9px] text-[#4A4742] tracking-[0.2em]">{label}</span>
      </div>
      {children}
    </div>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  const isNoCredits = msg === 'no_credits';

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="rounded-xl px-4 py-3 w-full text-center" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
        {isNoCredits ? (
          <>
            <p className="font-mono text-[11px] text-[#FCA5A5] tracking-[0.1em]">No credits left</p>
            <p className="font-sans text-[11px] text-[#6B7280] mt-1">You need 1 credit to unlock the fix.</p>
          </>
        ) : (
          <p className="font-mono text-[11px] text-[#FCA5A5] tracking-[0.1em]">{msg}</p>
        )}
      </div>
      <div className="flex gap-3 w-full">
        {isNoCredits && (
          <a
            href="/auth"
            className="flex-1 h-[40px] flex items-center justify-center rounded-xl font-mono text-[11px] font-bold tracking-[0.12em]"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)', color: 'white' }}
          >
            GET CREDITS ⚡
          </a>
        )}
        <button
          onClick={onRetry}
          className="flex-1 h-[40px] rounded-xl font-mono text-[11px] tracking-[0.12em] text-[#8A8680]"
          style={{ border: '1px solid rgba(255,241,234,0.08)' }}
        >
          retry
        </button>
      </div>
    </div>
  );
}
