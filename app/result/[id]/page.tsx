import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { decodeResult } from '@/lib/encode-result';
import { ResultPageClient } from '@/components/result-page-client';
import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ unlocked?: string }>;
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
    return { title: 'Mogfit' };
  }
}

export default async function ResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { unlocked: unlockedParam } = await searchParams;
  const preUnlocked = unlockedParam === '1';

  let result;
  try {
    result = decodeResult(id);
  } catch {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isMogPlus = false;
  if (user) {
    const { createServiceClient } = await import('@/lib/supabase/server');
    const service = createServiceClient();
    const { data: profile } = await service
      .from('profiles')
      .select('is_mogplus, mogplus_expires_at')
      .eq('id', user.id)
      .single();
    isMogPlus = !!(profile?.is_mogplus && (!profile.mogplus_expires_at || new Date(profile.mogplus_expires_at) > new Date()));
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080809]">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% -5%, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5">
        <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">MOGFIT</span>
        </a>
        <a href="/" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
          ← new scan
        </a>
      </nav>

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 pt-2 pb-16 gap-4 flex-1">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.04)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
          <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em]">SCAN COMPLETE</span>
        </div>

        <ResultPageClient result={result} encodedId={id} isLoggedIn={!!user} isMogPlus={isMogPlus} preUnlocked={preUnlocked} />
      </div>

      <div className="relative z-10 px-6 py-4 border-t border-[rgba(255,241,234,0.05)]">
        <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em] text-center">MOGFIT v0.1</p>
      </div>
    </main>
  );
}
