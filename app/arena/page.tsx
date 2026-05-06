import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArenaClient } from '@/components/arena/arena-client';

export const metadata: Metadata = {
  title: 'Arena — Mogfit',
  description: 'Live 1v1 fit battles. Get MOGGED or get MOGGING.',
};

export default async function ArenaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navUser = user
    ? {
        id: user.id,
        email: user.email,
        name: (user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined),
      }
    : null;

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#07070A]">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(147,51,234,0.1) 0%, transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute top-[50vh] left-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,107,0,0.05) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">MOGFIT</span>
        </Link>
        <Link href="/" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
          ← home
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col items-center px-5 pt-8 pb-20 flex-1 justify-center">
        <ArenaClient user={navUser} />
      </div>
    </main>
  );
}
