import Link from 'next/link';
import { UploadZone } from '@/components/upload-zone';
import { ArchetypeStrip } from '@/components/archetype-strip';
import { CreditsDisplay } from '@/components/credits-display';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let credits = 0;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();
    credits = profile?.credits ?? 0;
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080809]">
      {/* Subtle white ambient glow at top */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -15%, rgba(255,255,255,0.05) 0%, transparent 65%)',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/leaderboard" className="font-mono text-[10px] text-[#4A4742] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors hidden sm:block">
            LEADERBOARD
          </Link>
          {user ? (
            <>
              <CreditsDisplay credits={credits} isLoggedIn={true} />
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="font-mono text-[10px] text-[#4A4742] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
                  OUT
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth" className="font-mono text-[10px] text-[#4A4742] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
              SIGN IN
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-8 gap-6">
        {/* Pill badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.12)] bg-[rgba(255,241,234,0.04)]">
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70 animate-pulse" />
          <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em]">AI FASHION FORENSICS</span>
        </div>

        {/* Main title — Omoggle-style white glow */}
        <h1
          className="font-sans font-black text-white leading-[0.9] tracking-tight select-none"
          style={{
            fontSize: 'clamp(80px, 16vw, 160px)',
            textShadow:
              '0 0 40px rgba(255,255,255,0.9), 0 0 80px rgba(255,255,255,0.5), 0 0 160px rgba(255,255,255,0.25)',
          }}
        >
          AURA<br />LAB
        </h1>

        <p className="font-sans text-[#8A8680] text-base max-w-xs leading-relaxed">
          Upload a fit. Get the verdict.<br />First scan free, no account needed.
        </p>
      </div>

      {/* Upload card */}
      <div className="relative z-10 flex justify-center px-6 pb-10">
        <UploadZone isLoggedIn={!!user} credits={credits} />
      </div>

      {/* Steps */}
      <div className="relative z-10 flex justify-center px-6 pb-14">
        <div className="flex items-stretch gap-0 max-w-xl w-full">
          {[
            { n: '1', label: 'UPLOAD', sub: 'drop a fit pic' },
            { n: '2', label: 'SCAN', sub: 'ai reads the fit' },
            { n: '3', label: 'VERDICT', sub: 'share your archetype' },
          ].map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex-1 rounded-xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.03)] px-4 py-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-[#8A8680]">{step.n}</span>
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
      <div className="relative z-10 px-6 py-4 border-t border-[rgba(255,241,234,0.05)] flex items-center justify-between">
        <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em]">
          AURA LAB v0.1
        </p>
        <Link href="/leaderboard" className="font-mono text-[9px] text-[#4A4742] hover:text-[#8A8680] tracking-[0.15em] transition-colors">
          VIEW LEADERBOARD →
        </Link>
      </div>
    </main>
  );
}
