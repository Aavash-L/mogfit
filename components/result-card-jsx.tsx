import type { AuraResult } from '@/lib/types';

const COLORS = {
  bg: '#111111',
  text: '#F5F1EA',
  textDim: '#8A8680',
  textFaint: '#4A4742',
  accent: '#FF6B00',
  good: '#4ADE80',
  bad: '#EF4444',
  border: 'rgba(255, 241, 234, 0.08)',
};

function TierColor(tier: string) {
  if (tier === 'ELITE') return COLORS.accent;
  if (tier === 'HIGH') return COLORS.good;
  if (tier === 'LOW') return COLORS.bad;
  return COLORS.textDim;
}

export function ResultCardJSX({ result }: { result: AuraResult }) {
  const scanId = `SCAN #${Math.floor(Math.random() * 9000 + 1000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <div
        style={{
          width: 960,
          height: 1230,
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 24,
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* radial glow — centered with margin trick (no transform, Satori compat) */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: 180,
            width: 600,
            height: 400,
            background: 'radial-gradient(ellipse at center, rgba(255,107,0,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 20, height: 20, background: COLORS.accent, borderRadius: 3 }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: COLORS.text, letterSpacing: '0.22em', fontWeight: 700 }}>
              AURA LAB
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.textFaint, letterSpacing: '0.15em' }}>
              {scanId}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.textFaint, letterSpacing: '0.15em' }}>
              {timestamp}
            </span>
          </div>
        </div>

        {/* Hero block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 52, flex: 'none' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.textDim, letterSpacing: '0.22em', marginBottom: 18 }}>
            — ARCHETYPE —
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 58,
              fontWeight: 800,
              color: COLORS.accent,
              textShadow: `0 0 40px rgba(255,107,0,0.6), 0 0 80px rgba(255,107,0,0.3)`,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {result.archetype_name}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, color: COLORS.textDim, fontStyle: 'italic' }}>
            {result.archetype_tag}
          </span>
        </div>

        {/* Score divider block */}
        <div
          style={{
            display: 'flex',
            borderTop: `1px solid ${COLORS.border}`,
            borderBottom: `1px solid ${COLORS.border}`,
            marginBottom: 40,
            padding: '28px 0',
          }}
        >
          {/* Left: score */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRight: `1px solid ${COLORS.border}`,
            }}
          >
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: COLORS.textFaint, letterSpacing: '0.22em', marginBottom: 8 }}>
              AURA SCORE
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 72,
                  fontWeight: 800,
                  color: COLORS.accent,
                  textShadow: `0 0 30px rgba(255,107,0,0.5)`,
                  lineHeight: 1,
                }}
              >
                {result.aura_score}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, color: COLORS.textFaint }}>
                / 1000
              </span>
            </div>
          </div>
          {/* Right: tier */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: COLORS.textFaint, letterSpacing: '0.22em', marginBottom: 8 }}>
              TIER
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 40,
                fontWeight: 800,
                color: TierColor(result.tier),
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {result.tier}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: COLORS.textDim, letterSpacing: '0.15em' }}>
              {result.tier_percentile}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: COLORS.textDim, letterSpacing: '0.22em', marginBottom: 20 }}>
            — BREAKDOWN —
          </span>
          {result.pieces.map((piece, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 14,
                paddingBottom: 14,
                borderBottom: i < result.pieces.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: piece.type === 'good' ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      color: piece.type === 'good' ? COLORS.good : COLORS.bad,
                    }}
                  >
                    {piece.type === 'good' ? '+' : '−'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: COLORS.text }}>
                    {piece.name}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: COLORS.textDim }}>
                    {piece.verdict}
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14,
                  fontWeight: 700,
                  color: piece.type === 'good' ? COLORS.good : COLORS.bad,
                  flexShrink: 0,
                  marginLeft: 16,
                }}
              >
                {piece.delta > 0 ? '+' : ''}{piece.delta}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 32,
            paddingTop: 20,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.textFaint, letterSpacing: '0.15em' }}>
            UNCLAIMED
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.accent, letterSpacing: '0.15em' }}>
            aura.lab
          </span>
        </div>
      </div>
    </div>
  );
}
