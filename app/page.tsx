import { UploadZone } from '@/components/upload-zone';
import { ArchetypeStrip } from '@/components/archetype-strip';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Brand bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,241,234,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-[3px] bg-[#FF6B00]" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.22em] font-bold">
            AURA LAB
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#4A4742] tracking-[0.12em]">v0.1</span>
      </div>

      {/* Hero section */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 gap-14">
        <div className="text-center max-w-2xl">
          <h1 className="font-sans font-black text-[clamp(40px,8vw,80px)] leading-[1.05] tracking-tight text-[#F5F1EA] mb-4">
            Diagnose your aura.
          </h1>
          <p className="font-sans text-base text-[#8A8680]">
            Upload a fit. Get the verdict. Free, brutal, instant.
          </p>
        </div>

        <UploadZone />

        {/* Sample cards */}
        <div className="w-full max-w-4xl">
          <ArchetypeStrip />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[rgba(255,241,234,0.06)]">
        <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em] text-center">
          no accounts. no data kept. no purpose. v0.1
        </p>
      </div>
    </main>
  );
}
