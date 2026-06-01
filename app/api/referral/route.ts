import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// GET /api/referral — get or create the user's referral code
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const service = createServiceClient();
  const { data: profile } = await service.from('profiles').select('referral_code').eq('id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  let code = profile.referral_code;
  if (!code) {
    code = generateCode();
    await service.from('profiles').update({ referral_code: code }).eq('id', user.id);
  }

  return NextResponse.json({ code });
}

// POST /api/referral — redeem a referral code (called on signup/first scan)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

  const service = createServiceClient();

  // Find the referrer
  const { data: referrer } = await service
    .from('profiles')
    .select('id, credits')
    .eq('referral_code', code.toUpperCase())
    .single();

  if (!referrer || referrer.id === user.id) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  // Check if this user already used a referral
  const { data: self } = await service.from('profiles').select('credits, referred_by').eq('id', user.id).single();
  if (!self || self.referred_by) {
    return NextResponse.json({ error: 'Already used a referral' }, { status: 400 });
  }

  // Give both users 1 free credit
  await Promise.all([
    service.from('profiles').update({ credits: referrer.credits + 1 }).eq('id', referrer.id),
    service.from('profiles').update({ credits: self.credits + 1, referred_by: referrer.id }).eq('id', user.id),
  ]);

  return NextResponse.json({ success: true, message: 'You both got 1 free credit!' });
}
