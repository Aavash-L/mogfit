import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Service-role client (no cookies needed for webhook handler)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SCANS_PER_PURCHASE = 10;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id || session.metadata?.userId;

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('paid_scans_remaining')
        .eq('id', userId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ paid_scans_remaining: profile.paid_scans_remaining + SCANS_PER_PURCHASE })
          .eq('id', userId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
