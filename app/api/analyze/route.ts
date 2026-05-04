import { analyzeAura } from '@/lib/anthropic';
import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { encodeResult } from '@/lib/encode-result';

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Quota check
  const serviceClient = await createServiceClient();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('free_scans_used, paid_scans_remaining')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
  }

  const hasFreeScans = profile.free_scans_used < 1;
  const hasPaidScans = profile.paid_scans_remaining > 0;

  if (!hasFreeScans && !hasPaidScans) {
    return NextResponse.json({ error: 'quota_exceeded' }, { status: 402 });
  }

  try {
    const { imageBase64, mimeType } = await request.json();
    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing imageBase64 or mimeType' }, { status: 400 });
    }

    const result = await analyzeAura(imageBase64, mimeType);

    if (result.error) {
      return NextResponse.json(result, { status: 422 });
    }

    // Deduct quota
    if (hasFreeScans) {
      await serviceClient
        .from('profiles')
        .update({ free_scans_used: profile.free_scans_used + 1 })
        .eq('id', user.id);
    } else {
      await serviceClient
        .from('profiles')
        .update({ paid_scans_remaining: profile.paid_scans_remaining - 1 })
        .eq('id', user.id);
    }

    // Save to leaderboard
    const encoded = encodeResult(result);
    await serviceClient.from('scans').insert({
      user_id: user.id,
      archetype_name: result.archetype_name,
      archetype_tag: result.archetype_tag,
      aura_score: result.aura_score,
      tier: result.tier,
      encoded_result: encoded,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed. Try a clearer fit pic.' }, { status: 500 });
  }
}
