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
      className="relative overflow-hidden rounded-[20px] border border-[rgba(255,241,234,0.08)] bg-[#0F0F10]"
      style={{ padding: compact ? '18px 16px' : '32px 28px' }}
    >
      {/* Very subtle warm glow at top — not orange soup */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          top: -60,
          width: compact ? 240 : 420,
          height: compact ? 140 : 220,
          background: 'radial-gradient(ellipse at center, rgba(255,107,0,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,241,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,241,234,1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-[3px] bg-[#FF6B00]" />
            <span className="font-mono text-[10px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[8px] text-[#4A4742] tracking-[0.12em]">{id}</span>
            <span className="font-mono text-[8px] text-[#4A4742] tracking-[0.12em]">{date}</span>
          </div>
        </div>

        {/* Archetype hero */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-[rgba(255,241,234,0.07)]" />
            <span className="font-mono text-[8px] text-[#4A4742] tracking-[0.25em]">ARCHETYPE</span>
            <div className="h-px flex-1 bg-[rgba(255,241,234,0.07)]" />
          </div>

          <h2
            className={`font-sans font-black leading-tight mb-2 ${compact ? 'text-xl' : 'text-[38px]'}`}
            style={{
              color: '#F5F1EA',
              textShadow: compact ? 'none' : '0 0 30px rgba(255,107,0,0.25)',
            }}
          >
            {result.archetype_name}
          </h2>
          <p className={`text-[#8A8680] italic ${compact ? 'text-[10px]' : 'text-sm'} max-w-[260px]`}>
            {result.archetype_tag}
          </p>
        </div>

        {/* Score row */}
        <div className="flex rounded-xl overflow-hidden border border-[rgba(255,241,234,0.07)] mb-6">
          <div className="flex-1 flex flex-col items-center py-4 border-r border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)]">
            <span className="font-mono text-[7px] text-[#4A4742] tracking-[0.25em] mb-1.5">AURA SCORE</span>
            <div className="flex items-baseline gap-1">
              <span
                className={`font-sans font-black ${compact ? 'text-3xl' : 'text-[52px]'} text-[#FF6B00]`}
                style={{ textShadow: compact ? 'none' : '0 0 20px rgba(255,107,0,0.35)' }}
              >
                {result.aura_score}
              </span>
              <span className="font-mono text-[9px] text-[#4A4742]">/ 1000</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center py-4 bg-[rgba(255,241,234,0.02)]">
            <span className="font-mono text-[7px] text-[#4A4742] tracking-[0.25em] mb-1.5">TIER</span>
            <span className={`font-sans font-black ${compact ? 'text-xl' : 'text-3xl'} ${tierColor(result.tier)}`}>
              {result.tier}
            </span>
            <span className="font-mono text-[8px] text-[#8A8680] tracking-[0.12em] mt-0.5">
              {result.tier_percentile}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-[rgba(255,241,234,0.07)]" />
            <span className="font-mono text-[8px] text-[#4A4742] tracking-[0.25em]">BREAKDOWN</span>
            <div className="h-px flex-1 bg-[rgba(255,241,234,0.07)]" />
          </div>

          {result.pieces.map((piece, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-3 ${
                i < result.pieces.length - 1 ? 'border-b border-[rgba(255,241,234,0.06)]' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                    piece.type === 'good'
                      ? 'bg-[rgba(74,222,128,0.1)]'
                      : 'bg-[rgba(239,68,68,0.1)]'
                  }`}
                >
                  <span
                    className={`text-[11px] font-bold leading-none ${
                      piece.type === 'good' ? 'text-[#4ADE80]' : 'text-[#EF4444]'
                    }`}
                  >
                    {piece.type === 'good' ? '+' : '−'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-sans font-semibold text-[#F5F1EA] truncate ${compact ? 'text-[11px]' : 'text-sm'}`}>
                    {piece.name}
                  </span>
                  <span className={`text-[#8A8680] truncate ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
                    {piece.verdict}
                  </span>
                </div>
              </div>
              <span
                className={`font-mono ${compact ? 'text-[10px]' : 'text-xs'} font-bold shrink-0 ml-3 ${
                  piece.type === 'good' ? 'text-[#4ADE80]' : 'text-[#EF4444]'
                }`}
              >
                {piece.delta > 0 ? '+' : ''}{piece.delta}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        {!compact && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[rgba(255,241,234,0.06)]">
            <span className="font-mono text-[8px] text-[#4A4742] tracking-[0.15em]">UNCLAIMED</span>
            <span className="font-mono text-[8px] text-[#FF6B00] tracking-[0.15em]">aura.lab</span>
          </div>
        )}
      </div>
    </div>
  );
}
