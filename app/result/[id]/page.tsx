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
    <main className="min-h-screen flex flex-col">
      {/* Brand bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,241,234,0.06)]">
        <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-4 h-4 rounded-[3px] bg-[#FF6B00]" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.22em] font-bold">
            AURA LAB
          </span>
        </a>
        <a
          href="/"
          className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors"
        >
          ← new scan
        </a>
      </div>

      {/* Result */}
      <div className="flex flex-col items-center px-6 py-12 gap-8 flex-1">
        <div className="w-full max-w-md">
          <ResultCard result={result} />
        </div>

        <ShareButton encodedId={id} archetypeName={result.archetype_name} />
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
