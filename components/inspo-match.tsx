'use client';

import { useState, useCallback } from 'react';
import type { AuraResult, InspoMatchResult } from '@/lib/types';
import { BuyCreditsModal } from './buy-credits-modal';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface InspoMatchProps {
  result: AuraResult;
  encodedId: string;
  isLoggedIn: boolean;
  isMogPlus: boolean;
  currentImageBase64?: string;
  currentMimeType?: string;
}

export function InspoMatch({ result, encodedId, isLoggedIn, isMogPlus, currentImageBase64, currentMimeType }: InspoMatchProps) {
  const [inspoFiles, setInspoFiles] = useState<Array<{ preview: string; base64: string; mimeType: string }>>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [matchResult, setMatchResult] = useState<InspoMatchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);

  const addInspoImage = useCallback(async (file: File) => {
    if (inspoFiles.length >= 3) return;
    if (!file.type.startsWith('image/')) return;
    const base64 = await fileToBase64(file);
    const preview = URL.createObjectURL(file);
    setInspoFiles(prev => [...prev, { preview, base64, mimeType: file.type }]);
  }, [inspoFiles.length]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.slice(0, 3 - inspoFiles.length).forEach(addInspoImage);
    e.target.value = '';
  };

  async function handleAnalyze() {
    if (!isLoggedIn) { setShowBuyModal(true); return; }
    if (!currentImageBase64) { window.location.href = '/'; return; }
    if (inspoFiles.length === 0) return;

    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/inspo-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentImageBase64,
          currentMimeType: currentMimeType ?? 'image/jpeg',
          inspoImages: inspoFiles.map(f => ({ base64: f.base64, mimeType: f.mimeType })),
          auraResult: result,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) { setState('idle'); setShowBuyModal(true); return; }
        setState('error');
        setErrorMsg(data.error || 'Something went wrong.');
        return;
      }
      setMatchResult(data.inspoMatch);
      setState('done');
    } catch {
      setState('error');
      setErrorMsg('Network error. Try again.');
    }
  }

  return (
    <>
      <div className="w-full rounded-[22px] overflow-hidden" style={{
        background: 'linear-gradient(160deg, #080A0C 0%, #0A0C10 100%)',
        border: state === 'done' ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(99,102,241,0.18)',
        boxShadow: state === 'done' ? '0 0 50px -10px rgba(99,102,241,0.25)' : '0 0 20px -10px rgba(99,102,241,0.12)',
      }}>
        <div className="h-[1.5px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(139,92,246,0.4), transparent)' }} />

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[15px]">🎯</span>
              <span className="font-sans font-black text-white text-[16px] tracking-tight">Inspo Match</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: isMogPlus ? 'rgba(255,107,0,0.1)' : 'rgba(99,102,241,0.1)', border: isMogPlus ? '1px solid rgba(255,107,0,0.25)' : '1px solid rgba(99,102,241,0.22)' }}>
              <span className="font-mono text-[8px] tracking-[0.18em]" style={{ color: isMogPlus ? '#FF6B00' : '#818CF8' }}>
                {isMogPlus ? 'MOG+ INCLUDED' : 'VIP / 1 CREDIT'}
              </span>
            </div>
          </div>

          <p className="font-sans text-[12px] text-[#5A5450] leading-relaxed">
            Upload 1–3 inspo images showing the look you&apos;re going for. We&apos;ll tell you what&apos;s aligned and what&apos;s missing.
          </p>

          {/* Image upload grid */}
          {state !== 'done' && (
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                inspoFiles[i] ? (
                  <div key={i} className="relative flex-1 aspect-square rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={inspoFiles[i].preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setInspoFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white text-[10px] font-bold"
                    >×</button>
                  </div>
                ) : (
                  <label key={i} className="flex-1 aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all" style={{ background: 'rgba(99,102,241,0.04)', border: '1px dashed rgba(99,102,241,0.22)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.22)'; }}
                  >
                    <input type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
                    <span className="text-[18px] opacity-40">+</span>
                  </label>
                )
              ))}
            </div>
          )}

          {state === 'idle' && inspoFiles.length > 0 && (
            <button
              onClick={handleAnalyze}
              className="w-full py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-[0.14em] text-white transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 20px -4px rgba(99,102,241,0.45)' }}
            >
              MATCH MY INSPO →
            </button>
          )}

          {state === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-[rgba(99,102,241,0.15)]" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
              </div>
              <span className="font-mono text-[10px] text-[#6366F1] tracking-[0.2em]">ANALYZING THE VIBE GAP...</span>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] text-[#EF4444] text-center">{errorMsg}</p>
              <button onClick={() => setState('idle')} className="w-full py-2.5 rounded-xl font-mono text-[10px] text-[#8A8680]" style={{ border: '1px solid rgba(255,241,234,0.08)' }}>try again</button>
            </div>
          )}

          {state === 'done' && matchResult && <InspoResult matchResult={matchResult} />}
        </div>
      </div>

      {showBuyModal && (
        <BuyCreditsModal isLoggedIn={isLoggedIn} onClose={() => setShowBuyModal(false)} defaultTab="mogplus" />
      )}
    </>
  );
}

function InspoResult({ matchResult }: { matchResult: InspoMatchResult }) {
  return (
    <div className="flex flex-col gap-3" style={{ animation: 'fade-up 0.35s ease both' }}>
      {/* Vibe gap */}
      <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
        <span className="font-mono text-[8px] text-[#6366F1] tracking-[0.22em] block mb-1">✦ VIBE GAP</span>
        <p className="font-sans font-semibold text-[#F5F1EA] text-[13px] leading-snug">{matchResult.vibe_gap}</p>
      </div>

      {/* Already aligned */}
      {matchResult.aligned.length > 0 && (
        <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.14)' }}>
          <span className="font-mono text-[8px] text-[#4ADE80] tracking-[0.22em] block mb-2">✓ ALREADY ALIGNED</span>
          <div className="flex flex-col gap-1">
            {matchResult.aligned.map((item, i) => (
              <p key={i} className="font-sans text-[12px] text-[#86EFAC]">— {item}</p>
            ))}
          </div>
        </div>
      )}

      {/* Missing */}
      {matchResult.missing.length > 0 && (
        <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.14)' }}>
          <span className="font-mono text-[8px] text-[#EF4444] tracking-[0.22em] block mb-2">✗ MISSING</span>
          <div className="flex flex-col gap-1">
            {matchResult.missing.map((item, i) => (
              <p key={i} className="font-sans text-[12px] text-[#FCA5A5]">— {item}</p>
            ))}
          </div>
        </div>
      )}

      {/* Additions */}
      {matchResult.additions.length > 0 && (
        <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <span className="font-mono text-[8px] text-[#818CF8] tracking-[0.22em] block mb-2">➕ ADD THESE</span>
          <div className="flex flex-col gap-2">
            {matchResult.additions.map((item, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="font-sans font-semibold text-[#C7D2FE] text-[12px]">{item.add}</span>
                <span className="font-sans text-[11px] text-[#6B6460]">{item.why}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
