'use client';

import { useState, useEffect } from 'react';
import type { AuraResult, GlowUpResult } from '@/lib/types';
import { BuyCreditsModal } from './buy-credits-modal';

interface GlowUpSectionProps {
  result: AuraResult;
  encodedId: string;
  isLoggedIn: boolean;
  isMogPlus?: boolean;
  imageBase64?: string;
  mimeType?: string;
}

export function GlowUpSection({ result, encodedId, isLoggedIn, isMogPlus = false, imageBase64, mimeType }: GlowUpSectionProps) {
  const [state, setState] = useState<'locked' | 'loading' | 'unlocked' | 'error'>('locked');
  const [glowUp, setGlowUp] = useState<GlowUpResult | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`mogfit_glowup_${encodedId}`);
      if (stored) {
        setGlowUp(JSON.parse(stored));
        setState('unlocked');
      }
    } catch {}
  }, [encodedId]);

  async function handleUnlock() {
    if (!imageBase64) {
      // No image in session — redirect to rescan
      window.location.href = '/';
      return;
    }
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/glow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType, auraResult: result }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setState('locked');
          setShowBuyModal(true);
        } else {
          setState('error');
          setErrorMsg(data.error || 'Something went wrong.');
        }
        return;
      }
      const glowUpData: GlowUpResult = data.glowUp;
      setGlowUp(glowUpData);
      setState('unlocked');
      try { sessionStorage.setItem(`mogfit_glowup_${encodedId}`, JSON.stringify(glowUpData)); } catch {}
    } catch {
      setState('error');
      setErrorMsg('Network error. Try again.');
    }
  }

  const scoreDelta = glowUp
    ? glowUp.potential_score - glowUp.current_score
    : result.aura_score < 700 ? 120 : result.aura_score < 850 ? 85 : 45;
  const potentialPreview = Math.min(980, result.aura_score + scoreDelta);

  return (
    <>
      <div className="w-full rounded-[22px] overflow-hidden" style={{
        background: 'linear-gradient(160deg, #0A0808 0%, #0E0B0B 100%)',
        border: state === 'unlocked' ? '1px solid rgba(255,107,0,0.35)' : '1px solid rgba(255,107,0,0.18)',
        boxShadow: state === 'unlocked'
          ? '0 0 60px -10px rgba(255,107,0,0.3), inset 0 1px 0 rgba(255,107,0,0.1)'
          : '0 0 24px -10px rgba(255,107,0,0.15)',
      }}>
        {/* Top accent line */}
        <div className="h-[1.5px] w-full" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.7), rgba(255,160,50,0.4), transparent)',
        }} />

        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[15px]">✦</span>
              <span className="font-sans font-black text-white text-[16px] tracking-tight">The Glow-Up</span>
            </div>
            {state === 'locked' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)' }}>
                <span className="font-mono text-[8px] text-[#FF6B00] tracking-[0.18em]">OK, HERE&apos;S HOW TO FIX IT</span>
              </div>
            )}
            {state === 'unlocked' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                <span className="font-mono text-[8px] text-[#4ADE80] tracking-[0.18em]">UNLOCKED</span>
              </div>
            )}
          </div>

          {state === 'locked' && (
            <LockedView
              currentScore={result.aura_score}
              potentialScore={potentialPreview}
              isLoggedIn={isLoggedIn}
              isMogPlus={isMogPlus}
              hasImage={!!imageBase64}
              onUnlock={handleUnlock}
            />
          )}

          {state === 'loading' && <LoadingView />}

          {state === 'error' && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] text-[#EF4444] text-center">{errorMsg}</p>
              <button
                onClick={() => setState('locked')}
                className="w-full py-2.5 rounded-xl font-mono text-[10px] tracking-[0.14em] text-[#8A8680]"
                style={{ border: '1px solid rgba(255,241,234,0.08)' }}
              >
                try again
              </button>
            </div>
          )}

          {state === 'unlocked' && glowUp && <UnlockedView glowUp={glowUp} />}
        </div>
      </div>

      {showBuyModal && (
        <BuyCreditsModal isLoggedIn={isLoggedIn} onClose={() => setShowBuyModal(false)} />
      )}
    </>
  );
}

