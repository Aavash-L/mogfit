import type { Metadata } from 'next';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { LeaderboardLive } from '@/components/leaderboard-live';

export const metadata: Metadata = {
  title: 'Leaderboard — Aura Lab',
  description: 'Top-ranked fits. The highest auras on the planet.',
};

export const dynamic = 'force-dynamic';

const TIER_COLOR: Record<string, string> = {
  ELITE: '#FF6B00',
  HIGH: '#4ADE80',
  MID: '#8A8680',
  LOW: '#EF4444',
};

const MEDALS = ['🥇', '🥈', '🥉'];

function toDisplayName(email?: string, fullName?: string): string {
  if (fullName) {
    const first = fullName.trim().split(' ')[0];
    return first.length > 12 ? first.slice(0, 11) + '…' : first;
  }
  if (email) {
    const prefix = email.split('@')[0];
    return prefix.length > 10 ? prefix.slice(0, 9) + '…' : prefix;
  }
  return 'anon';
}

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const { period = 'all' } = await searchParams;

  const service = createServiceClient();

  // Build query with optional time filter
  let query = service
    .from('scans')
    .select('id, user_id, archetype_name, archetype_tag, aura_score, tier, encoded_result, created_at')
    .order('aura_score', { ascending: false })
    .limit(50);

  if (period === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    query = query.gte('created_at', start.toISOString());
  } else if (period === 'week') {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    query = query.gte('created_at', start.toISOString());
  }

  const { data: scans, error } = await query;
  const rows = scans ?? [];

  // Fetch user display info for all unique user_ids
  const userMap = new Map<string, { name: string }>();
  if (rows.length > 0) {
    const { data: authList } = await service.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authList?.users ?? []) {
      userMap.set(u.id, {
        name: toDisplayName(
          u.email,
          (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string),
        ),
      });
    }
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  const PERIODS = [
    { key: 'all', label: 'ALL TIME' },
    { key: 'week', label: 'THIS WEEK' },
    { key: 'today', label: 'TODAY' },
  ];

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#07070A]">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,107,0,0.08) 0%, transparent 65%)', filter: 'blur(60px)' }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[13px] h-[13px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </Link>
        <Link href="/" className="font-mono text-[10px] text-[#4A4742] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors">
          ← back
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col items-center px-5 pt-6 pb-20 w-full max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,107,0,0.2)] bg-[rgba(255,107,0,0.06)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
          <span className="font-mono text-[10px] text-[#FF6B00] tracking-[0.2em]">GLOBAL RANKINGS</span>
        </div>

        <h1
          className="font-sans font-black text-white leading-[0.88] tracking-tight text-center select-none mb-4"
          style={{
            fontSize: 'clamp(56px, 12vw, 110px)',
            textShadow: '0 0 50px rgba(255,107,0,0.3), 0 0 100px rgba(255,107,0,0.12)',
          }}
        >
          LEADER<br />BOARD
        </h1>

        <div className="mb-8">
          <LeaderboardLive period={period} initialCount={rows.length} />
        </div>

        {/* Period filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] mb-8 w-full max-w-xs">
          {PERIODS.map(p => (
            <Link
              key={p.key}
              href={p.key === 'all' ? '/leaderboard' : `/leaderboard?period=${p.key}`}
              className={`flex-1 text-center font-mono text-[10px] tracking-[0.14em] py-2 rounded-lg transition-all ${
                period === p.key
                  ? 'bg-white text-[#080809] font-bold'
                  : 'text-[#4A4742] hover:text-[#8A8680]'
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>

        {error && (
          <div className="w-full rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)] px-4 py-3 mb-6">
            <p className="font-mono text-[11px] text-[#EF4444]">Failed to load: {error.message}</p>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="w-full rounded-2xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] p-14 flex flex-col items-center gap-4">
            <span className="text-4xl">🏆</span>
            <p className="font-sans font-black text-white text-xl tracking-tight">No scans yet</p>
            <p className="font-mono text-[10px] text-[#4A4742] tracking-[0.15em]">
              {period !== 'all' ? 'Try a wider time range.' : 'Be the first.'}
            </p>
            <Link href="/" className="font-mono text-[11px] text-[#8A8680] hover:text-white tracking-[0.15em] underline transition-colors mt-1">
              SCAN YOUR FIT →
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 */}
            <div className="w-full flex flex-col gap-2 mb-3">
              {top3.map((row, i) => (
                <Link
                  key={row.id}
                  href={`/result/${row.encoded_result}`}
                  className="group flex items-center gap-4 px-5 py-4 rounded-2xl border border-[rgba(255,241,234,0.08)] bg-[rgba(255,241,234,0.03)] hover:bg-[rgba(255,241,234,0.055)] hover:border-[rgba(255,241,234,0.14)] transition-all"
                  style={i === 0 ? { boxShadow: '0 0 30px -8px rgba(255,107,0,0.2)' } : undefined}
                >
                  <span className="text-xl w-8 flex-shrink-0">{MEDALS[i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-[#F5F1EA] text-[15px] leading-tight truncate">{row.archetype_name}</p>
                    <p className="font-mono text-[10px] text-[#3A3632] mt-0.5 truncate">
                      {userMap.get(row.user_id)?.name ?? 'anon'}
                    </p>
                  </div>
                  <span
                    className="font-mono text-[10px] font-bold tracking-[0.1em] flex-shrink-0 w-10 text-right"
                    style={{ color: TIER_COLOR[row.tier] ?? '#8A8680' }}
                  >
                    {row.tier}
                  </span>
                  <span className="font-mono text-[22px] font-black text-[#FF6B00] flex-shrink-0 w-14 text-right">
                    {row.aura_score}
                  </span>
                </Link>
              ))}
            </div>

            {/* Rest */}
            {rest.length > 0 && (
              <div className="w-full rounded-2xl border border-[rgba(255,241,234,0.06)] overflow-hidden mb-8">
                {rest.map((row, i) => (
                  <Link
                    key={row.id}
                    href={`/result/${row.encoded_result}`}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-[rgba(255,241,234,0.05)] last:border-0 hover:bg-[rgba(255,241,234,0.03)] transition-colors"
                  >
                    <span className="font-mono text-[11px] text-[#2A2826] w-7 text-center flex-shrink-0 tabular-nums">
                      {i + 4}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-[#E8E4DC] text-[13px] leading-tight truncate">{row.archetype_name}</p>
                      <p className="font-mono text-[9px] text-[#3A3632] mt-0.5 truncate">
                        {userMap.get(row.user_id)?.name ?? 'anon'}
                      </p>
                    </div>
                    <span
                      className="font-mono text-[10px] font-bold tracking-[0.1em] flex-shrink-0 w-10 text-right"
                      style={{ color: TIER_COLOR[row.tier] ?? '#8A8680' }}
                    >
                      {row.tier}
                    </span>
                    <span className="font-mono text-[15px] font-bold text-[#FF6B00] flex-shrink-0 w-12 text-right tabular-nums">
                      {row.aura_score}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Bottom CTAs */}
        <div className="w-full grid grid-cols-2 gap-3 mt-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl border border-[rgba(255,107,0,0.18)] bg-[rgba(255,107,0,0.05)] px-4 py-4 hover:bg-[rgba(255,107,0,0.09)] transition-colors group"
          >
            <span className="text-xl flex-shrink-0">🔥</span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] font-bold text-[#F5F1EA] tracking-[0.12em]">SCAN YOUR FIT</p>
              <p className="font-sans text-[10px] text-[#4A4742] mt-0.5">get your aura score</p>
            </div>
            <span className="font-mono text-[12px] text-[#3A3632] group-hover:text-[#F5F1EA] transition-colors">›</span>
          </Link>
          <Link
            href="/auth"
            className="flex items-center gap-3 rounded-2xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] px-4 py-4 hover:bg-[rgba(255,241,234,0.05)] transition-colors group"
          >
            <span className="text-xl flex-shrink-0">⚡</span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] font-bold text-[#F5F1EA] tracking-[0.12em]">GET CREDITS</p>
              <p className="font-sans text-[10px] text-[#4A4742] mt-0.5">unlock full readings</p>
            </div>
            <span className="font-mono text-[12px] text-[#3A3632] group-hover:text-[#F5F1EA] transition-colors">›</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
