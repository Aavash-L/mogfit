'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { encodeResult } from '@/lib/encode-result';
import { LoadingScan } from './loading-scan';

type Stage = 'idle' | 'analyzing' | 'error' | 'paywall';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface UploadZoneProps {
  scansRemaining?: number;
}

export function UploadZone({ scansRemaining = 0 }: UploadZoneProps) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string>('');
  const [dragging, setDragging] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are accepted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB.');
      return;
    }

    setError('');
    setStage('analyzing');

    try {
      const base64 = await fileToBase64(file);
      const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (analyzeRes.status === 401) {
        router.push('/auth');
        return;
      }

      if (analyzeRes.status === 402) {
        setStage('paywall');
        return;
      }

      if (analyzeRes.status === 422) {
        const data = await analyzeRes.json();
        setError(data.message ?? 'No fit detected. Try a clearer photo.');
        setStage('error');
        return;
      }

      if (!analyzeRes.ok) {
        const data = await analyzeRes.json().catch(() => ({}));
        throw new Error(data.error ?? 'Analysis failed');
      }

      const result = await analyzeRes.json();
      const encoded = encodeResult(result);
      router.push(`/result/${encoded}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setStage('error');
    }
  }

  async function handleBuyScans() {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setCheckoutLoading(false);
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
  };

  if (stage === 'analyzing') {
    return (
      <div className="w-full max-w-xl">
        <LoadingScan />
      </div>
    );
  }

  if (stage === 'paywall') {
    return (
      <div className="w-full max-w-xl flex flex-col items-center gap-5 rounded-2xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] p-10 text-center">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em]">SCAN LIMIT REACHED</span>
          <p className="font-sans font-semibold text-[#F5F1EA] text-lg">Free scan used.</p>
          <p className="font-sans text-[#8A8680] text-sm">Get 10 more scans for $4.99.</p>
        </div>
        <button
          onClick={handleBuyScans}
          disabled={checkoutLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-mono text-xs tracking-[0.15em] text-[#080809] font-bold bg-white transition-opacity disabled:opacity-50"
        >
          {checkoutLoading ? 'LOADING...' : 'GET 10 SCANS — $4.99 →'}
        </button>
        <button
          onClick={() => setStage('idle')}
          className="font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] underline transition-colors"
        >
          cancel
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-3">
      {scansRemaining > 0 && (
        <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.12em] text-center">
          {scansRemaining} scan{scansRemaining !== 1 ? 's' : ''} remaining
        </p>
      )}

      <label
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          group relative flex flex-col items-center justify-center gap-5 cursor-pointer
          rounded-2xl border transition-all duration-200 p-14
          ${dragging
            ? 'border-white bg-[rgba(255,255,255,0.05)]'
            : 'border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] hover:border-[rgba(255,241,234,0.2)] hover:bg-[rgba(255,241,234,0.05)]'
          }
        `}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onFileChange}
        />

        {/* Upload icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 3v13M5 9l6-6 6 6M3 19h16" stroke="#F5F1EA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="text-center">
          <p className="font-sans font-semibold text-[#F5F1EA] text-base mb-1.5">
            Drop your fit pic
          </p>
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
          <button
            onClick={() => { setStage('idle'); setError(''); }}
            className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] mt-1.5 underline"
          >
            try again
          </button>
        </div>
      )}
    </div>
  );
}
