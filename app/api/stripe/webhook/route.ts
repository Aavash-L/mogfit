import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
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
    const type = session.metadata?.type;

    if (!userId) return NextResponse.json({ received: true });

    if (type === 'mogplus') {
      // Grant MOG+ — set expiry based on interval
      const interval = session.metadata?.interval;
      const now = new Date();
      const expires = new Date(now);
      if (interval === 'year') {
        expires.setFullYear(expires.getFullYear() + 1);
      } else {
        expires.setMonth(expires.getMonth() + 1);
      }

      // Store Stripe subscription ID for renewal tracking
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as Stripe.Subscription)?.id;

      await supabase.from('profiles').update({
        is_mogplus: true,
        mogplus_expires_at: expires.toISOString(),
        mogplus_stripe_sub_id: subscriptionId ?? null,
      }).eq('id', userId);

    } else if (type === 'credits' || session.mode === 'payment') {
      const creditsToAdd = parseInt(session.metadata?.credits ?? '0', 10);
      if (creditsToAdd > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ credits: profile.credits + creditsToAdd })
            .eq('id', userId);
        }
      }
    }
  }

  // Handle subscription cancellation / expiry
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;
    if (userId) {
      await supabase.from('profiles').update({
        is_mogplus: false,
        mogplus_expires_at: null,
        mogplus_stripe_sub_id: null,
      }).eq('id', userId);
    }
  }

  // Renewal: extend expiry on invoice payment
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
    const rawSub = invoice.subscription;
    const subId = typeof rawSub === 'string' ? rawSub : rawSub?.id;
    if (!subId) return NextResponse.json({ received: true });

    const subscription = await stripe.subscriptions.retrieve(subId);
    const userId = subscription.metadata?.userId;
    if (!userId) return NextResponse.json({ received: true });

    const interval = subscription.items.data[0]?.plan?.interval as string | undefined;
    const now = new Date();
    const expires = new Date(now);
    if (interval === 'year') {
      expires.setFullYear(expires.getFullYear() + 1);
    } else {
      expires.setMonth(expires.getMonth() + 1);
    }

    await supabase.from('profiles').update({
      is_mogplus: true,
      mogplus_expires_at: expires.toISOString(),
    }).eq('id', userId);
  }

  return NextResponse.json({ received: true });
}