function LockedView({
  currentScore, potentialScore, isLoggedIn, isMogPlus, hasImage, onUnlock
}: {
  currentScore: number;
  potentialScore: number;
  isLoggedIn: boolean;
  isMogPlus: boolean;
  hasImage: boolean;
  onUnlock: () => void;
}) {
  const delta = potentialScore - currentScore;
  const teaser = [
    { icon: '🔄', label: 'specific swaps' },
    { icon: '➕', label: 'what to add' },
    { icon: '✂️', label: 'what to cut' },
    { icon: '🎯', label: 'one key move' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Score preview */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.14)' }}>
        <div className="flex flex-col">
          <span className="font-mono text-[8px] text-[#5A5450] tracking-[0.2em]">YOUR SCORE</span>
          <span className="font-sans font-black text-[#FF6B00] text-2xl leading-none">{currentScore}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#4A4742]">→</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono text-[8px] text-[#5A5450] tracking-[0.2em]">POTENTIAL</span>
          <div className="flex items-baseline gap-1">
            <span className="font-sans font-black text-[#4ADE80] text-2xl leading-none">~{potentialScore}</span>
            <span className="font-mono text-[9px] text-[#4ADE80]">+{delta}</span>
          </div>
        </div>
      </div>

      {/* Blurred teaser rows */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="flex flex-col gap-1 pointer-events-none select-none" style={{ filter: 'blur(4px)', opacity: 0.35 }}>
          {teaser.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[11px]">{item.icon}</span>
              <span className="font-sans text-[11px] text-[#6B7280]">{item.label}</span>
              <div className="ml-auto flex gap-1">
                {[40, 28, 36, 20].slice(0, 3).map((w, j) => (
                  <div key={j} className="rounded-full" style={{ width: w, height: 5, background: 'rgba(255,107,0,0.2)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, transparent 30%, rgba(10,8,8,0.7) 100%)',
        }} />
      </div>

      {/* CTA */}
      {hasImage ? (
        <button
          onClick={onUnlock}
          className="w-full py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-[0.16em] relative overflow-hidden transition-all hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
            boxShadow: '0 0 24px -4px rgba(255,107,0,0.55)',
            color: '#ffffff',
          }}
        >
          {isMogPlus ? 'UNLOCK YOUR GLOW-UP →' : isLoggedIn ? 'UNLOCK THE FIX → 1 CREDIT' : 'UNLOCK FREE (FIRST TIME) →'}
          <span className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          }} />
        </button>
      ) : (
        <a
          href="/"
          className="w-full py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-[0.16em] text-center block transition-all hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
            boxShadow: '0 0 24px -4px rgba(255,107,0,0.55)',
            color: '#ffffff',
          }}
        >
          RESCAN TO UNLOCK →
        </a>
      )}
      {!isMogPlus && (
        <p className="font-mono text-[9px] text-[#3A3632] tracking-[0.12em] text-center">
          {isLoggedIn ? 'first glow-up free · then 1 credit each' : 'free once · no account needed'}
        </p>
      )}
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[rgba(255,107,0,0.15)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF6B00] animate-spin" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-[11px] text-[#FF6B00] tracking-[0.2em]">ANALYZING YOUR FIT</span>
        <span className="font-sans text-[12px] text-[#4A4742]">building your glow-up plan...</span>
      </div>
    </div>
  );
}

