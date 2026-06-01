'use client';

import { useEffect, useState } from 'react';
import type { AuraResult } from '@/lib/types';
import { ResultCard } from './result-card';
import { ShareButton } from './share-button';
import { GlowUpSection } from './glow-up-section';
import { InspoMatch } from './inspo-match';
import { ReferralPrompt } from './referral-prompt';

interface ResultPageClientProps {
  result: AuraResult;
  encodedId: string;
  isLoggedIn: boolean;
  isMogPlus?: boolean;
  preUnlocked?: boolean;
}

export function ResultPageClient({ result, encodedId, isLoggedIn, isMogPlus = false, preUnlocked = false }: ResultPageClientProps) {
  const [unlocked, setUnlocked] = useState(preUnlocked);
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [mimeType, setMimeType] = useState<string | undefined>();

  useEffect(() => {
    if (preUnlocked) return;
    try {
      const flag = sessionStorage.getItem(`aura_unlocked_${encodedId}`);
      if (flag === '1') setUnlocked(true);
    } catch {}
  }, [encodedId, preUnlocked]);

  // Recover image from sessionStorage so glow-up can use it
  useEffect(() => {
    try {
      const img = sessionStorage.getItem('mogfit_last_image');
      const mime = sessionStorage.getItem('mogfit_last_mime');
      if (img && mime) {
        setImageBase64(img);
        setMimeType(mime);
      }
    } catch {}
  }, []);

  return (
    <div className="flex flex-col items-center w-full gap-0">
      {/* ── THE VERDICT (free) ── */}
      <div className="w-full max-w-sm">
        <ResultCard
          result={result}
          scanId={encodedId.slice(0, 12).toUpperCase()}
          unlocked={unlocked}
          isLoggedIn={isLoggedIn}
          isMogPlus={isMogPlus}
        />
      </div>

      {/* ── Connector ── */}
      <div className="flex flex-col items-center py-2 gap-0.5 w-full max-w-sm">
        <div className="w-px h-5" style={{ background: 'linear-gradient(to bottom, rgba(255,107,0,0.0), rgba(255,107,0,0.5))' }} />
        <span className="font-mono text-[8px] tracking-[0.28em]" style={{ color: 'rgba(255,107,0,0.4)' }}>OK, HERE&apos;S HOW TO FIX IT</span>
        <div className="w-px h-5" style={{ background: 'linear-gradient(to bottom, rgba(255,107,0,0.5), rgba(255,107,0,0.0))' }} />
      </div>

      {/* ── THE GLOW-UP (paid) ── */}
      <div className="w-full max-w-sm">
        <GlowUpSection
          result={result}
          encodedId={encodedId}
          isLoggedIn={isLoggedIn}
          isMogPlus={isMogPlus}
          imageBase64={imageBase64}
          mimeType={mimeType}
        />
      </div>

      {/* ── Inspo Match ── */}
      <div className="flex flex-col items-center py-2 gap-0.5 w-full max-w-sm">
        <div className="w-px h-5" style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.0), rgba(99,102,241,0.4))' }} />
        <span className="font-mono text-[8px] tracking-[0.28em]" style={{ color: 'rgba(99,102,241,0.4)' }}>MATCH THE VIBE</span>
        <div className="w-px h-5" style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(99,102,241,0.0))' }} />
      </div>
      <div className="w-full max-w-sm">
        <InspoMatch
          result={result}
          encodedId={encodedId}
          isLoggedIn={isLoggedIn}
          isMogPlus={isMogPlus}
          currentImageBase64={imageBase64}
          currentMimeType={mimeType}
        />
      </div>

      {/* ── Referral prompt (post-roast conversion) ── */}
      <div className="mt-6 w-full max-w-sm">
        <ReferralPrompt isLoggedIn={isLoggedIn} auraScore={result.aura_score} />
      </div>

      {/* ── Bottom actions ── */}
      <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-sm">
        {unlocked && <ShareButton encodedId={encodedId} archetypeName={result.archetype_name} />}

        {unlocked ? (
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <p className="font-sans text-[#8A8680] text-sm">Try your friend&apos;s aura 👀</p>
            <a href="/" className="font-mono text-[11px] text-white hover:opacity-70 tracking-[0.15em] transition-opacity underline">
              SCAN ANOTHER FIT →
            </a>
          </div>
        ) : (
          <a href="/" className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] tracking-[0.15em] transition-colors">
            scan a different fit →
          </a>
        )}
      </div>
    </div>
  );
}
