import type { AuraResult } from '@/lib/types';

const C = {
  bg: '#0C0C0E',
  text: '#F5F1EA',
  textDim: '#8A8680',
  textFaint: '#4A4742',
  textFainter: '#2A2826',
  accent: '#FF6B00',
  good: '#4ADE80',
  bad: '#EF4444',
  border: 'rgba(255, 241, 234, 0.07)',
};

function tierColor(tier: string) {
  if (tier === 'ELITE') return C.accent;
  if (tier === 'HIGH') return C.good;
  if (tier === 'LOW') return C.bad;
  return C.textDim;
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.textFaint, letterSpacing: '0.26em' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

export function ResultCardJSX({ result, full = false }: { result: AuraResult; full?: boolean }) {
  const scanId = `SCAN #${Math.floor(Math.random() * 9000 + 1000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const tc = tierColor(result.tier);

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        background: '#07070A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 600,
          height: 500,
          background: 'radial-gradient(ellipse at top left, rgba(110,50,255,0.18) 0%, transparent 65%)',
        }}
      />

      <div
        style={{
          width: 960,
          height: 1270,
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 28,
          padding: full ? '40px 44px' : '44px 48px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 0 80px -20px ${tc}44`,
        }}
      >
        {/* Tier-tinted top glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: 140,
            width: 680,
            height: 380,
            background: `radial-gradient(ellipse at center, ${tc}22 0%, transparent 70%)`,
          }}
        />

        {/* Subtle grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(245,241,234,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(245,241,234,0.018) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: full ? 36 : 44, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 18, height: 18, background: '#ffffff', borderRadius: 3, opacity: 0.9 }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: C.text, letterSpacing: '0.28em', fontWeight: 700 }}>
              AURA LAB
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.textFainter, letterSpacing: '0.15em' }}>{scanId}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.textFainter, letterSpacing: '0.15em' }}>{timestamp}</span>
          </div>
        </div>

        {/* ── Archetype ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: full ? 36 : 48, position: 'relative' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.textFaint, letterSpacing: '0.26em', marginBottom: 16 }}>
            — ARCHETYPE —
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: full ? 62 : 66,
              fontWeight: 800,
              color: C.text,
              lineHeight: 1.0,
              marginBottom: 14,
              textShadow: `0 0 40px rgba(255,255,255,0.15)`,
            }}
          >
            {result.archetype_name}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, color: C.textDim, fontStyle: 'italic' }}>
            {result.archetype_tag}
          </span>
        </div>

        {/* ── Score / Tier row ── */}
        <div
          style={{
            display: 'flex',
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
            marginBottom: full ? 32 : 36,
            padding: full ? '22px 0' : '28px 0',
            position: 'relative',
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.textFaint, letterSpacing: '0.26em', marginBottom: 8 }}>AURA SCORE</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: full ? 64 : 72, fontWeight: 800, color: C.accent, lineHeight: 1, textShadow: '0 0 30px rgba(255,107,0,0.45)' }}>
                {result.aura_score}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, color: C.textFaint }}>/1000</span>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.textFaint, letterSpacing: '0.26em', marginBottom: 8 }}>TIER</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: full ? 36 : 42, fontWeight: 800, color: tc, lineHeight: 1, marginBottom: 6, textShadow: `0 0 20px ${tc}66` }}>
              {result.tier}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: C.textDim, letterSpacing: '0.15em' }}>{result.tier_percentile}</span>
          </div>
        </div>

        {/* ── Short roast ── */}
        {result.short_roast && (
          <div
            style={{
              display: 'flex',
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              background: 'rgba(255,241,234,0.025)',
              padding: full ? '22px 28px' : '26px 32px',
              marginBottom: full ? 28 : 36,
              position: 'relative',
            }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: full ? 17 : 20, color: C.textDim, fontStyle: 'italic', lineHeight: 1.55 }}>
              &ldquo;{result.short_roast.split('\n')[0]}&rdquo;
            </span>
          </div>
        )}

        {full ? (
          /* ── FULL content ── */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
            {/* Breakdown */}
            <Divider label="BREAKDOWN" />
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
              {result.pieces.map((piece, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 16,
                    paddingBottom: 16,
                    borderBottom: i < result.pieces.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: piece.type === 'good' ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: piece.type === 'good' ? C.good : C.bad, lineHeight: 1 }}>
                        {piece.type === 'good' ? '+' : '−'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: C.text }}>{piece.name}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.textFaint }}>{piece.verdict}</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color: piece.type === 'good' ? C.good : C.bad }}>
                    {piece.delta > 0 ? '+' : ''}{piece.delta}
                  </span>
                </div>
              ))}
            </div>

            {/* How perceived */}
            {result.how_perceived && (
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 22 }}>
                <Divider label="HOW PEOPLE SEE YOU" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: C.textDim, lineHeight: 1.6 }}>
                  {result.how_perceived}
                </span>
              </div>
            )}

            {/* Rare traits */}
            {result.rare_traits && result.rare_traits.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
                <Divider label="RARE TRAITS" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.rare_traits.map((trait, i) => (
                    <span
                      key={i}
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 12,
                        color: C.textDim,
                        padding: '7px 14px',
                        borderRadius: 999,
                        border: `1px solid ${C.border}`,
                        background: 'rgba(255,241,234,0.03)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.textFainter, letterSpacing: '0.18em' }}>AURA LAB</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: tc, letterSpacing: '0.18em' }}>aura.lab</span>
            </div>
          </div>
        ) : (
          /* ── TEASER content (social sharing) ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1, position: 'relative' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.textDim, letterSpacing: '0.22em', marginBottom: 20 }}>
              — FULL BREAKDOWN —
            </span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, paddingBottom: 18, borderBottom: i < 2 ? `1px solid ${C.border}` : 'none', opacity: 0.25 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,241,234,0.08)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 120 + i * 20, height: 12, borderRadius: 4, background: 'rgba(255,241,234,0.15)' }} />
                    <div style={{ width: 160 + i * 10, height: 10, borderRadius: 4, background: 'rgba(255,241,234,0.07)' }} />
                  </div>
                </div>
                <div style={{ width: 36, height: 12, borderRadius: 4, background: 'rgba(74,222,128,0.2)' }} />
              </div>
            ))}

            {/* Unlock CTA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto', paddingTop: 28, borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#080809', background: '#ffffff', borderRadius: 999, padding: '14px 32px', letterSpacing: '0.15em' }}>
                ⚡ UNLOCK FULL AURA AT AURA.LAB
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
