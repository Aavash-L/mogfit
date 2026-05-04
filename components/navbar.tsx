'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BuyCreditsModal } from './buy-credits-modal';

interface NavbarProps {
  user: { id: string } | null;
  credits?: number;
}

export function Navbar({ user, credits = 0 }: NavbarProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-8 h-14 border-b border-[rgba(255,241,234,0.07)] bg-[rgba(8,8,9,0.85)] backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity flex-shrink-0">
          <div className="w-[13px] h-[13px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden sm:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link href="/leaderboard" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.18em] transition-colors">
            LEADERBOARD
          </Link>
          <Link href="/#how-it-works" className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.18em] transition-colors">
            HOW IT WORKS
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(255,241,234,0.12)] bg-[rgba(255,241,234,0.04)] hover:bg-[rgba(255,241,234,0.08)] transition-colors"
              >
                <span className="text-[11px]">⚡</span>
                <span className="font-mono text-[10px] text-[#F5F1EA] font-bold tracking-[0.1em]">
                  {credits} Credits
                </span>
              </button>
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
            <>
              <Link
                href="/auth"
                className="font-mono text-[10px] text-[#8A8680] hover:text-[#F5F1EA] tracking-[0.15em] transition-colors hidden sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/auth?mode=signup"
                className="font-mono text-[10px] font-bold tracking-[0.12em] text-[#080809] bg-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {showModal && (
        <BuyCreditsModal isLoggedIn={!!user} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
