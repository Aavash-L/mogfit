import Link from 'next/link';
import { Suspense } from 'react';
import { UploadZone } from '@/components/upload-zone';
import { Navbar } from '@/components/navbar';
import { LandingCredits } from '@/components/landing-credits';
import { ResultCard } from '@/components/result-card';
import { ReferralRedeemer } from '@/components/referral-redeemer';
import { createClient } from '@/lib/supabase/server';
import type { AuraResult } from '@/lib/types';

const EXAMPLE_RESULTS: AuraResult[] = [
  {
    archetype_name: 'Resort Siren',
    archetype_tag: 'the dress is doing exactly what it was hired to do',
    aura_score: 742,
    tier: 'MID',
    tier_percentile: 'TOP 46%',
    short_roast: 'Nude slip dress at a rooftop bar — a classic play, executed with suspicious confidence.\nThe lace glove is either genius or a dare she accepted and won.\nThis outfit has been to Mykonos, Tulum, and your ex\'s Instagram explore page.',
    pieces: [
      { name: 'Nude Slip Dress', verdict: 'does exactly one thing and does it without apology', delta: 140, type: 'good' },
      { name: 'Chain Shoulder Bag', verdict: 'quiet luxury cosplay — the chain is doing the heavy lifting', delta: 75, type: 'good' },
      { name: 'Single Lace Glove', verdict: 'one glove means you either lost the other one or you\'re unhinged', delta: -110, type: 'bad' },
    ],
    how_perceived: 'Strangers assume she\'s either someone\'s girlfriend on a brand trip or an influencer in the 50k-200k follower bracket. She gets seated quickly at restaurants and ignored at dive bars.',
    rare_traits: ['single-glove asymmetry as texture break', 'nude-on-neutral restraint at night', 'anti-color commitment'],
  },
  {
    archetype_name: 'Silent CEO',
    archetype_tag: 'looks expensive. probably is. won\'t explain why.',
    aura_score: 923,
    tier: 'ELITE',
    tier_percentile: 'TOP 3%',
    short_roast: 'No logo. No effort. Somehow the most intimidating person in the room.\nEvery piece was chosen to signal that you don\'t need to signal anything.\nThis is what it looks like when money stops trying.',
    pieces: [
      { name: 'Cashmere Crewneck', verdict: 'the kind of soft that only comes from money or inheritance', delta: 180, type: 'good' },
      { name: 'Straight-Leg Trousers', verdict: 'perfect break. you measured this. you measured this twice.', delta: 145, type: 'good' },
      { name: 'Minimal Watch', verdict: 'says more than a billboard. says nothing out loud.', delta: 120, type: 'good' },
    ],
    how_perceived: 'People assume you run something. They\'re not sure what. They don\'t ask. You get the corner table, the first callback, and the benefit of every doubt.',
    rare_traits: ['intentional logolessness', 'fit architecture over trend', 'calibrated restraint'],
  },
  {
    archetype_name: 'Midnight Overthinker',
    archetype_tag: 'intellectually restless, emotionally layered, chronically online',
    aura_score: 847,
    tier: 'HIGH',
    tier_percentile: 'TOP 11%',
    short_roast: 'You\'ve rewatched that one scene 11 times and still haven\'t texted back.\nThe all-black fit isn\'t a mood — it\'s a load-bearing personality trait.\nSomewhere between "I read Camus at 16" and "I curate my Spotify like a resume."',
    pieces: [
      { name: 'Oversized Black Coat', verdict: 'doing 60% of the work. correctly.', delta: 160, type: 'good' },
      { name: 'Worn-In Boots', verdict: 'character. actual character. rare.', delta: 95, type: 'good' },
      { name: 'Tote With Visible Book', verdict: 'the book is load-bearing. hope it\'s good.', delta: -45, type: 'bad' },
    ],
    how_perceived: 'People think you\'re either a writer, a therapist, or someone who\'s been to therapy a lot. You get recommended obscure films. You get asked for advice at 2am.',
    rare_traits: ['monochrome as identity not aesthetic', 'intentional wear patina', 'intellectual signaling through accessories'],
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let credits = 0;
  let isMogPlus = false;
  let scanStreak = 0;
  let dailyRoastAvailable = true;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, is_mogplus, mogplus_expires_at, daily_roast_used_at, scan_streak')
      .eq('id', user.id)
      .single();
    credits = profile?.credits ?? 0;
    isMogPlus = !!(profile?.is_mogplus && (!profile.mogplus_expires_at || new Date(profile.mogplus_expires_at) > new Date()));
    scanStreak = profile?.scan_streak ?? 0;
    if (profile?.daily_roast_used_at) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      dailyRoastAvailable = new Date(profile.daily_roast_used_at) < todayStart;
    }
  }

  const navUser = user
    ? {
        id: user.id,
        email: user.email,
        displayName:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined),
      }
    : null;

  return (
    <main className="relative min-h-screen bg-[#07070A] text-[#F5F1EA] overflow-x-hidden">
      {/* Ambient background glows — fixed so they persist while scrolling */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full anim-pulse-glow"
          style={{
            background: 'radial-gradient(circle, rgba(110,50,255,0.22) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(50,100,255,0.13) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute top-[60vh] left-1/2 -translate-x-1/2 w-[900px] h-[300px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(100,40,200,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <Navbar user={navUser} credits={credits} isMogPlus={isMogPlus} />
      <Suspense fallback={null}>
        <ReferralRedeemer isLoggedIn={!!user} />
      </Suspense>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 sm:pt-28 pb-10 sm:pb-14">
        {/* Eyebrow label */}
        <div className="flex items-center gap-3 mb-5 anim-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div className="w-5 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(147,51,234,0.6))' }} />
          <span className="font-mono text-[10px] text-[#6B4FA0] tracking-[0.3em]">AI FIT ANALYSIS</span>
          <div className="w-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(147,51,234,0.6))' }} />
        </div>

        {/* Headline */}
        <h1
          className="font-sans font-black text-white leading-[0.9] tracking-tight mb-4 anim-fade-up"
          style={{
            fontSize: 'clamp(48px, 10.5vw, 108px)',
            textShadow:
              '0 0 50px rgba(147,51,234,0.55), 0 0 100px rgba(147,51,234,0.22), 0 0 180px rgba(100,40,255,0.1)',
            animationDelay: '0.15s',
            opacity: 0,
          }}
        >
          Get roasted.<br />Then glow up.
        </h1>

        {/* Sub */}
        <p
          className="font-sans text-[#5A5450] text-base max-w-xs mb-8 leading-relaxed anim-fade-up"
          style={{ animationDelay: '0.3s', opacity: 0 }}
        >
          Upload a fit. Get the brutally honest verdict — then exactly how to fix it.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-wrap gap-3 justify-center mb-8 anim-fade-up"
          style={{ animationDelay: '0.42s', opacity: 0 }}
        >
          <a
            href="#scan"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-full font-mono text-[11px] font-bold tracking-[0.16em] text-[#080809] bg-white transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ boxShadow: '0 0 30px rgba(255,255,255,0.18), 0 0 60px rgba(255,255,255,0.07)' }}
          >
            SCAN YOUR FIT
            <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
          </a>
          <a
            href="#examples"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-mono text-[11px] tracking-[0.14em] text-[#6B6460] border border-[rgba(255,241,234,0.1)] hover:border-[rgba(255,241,234,0.22)] hover:text-[#F5F1EA] hover:bg-[rgba(255,241,234,0.04)] transition-all"
          >
            VIEW EXAMPLE
          </a>
        </div>

        {/* Social proof */}
        <div
          className="flex flex-wrap items-center justify-center gap-5 anim-fade-in"
          style={{ animationDelay: '0.6s', opacity: 0 }}
        >
          {[
            { icon: '⚡', text: '10,000+ scans' },
            { icon: '🔥', text: 'Going viral on TikTok' },
            { icon: '✦', text: 'Used by creators' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2">
              <span className="text-[12px]">{item.icon}</span>
              <span className="font-mono text-[11px] text-[#C8C4BC] tracking-[0.15em] font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ UPLOAD */}
      <section id="scan" className="relative z-10 px-4 sm:px-6 py-8 sm:py-10 flex flex-col items-center gap-5">
        <div className="text-center">
          <p className="font-mono text-[10px] text-[#3A3632] tracking-[0.28em] mb-1.5">READY TO SCAN</p>
          <h2 className="font-sans font-black text-white text-3xl tracking-tight">Drop your fit.</h2>
        </div>

        {/* Scan-frame card */}
        <div className="relative w-full max-w-lg">
          <div className="absolute -top-3 -left-3 w-7 h-7 border-t-2 border-l-2 border-[rgba(147,51,234,0.45)] rounded-tl pointer-events-none" />
          <div className="absolute -top-3 -right-3 w-7 h-7 border-t-2 border-r-2 border-[rgba(147,51,234,0.45)] rounded-tr pointer-events-none" />
          <div className="absolute -bottom-3 -left-3 w-7 h-7 border-b-2 border-l-2 border-[rgba(147,51,234,0.45)] rounded-bl pointer-events-none" />
          <div className="absolute -bottom-3 -right-3 w-7 h-7 border-b-2 border-r-2 border-[rgba(147,51,234,0.45)] rounded-br pointer-events-none" />

          <UploadZone isLoggedIn={!!user} credits={credits} isMogPlus={isMogPlus} dailyRoastAvailable={dailyRoastAvailable} />
        </div>

        {/* Single status line — no duplicate */}
        {user && scanStreak > 1 ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(255,107,0,0.22)] bg-[rgba(255,107,0,0.07)]">
            <span className="text-[13px]">🔥</span>
            <span className="font-mono text-[10px] text-[#FF6B00] font-bold tracking-[0.14em]">{scanStreak} day streak</span>
          </div>
        ) : (
          <p className="font-mono text-[10px] text-[#3A3632] tracking-[0.18em]">
            {!user
              ? 'first scan free · no account needed'
              : isMogPlus
                ? 'MOG+ · unlimited scans'
                : dailyRoastAvailable
                  ? 'daily free roast ready ⚡'
                  : `⚡ ${credits} credit${credits !== 1 ? 's' : ''} remaining`}
          </p>
        )}
      </section>



      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ MOG+ PROMO */}
      <section className="relative z-10 px-4 sm:px-6 py-8 sm:py-10 flex flex-col items-center">
        <div className="relative w-full max-w-2xl rounded-2xl border border-[rgba(255,107,0,0.22)] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,107,0,0.10) 0%, transparent 70%)' }} />
          <div className="relative flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10">
            <div className="flex flex-col items-center sm:items-start gap-4 flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,107,0,0.35)] bg-[rgba(255,107,0,0.09)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
                <span className="font-mono text-[9px] text-[#FF6B00] tracking-[0.25em]">MOG+ VIP</span>
              </div>
              <h2 className="font-sans font-black text-white text-3xl sm:text-4xl leading-none tracking-tight">
                Roast&apos;s free.<br />Glowing up isn&apos;t.
              </h2>
              <p className="font-sans text-[#5A5450] text-sm leading-relaxed max-w-xs">
                Unlimited scans + full glow-up plans + inspo matching. $7.99/mo — under a latte.
              </p>
              <a
                href="#scan"
                className="group flex items-center gap-2 px-6 py-3 rounded-full font-mono text-[11px] font-bold tracking-[0.16em] text-[#080809] bg-[#FF6B00] hover:opacity-90 transition-all"
                style={{ boxShadow: '0 0 24px rgba(255,107,0,0.4)' }}
              >
                SCAN FIRST, UPGRADE AFTER
                <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
              </a>
            </div>
            <div className="flex flex-col gap-2 shrink-0 min-w-[160px]">
              {[
                { icon: '⚡', text: 'Unlimited scans' },
                { icon: '✦', text: 'Full glow-up plan' },
                { icon: '🎯', text: 'Inspo matching' },
                { icon: '🏆', text: 'VIP badge on cards' },
                { icon: '🔓', text: 'Rare archetypes' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3 px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(255,107,0,0.05)', border: '1px solid rgba(255,107,0,0.1)' }}>
                  <span className="text-[12px]">{item.icon}</span>
                  <span className="font-mono text-[10px] text-[#C8C4BC] tracking-[0.08em]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ EXAMPLE RESULTS */}
      <section id="examples" className="relative z-10 px-6 py-10 sm:py-14">
        <div className="text-center mb-8 max-w-lg mx-auto">
          <p className="font-mono text-[10px] text-[#3A3632] tracking-[0.28em] mb-2">REAL RESULTS</p>
          <h2 className="font-sans font-black text-white text-3xl tracking-tight mb-2">
            The verdict doesn&apos;t lie.
          </h2>
          <p className="font-sans text-[#4A4742] text-sm leading-relaxed">
            Each read is tailored to your energy. No two are the same.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {EXAMPLE_RESULTS.map((result, i) => (
            <div key={result.archetype_name} className="w-full">
              <ResultCard
                result={result}
                scanId={['9FC2E1V422', 'B4A7K3X891', '3DE9T7Y556'][i]}
                unlocked={true}
                compact={false}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ PRICING */}
      <section className="relative z-10 px-6 py-10 sm:py-14 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <p className="font-mono text-[10px] text-[#3A3632] tracking-[0.28em] mb-2">PRICING</p>
          <h2 className="font-sans font-black text-white text-3xl tracking-tight mb-2">The roast is free.</h2>
          <p className="font-sans text-[#4A4742] text-sm">The glow-up is where it gets real. Pick your lane.</p>
        </div>

        <LandingCredits isLoggedIn={!!user} />
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ FOOTER */}
      <footer className="relative z-10 border-t border-[rgba(255,241,234,0.06)] mt-10">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-[12px] h-[12px] rounded-[3px] bg-white opacity-80" />
                <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.22em] font-bold">MOGFIT</span>
              </div>
              <p className="font-sans text-[12px] text-[#8A8680] max-w-[220px] leading-relaxed">
                Brutally honest fit reads — and exactly how to glow up.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-2.5">
              <Link href="/how-it-works" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.14em] transition-colors">HOW IT WORKS</Link>
              <Link href="/leaderboard" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.14em] transition-colors">LEADERBOARD</Link>
              <Link href="/auth" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.14em] transition-colors">SIGN IN</Link>
              <Link href="/privacy" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.14em] transition-colors">PRIVACY POLICY</Link>
              <Link href="/terms" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.14em] transition-colors">TERMS OF SERVICE</Link>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[rgba(255,241,234,0.05)]">
            <p className="font-mono text-[9px] text-[#8A8680] tracking-[0.12em]">
              © {new Date().getFullYear()} Mogfit. All rights reserved.
            </p>
            <p className="font-mono text-[9px] text-[#8A8680] tracking-[0.12em]">
              For entertainment purposes. Not professional style advice.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
