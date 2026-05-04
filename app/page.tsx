import Link from 'next/link';
import { UploadZone } from '@/components/upload-zone';
import { ArchetypeStrip } from '@/components/archetype-strip';
import { Navbar } from '@/components/navbar';
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

  const navUser = user ? {
    id: user.id,
    email: user.email,
    displayName: (user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined),
  } : null;

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

      <Navbar user={navUser} credits={credits} />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-8 gap-6">
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

      {/* How it works */}
      <div id="how-it-works" className="relative z-10 flex flex-col items-center px-6 pb-16 gap-8 w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.04)]">
            <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em]">HOW IT WORKS</span>
          </div>
          <p className="font-sans text-[#4A4742] text-sm mt-1">three steps. zero excuses.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {[
            {
              n: '01',
              icon: '📸',
              label: 'Drop your fit',
              desc: 'Upload any photo of your outfit. Full body, mirror pic, candid — whatever you\'ve got.',
            },
            {
              n: '02',
              icon: '🧠',
              label: 'AI reads the fit',
              desc: 'Claude analyzes your silhouette, palette, layering, and cultural signals to assign your archetype.',
            },
            {
              n: '03',
              icon: '⚡',
              label: 'Get your verdict',
              desc: 'Score out of 1000, tier ranking, and a full breakdown of what\'s working and what\'s not.',
            },
          ].map((step) => (
            <div key={step.n} className="rounded-2xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{step.icon}</span>
                <span className="font-mono text-[10px] text-[#4A4742] tracking-[0.2em]">{step.n}</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-sans font-bold text-[#F5F1EA] text-sm tracking-tight">{step.label}</p>
                <p className="font-sans text-[#4A4742] text-[12px] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What you get section */}
        <div className="w-full rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.02)] p-6">
          <p className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em] mb-4">WHAT YOU GET</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { free: true, label: 'Archetype name + tag' },
              { free: true, label: 'Aura score out of 1000' },
              { free: true, label: 'Tier ranking (LOW → ELITE)' },
              { free: true, label: 'One-line roast' },
              { free: false, label: 'Full piece-by-piece breakdown' },
              { free: false, label: 'How people perceive you' },
              { free: false, label: 'Rare trait detection' },
              { free: false, label: 'Shareable result card' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${item.free ? 'bg-[rgba(74,222,128,0.15)] text-[#4ADE80]' : 'bg-[rgba(255,241,234,0.06)] text-[#4A4742]'}`}>
                  {item.free ? '✓' : '⚡'}
                </span>
                <span className={`font-sans text-[12px] ${item.free ? 'text-[#8A8680]' : 'text-[#4A4742]'}`}>
                  {item.label}
                  {!item.free && <span className="font-mono text-[9px] text-[#4A4742] ml-1.5 tracking-[0.1em]">CREDITS</span>}
                </span>
              </div>
            ))}
          </div>
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
