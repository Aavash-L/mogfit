import { NextResponse } from 'next/server';
import { analyzeInspoMatch } from '@/lib/anthropic';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { AuraResult } from '@/lib/types';

type ValidMime = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
const VALID_MIMES: ValidMime[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function safeMime(m: string): ValidMime {
  return VALID_MIMES.includes(m as ValidMime) ? (m as ValidMime) : 'image/jpeg';
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'credits_required', mustLogin: true }, { status: 402 });
  }

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('credits, is_mogplus, mogplus_expires_at')
    .eq('id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const mogplusActive = profile.is_mogplus && (!profile.mogplus_expires_at || new Date(profile.mogplus_expires_at) > new Date());

  if (!mogplusActive) {
    if (profile.credits < 1) {
      return NextResponse.json({ error: 'credits_required' }, { status: 402 });
    }
    await serviceClient.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);
  }

  const body = await request.json() as {
    currentImageBase64: string;
    currentMimeType: string;
    inspoImages: Array<{ base64: string; mimeType: string }>;
    auraResult: AuraResult;
  };

  const { currentImageBase64, currentMimeType, inspoImages, auraResult } = body;

  if (!currentImageBase64 || !inspoImages?.length || !auraResult) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (inspoImages.length > 3) {
    return NextResponse.json({ error: 'Max 3 inspo images' }, { status: 400 });
  }

  try {
    const result = await analyzeInspoMatch(
      currentImageBase64,
      safeMime(currentMimeType),
      inspoImages.map(img => ({ base64: img.base64, mimeType: safeMime(img.mimeType) })),
      auraResult
    );

    return NextResponse.json({ inspoMatch: result });
  } catch (err) {
    console.error('Inspo match error:', err);
    return NextResponse.json({ error: 'Inspo match failed.' }, { status: 500 });
  }
}
