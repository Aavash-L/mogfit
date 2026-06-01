import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const CREDIT_PACKAGES: Record<string, { priceId: string; credits: number }> = {
  starter: { priceId: process.env.STRIPE_PRICE_5!, credits: 5 },
  popular: { priceId: process.env.STRIPE_PRICE_15!, credits: 15 },
  value: { priceId: process.env.STRIPE_PRICE_50!, credits: 50 },
};

const MOGPLUS_PLANS: Record<string, { priceId: string; interval: string }> = {
  mogplus_monthly: { priceId: process.env.STRIPE_MOGPLUS_MONTHLY!, interval: 'month' },
  mogplus_yearly: { priceId: process.env.STRIPE_MOGPLUS_YEARLY!, interval: 'year' },
};

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not set' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Must be logged in to purchase' }, { status: 401 });
    }

    const { pkg = 'popular' } = await request.json().catch(() => ({}));
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mogfit.xyz';

    // MOG+ subscription
    if (pkg in MOGPLUS_PLANS) {
      const plan = MOGPLUS_PLANS[pkg];
      if (!plan.priceId) {
        return NextResponse.json({ error: `Price ID for "${pkg}" not set in env vars` }, { status: 500 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: plan.priceId, quantity: 1 }],
        client_reference_id: user.id,
        metadata: { userId: user.id, type: 'mogplus', interval: plan.interval },
        success_url: `${appUrl}/?mogplus=1`,
        cancel_url: `${appUrl}/`,
        subscription_data: {
          metadata: { userId: user.id },
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // Credit pack (one-time)
    const selected = CREDIT_PACKAGES[pkg] ?? CREDIT_PACKAGES.popular;
    if (!selected.priceId) {
      return NextResponse.json({ error: `Price ID for "${pkg}" is not set in env vars` }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: selected.priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { userId: user.id, credits: String(selected.credits), type: 'credits' },
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
