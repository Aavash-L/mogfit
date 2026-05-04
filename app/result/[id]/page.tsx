import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { decodeResult } from '@/lib/encode-result';
import { ResultCard } from '@/components/result-card';
import { ShareButton } from '@/components/share-button';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const result = decodeResult(id);
    return {
      title: `Aura: ${result.archetype_name} — ${result.aura_score}/1000`,
      description: result.archetype_tag,
      openGraph: {
        title: `Aura: ${result.archetype_name} — ${result.aura_score}/1000`,
        description: result.archetype_tag,
        images: [`/api/og?data=${id}`],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Aura: ${result.archetype_name} — ${result.aura_score}/1000`,
        description: result.archetype_tag,
        images: [`/api/og?data=${id}`],
      },
    };
  } catch {
    return { title: 'Aura Lab' };
  }
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;

  let result;
  try {
    result = decodeResult(id);
  } catch {
    notFound();
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080809]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% -5%, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </a>
        <a
          href="/"
          className="font-mono text-[10px] text-[#4A4742] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors"
        >
          ← new scan
        </a>
      </nav>

      {/* Result */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-4 pb-16 gap-6 flex-1">
        {/* Label above card */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.04)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
          <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em]">SCAN COMPLETE</span>
        </div>

        <div className="w-full max-w-sm">
          <ResultCard result={result} />
        </div>

        <ShareButton encodedId={id} archetypeName={result.archetype_name} />

        <a
          href="/"
          className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] tracking-[0.15em] transition-colors"
        >
          scan another fit →
        </a>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-4 border-t border-[rgba(255,241,234,0.05)]">
        <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em] text-center">
          AURA LAB v0.1
        </p>
      </div>
    </main>
  );
}
