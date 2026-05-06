import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzeAura } from '@/lib/anthropic';
import { calcEloChange } from '@/lib/arena-rank';

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

  // Write this player's score
  const scoreUpdate: Record<string, unknown> = {};
  if (role === 'player1') {
    scoreUpdate.player1_score = result.aura_score;
    scoreUpdate.player1_archetype = result.archetype_name;
  } else {
    scoreUpdate.player2_score = result.aura_score;
    scoreUpdate.player2_archetype = result.archetype_name;
  }
  await service.from('arena_matches').update(scoreUpdate).eq('id', matchId);

  // Re-read to check if both scores are now in (avoids race condition)
  const { data: updated } = await service.from('arena_matches').select('*').eq('id', matchId).single();
  const p1Score = updated?.player1_score;
  const p2Score = updated?.player2_score;

  if (p1Score != null && p2Score != null && updated?.status !== 'complete') {
    const winner = p1Score > p2Score ? 'player1' : p2Score > p1Score ? 'player2' : 'tie';
    const eloChange = calcEloChange(winner);

    // Fetch both profiles
    const [{ data: p1 }, { data: p2 }] = await Promise.all([
      service.from('profiles').select('elo, arena_wins, arena_losses, arena_ties').eq('id', updated.player1_id).single(),
      service.from('profiles').select('elo, arena_wins, arena_losses, arena_ties').eq('id', updated.player2_id).single(),
    ]);

    const p1Elo = p1?.elo ?? 400;
    const p2Elo = p2?.elo ?? 400;

    // Update both profiles
    await Promise.all([
      service.from('profiles').update({
        elo: Math.max(0, p1Elo + eloChange.player1),
        arena_wins:   (p1?.arena_wins   ?? 0) + (winner === 'player1' ? 1 : 0),
        arena_losses: (p1?.arena_losses ?? 0) + (winner === 'player2' ? 1 : 0),
        arena_ties:   (p1?.arena_ties   ?? 0) + (winner === 'tie'     ? 1 : 0),
      }).eq('id', updated.player1_id),
      service.from('profiles').update({
        elo: Math.max(0, p2Elo + eloChange.player2),
        arena_wins:   (p2?.arena_wins   ?? 0) + (winner === 'player2' ? 1 : 0),
        arena_losses: (p2?.arena_losses ?? 0) + (winner === 'player1' ? 1 : 0),
        arena_ties:   (p2?.arena_ties   ?? 0) + (winner === 'tie'     ? 1 : 0),
      }).eq('id', updated.player2_id),
    ]);

    // Mark match complete with ELO info so clients can display the change
    await service.from('arena_matches').update({
      status: 'complete',
      winner,
      player1_elo_before: p1Elo,
      player2_elo_before: p2Elo,
      player1_elo_change: eloChange.player1,
      player2_elo_change: eloChange.player2,
    }).eq('id', matchId);
  }

  return NextResponse.json({ ok: true, result });
}
