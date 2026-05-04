import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aura.lab';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    client_reference_id: user.id,
    metadata: { userId: user.id },
    success_url: `${appUrl}/?scan_credits=added`,
    cancel_url: `${appUrl}/?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
