'use client';

import { useState } from 'react';
import { BuyCreditsModal } from './buy-credits-modal';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    highlight: false,
    badge: null,
    features: [
      'First scan, no account',
      '1 free roast/day (signed in)',
      'First glow-up free',
      'Full result card + sharing',
    ],
    cta: 'START FREE',
    ctaAction: 'free',
  },
  {
    name: 'Credits',
    price: '$4.99',
    period: '5 credits',
    highlight: false,
    badge: null,
    features: [
      '1 credit = 1 scan or glow-up',
      '1 credit = 1 inspo match',
      'Credits never expire',
      'Pay only when you need more',
    ],
    cta: 'BUY CREDITS ⚡',
    ctaAction: 'credits',
  },
  {
    name: 'MOG+',
    price: '$7.99',
    period: '/mo · $49.99/yr',
    highlight: true,
    badge: 'BEST VALUE',
    features: [
      'Unlimited scans + glow-ups',
      'Inspo match included',
      'VIP badge on shared cards',
      'Rare archetypes unlocked',
      'Early access to new features',
    ],
    cta: 'GET MOG+ →',
    ctaAction: 'mogplus',
  },
];

export function LandingCredits({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'mogplus' | 'credits'>('mogplus');

  function handleClick(action: string) {
    if (action === 'free') {
      document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setDefaultTab(action === 'mogplus' ? 'mogplus' : 'credits');
    setShowModal(true);
  }

  return (
    <>
      <div className="grid sm:grid-cols-3 gap-4">
        {TIERS.map(tier => (
          <div
            key={tier.name}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: tier.highlight ? 'linear-gradient(160deg, #1A0800 0%, #120800 100%)' : '#0C0C0E',
              border: tier.highlight ? '1px solid rgba(255,107,0,0.4)' : '1px solid rgba(255,241,234,0.07)',
              boxShadow: tier.highlight ? '0 0 50px -10px rgba(255,107,0,0.25)' : undefined,
            }}
          >
            {tier.highlight && (
              <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.8), transparent)' }} />
            )}
            {tier.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold tracking-[0.14em] whitespace-nowrap px-3 py-0.5 rounded-full"
                style={{ background: '#FF6B00', color: '#fff' }}>
                {tier.badge}
              </span>
            )}
            <div className="flex flex-col gap-4 p-5 flex-1">
              <div>
                <p className="font-mono text-[9px] tracking-[0.22em] mb-1" style={{ color: tier.highlight ? '#FF6B00' : 'rgba(255,241,234,0.3)' }}>{tier.name.toUpperCase()}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-sans font-black text-white text-2xl leading-none">{tier.price}</span>
                  <span className="font-mono text-[10px] text-[#4A4742]">{tier.period}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                {tier.features.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <span className="text-[10px] mt-0.5 flex-shrink-0" style={{ color: tier.highlight ? '#FF6B00' : '#4ADE80' }}>✦</span>
                    <span className="font-sans text-[11px] text-[#8A8680] leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleClick(tier.ctaAction)}
                className="w-full py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-[0.14em] transition-all hover:scale-[1.02]"
                style={tier.highlight
                  ? { background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', color: '#fff', boxShadow: '0 0 16px rgba(255,107,0,0.4)' }
                  : { border: '1px solid rgba(255,241,234,0.12)', color: '#F5F1EA', background: 'transparent' }
                }
              >
                {tier.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <BuyCreditsModal isLoggedIn={isLoggedIn} onClose={() => setShowModal(false)} defaultTab={defaultTab} />
      )}
    </>
  );
}
