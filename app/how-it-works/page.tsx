import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works — Aura Lab',
  description: 'Upload a fit, get an AI aura reading. Here\'s exactly what happens.',
};

export default function HowItWorksPage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080809]">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -15%, rgba(255,255,255,0.05) 0%, transparent 65%)' }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </Link>
        <Link href="/" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
          ← back
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col items-center px-6 pt-8 pb-24 gap-0 w-full max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-14">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.04)]">
            <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em]">THE PROCESS</span>
          </div>
          <h1
            className="font-sans font-black text-white leading-[0.9] tracking-tight"
            style={{
              fontSize: 'clamp(52px, 12vw, 96px)',
              textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4)',
            }}
          >
            HOW IT<br />WORKS
          </h1>
          <p className="font-sans text-[#8A8680] text-sm max-w-xs leading-relaxed">
            Three steps. The AI does the heavy lifting.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3 w-full mb-10">
          {[
            {
              n: '01',
              icon: '📸',
              label: 'Drop your fit',
              desc: 'Upload any photo — full body, mirror selfie, candid, whatever. The clearer the outfit, the sharper the reading. JPEG, PNG, WEBP all work.',
            },
            {
              n: '02',
              icon: '🧠',
              label: 'AI reads the fit',
              desc: 'Claude analyzes your silhouette, color palette, layering, footwear, accessories, and cultural signals. It assigns you an archetype based on thousands of style patterns.',
            },
            {
              n: '03',
              icon: '📊',
              label: 'Score + breakdown',
              desc: 'You get an aura score out of 1000, a tier (LOW → MID → HIGH → ELITE), and a one-line roast. Unlock the full breakdown to see exactly what\'s working and what\'s not.',
            },
            {
              n: '04',
              icon: '⚡',
              label: 'Share the verdict',
              desc: 'Download your result card as an image or copy the link. Post it, send it to friends, let them get scored. The leaderboard tracks the highest auras globally.',
            },
          ].map((step, i) => (
            <div
              key={step.n}
              className="flex gap-5 rounded-2xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] p-5"
            >
              <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-0.5">
                <span className="text-2xl">{step.icon}</span>
                {i < 3 && <div className="w-px flex-1 bg-[rgba(255,241,234,0.07)] min-h-[24px]" />}
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-[#4A4742] tracking-[0.2em]">{step.n}</span>
                  <span className="font-sans font-bold text-[#F5F1EA] text-[15px]">{step.label}</span>
                </div>
                <p className="font-sans text-[#8A8680] text-[13px] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature callouts */}
        <div className="w-full grid sm:grid-cols-2 gap-4 mb-2">
          {/* Roast */}
          <div className="rounded-2xl border border-[rgba(255,107,0,0.15)] bg-[rgba(255,107,0,0.04)] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">🔥</span>
              <span className="font-sans font-black text-white text-[15px]">We roast your fit</span>
            </div>
            <p className="font-sans text-[#8A8680] text-[13px] leading-relaxed">
              No sugarcoating. The AI reads your outfit like a brutally honest friend — archetype, score, and a one-liner that stings a little.
            </p>
            <div className="rounded-xl px-3.5 py-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,107,0,0.12)' }}>
              <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.18em] mb-1.5">EXAMPLE ROAST</p>
              <p className="font-sans text-[12px] text-[#8A8680] leading-relaxed italic">
                &ldquo;You dress like you&apos;re late for something important and don&apos;t care that you&apos;re not.&rdquo;
              </p>
            </div>
            <span className="font-mono text-[9px] text-[#FF6B00] tracking-[0.15em]">FREE WITH EVERY SCAN</span>
          </div>

          {/* Fix */}
          <div className="rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">🔧</span>
              <span className="font-sans font-black text-white text-[15px]">Fix My Aura</span>
            </div>
            <p className="font-sans text-[#8A8680] text-[13px] leading-relaxed">
              After the roast comes the fix. Exact pieces to swap, what&apos;s killing your score, and the one direction that ties your whole look together.
            </p>
            <div className="rounded-xl px-3.5 py-3 flex flex-col gap-1.5" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.12)' }}>
              <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.18em] mb-0.5">WHAT&apos;S INSIDE</p>
              {['💀 What\'s killing your score', '⚡ 2 fixes to do immediately', '🔄 3 specific swaps', '🧭 Your style direction'].map(item => (
                <p key={item} className="font-sans text-[12px] text-[#6B7280]">{item}</p>
              ))}
            </div>
            <span className="font-mono text-[9px] text-[#A78BFA] tracking-[0.15em]">INCLUDED WITH EVERY CREDIT SCAN</span>
          </div>
        </div>

        {/* Free vs paid */}
        <div className="w-full rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.02)] p-6 mb-6">
          <p className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em] mb-5">WHAT YOU GET</p>
          <div className="flex flex-col gap-0">
            {[
              { free: true,  label: 'Archetype name + personality tag' },
              { free: true,  label: 'Aura score (0 – 1000)' },
              { free: true,  label: 'Tier ranking: LOW / MID / HIGH / ELITE' },
              { free: true,  label: 'One-line roast' },
              { free: false, label: 'Full piece-by-piece breakdown with scores' },
              { free: false, label: 'How people perceive you on the street' },
              { free: false, label: 'Rare trait detection' },
              { free: false, label: 'Fix My Aura — exact swaps + direction' },
              { free: false, label: 'Downloadable result card' },
            ].map((item, i, arr) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-3 ${i < arr.length - 1 ? 'border-b border-[rgba(255,241,234,0.05)]' : ''}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 font-bold ${item.free ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : 'bg-[rgba(255,241,234,0.05)] text-[#4A4742]'}`}>
                  {item.free ? '✓' : '⚡'}
                </span>
                <span className={`font-sans text-[13px] flex-1 ${item.free ? 'text-[#8A8680]' : 'text-[#4A4742]'}`}>
                  {item.label}
                </span>
                <span className={`font-mono text-[9px] tracking-[0.12em] flex-shrink-0 ${item.free ? 'text-[#4A4742]' : 'text-[#4A4742]'}`}>
                  {item.free ? 'FREE' : '1 CREDIT'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Credits explainer */}
        <div className="w-full rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.02)] p-6 mb-10">
          <p className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em] mb-4">CREDITS</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { credits: 5,  price: '$4.99', per: '$1.00/scan' },
              { credits: 15, price: '$9.99', per: '$0.67/scan', popular: true },
              { credits: 50, price: '$24.99', per: '$0.50/scan' },
            ].map((pkg) => (
              <div
                key={pkg.credits}
                className={`relative flex flex-col items-center gap-1 rounded-xl border py-4 ${pkg.popular ? 'border-white/20 bg-white/5' : 'border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)]'}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 font-mono text-[8px] text-[#080809] bg-white px-2 py-0.5 rounded-full tracking-[0.1em]">
                    POPULAR
                  </span>
                )}
                <span className="font-sans font-black text-[#F5F1EA] text-xl">⚡{pkg.credits}</span>
                <span className="font-mono text-[11px] text-white font-bold">{pkg.price}</span>
                <span className="font-mono text-[9px] text-[#4A4742]">{pkg.per}</span>
              </div>
            ))}
          </div>
          <p className="font-sans text-[#4A4742] text-[12px] leading-relaxed">
            Credits never expire. Scan your friends, your ex, random fits from the internet.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="w-full max-w-xs flex items-center justify-center rounded-full py-4 font-mono text-[12px] font-bold tracking-[0.15em] text-[#080809] bg-white hover:opacity-90 transition-opacity"
          style={{ boxShadow: '0 0 30px rgba(255,255,255,0.2)' }}
        >
          SCAN YOUR FIT →
        </Link>
      </div>
    </main>
  );
}
