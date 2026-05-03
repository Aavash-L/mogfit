import type { AuraResult } from '@/lib/types';

function tierColor(tier: string) {
  if (tier === 'ELITE') return 'text-[#FF6B00]';
  if (tier === 'HIGH') return 'text-[#4ADE80]';
  if (tier === 'LOW') return 'text-[#EF4444]';
  return 'text-[#8A8680]';
}

interface ResultCardProps {
  result: AuraResult;
  scanId?: string;
  compact?: boolean;
}

export function ResultCard({ result, scanId, compact = false }: ResultCardProps) {
  const id = scanId ?? `SCAN #${Math.floor(Math.random() * 9000 + 1000)}-ALB`;
  const date = new Date().toISOString().split('T')[0];

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-[rgba(255,241,234,0.08)] bg-[#111111]"
      style={{
        padding: compact ? '20px 18px' : '36px 32px',
      }}
    >
      {/* radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          top: -80,
          width: compact ? 300 : 500,
          height: compact ? 200 : 320,
          background: 'radial-gradient(ellipse at center, rgba(255,107,0,0.2) 0%, transparent 70%)',
        }}
      />

      {/* grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,241,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,241,234,1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-[3px] bg-[#FF6B00]" />
            <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.22em] font-bold">
              AURA LAB
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em]">{id}</span>
            <span className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em]">{date}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="font-mono text-[9px] text-[#8A8680] tracking-[0.22em] mb-3">
            — ARCHETYPE —
          </span>
          <h2
            className={`font-sans font-black leading-tight mb-3 ${compact ? 'text-2xl' : 'text-[44px]'}`}
            style={{
              color: '#FF6B00',
              textShadow: compact
                ? '0 0 20px rgba(255,107,0,0.5)'
                : '0 0 40px rgba(255,107,0,0.6), 0 0 80px rgba(255,107,0,0.3)',
            }}
          >
            {result.archetype_name}
          </h2>
          <p className={`text-[#8A8680] italic ${compact ? 'text-xs' : 'text-sm'}`}>
            {result.archetype_tag}
          </p>
        </div>

        {/* Score row */}
        <div className="flex border-t border-b border-[rgba(255,241,234,0.08)] mb-6">
          <div className="flex-1 flex flex-col items-center py-5 border-r border-[rgba(255,241,234,0.08)]">
            <span className="font-mono text-[8px] text-[#4A4742] tracking-[0.22em] mb-1.5">
              AURA SCORE
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`font-sans font-black ${compact ? 'text-4xl' : 'text-6xl'} text-[#FF6B00]`}
                style={{ textShadow: '0 0 24px rgba(255,107,0,0.45)' }}
              >
                {result.aura_score}
              </span>
              <span className="font-mono text-[11px] text-[#4A4742]">/ 1000</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center py-5">
            <span className="font-mono text-[8px] text-[#4A4742] tracking-[0.22em] mb-1.5">
              TIER
            </span>
            <span className={`font-sans font-black ${compact ? 'text-2xl' : 'text-4xl'} ${tierColor(result.tier)}`}>
              {result.tier}
            </span>
            <span className="font-mono text-[9px] text-[#8A8680] tracking-[0.15em] mt-1">
              {result.tier_percentile}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col">
          <span className="font-mono text-[8px] text-[#8A8680] tracking-[0.22em] mb-4">
            — BREAKDOWN —
          </span>
          <div className="space-y-0">
            {result.pieces.map((piece, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-3 ${
                  i < result.pieces.length - 1 ? 'border-b border-[rgba(255,241,234,0.08)]' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0 ${
                      piece.type === 'good'
                        ? 'bg-[rgba(74,222,128,0.1)]'
                        : 'bg-[rgba(239,68,68,0.1)]'
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        piece.type === 'good' ? 'text-[#4ADE80]' : 'text-[#EF4444]'
                      }`}
                    >
                      {piece.type === 'good' ? '+' : '−'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-sans font-semibold text-[#F5F1EA] truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                      {piece.name}
                    </span>
                    <span className={`text-[#8A8680] truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>
                      {piece.verdict}
                    </span>
                  </div>
                </div>
                <span
                  className={`font-mono text-xs font-bold shrink-0 ml-3 ${
                    piece.type === 'good' ? 'text-[#4ADE80]' : 'text-[#EF4444]'
                  }`}
                >
                  {piece.delta > 0 ? '+' : ''}
                  {piece.delta}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {!compact && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgba(255,241,234,0.08)]">
            <span className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em]">UNCLAIMED</span>
            <span className="font-mono text-[9px] text-[#FF6B00] tracking-[0.15em]">aura.lab</span>
          </div>
        )}
      </div>
    </div>
  );
}
