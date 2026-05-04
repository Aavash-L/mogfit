'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const INTERVAL_MS = 30_000;

export function LeaderboardLive({ period, initialCount }: { period: string; initialCount: number }) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [fresh, setFresh] = useState(false);
  const prevCount = useRef(initialCount);

  useEffect(() => {
    const tick = async () => {
      try {
        const qs = period !== 'all' ? `?period=${period}` : '';
        const res = await fetch(`/api/leaderboard${qs}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const newCount = Array.isArray(data) ? data.length : 0;
        if (newCount !== prevCount.current) {
          prevCount.current = newCount;
          setCount(newCount);
          setFresh(true);
          router.refresh(); // re-render server component with fresh data
          setTimeout(() => setFresh(false), 3000);
        }
        setLastRefresh(new Date());
      } catch {}
    };

    const id = setInterval(tick, INTERVAL_MS);
    return () => clearInterval(id);
  }, [period, router]);

  const ago = Math.round((Date.now() - lastRefresh.getTime()) / 1000);
  const agoLabel = ago < 5 ? 'just now' : ago < 60 ? `${ago}s ago` : `${Math.round(ago / 60)}m ago`;

  return (
    <div className="flex items-center gap-3">
      <p className="font-mono text-[11px] tracking-[0.2em] transition-colors duration-500 font-bold"
         style={{ color: fresh ? '#4ADE80' : '#8A8680' }}>
        {count} SCAN{count !== 1 ? 'S' : ''} RANKED
      </p>
      <span className="font-mono text-[10px] text-[#4A4742] tracking-[0.1em]">
        · updated {agoLabel}
      </span>
      {fresh && (
        <span className="font-mono text-[9px] text-[#4ADE80] tracking-[0.1em] animate-pulse">
          ↑ new
        </span>
      )}
    </div>
  );
}
