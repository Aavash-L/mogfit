import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { decodeResult } from '@/lib/encode-result';
import { FIX_AURA_SYSTEM_PROMPT } from '@/lib/prompts/fix-aura-system';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (!profile || profile.credits < 1) {
    return NextResponse.json({ error: 'no_credits' }, { status: 402 });
  }

  const { encodedId } = await request.json();
  if (!encodedId) {
    return NextResponse.json({ error: 'Missing encodedId' }, { status: 400 });
  }

  let result;
  try {
    result = decodeResult(encodedId);
  } catch {
    return NextResponse.json({ error: 'Invalid result ID' }, { status: 400 });
  }

  // Deduct credit before calling Claude
  await service
    .from('profiles')
    .update({ credits: profile.credits - 1 })
    .eq('id', user.id);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: FIX_AURA_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Here is the aura scan result. Generate the fix plan.\n\n${JSON.stringify(result, null, 2)}`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();

  try {
    const fix = JSON.parse(cleaned);
    return NextResponse.json({ ok: true, fix, creditsLeft: profile.credits - 1 });
  } catch {
    return NextResponse.json({ error: 'Failed to parse fix analysis' }, { status: 500 });
  }
}
