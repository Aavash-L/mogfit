'use client';

import { useState, useEffect } from 'react';

interface ReferralPromptProps {
  isLoggedIn: boolean;
  auraScore: number;
}

export function ReferralPrompt({ isLoggedIn, auraScore }: ReferralPromptProps) {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || auraScore < 700) return;
    fetch('/api/referral')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.code) setCode(d.code); })
      .catch(() => {});
  }, [isLoggedIn, auraScore]);

  if (!isLoggedIn || auraScore < 700 || !code || dismissed) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mogfit.xyz';
  const referralUrl = `${appUrl}/?ref=${code}`;

  function copy() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const message = auraScore >= 900
    ? "That score? Flex it. Invite a friend and you both get a free credit."
    : "Share this with someone whose fit needs work. Both of you get a free credit.";

  return (
    <div className="w-full max-w-sm rounded-[22px] overflow-hidden" style={{
      background: '#0C0C0E',
      border: '1px solid rgba(74,222,128,0.18)',
      boxShadow: '0 0 30px -10px rgba(74,222,128,0.15)',
    }}>
      <div className="h-[1.5px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.5), transparent)' }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[15px]">✦</span>
            <span className="font-sans font-black text-white text-[15px] tracking-tight">Flex this on someone.</span>
          </div>
          <button onClick={() => setDismissed(true)} className="font-mono text-[12px] text-[#3A3632] hover:text-[#8A8680] mt-0.5 flex-shrink-0">×</button>
        </div>
        <p className="font-sans text-[12px] text-[#5A5450] leading-relaxed">{message}</p>
        <div
          className="flex items-center gap-2 px-3.5 py-3 rounded-xl cursor-pointer transition-all"
          style={{ border: '1px solid rgba(74,222,128,0.22)', background: 'rgba(74,222,128,0.05)' }}
          onClick={copy}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,222,128,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,222,128,0.22)'; }}
        >
          <span className="font-mono text-[10px] text-[#4A4742] truncate flex-1">{referralUrl}</span>
          <span className="font-mono text-[10px] font-bold flex-shrink-0 transition-colors" style={{ color: copied ? '#4ADE80' : '#86EFAC' }}>
            {copied ? 'copied ✓' : 'copy'}
          </span>
        </div>
        <p className="font-mono text-[9px] text-[#3A3632] tracking-[0.12em] text-center">both get 1 free credit when they scan</p>
      </div>
    </div>
  );
}
