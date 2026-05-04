import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { analyzeAura } from '@/lib/anthropic';
import { encodeResult } from '@/lib/encode-result';

const FREE_SCAN_COOKIE = 'aura_free_used';
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = createServiceClient();
  const { data: battle, error } = await service.from('battles').select('*').eq('id', id).single();
  if (error || !battle) return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  return NextResponse.json(battle);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = createServiceClient();

  const { data: battle } = await service.from('battles').select('*').eq('id', id).single();
  if (!battle) return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  if (battle.status === 'complete') return NextResponse.json({ error: 'Battle already complete' }, { status: 409 });

  // Check credit / free scan
  const cookieStore = await cookies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const freeCookieUsed = cookieStore.get(FREE_SCAN_COOKIE)?.value === '1';

  let isFirstScan = false;

  if (!freeCookieUsed) {
    isFirstScan = true;
  } else if (user) {
    const { data: profile } = await service.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits < 1) {
      return NextResponse.json({ error: 'credits_required' }, { status: 402 });
    }
    await service.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);
  } else {
    return NextResponse.json({ error: 'credits_required', mustLogin: true }, { status: 402 });
  }

  const { imageBase64, mimeType } = await request.json();
  if (!imageBase64 || !mimeType) return NextResponse.json({ error: 'Missing image' }, { status: 400 });

  const result = await analyzeAura(imageBase64, mimeType);
  if (result.error) return NextResponse.json(result, { status: 422 });

  const encoded = encodeResult(result);

  // Save to leaderboard if logged in
  if (user) {
    await service.from('scans').insert({
      user_id: user.id,
      archetype_name: result.archetype_name,
      archetype_tag: result.archetype_tag,
      aura_score: result.aura_score,
      tier: result.tier,
      encoded_result: encoded,
    });
  }

  // Complete the battle
  await service.from('battles').update({
    opponent_encoded: encoded,
    opponent_score: result.aura_score,
    opponent_archetype: result.archetype_name,
    status: 'complete',
  }).eq('id', id);

  const response = NextResponse.json({ ok: true, result, encoded });
  if (isFirstScan) {
    response.cookies.set(FREE_SCAN_COOKIE, '1', { httpOnly: true, sameSite: 'strict', maxAge: ONE_YEAR, path: '/' });
  }
  return response;
}
