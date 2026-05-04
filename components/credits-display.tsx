'use client';

import { useState } from 'react';
import { BuyCreditsModal } from './buy-credits-modal';

interface CreditsDisplayProps {
  credits: number;
  isLoggedIn: boolean;
}

export function CreditsDisplay({ credits, isLoggedIn }: CreditsDisplayProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.04)] hover:bg-[rgba(255,241,234,0.08)] transition-colors"
      >
        <span className="text-[11px]">⚡</span>
        <span className="font-mono text-[10px] text-[#F5F1EA] font-bold tracking-[0.1em]">
          {credits} Credits
        </span>
      </button>

      {showModal && (
        <BuyCreditsModal isLoggedIn={isLoggedIn} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
