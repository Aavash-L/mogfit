'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Props {
  isLoggedIn: boolean;
}

export function ReferralRedeemer({ isLoggedIn }: Props) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (!ref || !isLoggedIn) return;

    const storageKey = 'mogfit_ref_redeemed';
    if (sessionStorage.getItem(storageKey)) return;

    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: ref }),
    }).then(r => {
      if (r.ok) {
        sessionStorage.setItem(storageKey, '1');
      }
    }).catch(() => {});
  }, [searchParams, isLoggedIn]);

  return null;
}
