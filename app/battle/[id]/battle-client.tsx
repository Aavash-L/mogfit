'use client';

import { useRef, useState } from 'react';
import { decodeResult } from '@/lib/encode-result';
import type { AuraResult } from '@/lib/types';

interface Battle {
  id: string;
  initiator_encoded: string;
  initiator_score: number;
  initiator_archetype: string;
  opponent_encoded: string | null;
  opponent_score: number | null;
  opponent_archetype: string | null;
  status: 'waiting' | 'complete';
}

const TIER_COLOR: Record<string, string> = {
  ELITE: '#FF6B00', HIGH: '#4ADE80', MID: '#8A8680', LOW: '#EF4444',
};

export function BattleClient({ battle: initial }: { battle: Battle }) {
  const [battle, setBattle] = useState(initial);
  const [state, setState] = useState<'idle' | 'scanning' | 'error'>(
    initial.status === 'complete' ? 'idle' : 'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/battle/${battle.id}` : `/battle/${battle.id}`;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      setImageData({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  }

  async function scan() {
    if (!imageData) return;
    setState('scanning');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/battle/${battle.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageData.base64, mimeType: imageData.mimeType }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'credits_required') {
          window.location.href = data.mustLogin
            ? `/auth?next=/battle/${battle.id}`
            : `/auth?next=/battle/${battle.id}`;
          return;
        }
        setErrorMsg(data.message ?? data.error ?? 'Something went wrong');
        setState('error');
        return;
      }
      // Refresh battle state
      const updated = await fetch(`/api/battle/${battle.id}`);
      setBattle(await updated.json());
      setState('idle');
    } catch {
      setErrorMsg('Network error — try again');
      setState('error');
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── COMPLETE VIEW ──────────────────────────────────────────────
  if (battle.status === 'complete' && battle.opponent_encoded) {
    const a = decodeResult(battle.initiator_encoded);
    const b = decodeResult(battle.opponent_encoded);
    const aWins = a.aura_score > b.aura_score;
    const bWins = b.aura_score > a.aura_score;
    const tied = a.aura_score === b.aura_score;
    const diff = Math.abs(a.aura_score - b.aura_score);

    return (
      <div className="w-full flex flex-col items-center gap-6" style={{ animation: 'fade-up 0.4s ease both' }}>
        {/* Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,107,0,0.2)] bg-[rgba(255,107,0,0.06)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
          <span className="font-mono text-[10px] text-[#FF6B00] tracking-[0.2em]">BATTLE RESULT</span>
        </div>

        {/* Winner banner */}
        <div className="text-center">
          {tied ? (
            <p className="font-sans font-black text-white text-3xl tracking-tight">DEAD TIED 💀</p>
          ) : (
            <>
              <p className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em] mb-1">{aWins ? 'CHALLENGER' : 'OPPONENT'} MOGS</p>
              <p className="font-sans font-black text-white text-3xl tracking-tight leading-tight">
                {aWins ? a.archetype_name : b.archetype_name}
              </p>
              <p className="font-mono text-[11px] mt-1" style={{ color: '#FF6B00' }}>
                by {diff} pts
              </p>
            </>
          )}
        </div>

        {/* Cards */}
        <div className="w-full grid grid-cols-2 gap-3">
          <MiniCard result={a} label="CHALLENGER" winner={aWins} loser={bWins && !tied} />
          <MiniCard result={b} label="OPPONENT" winner={bWins} loser={aWins && !tied} />
        </div>

        {/* Short roasts */}
        <div className="w-full grid grid-cols-2 gap-3">
          <RoastBox result={a} />
          <RoastBox result={b} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full max-w-xs">
          <a
            href="/"
            className="flex-1 h-[44px] flex items-center justify-center rounded-xl font-mono text-[11px] font-bold tracking-[0.14em] text-[#080809] bg-white hover:opacity-90 transition-opacity"
          >
            REMATCH 🔥
          </a>
          <button
            onClick={copyLink}
            className="flex-1 h-[44px] rounded-xl font-mono text-[11px] tracking-[0.14em] transition-colors"
            style={{ border: '1px solid rgba(255,241,234,0.1)', color: copied ? '#4ADE80' : '#8A8680' }}
          >
            {copied ? 'COPIED ✓' : 'SHARE'}
          </button>
        </div>
      </div>
    );
  }

  // ── WAITING / UPLOAD VIEW ──────────────────────────────────────
  const initiator = decodeResult(battle.initiator_encoded);

  return (
    <div className="w-full flex flex-col items-center gap-6" style={{ animation: 'fade-up 0.4s ease both' }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.07)]">
        <span className="text-[12px]">⚔️</span>
        <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: '#A78BFA' }}>1V1 BATTLE</span>
      </div>

      <div className="text-center flex flex-col gap-1">
        <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.2em]">CHALLENGER DROPPED</p>
        <p className="font-sans font-black text-white text-2xl tracking-tight">{initiator.archetype_name}</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="font-mono text-[22px] font-black text-[#FF6B00]">{initiator.aura_score}</span>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ color: TIER_COLOR[initiator.tier], background: `${TIER_COLOR[initiator.tier]}18`, border: `1px solid ${TIER_COLOR[initiator.tier]}30` }}>
            {initiator.tier}
          </span>
        </div>
      </div>

      <div className="font-mono text-[10px] text-[#4A4742] tracking-[0.15em]">— CAN YOU MOG THEM? —</div>

      {/* Upload zone */}
      <div
        className="w-full max-w-xs rounded-2xl overflow-hidden cursor-pointer relative"
        style={{ border: preview ? '1px solid rgba(139,92,246,0.35)' : '1.5px dashed rgba(255,241,234,0.12)', background: 'rgba(255,241,234,0.02)', minHeight: 180 }}
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="your fit" className="w-full object-cover" style={{ maxHeight: 280 }} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <span className="text-3xl">📸</span>
            <p className="font-sans font-bold text-[#F5F1EA] text-[13px]">Upload your fit</p>
            <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.1em]">tap to choose a photo</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>

      {preview && (
        <button
          onClick={scan}
          disabled={state === 'scanning'}
          className="w-full max-w-xs h-[48px] rounded-xl font-mono text-[12px] font-bold tracking-[0.15em] disabled:opacity-50 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
            border: '1px solid rgba(139,92,246,0.45)',
            color: 'white',
            boxShadow: '0 0 24px -6px rgba(139,92,246,0.5)',
          }}
        >
          {state === 'scanning' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-white inline-block" style={{ animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </span>
              SCANNING...
            </span>
          ) : 'SCAN & BATTLE ⚔️'}
          <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)', animation: 'shimmer-sweep 3s infinite' }} />
        </button>
      )}

      {!preview && (
        <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.12em] text-center">
          First scan is free — credits required after
        </p>
      )}

      {state === 'error' && (
        <p className="font-mono text-[11px] text-[#EF4444] text-center tracking-[0.1em]">{errorMsg}</p>
      )}

      {/* Share link (for initiator waiting) */}
      <div className="w-full max-w-xs">
        <p className="font-mono text-[9px] text-[#3A3632] tracking-[0.15em] text-center mb-2">SHARE THIS LINK WITH YOUR FRIEND</p>
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group"
          style={{ border: '1px solid rgba(255,241,234,0.07)', background: 'rgba(255,241,234,0.02)' }}
          onClick={copyLink}
        >
          <span className="font-mono text-[10px] text-[#4A4742] truncate flex-1">{shareUrl}</span>
          <span className="font-mono text-[10px] flex-shrink-0 transition-colors" style={{ color: copied ? '#4ADE80' : '#8A8680' }}>
            {copied ? 'copied ✓' : 'copy'}
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ result, label, winner, loser }: { result: AuraResult; label: string; winner: boolean; loser: boolean }) {
  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden"
      style={{
        background: winner ? 'rgba(255,107,0,0.06)' : 'rgba(255,255,255,0.02)',
        border: winner ? '1px solid rgba(255,107,0,0.25)' : '1px solid rgba(255,241,234,0.06)',
        boxShadow: winner ? '0 0 24px -8px rgba(255,107,0,0.3)' : 'none',
      }}
    >
      {winner && (
        <div className="absolute top-2 right-2 text-[14px]">🏆</div>
      )}
      <span className="font-mono text-[8px] tracking-[0.18em]" style={{ color: winner ? '#FF6B00' : '#4A4742' }}>{label}</span>
      <p className="font-sans font-bold text-[#F5F1EA] text-[12px] leading-tight pr-4">{result.archetype_name}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="font-mono font-black text-[18px]" style={{ color: winner ? '#FF6B00' : loser ? '#4A4742' : '#8A8680' }}>
          {result.aura_score}
        </span>
        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: TIER_COLOR[result.tier], background: `${TIER_COLOR[result.tier]}18` }}>
          {result.tier}
        </span>
      </div>
    </div>
  );
}

function RoastBox({ result }: { result: AuraResult }) {
  const firstLine = result.short_roast.split('\n')[0];
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,241,234,0.05)' }}>
      <p className="font-sans text-[10px] text-[#6B7280] leading-relaxed line-clamp-3">{firstLine}</p>
    </div>
  );
}
