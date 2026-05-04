'use client';

import { useState } from 'react';

export function ChallengeButton({ encodedId }: { encodedId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [battleUrl, setBattleUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  async function create() {
    setState('loading');
    setErrMsg('');
    try {
      const res = await fetch('/api/battle/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encodedId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error ?? `Error ${res.status}`);
        setState('error');
        return;
      }
      const url = `${window.location.origin}/battle/${data.battleId}`;
      setBattleUrl(url);
      setState('ready');
    } catch {
      setErrMsg('Network error');
      setState('error');
    }
  }

  function copy() {
    navigator.clipboard.writeText(battleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (state === 'ready') {
    return (
      <div className="w-full flex flex-col gap-2" style={{ animation: 'fade-up 0.3s ease both' }}>
        <p className="font-mono text-[9px] text-[#4A4742] tracking-[0.18em] text-center">SEND THIS TO YOUR FRIEND</p>
        <div
          className="flex items-center gap-2 px-3.5 py-3 rounded-xl cursor-pointer"
          style={{ border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)' }}
          onClick={copy}
        >
          <span className="font-mono text-[10px] text-[#8A8680] truncate flex-1">{battleUrl}</span>
          <span className="font-mono text-[10px] font-bold flex-shrink-0 transition-colors" style={{ color: copied ? '#4ADE80' : '#A78BFA' }}>
            {copied ? 'copied ✓' : 'copy ⚔️'}
          </span>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="w-full flex flex-col gap-2">
        <p className="font-mono text-[10px] text-[#EF4444] tracking-[0.1em] text-center">{errMsg}</p>
        <button
          onClick={() => { setState('idle'); setErrMsg(''); }}
          className="w-full h-[44px] rounded-xl font-mono text-[11px] tracking-[0.14em]"
          style={{ border: '1px solid rgba(255,241,234,0.08)', color: '#8A8680' }}
        >
          retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={create}
      disabled={state === 'loading'}
      className="w-full h-[44px] rounded-xl font-mono text-[11px] font-bold tracking-[0.14em] disabled:opacity-50 transition-all"
      style={{
        background: 'rgba(139,92,246,0.1)',
        border: '1px solid rgba(139,92,246,0.28)',
        color: '#A78BFA',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.16)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
    >
      {state === 'loading' ? '...' : '⚔️ 1V1 A FRIEND'}
    </button>
  );
}
