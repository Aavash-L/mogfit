import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzeAura } from '@/lib/anthropic';

export async function POST(request: Request) {
  const { matchId, role, imageBase64, mimeType } = await request.json();
  if (!matchId || !role || !imageBase64 || !mimeType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: match } = await service.from('arena_matches').select('*').eq('id', matchId).single();
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  if (match.status === 'complete') return NextResponse.json({ error: 'Already complete' }, { status: 409 });

  let result;
  try {
    result = await analyzeAura(imageBase64, mimeType);
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }

  if ('error' in result) {
    return NextResponse.json({ error: result.message ?? 'No fit detected' }, { status: 422 });
  }

  const update: Record<string, unknown> = {};
  if (role === 'player1') {
    update.player1_score = result.aura_score;
    update.player1_archetype = result.archetype_name;
  } else {
    update.player2_score = result.aura_score;
    update.player2_archetype = result.archetype_name;
  }

  // Determine winner if both scanned
  const p1Score = role === 'player1' ? result.aura_score : match.player1_score;
  const p2Score = role === 'player2' ? result.aura_score : match.player2_score;

  if (p1Score != null && p2Score != null) {
    update.status = 'complete';
    update.winner = p1Score > p2Score ? 'player1' : p2Score > p1Score ? 'player2' : 'tie';
  }

  await service.from('arena_matches').update(update).eq('id', matchId);

  return NextResponse.json({ ok: true, result });
}
