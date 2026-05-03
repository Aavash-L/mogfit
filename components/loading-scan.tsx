'use client';

import { useEffect, useState } from 'react';

const SCAN_LINES = [
  'INITIALIZING FASHION FORENSICS...',
  'ANALYZING SILHOUETTE...',
  'INDEXING COLOR THEORY...',
  'CROSS-REFERENCING NPC DATABASE...',
  'MEASURING DRIP COEFFICIENT...',
  'CONSULTING THE AURA COUNCIL...',
  'CALCULATING OUTFIT DAMAGE...',
  'VERIFYING SWAG COORDINATES...',
  'RENDERING FINAL VERDICT...',
];

export function LoadingScan() {
  const [lines, setLines] = useState<string[]>([SCAN_LINES[0]]);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    let i = 1;
    const interval = setInterval(() => {
      if (i < SCAN_LINES.length) {
        setLines(prev => [...prev, SCAN_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(blink);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border border-[rgba(255,241,234,0.08)] rounded-xl p-6 bg-[#111111]">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,241,234,0.08)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse" />
          <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.22em]">
            SCANNING IN PROGRESS
          </span>
        </div>
        <div className="space-y-1 min-h-[160px]">
          {lines.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-mono text-[11px] text-[#FF6B00] mt-[1px] shrink-0">›</span>
              <span className="font-mono text-[11px] text-[#8A8680] tracking-wide">
                {line}
                {i === lines.length - 1 && (
                  <span className={`ml-0.5 ${cursor ? 'opacity-100' : 'opacity-0'}`}>▋</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
