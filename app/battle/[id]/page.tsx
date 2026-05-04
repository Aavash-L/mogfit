import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { BattleClient } from './battle-client';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ id: string }> }

export default async function BattlePage({ params }: Props) {
  const { id } = await params;
  const service = createServiceClient();

  const { data: battle } = await service.from('battles').select('*').eq('id', id).single();
  if (!battle) notFound();

  return (
    <main className="relative min-h-screen flex flex-col bg-[#07070A] overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,107,0,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[13px] h-[13px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </Link>
        <Link href="/" className="font-mono text-[11px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
          ← back
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col items-center px-5 pt-4 pb-20 w-full max-w-2xl mx-auto">
        <BattleClient battle={battle} />
      </div>
    </main>
  );
}
