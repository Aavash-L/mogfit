'use client';

import { useState } from 'react';

export function AdminActions() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string; newCredits?: number } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const credits = parseInt(amount, 10);
    try {
      const res = await fetch('/api/admin/give-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), credits }),
      });
      const json = await res.json();
      setResult(json);
      if (json.ok) { setEmail(''); setAmount(''); }
    } catch {
      setResult({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  const credits = parseInt(amount, 10) || 0;

  return (
    <div className="rounded-2xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] p-6">
      <p className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em] mb-5">GIVE / ADJUST CREDITS</p>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em]">USER EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="rounded-xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-3 font-mono text-[13px] text-[#F5F1EA] placeholder-[#4A4742] outline-none focus:border-[rgba(255,241,234,0.3)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-36">
          <label className="font-mono text-[9px] text-[#4A4742] tracking-[0.15em]">AMOUNT</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 10"
            required
            className="rounded-xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-3 font-mono text-[13px] text-[#F5F1EA] placeholder-[#4A4742] outline-none focus:border-[rgba(255,241,234,0.3)] transition-colors"
          />
          {amount && (
            <span className={`font-mono text-[9px] tracking-[0.1em] ${credits > 0 ? 'text-[#4ADE80]' : 'text-[#EF4444]'}`}>
              {credits > 0 ? `+${credits} credits` : `${credits} credits (remove)`}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !email || !amount}
          className="h-[46px] px-6 rounded-xl font-mono text-[11px] font-bold tracking-[0.15em] text-[#080809] bg-white hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0"
        >
          {loading ? '...' : 'APPLY'}
        </button>
      </form>

      {result && (
        <div className={`mt-3 px-4 py-2.5 rounded-xl font-mono text-[11px] tracking-[0.1em] ${result.ok ? 'bg-[rgba(74,222,128,0.08)] text-[#4ADE80] border border-[rgba(74,222,128,0.2)]' : 'bg-[rgba(239,68,68,0.08)] text-[#EF4444] border border-[rgba(239,68,68,0.2)]'}`}>
          {result.ok
            ? `✓ Done — user now has ⚡${result.newCredits} credits`
            : `✗ ${result.error}`}
        </div>
      )}

      <p className="font-mono text-[9px] text-[#4A4742] mt-4 tracking-[0.1em]">
        Use a negative number to remove credits (e.g. -5)
      </p>
    </div>
  );
}
