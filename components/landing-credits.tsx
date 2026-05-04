'use client';

import { useState } from 'react';
import { BuyCreditsModal } from './buy-credits-modal';

const PACKAGES = [
  { id: 'starter', credits: 5, price: '$4.99', label: null },
  { id: 'popular', credits: 15, price: '$9.99', label: 'MOST POPULAR' },
  { id: 'value', credits: 50, price: '$24.99', label: 'BEST VALUE' },
];

export function LandingCredits({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="grid sm:grid-cols-3 gap-4">
        {PACKAGES.map((pkg, i) => {
          const isHighlighted = i === 1;
          const pricePerCredit = (parseFloat(pkg.price.replace('$', '')) / pkg.credits).toFixed(2);

          return (
            <button
              key={pkg.id}
              onClick={() => setShowModal(true)}
              className={`relative flex flex-col gap-3 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                isHighlighted
                  ? 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)]'
                  : 'border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] hover:border-[rgba(255,241,234,0.14)] hover:bg-[rgba(255,241,234,0.04)]'
              }`}
              style={
                isHighlighted
                  ? { boxShadow: '0 0 50px -10px rgba(255,255,255,0.12), 0 0 0 0.5px rgba(255,255,255,0.08)' }
                  : undefined
              }
            >
              {pkg.label && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#080809] bg-white px-3 py-0.5 rounded-full tracking-[0.15em] whitespace-nowrap">
                  {pkg.label}
                </span>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">⚡</span>
                  <span className="font-sans font-black text-white text-2xl leading-none">{pkg.credits}</span>
                </div>
                <span className="font-mono text-sm font-bold text-[#8A8680]">{pkg.price}</span>
              </div>

              <div>
                <p className="font-sans font-semibold text-[#F5F1EA] text-sm">Credits</p>
                <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.08em] mt-0.5">
                  ${pricePerCredit} per scan
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {showModal && (
        <BuyCreditsModal isLoggedIn={isLoggedIn} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
