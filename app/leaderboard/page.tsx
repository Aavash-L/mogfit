import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Leaderboard — Aura Lab',
  description: 'Top-ranked fits. The highest auras on the planet.',
};

const TIER_COLOR: Record<string, string> = {
  ELITE: '#FF6B00',
  HIGH: '#4ADE80',
  MID: '#8A8680',
  LOW: '#EF4444',
};

const RANK_MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

interface ScanRow {
  id: string;
  archetype_name: string;
  archetype_tag: string;
  aura_score: number;
  tier: string;
  encoded_result: string;
  created_at: string;
}

async function getLeaderboard(): Promise<ScanRow[]> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aura.lab';
  try {
    const res = await fetch(`${appUrl}/api/leaderboard`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080809]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -15%, rgba(255,255,255,0.05) 0%, transparent 65%)' }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </Link>
        <Link href="/" className="font-mono text-[10px] text-[#4A4742] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
          ← back
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col items-center px-6 pt-8 pb-20 gap-0 w-full max-w-2xl mx-auto">

        {/* Pill badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.12)] bg-[rgba(255,241,234,0.04)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
          <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em]">GLOBAL RANKINGS</span>
        </div>

        {/* Massive title */}
        <h1
          className="font-sans font-black text-white leading-[0.9] tracking-tight text-center select-none mb-5"
          style={{
            fontSize: 'clamp(64px, 14vw, 128px)',
            textShadow: '0 0 40px rgba(255,255,255,0.9), 0 0 80px rgba(255,255,255,0.5), 0 0 160px rgba(255,255,255,0.25)',
          }}
        >
          LEADER<br />BOARD
        </h1>

        {/* Count badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.04)] mb-10">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
          <span className="font-mono text-[11px] text-[#F5F1EA] font-bold tracking-[0.15em]">
            {rows.length} SCANS RANKED
          </span>
        </div>

        {/* Main podium card */}
        {rows.length === 0 ? (
          <div className="w-full rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.03)] p-12 flex flex-col items-center gap-4 mb-6">
            <span className="text-4xl">🏆</span>
            <p className="font-sans font-black text-white text-xl tracking-tight">No scans yet</p>
            <Link
              href="/"
              className="font-mono text-[11px] text-[#8A8680] hover:text-white tracking-[0.15em] underline transition-colors"
            >
              BE THE FIRST →
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            <div className="w-full rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.03)] overflow-hidden mb-4">
              {top3.map((row, i) => (
                <Link
                  key={row.id}
                  href={`/result/${row.encoded_result}`}
                  className="flex items-center gap-4 px-5 py-4 border-b border-[rgba(255,241,234,0.06)] last:border-0 hover:bg-[rgba(255,241,234,0.04)] transition-colors"
                >
                  <span className="text-xl w-7 flex-shrink-0">{RANK_MEDAL[i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-[#F5F1EA] text-[15px] leading-tight">{row.archetype_name}</p>
                    <p className="font-sans text-[11px] text-[#4A4742] italic truncate mt-0.5">{row.archetype_tag}</p>
                  </div>
                  <span className="font-mono text-[11px] font-bold tracking-[0.1em] flex-shrink-0" style={{ color: TIER_COLOR[row.tier] || '#8A8680' }}>
                    {row.tier}
                  </span>
                  <span className="font-mono text-[20px] font-black text-[#FF6B00] flex-shrink-0 w-14 text-right">
                    {row.aura_score}
                  </span>
                </Link>
              ))}
            </div>

            {/* Rest of leaderboard */}
            {rest.length > 0 && (
              <div className="w-full rounded-2xl border border-[rgba(255,241,234,0.06)] overflow-hidden mb-6">
                {rest.map((row, i) => (
                  <Link
                    key={row.id}
                    href={`/result/${row.encoded_result}`}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-[rgba(255,241,234,0.05)] last:border-0 hover:bg-[rgba(255,241,234,0.03)] transition-colors"
                  >
                    <span className="font-mono text-[12px] text-[#4A4742] w-7 text-center flex-shrink-0">{i + 4}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-[#F5F1EA] text-[13px] leading-tight">{row.archetype_name}</p>
                      <p className="font-sans text-[10px] text-[#4A4742] italic truncate">{row.archetype_tag}</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold tracking-[0.1em] flex-shrink-0" style={{ color: TIER_COLOR[row.tier] || '#8A8680' }}>
                      {row.tier}
                    </span>
                    <span className="font-mono text-[15px] font-bold text-[#FF6B00] flex-shrink-0 w-12 text-right">
                      {row.aura_score}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Bottom action tiles — Omoggle style */}
        <div className="w-full grid grid-cols-2 gap-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl border border-[rgba(255,107,0,0.2)] bg-[rgba(255,107,0,0.06)] px-4 py-4 hover:bg-[rgba(255,107,0,0.1)] transition-colors group"
          >
            <span className="text-2xl flex-shrink-0">🔥</span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] font-bold text-[#F5F1EA] tracking-[0.12em]">SCAN YOUR FIT</p>
              <p className="font-sans text-[10px] text-[#8A8680] mt-0.5">get your aura score</p>
            </div>
            <span className="font-mono text-[12px] text-[#4A4742] group-hover:text-[#F5F1EA] transition-colors">›</span>
          </Link>

          <Link
            href="/auth"
            className="flex items-center gap-3 rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.03)] px-4 py-4 hover:bg-[rgba(255,241,234,0.06)] transition-colors group"
          >
            <span className="text-2xl flex-shrink-0">⚡</span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] font-bold text-[#F5F1EA] tracking-[0.12em]">GET CREDITS</p>
              <p className="font-sans text-[10px] text-[#8A8680] mt-0.5">unlock full readings</p>
            </div>
            <span className="font-mono text-[12px] text-[#4A4742] group-hover:text-[#F5F1EA] transition-colors">›</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
