'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { encodeResult } from '@/lib/encode-result';
import { LoadingScan } from './loading-scan';

type Stage = 'idle' | 'uploading' | 'analyzing' | 'error';

export function UploadZone() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string>('');
  const [dragging, setDragging] = useState(false);

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
    setStage('uploading');

    try {
      // Upload to blob
      const uploadRes = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { url } = await uploadRes.json();

      setStage('analyzing');

      // Analyze with Claude
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (analyzeRes.status === 422) {
        const { message } = await analyzeRes.json();
        setError(message ?? 'No fit detected. Try a clearer photo.');
        setStage('error');
        return;
      }

      if (!analyzeRes.ok) throw new Error('Analysis failed');

      const result = await analyzeRes.json();
      const encoded = encodeResult(result);
      router.push(`/result/${encoded}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
      setStage('error');
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    []
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  if (stage === 'analyzing') {
    return (
      <div className="w-full">
        <LoadingScan />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
      <label
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center gap-4 cursor-pointer
          rounded-2xl border-2 border-dashed transition-all duration-200
          ${dragging
            ? 'border-[#FF6B00] bg-[rgba(255,107,0,0.06)]'
            : 'border-[rgba(255,241,234,0.14)] hover:border-[rgba(255,241,234,0.25)] hover:bg-[#161616]'
          }
          ${stage === 'uploading' ? 'pointer-events-none opacity-60' : ''}
          p-12
        `}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onFileChange}
          disabled={stage === 'uploading'}
        />
        {stage === 'uploading' ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-[11px] text-[#8A8680] tracking-[0.15em]">UPLOADING...</span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl border border-[rgba(255,241,234,0.08)] flex items-center justify-center bg-[#161616]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2v12M6 6l4-4 4 4M3 16h14" stroke="#8A8680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="font-sans text-sm text-[#F5F1EA] font-medium">
                Drop a fit pic, or click to upload
              </p>
              <p className="font-mono text-[10px] text-[#4A4742] mt-1.5 tracking-wide">
                JPG/PNG · max 10mb · we don&apos;t store it
              </p>
            </div>
          </>
        )}
      </label>

      {(stage === 'error' || error) && (
        <div className="rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)] px-4 py-3">
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
