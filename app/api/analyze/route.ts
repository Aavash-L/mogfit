import { analyzeAura } from '@/lib/anthropic';
import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { encodeResult } from '@/lib/encode-result';
import { cookies } from 'next/headers';

const FREE_SCAN_COOKIE = 'aura_free_used';
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const freeCookieUsed = cookieStore.get(FREE_SCAN_COOKIE)?.value === '1';

  // Determine if this scan is allowed and whether it's free/unlocked
  let isUnlocked = false;

  if (!freeCookieUsed) {
    // First scan ever on this browser — always free
    isUnlocked = true;
  } else if (user) {
    // Logged-in user — check credits
    const serviceClient = await createServiceClient();
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!profile || profile.credits < 1) {
      return NextResponse.json({ error: 'credits_required' }, { status: 402 });
    }

    // Deduct 1 credit
    await serviceClient
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    isUnlocked = true;
  } else {
    // Guest with used free scan — need to log in + buy credits
    return NextResponse.json({ error: 'credits_required', mustLogin: true }, { status: 402 });
  }

  // Run analysis
  try {
    const { imageBase64, mimeType } = await request.json();
    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing imageBase64 or mimeType' }, { status: 400 });
    }

    const result = await analyzeAura(imageBase64, mimeType);

    if (result.error) {
      return NextResponse.json(result, { status: 422 });
    }

    // Save to leaderboard if user is logged in
    if (user) {
      const serviceClient = await createServiceClient();
      const encoded = encodeResult(result);
      await serviceClient.from('scans').insert({
        user_id: user.id,
        archetype_name: result.archetype_name,
        archetype_tag: result.archetype_tag,
        aura_score: result.aura_score,
        tier: result.tier,
        encoded_result: encoded,
      });
    }

    const response = NextResponse.json({ ...result, unlocked: isUnlocked });

    // Set free scan cookie if this was the first scan
    if (!freeCookieUsed) {
      response.cookies.set(FREE_SCAN_COOKIE, '1', {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: ONE_YEAR,
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed. Try a clearer fit pic.' }, { status: 500 });
  }
}
