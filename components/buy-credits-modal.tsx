'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

interface BuyCreditsModalProps {
  isLoggedIn: boolean;
  onClose: () => void;
}

const PACKAGES = [
  { id: 'starter', credits: 5, price: '$4.99', label: null },
  { id: 'popular', credits: 15, price: '$9.99', label: 'MOST POPULAR' },
  { id: 'value', credits: 50, price: '$24.99', label: 'BEST VALUE' },
];

export function BuyCreditsModal({ isLoggedIn, onClose }: BuyCreditsModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  async function handlePurchase(pkg: string) {
    if (!isLoggedIn) {
      router.push('/auth?next=/');
      return;
    }
    setLoading(pkg);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pkg }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || `Error ${res.status} — check Stripe env vars`);
        setLoading(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setLoading(null);
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm flex flex-col gap-4 rounded-2xl border border-[rgba(255,241,234,0.1)] bg-[#111111] p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full border border-[rgba(255,241,234,0.1)] text-[#8A8680] hover:text-white hover:border-[rgba(255,241,234,0.3)] transition-colors font-mono text-[14px]"
        >
          ×
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="font-sans font-black text-white text-xl tracking-tight">
            {isLoggedIn ? 'Get Credits' : 'Create account first'}
          </h2>
          <p className="font-sans text-[#8A8680] text-sm">
            {isLoggedIn
              ? 'Credits never expire. Scan your friends. It gets addictive.'
              : 'You need an account to buy credits. Takes 10 seconds.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="font-mono text-[11px] text-red-400">{error}</p>
          </div>
        )}

        {isLoggedIn ? (
          <div className="flex flex-col gap-2">
            {PACKAGES.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading !== null}
                className="relative flex items-center justify-between rounded-xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-3.5 hover:border-[rgba(255,241,234,0.2)] hover:bg-[rgba(255,241,234,0.06)] transition-all disabled:opacity-50 text-left"
              >
                {pkg.label && (
                  <span className="absolute -top-2 right-3 font-mono text-[9px] text-[#080809] bg-white px-2 py-0.5 rounded-full tracking-[0.12em]">
                    {pkg.label}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="font-sans font-semibold text-[#F5F1EA] text-sm">{pkg.credits} Credits</p>
                    <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.1em]">
                      {(parseFloat(pkg.price.replace('$', '')) / pkg.credits).toFixed(2)}/credit
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[13px] font-bold text-white">
                  {loading === pkg.id ? '...' : pkg.price}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => router.push('/auth?next=/')}
            className="w-full rounded-full py-3 font-mono text-[12px] font-bold tracking-[0.15em] text-[#080809] bg-white"
          >
            CREATE ACCOUNT →
          </button>
        )}

        <button
          onClick={onClose}
          className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] text-center underline transition-colors"
        >
          cancel
        </button>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
