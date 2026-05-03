import { UploadZone } from '@/components/upload-zone';
import { ArchetypeStrip } from '@/components/archetype-strip';

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080809]">
      {/* Ambient background glow — warm, very subtle */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,107,0,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-[#FF6B00]" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </div>
        <span className="font-mono text-[10px] text-[#4A4742] tracking-[0.12em]">v0.1</span>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-8 gap-6">
        {/* Pill badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.04)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
          <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em]">AI FASHION FORENSICS</span>
        </div>

        {/* Main title */}
        <h1
          className="font-sans font-black text-[#F5F1EA] leading-[0.95] tracking-tight"
          style={{ fontSize: 'clamp(72px, 14vw, 144px)' }}
        >
          AURA<br />LAB
        </h1>

        <p className="font-sans text-[#8A8680] text-base max-w-xs leading-relaxed">
          Upload a fit. Get the verdict.<br />Free, brutal, instant.
        </p>
      </div>

      {/* Upload card — the arena entry */}
      <div className="relative z-10 flex justify-center px-6 pb-10">
        <UploadZone />
      </div>

      {/* Steps */}
      <div className="relative z-10 flex justify-center px-6 pb-14">
        <div className="flex items-stretch gap-0 max-w-xl w-full">
          {[
            { n: '1', label: 'UPLOAD', sub: 'drop a fit pic' },
            { n: '2', label: 'SCAN', sub: 'claude analyzes the fit' },
            { n: '3', label: 'VERDICT', sub: 'share your archetype' },
          ].map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex-1 rounded-xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.03)] px-4 py-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-[#FF6B00]">{step.n}</span>
                  <span className="font-mono text-[10px] text-[#F5F1EA] tracking-[0.18em]">{step.label}</span>
                </div>
                <span className="font-sans text-[11px] text-[#4A4742]">{step.sub}</span>
              </div>
              {i < 2 && (
                <span className="font-mono text-[10px] text-[#4A4742] px-2">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sample cards */}
      <div className="relative z-10 px-6 pb-16">
        <ArchetypeStrip />
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-4 border-t border-[rgba(255,241,234,0.05)]">
        <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em] text-center">
          no accounts. no data kept. no purpose. v0.1
        </p>
      </div>
    </main>
  );
}
