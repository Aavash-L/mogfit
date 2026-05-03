import { ResultCard } from './result-card';
import type { AuraResult } from '@/lib/types';

const SAMPLES: AuraResult[] = [
  {
    archetype_name: 'Quiet Money',
    archetype_tag: 'the loafers cost more than your rent',
    aura_score: 847,
    tier: 'HIGH',
    tier_percentile: 'TOP 12%',
    pieces: [
      { name: 'Overcoat', verdict: 'fit is an actual fit', delta: 120, type: 'good' },
      { name: 'The Watch', verdict: 'quiet money signal — restrained', delta: 90, type: 'good' },
      { name: 'White Tee', verdict: 'amazon basics in a trenchcoat', delta: -80, type: 'bad' },
    ],
  },
  {
    archetype_name: 'NPC Coded',
    archetype_tag: 'the simulation forgot to render this fit',
    aura_score: 312,
    tier: 'LOW',
    tier_percentile: 'BOTTOM 30%',
    pieces: [
      { name: 'Sneakers', verdict: 'bones of a real outfit', delta: 70, type: 'good' },
      { name: 'Cargo Shorts', verdict: 'shorts cargo pants, full crisis', delta: -160, type: 'bad' },
      { name: 'Graphic Tee', verdict: 'this t-shirt is doing crimes', delta: -130, type: 'bad' },
    ],
  },
  {
    archetype_name: 'Editorial Ghost',
    archetype_tag: 'looks like a spread no one will ever publish',
    aura_score: 921,
    tier: 'ELITE',
    tier_percentile: 'TOP 2%',
    pieces: [
      { name: 'Layering', verdict: 'cropped right, breaks clean', delta: 150, type: 'good' },
      { name: 'Trousers', verdict: 'this color was a decision', delta: 110, type: 'good' },
      { name: 'Bag', verdict: 'the watch is faking the funk', delta: -90, type: 'bad' },
    ],
  },
];

export function ArchetypeStrip() {
  return (
    <div className="w-full">
      <p className="font-mono text-[10px] text-[#8A8680] tracking-[0.22em] text-center mb-6">
        Receipts.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {SAMPLES.map((sample, i) => (
          <ResultCard key={i} result={sample} scanId={`SAMPLE #${i + 1}`} compact />
        ))}
      </div>
    </div>
  );
}
