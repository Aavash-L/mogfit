import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not set' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const PACKAGES: Record<string, { priceId: string; credits: number }> = {
      starter: { priceId: process.env.STRIPE_PRICE_5!, credits: 5 },
      popular: { priceId: process.env.STRIPE_PRICE_15!, credits: 15 },
      value: { priceId: process.env.STRIPE_PRICE_50!, credits: 50 },
    };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Must be logged in to purchase credits' }, { status: 401 });
    }

    const { pkg = 'popular' } = await request.json().catch(() => ({}));
    const selected = PACKAGES[pkg] ?? PACKAGES.popular;

    if (!selected.priceId) {
      return NextResponse.json({ error: `Price ID for "${pkg}" is not set in env vars` }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mogfit.xyz';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: selected.priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { userId: user.id, credits: String(selected.credits) },
      success_url: `${appUrl}/?credits_added=${selected.credits}`,
      cancel_url: `${appUrl}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