function UnlockedView({ glowUp }: { glowUp: GlowUpResult }) {
  return (
    <div className="flex flex-col gap-4" style={{ animation: 'fade-up 0.35s ease both' }}>
      {/* Verdict + score jump */}
      <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(255,107,0,0.07)', border: '1px solid rgba(255,107,0,0.15)' }}>
        <p className="font-sans text-[#F5F1EA] text-[13px] font-semibold leading-snug mb-2">{glowUp.verdict_line}</p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#5A5450]">{glowUp.current_score} now</span>
          <span className="font-mono text-[10px] text-[#3A3632]">→</span>
          <span className="font-mono text-[10px] text-[#4ADE80] font-bold">~{glowUp.potential_score} potential</span>
          <span className="font-mono text-[9px] text-[#4ADE80]">(+{glowUp.potential_score - glowUp.current_score})</span>
        </div>
      </div>

      {/* Swaps */}
      {glowUp.swaps.length > 0 && (
        <GlowSection label="🔄 SWAP" color="rgba(251,191,36,0.12)" borderColor="rgba(251,191,36,0.18)">
          {glowUp.swaps.map((s, i) => (
            <div key={i} className="flex flex-col gap-0.5 py-2 border-b last:border-0" style={{ borderColor: 'rgba(255,241,234,0.05)' }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#EF4444] line-through opacity-60 truncate max-w-[100px]">{s.replace}</span>
                <span className="font-mono text-[9px] text-[#3A3632] flex-shrink-0">→</span>
                <span className="font-mono text-[10px] text-[#86EFAC] font-bold truncate">{s.with}</span>
                <span className="font-mono text-[9px] text-[#4ADE80] ml-auto flex-shrink-0">{s.impact}</span>
              </div>
              <p className="font-sans text-[11px] text-[#6B6460] leading-snug pl-1">{s.why}</p>
            </div>
          ))}
        </GlowSection>
      )}

      {/* Additions */}
      {glowUp.additions.length > 0 && (
        <GlowSection label="➕ ADD" color="rgba(74,222,128,0.06)" borderColor="rgba(74,222,128,0.14)">
          {glowUp.additions.map((a, i) => (
            <div key={i} className="flex flex-col gap-0.5 py-2 border-b last:border-0" style={{ borderColor: 'rgba(255,241,234,0.05)' }}>
              <div className="flex items-center justify-between">
                <span className="font-sans font-semibold text-[#86EFAC] text-[12px]">{a.add}</span>
                <span className="font-mono text-[9px] text-[#4ADE80] flex-shrink-0 ml-2">{a.impact}</span>
              </div>
              <p className="font-sans text-[11px] text-[#6B6460] leading-snug">{a.why}</p>
            </div>
          ))}
        </GlowSection>
      )}

      {/* Remove */}
      {glowUp.remove.length > 0 && (
        <GlowSection label="✂️ CUT" color="rgba(239,68,68,0.06)" borderColor="rgba(239,68,68,0.14)">
          {glowUp.remove.map((r, i) => (
            <div key={i} className="flex flex-col gap-0.5 py-2 border-b last:border-0" style={{ borderColor: 'rgba(255,241,234,0.05)' }}>
              <div className="flex items-center justify-between">
                <span className="font-sans font-semibold text-[#FCA5A5] text-[12px] line-through">{r.item}</span>
                <span className="font-mono text-[9px] text-[#4ADE80] flex-shrink-0 ml-2">{r.impact}</span>
              </div>
              <p className="font-sans text-[11px] text-[#6B6460] leading-snug">{r.why}</p>
            </div>
          ))}
        </GlowSection>
      )}

      {/* One thing */}
      <div className="px-4 py-3 rounded-xl flex flex-col gap-1" style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.18)' }}>
        <span className="font-mono text-[8px] text-[#FF6B00] tracking-[0.22em]">🎯 ONE THING</span>
        <p className="font-sans font-black text-white text-[13px] leading-snug">{glowUp.one_thing}</p>
      </div>
    </div>
  );
}

function GlowSection({ label, color, borderColor, children }: {
  label: string;
  color: string;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: color, border: `1px solid ${borderColor}` }}>
      <div className="px-4 pt-3 pb-1">
        <span className="font-mono text-[9px] tracking-[0.2em]" style={{ color: 'rgba(255,241,234,0.4)' }}>{label}</span>
      </div>
      <div className="px-4 pb-3">{children}</div>
    </div>
  );
}
