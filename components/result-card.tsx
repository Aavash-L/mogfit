'use client';

import { useState, useEffect } from 'react';
import type { AuraResult } from '@/lib/types';
import { BuyCreditsModal } from './buy-credits-modal';

function tierConfig(tier: string) {
  if (tier === 'ELITE') return { text: 'text-[#FF6B00]', glow: 'rgba(255,107,0,0.22)', border: 'rgba(255,107,0,0.18)' };
  if (tier === 'HIGH')  return { text: 'text-[#4ADE80]', glow: 'rgba(74,222,128,0.18)', border: 'rgba(74,222,128,0.15)' };
  if (tier === 'LOW')   return { text: 'text-[#EF4444]', glow: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.15)' };
  return { text: 'text-[#8A8680]', glow: 'rgba(138,134,128,0.1)', border: 'rgba(138,134,128,0.1)' };
}

interface ResultCardProps {
  result: AuraResult;
  scanId?: string;
  compact?: boolean;
  unlocked?: boolean;
  isLoggedIn?: boolean;
}

export function ResultCard({ result, scanId, compact = false, unlocked = false, isLoggedIn = false }: ResultCardProps) {
  const id = scanId ?? `SCAN #${Math.floor(Math.random() * 9000 + 1000)}-ALB`;
  const date = new Date().toISOString().split('T')[0];
  const [isUnlocked, setIsUnlocked] = useState(unlocked);
  const [unlocking, setUnlocking] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const tc = tierConfig(result.tier);

  // Sync when parent resolves the unlock state from sessionStorage
  useEffect(() => {
    if (unlocked) setIsUnlocked(true);
  }, [unlocked]);

  async function handleUnlock() {
    if (!isLoggedIn) { setShowBuyModal(true); return; }
    setUnlocking(true);
    try {
      const res = await fetch('/api/credits/spend', { method: 'POST' });
      if (res.ok) {
        setIsUnlocked(true);
        try { sessionStorage.setItem(`aura_unlocked_${scanId}`, '1'); } catch {}
      } else if (res.status === 402) {
        setShowBuyModal(true);
      }
    } finally {
      setUnlocking(false);
    }
  }

  const pad = compact ? 'p-5' : 'p-8';

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-[22px] border ${pad}`}
        style={{
          background: '#0C0C0E',
          borderColor: tc.border,
          boxShadow: `0 0 60px -15px ${tc.glow}, 0 0 0 0.5px rgba(255,241,234,0.04) inset`,
        }}
      >
        {/* Top glow */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-16"
          style={{
            width: compact ? 200 : 380,
            height: compact ? 120 : 200,
            background: `radial-gradient(ellipse at center, ${tc.glow} 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />

        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(245,241,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,241,234,1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-[2.5px] bg-white opacity-85" />
              <span className="font-mono text-[10px] text-[#F5F1EA] tracking-[0.28em] font-bold">AURA LAB</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-[8px] text-[#2A2826] tracking-[0.12em]">{id}</span>
              <span className="font-mono text-[8px] text-[#2A2826] tracking-[0.12em]">{date}</span>
            </div>
          </div>

          {/* Archetype */}
          <div className="flex flex-col items-center text-center mb-7">
            <span className="font-mono text-[8px] text-[#3A3632] tracking-[0.28em] mb-3">ARCHETYPE</span>
            <h2 className={`font-sans font-black leading-tight mb-2 ${compact ? 'text-xl' : 'text-[40px]'} text-[#F5F1EA] tracking-tight`}>
              {result.archetype_name}
            </h2>
            <p className={`text-[#6B6460] italic ${compact ? 'text-[10px]' : 'text-[13px]'} max-w-[240px] leading-relaxed`}>
              {result.archetype_tag}
            </p>
          </div>

          {/* Score + Tier */}
          <div
            className="flex rounded-2xl overflow-hidden mb-6 border"
            style={{ borderColor: 'rgba(255,241,234,0.06)', background: 'rgba(255,241,234,0.015)' }}
          >
            <div className="flex-1 flex flex-col items-center py-5 border-r" style={{ borderColor: 'rgba(255,241,234,0.06)' }}>
              <span className="font-mono text-[7px] text-[#3A3632] tracking-[0.28em] mb-1">AURA SCORE</span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-sans font-black ${compact ? 'text-3xl' : 'text-[54px]'} leading-none`}
                  style={{ color: '#FF6B00', textShadow: '0 0 30px rgba(255,107,0,0.4)' }}
                >
                  {result.aura_score}
                </span>
                <span className="font-mono text-[9px] text-[#3A3632]">/1000</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center py-5">
              <span className="font-mono text-[7px] text-[#3A3632] tracking-[0.28em] mb-1">TIER</span>
              <span
                className={`font-sans font-black ${compact ? 'text-xl' : 'text-3xl'} leading-none ${tc.text}`}
                style={{ textShadow: `0 0 20px ${tc.glow}` }}
              >
                {result.tier}
              </span>
              <span className="font-mono text-[8px] text-[#4A4742] tracking-[0.1em] mt-1">
                {result.tier_percentile}
              </span>
            </div>
          </div>

          {/* Short roast */}
          {result.short_roast && (
            <div
              className="rounded-xl px-5 py-4 mb-6 border"
              style={{ borderColor: 'rgba(255,241,234,0.06)', background: 'rgba(255,241,234,0.02)' }}
            >
              <p className="font-sans text-[#7A7470] text-[13px] leading-relaxed italic whitespace-pre-line">
                {result.short_roast}
              </p>
            </div>
          )}

          {/* Full breakdown (unlocked) or locked teaser */}
          {isUnlocked ? (
            <div className="flex flex-col gap-0">
              {/* Breakdown */}
              <SectionLabel>BREAKDOWN</SectionLabel>
              <div className="flex flex-col mb-1">
                {result.pieces.map((piece, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-3.5 ${i < result.pieces.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: 'rgba(255,241,234,0.05)' }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: piece.type === 'good' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)' }}
                      >
                        <span className={`text-[11px] font-bold leading-none ${piece.type === 'good' ? 'text-[#4ADE80]' : 'text-[#EF4444]'}`}>
                          {piece.type === 'good' ? '+' : '−'}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`font-sans font-semibold text-[#E8E4DC] truncate ${compact ? 'text-[11px]' : 'text-[13px]'}`}>
                          {piece.name}
                        </span>
                        <span className={`text-[#5A5450] truncate ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
                          {piece.verdict}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`font-mono ${compact ? 'text-[10px]' : 'text-xs'} font-bold shrink-0 ml-3 ${piece.type === 'good' ? 'text-[#4ADE80]' : 'text-[#EF4444]'}`}
                    >
                      {piece.delta > 0 ? '+' : ''}{piece.delta}
                    </span>
                  </div>
                ))}
              </div>

              {/* How perceived */}
              {result.how_perceived && (
                <div className="mt-6">
                  <SectionLabel>HOW PEOPLE SEE YOU</SectionLabel>
                  <p className="font-sans text-[#6B6460] text-[13px] leading-relaxed mt-3">{result.how_perceived}</p>
                </div>
              )}

              {/* Rare traits */}
              {result.rare_traits && result.rare_traits.length > 0 && (
                <div className="mt-6">
                  <SectionLabel>RARE TRAITS</SectionLabel>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.rare_traits.map((trait, i) => (
                      <span
                        key={i}
                        className="font-mono text-[10px] text-[#8A8680] px-3 py-1.5 rounded-full tracking-[0.08em]"
                        style={{ border: '1px solid rgba(255,241,234,0.1)', background: 'rgba(255,241,234,0.03)' }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              {!compact && (
                <div className="flex items-center justify-between mt-7 pt-4" style={{ borderTop: '1px solid rgba(255,241,234,0.05)' }}>
                  <span className="font-mono text-[8px] text-[#2A2826] tracking-[0.18em]">AURA LAB</span>
                  <span className={`font-mono text-[8px] tracking-[0.18em] ${tc.text}`}>aura.lab</span>
                </div>
              )}
            </div>
          ) : (
            /* Locked */
            <div className="relative">
              <div className="pointer-events-none select-none opacity-25 blur-[3px]">
                <SectionLabel>BREAKDOWN</SectionLabel>
                {['', '', ''].map((_, i) => (
                  <div key={i} className={`flex items-center justify-between py-3.5 ${i < 2 ? 'border-b' : ''}`} style={{ borderColor: 'rgba(255,241,234,0.05)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md" style={{ background: 'rgba(74,222,128,0.1)' }} />
                      <div className="flex flex-col gap-1">
                        <div className="h-2.5 w-24 rounded" style={{ background: 'rgba(255,241,234,0.12)' }} />
                        <div className="h-2 w-36 rounded" style={{ background: 'rgba(255,241,234,0.06)' }} />
                      </div>
                    </div>
                    <div className="h-2.5 w-8 rounded" style={{ background: 'rgba(74,222,128,0.15)' }} />
                  </div>
                ))}
                <div className="mt-5 space-y-1.5">
                  <div className="h-2.5 w-48 rounded" style={{ background: 'rgba(255,241,234,0.07)' }} />
                  <div className="h-2 w-full rounded" style={{ background: 'rgba(255,241,234,0.04)' }} />
                  <div className="h-2 w-3/4 rounded" style={{ background: 'rgba(255,241,234,0.04)' }} />
                </div>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-mono text-[11px] tracking-[0.15em] font-bold text-[#080809] bg-white disabled:opacity-50 transition-all hover:scale-[1.02]"
                  style={{ boxShadow: '0 0 24px rgba(255,255,255,0.25)' }}
                >
                  {unlocking ? 'UNLOCKING...' : '⚡ UNLOCK FULL AURA'}
                </button>
                <p className="font-mono text-[9px] text-[#3A3632] tracking-[0.1em]">
                  {isLoggedIn ? '1 credit · never expires' : 'create an account to unlock'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBuyModal && (
        <BuyCreditsModal isLoggedIn={isLoggedIn} onClose={() => setShowBuyModal(false)} />
      )}
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="h-px flex-1" style={{ background: 'rgba(255,241,234,0.06)' }} />
      <span className="font-mono text-[8px] text-[#3A3632] tracking-[0.28em]">{children}</span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,241,234,0.06)' }} />
    </div>
  );
}
