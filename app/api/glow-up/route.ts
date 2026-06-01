import { NextResponse } from 'next/server';
import { generateGlowUp } from '@/lib/anthropic';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { AuraResult } from '@/lib/types';

const FREE_GLOWUP_COOKIE = 'mogfit_free_glowup_used';
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { imageBase64, mimeType, auraResult } = await request.json() as {
    imageBase64: string;
    mimeType: string;
    auraResult: AuraResult;
  };

  if (!imageBase64 || !mimeType || !auraResult) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  let isFree = false;

  if (user) {
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('credits, is_mogplus, mogplus_expires_at, free_glowup_used')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    // MOG+ gets unlimited glow-ups
    const mogplusActive = profile.is_mogplus && (!profile.mogplus_expires_at || new Date(profile.mogplus_expires_at) > new Date());
    if (mogplusActive) {
      // proceed free
    } else if (!profile.free_glowup_used) {
      // First free glow-up
      await serviceClient.from('profiles').update({ free_glowup_used: true }).eq('id', user.id);
      isFree = true;
    } else if (profile.credits >= 1) {
      // Spend 1 credit
      await serviceClient.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);
    } else {
      return NextResponse.json({ error: 'credits_required' }, { status: 402 });
    }
  } else {
    // Guest: one-time free via cookie
    const cookieUsed = cookieStore.get(FREE_GLOWUP_COOKIE)?.value === '1';
    if (cookieUsed) {
      return NextResponse.json({ error: 'credits_required', mustLogin: true }, { status: 402 });
    }
    isFree = true;
  }

  try {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
    type ValidMimeType = typeof validMimeTypes[number];
    const safeMimeType: ValidMimeType = validMimeTypes.includes(mimeType as ValidMimeType)
      ? (mimeType as ValidMimeType)
      : 'image/jpeg';

    const glowUp = await generateGlowUp(imageBase64, safeMimeType, auraResult);

    const response = NextResponse.json({ glowUp });

    // Set free glow-up cookie for guests
    if (isFree && !user) {
      response.cookies.set(FREE_GLOWUP_COOKIE, '1', {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: ONE_YEAR,
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('Glow-up error:', err);
    return NextResponse.json({ error: 'Glow-up generation failed.' }, { status: 500 });
  }
}
