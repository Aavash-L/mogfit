'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BuyCreditsModal } from './buy-credits-modal';

interface NavbarProps {
  user: { id: string; email?: string; displayName?: string } | null;
  credits?: number;
}

export function Navbar({ user, credits = 0 }: NavbarProps) {
  const [showModal, setShowModal] = useState(false);
  const displayName = user?.displayName || user?.email?.split('@')[0] || null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-8 h-[60px] border-b border-[rgba(255,241,234,0.08)] bg-[rgba(7,7,10,0.92)] backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-75 transition-opacity flex-shrink-0">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white" />
          <span className="font-mono text-[12px] text-white tracking-[0.22em] font-bold">AURA LAB</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-5 sm:gap-6">
          <Link
            href="/how-it-works"
            className="hidden sm:block font-mono text-[11px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.16em] transition-colors"
          >
            HOW IT WORKS
          </Link>
          <Link
            href="/leaderboard"
            className="hidden sm:block font-mono text-[11px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.16em] transition-colors"
          >
            LEADERBOARD
          </Link>

          <div className="w-px h-5 bg-[rgba(255,241,234,0.12)] hidden sm:block" />

          {/* Credits pill */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all"
            style={{
              border: '1px solid rgba(255,200,50,0.25)',
              background: 'rgba(255,200,50,0.08)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,200,50,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,200,50,0.08)'; }}
          >
            <span className="text-[11px]">⚡</span>
            <span className="font-mono text-[11px] text-[#F5F1EA] font-bold tracking-[0.08em]">{credits}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:block font-mono text-[11px] text-[#8A8680] tracking-[0.08em] max-w-[110px] truncate">
                {displayName}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="font-mono text-[11px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.14em] transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth"
              className="font-mono text-[11px] font-bold tracking-[0.14em] text-[#080809] bg-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {showModal && (
        <BuyCreditsModal isLoggedIn={!!user} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
