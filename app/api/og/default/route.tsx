import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#080809',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: '50%',
            width: 700,
            height: 400,
            background: 'radial-gradient(ellipse at center, rgba(255,107,0,0.18) 0%, transparent 70%)',
            marginLeft: -350,
          }}
        />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 20,
              height: 20,
              background: '#FF6B00',
              borderRadius: 4,
            }}
          />
          <span style={{ color: '#F5F1EA', fontSize: 18, letterSpacing: '0.25em', fontWeight: 700 }}>
            MOGFIT
          </span>
        </div>

        {/* Main text */}
        <div
          style={{
            color: '#F5F1EA',
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-2px',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Diagnose<br />your aura.
        </div>

        <div style={{ color: '#8A8680', fontSize: 24, textAlign: 'center' }}>
          Upload a fit. Get the verdict. Free, brutal, instant.
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            border: '1px solid rgba(255,241,234,0.1)',
            borderRadius: 999,
          }}
        >
          <span style={{ color: '#FF6B00', fontSize: 12, letterSpacing: '0.2em' }}>
            ● AI FASHION FORENSICS
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
