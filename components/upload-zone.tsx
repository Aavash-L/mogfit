'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { encodeResult } from '@/lib/encode-result';
import { LoadingScan } from './loading-scan';
import { BuyCreditsModal } from './buy-credits-modal';

type Stage = 'idle' | 'analyzing' | 'error' | 'paywall';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface UploadZoneProps {
  isLoggedIn: boolean;
  credits: number;
  isMogPlus?: boolean;
  dailyRoastAvailable?: boolean;
}

export function UploadZone({ isLoggedIn, credits, isMogPlus = false, dailyRoastAvailable = true }: UploadZoneProps) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string>('');
  const [dragging, setDragging] = useState(false);
  const [mustLogin, setMustLogin] = useState(false);

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Only image files are accepted.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return; }

    setError('');
    setStage('analyzing');

    try {
      const base64 = await fileToBase64(file);
      const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (res.status === 402) {
        const data = await res.json().catch(() => ({}));
        setMustLogin(!!data.mustLogin);
        setStage('paywall');
        return;
      }

      if (res.status === 422) {
        const data = await res.json();
        setError(data.message ?? 'No fit detected. Try a clearer photo.');
        setStage('error');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Analysis failed');
      }

      const data = await res.json();
      const encoded = encodeResult(data);

      if (data.unlocked) {
        try { sessionStorage.setItem(`aura_unlocked_${encoded}`, '1'); } catch {}
      }
      // Store image for glow-up (cleared after 30 min to save memory)
      try {
        sessionStorage.setItem('mogfit_last_image', base64);
        sessionStorage.setItem('mogfit_last_mime', mimeType);
        sessionStorage.setItem('mogfit_last_image_encoded', encoded);
      } catch {}

      router.push(`/result/${encoded}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setStage('error');
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  if (stage === 'analyzing') {
    return <div className="w-full max-w-xl"><LoadingScan /></div>;
  }

  if (stage === 'paywall') {
    return (
      <>
        <div className="w-full max-w-xl flex flex-col items-center gap-5 rounded-2xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] p-10 text-center">
          <div className="text-3xl">⚡</div>
          <div className="flex flex-col gap-1.5">
            <p className="font-sans font-black text-white text-xl tracking-tight">
              {mustLogin ? 'Create an account' : "You're out of scans"}
            </p>
            <p className="font-sans text-[#8A8680] text-sm">
              {mustLogin
                ? 'Scan your friends. It gets addictive.'
                : 'Credits never expire. Spend on scans or unlocks.'}
            </p>
          </div>
          <button
            onClick={() => setStage('idle')}
            className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] underline transition-colors"
          >
            cancel
          </button>
        </div>
        <BuyCreditsModal isLoggedIn={isLoggedIn && !mustLogin} onClose={() => setStage('idle')} />
      </>
    );
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-3">
      {isLoggedIn && (
        <p className="font-mono text-[10px] tracking-[0.12em] text-center" style={{ color: isMogPlus ? '#FF6B00' : dailyRoastAvailable ? '#4ADE80' : '#4A4742' }}>
          {isMogPlus
            ? '⚡ MOG+ — unlimited scans'
            : dailyRoastAvailable
              ? '⚡ daily free roast ready'
              : `⚡ ${credits} credit${credits !== 1 ? 's' : ''} remaining`}
        </p>
      )}

      <label
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          group relative flex flex-col items-center justify-center gap-5 cursor-pointer
          rounded-2xl border transition-all duration-200 p-8 sm:p-14
          ${dragging
            ? 'border-white bg-[rgba(255,255,255,0.05)]'
            : 'border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] hover:border-[rgba(255,241,234,0.2)] hover:bg-[rgba(255,241,234,0.05)]'
          }
        `}
      >
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFileChange} />

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 3v13M5 9l6-6 6 6M3 19h16" stroke="#F5F1EA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="text-center">
          <p className="font-sans font-semibold text-[#F5F1EA] text-base mb-1.5">Drop your fit pic</p>
          <p className="font-mono text-[10px] text-[#4A4742] tracking-wide">
            JPG / PNG · max 10mb · we don&apos;t store it
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs tracking-[0.15em] text-[#080809] font-bold"
          style={{ background: '#FFFFFF', boxShadow: '0 0 24px rgba(255,255,255,0.25)' }}
        >
          UPLOAD &amp; SCAN →
        </div>
      </label>

      {(stage === 'error' || error) && (
        <div className="rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)] px-4 py-3">
          <p className="font-mono text-[11px] text-[#EF4444]">{error}</p>
          <button onClick={() => { setStage('idle'); setError(''); }} className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] mt-1.5 underline">
            try again
          </button>
        </div>
      )}
    </div>
  );
}
