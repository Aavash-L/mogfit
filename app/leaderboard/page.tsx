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

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080809]">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% -5%, rgba(255,255,255,0.03) 0%, transparent 60%)',
        }}
      />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </Link>
        <Link href="/" className="font-mono text-[10px] text-[#4A4742] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
          ← scan yours
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col items-center px-6 pt-6 pb-20 gap-8 max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)]">
            <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em]">TOP AURAS</span>
          </div>
          <h1
            className="font-sans font-black text-white leading-[0.95] tracking-tight"
            style={{
              fontSize: 'clamp(48px, 10vw, 80px)',
              textShadow: '0 0 60px rgba(255,255,255,0.5), 0 0 120px rgba(255,255,255,0.2)',
            }}
          >
            LEADERBOARD
          </h1>
          <p className="font-sans text-[#8A8680] text-sm">
            the highest auras on the planet
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <span className="font-mono text-[12px] text-[#4A4742] tracking-[0.15em]">NO SCANS YET</span>
            <Link href="/" className="font-mono text-[11px] text-[#8A8680] hover:text-white underline transition-colors">
              be the first →
            </Link>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-0">
            {rows.map((row, i) => (
              <Link
                key={row.id}
                href={`/result/${row.encoded_result}`}
                className="group flex items-center gap-4 px-4 py-4 border-b border-[rgba(255,241,234,0.06)] hover:bg-[rgba(255,241,234,0.03)] transition-colors"
              >
                {/* Rank */}
                <span
                  className="font-mono text-[13px] font-bold w-8 text-center flex-shrink-0"
                  style={{ color: i < 3 ? '#FF6B00' : '#4A4742' }}
                >
                  {i + 1}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-[#F5F1EA] text-[14px] leading-tight">
                    {row.archetype_name}
                  </p>
                  <p className="font-sans text-[11px] text-[#4A4742] italic leading-tight mt-0.5 truncate">
                    {row.archetype_tag}
                  </p>
                </div>

                {/* Tier */}
                <span
                  className="font-mono text-[11px] font-bold tracking-[0.12em] flex-shrink-0"
                  style={{ color: TIER_COLOR[row.tier] || '#8A8680' }}
                >
                  {row.tier}
                </span>

                {/* Score */}
                <span
                  className="font-mono text-[18px] font-bold flex-shrink-0 w-14 text-right"
                  style={{ color: '#FF6B00' }}
                >
                  {row.aura_score}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
