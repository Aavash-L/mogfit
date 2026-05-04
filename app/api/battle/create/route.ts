import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { decodeResult } from '@/lib/encode-result';

export async function POST(request: Request) {
  const { encodedId } = await request.json();
  if (!encodedId) return NextResponse.json({ error: 'Missing encodedId' }, { status: 400 });

  let result;
  try { result = decodeResult(encodedId); } catch {
    return NextResponse.json({ error: 'Invalid result' }, { status: 400 });
  }

  const id = Math.random().toString(36).slice(2, 10);
  const service = createServiceClient();

  const { error } = await service.from('battles').insert({
    id,
    initiator_encoded: encodedId,
    initiator_score: result.aura_score,
    initiator_archetype: result.archetype_name,
    status: 'waiting',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ battleId: id });
}
