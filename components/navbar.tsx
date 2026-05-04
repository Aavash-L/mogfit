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
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-8 h-14 border-b border-[rgba(255,241,234,0.06)] bg-[rgba(7,7,10,0.85)] backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity flex-shrink-0">
          <div className="w-[13px] h-[13px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4 sm:gap-5">
          <Link
            href="/how-it-works"
            className="hidden sm:block font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] tracking-[0.18em] transition-colors"
          >
            HOW IT WORKS
          </Link>
          <Link
            href="/leaderboard"
            className="hidden sm:block font-mono text-[10px] text-[#4A4742] hover:text-[#8A8680] tracking-[0.18em] transition-colors"
          >
            LEADERBOARD
          </Link>

          <div className="w-px h-4 bg-[rgba(255,241,234,0.07)] hidden sm:block" />

          {/* Credits pill */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.04)] hover:bg-[rgba(255,241,234,0.08)] hover:border-[rgba(255,241,234,0.2)] transition-all"
          >
            <span className="text-[10px]">⚡</span>
            <span className="font-mono text-[10px] text-[#F5F1EA] font-bold tracking-[0.1em]">{credits}</span>
          </button>

          {user ? (
            <>
              <span className="hidden sm:block font-mono text-[10px] text-[#4A4742] tracking-[0.1em] max-w-[100px] truncate">
                {displayName}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="font-mono text-[10px] text-[#4A4742] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth"
              className="font-mono text-[10px] font-bold tracking-[0.15em] text-[#080809] bg-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
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
