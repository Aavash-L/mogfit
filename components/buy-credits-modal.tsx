'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

interface BuyCreditsModalProps {
  isLoggedIn: boolean;
  onClose: () => void;
  defaultTab?: 'mogplus' | 'credits';
}

const CREDIT_PACKAGES = [
  { id: 'starter', credits: 5, price: '$4.99', label: null },
  { id: 'popular', credits: 15, price: '$9.99', label: 'MOST POPULAR' },
  { id: 'value', credits: 50, price: '$24.99', label: 'BEST VALUE' },
];

export function BuyCreditsModal({ isLoggedIn, onClose, defaultTab = 'mogplus' }: BuyCreditsModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'mogplus' | 'credits'>(defaultTab);
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
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-sm flex flex-col gap-4 rounded-t-2xl sm:rounded-2xl border border-[rgba(255,241,234,0.1)] bg-[#0F0F0F] p-5 pb-8 sm:pb-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full border border-[rgba(255,241,234,0.1)] text-[#8A8680] hover:text-white transition-colors font-mono text-[14px]">×</button>

        <div className="flex flex-col gap-1">
          <h2 className="font-sans font-black text-white text-xl tracking-tight">
            {isLoggedIn ? 'Upgrade your aura' : 'Create account first'}
          </h2>
          <p className="font-sans text-[#8A8680] text-sm">
            {isLoggedIn ? "Your roast is free. Glowing up isn't." : 'Takes 10 seconds. Then come back here.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="font-mono text-[11px] text-red-400">{error}</p>
          </div>
        )}

        {isLoggedIn ? (
          <>
            {/* Tab toggle */}
            <div className="flex gap-1 p-1 rounded-xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)]">
              <button
                onClick={() => setTab('mogplus')}
                className={`flex-1 py-2 rounded-lg font-mono text-[10px] tracking-[0.14em] transition-all ${tab === 'mogplus' ? 'bg-[#FF6B00] text-white font-bold' : 'text-[#4A4742] hover:text-[#8A8680]'}`}
              >
                MOG+ VIP
              </button>
              <button
                onClick={() => setTab('credits')}
                className={`flex-1 py-2 rounded-lg font-mono text-[10px] tracking-[0.14em] transition-all ${tab === 'credits' ? 'bg-white text-[#080809] font-bold' : 'text-[#4A4742] hover:text-[#8A8680]'}`}
              >
                ⚡ CREDITS
              </button>
            </div>

            {tab === 'mogplus' && (
              <div className="flex flex-col gap-3">
                {/* MOG+ hero card */}
                <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3"
                  style={{ background: 'linear-gradient(160deg, #1A0A00 0%, #120800 100%)', border: '1px solid rgba(255,107,0,0.35)', boxShadow: '0 0 40px -10px rgba(255,107,0,0.25)' }}>
                  <div className="h-px w-full mb-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.7), transparent)' }} />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold text-[#FF6B00] tracking-[0.25em] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.25)' }}>MOG+ VIP</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {['Unlimited scans + glow-ups', 'Inspo matching', 'VIP badge on your cards', 'Rare archetypes unlocked', 'Early access to new features'].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <span className="text-[#FF6B00] text-[11px]">✦</span>
                        <span className="font-sans text-[12px] text-[#C8C4BC]">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing options */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handlePurchase('mogplus_yearly')}
                    disabled={loading !== null}
                    className="relative flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all disabled:opacity-50"
                    style={{ borderColor: 'rgba(255,107,0,0.4)', background: 'rgba(255,107,0,0.08)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,0,0.65)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,0,0.4)'; }}
                  >
                    <span className="absolute -top-2.5 right-3 font-mono text-[8px] text-white bg-[#FF6B00] px-2 py-0.5 rounded-full tracking-[0.1em]">BEST DEAL</span>
                    <div>
                      <p className="font-sans font-semibold text-[#F5F1EA] text-sm">Annual</p>
                      <p className="font-mono text-[10px] text-[#8A8680]">$4.16/mo · billed $49.99/yr</p>
                    </div>
                    <span className="font-mono text-[13px] font-bold text-[#FF6B00]">{loading === 'mogplus_yearly' ? '...' : '$49.99'}</span>
                  </button>
                  <button
                    onClick={() => handlePurchase('mogplus_monthly')}
                    disabled={loading !== null}
                    className="flex items-center justify-between rounded-xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-3.5 text-left hover:border-[rgba(255,241,234,0.18)] hover:bg-[rgba(255,241,234,0.06)] transition-all disabled:opacity-50"
                  >
                    <div>
                      <p className="font-sans font-semibold text-[#F5F1EA] text-sm">Monthly</p>
                      <p className="font-mono text-[10px] text-[#4A4742]">cancel anytime</p>
                    </div>
                    <span className="font-mono text-[13px] font-bold text-white">{loading === 'mogplus_monthly' ? '...' : '$7.99'}</span>
                  </button>
                </div>
              </div>
            )}

            {tab === 'credits' && (
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.1em]">1 credit = 1 scan or 1 glow-up. Never expire.</p>
                {CREDIT_PACKAGES.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading !== null}
                    className="relative flex items-center justify-between rounded-xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-3.5 hover:border-[rgba(255,241,234,0.2)] hover:bg-[rgba(255,241,234,0.06)] transition-all disabled:opacity-50 text-left"
                  >
                    {pkg.label && (
                      <span className="absolute -top-2 right-3 font-mono text-[9px] text-[#080809] bg-white px-2 py-0.5 rounded-full tracking-[0.12em]">{pkg.label}</span>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⚡</span>
                      <div>
                        <p className="font-sans font-semibold text-[#F5F1EA] text-sm">{pkg.credits} Credits</p>
                        <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.1em]">
                          ${(parseFloat(pkg.price.replace('$', '')) / pkg.credits).toFixed(2)}/credit
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[13px] font-bold text-white">{loading === pkg.id ? '...' : pkg.price}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => router.push('/auth?next=/')}
            className="w-full rounded-full py-3 font-mono text-[12px] font-bold tracking-[0.15em] text-[#080809] bg-white"
          >
            CREATE ACCOUNT →
          </button>
        )}

        <button onClick={onClose} className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] text-center underline transition-colors">
          cancel
        </button>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
