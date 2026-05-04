'use client';

import { useEffect, useState } from 'react';
import type { AuraResult } from '@/lib/types';
import { ResultCard } from './result-card';
import { ShareButton } from './share-button';
import { FixMyAura } from './fix-my-aura';

interface ResultPageClientProps {
  result: AuraResult;
  encodedId: string;
  isLoggedIn: boolean;
  preUnlocked?: boolean;
}

export function ResultPageClient({ result, encodedId, isLoggedIn, preUnlocked = false }: ResultPageClientProps) {
  const [unlocked, setUnlocked] = useState(preUnlocked);

  useEffect(() => {
    if (preUnlocked) return;
    try {
      const flag = sessionStorage.getItem(`aura_unlocked_${encodedId}`);
      if (flag === '1') setUnlocked(true);
    } catch {}
  }, [encodedId, preUnlocked]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Result card */}
      <div className="w-full max-w-sm">
        <ResultCard
          result={result}
          scanId={encodedId.slice(0, 12).toUpperCase()}
          unlocked={unlocked}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* Connector → Fix My Aura */}
      <div className="flex flex-col items-center w-full max-w-sm">
        <div className="flex flex-col items-center py-2 gap-1">
          <div className="w-px h-4" style={{ background: 'linear-gradient(to bottom, rgba(139,92,246,0.0), rgba(139,92,246,0.4))' }} />
          <span className="font-mono text-[9px] tracking-[0.25em]" style={{ color: 'rgba(139,92,246,0.5)' }}>NEXT STEP</span>
          <div className="w-px h-4" style={{ background: 'linear-gradient(to bottom, rgba(139,92,246,0.4), rgba(139,92,246,0.0))' }} />
        </div>
        <FixMyAura result={result} encodedId={encodedId} isLoggedIn={isLoggedIn} />
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-4 mt-8">
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
