import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });

  const { displayName } = await request.json();
  if (!displayName?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const service = createServiceClient();

  // Clean up stale queue entries (older than 60s)
  await service.from('arena_queue')
    .delete()
    .lt('joined_at', new Date(Date.now() - 60_000).toISOString());

  // Don't queue twice
  await service.from('arena_queue').delete().eq('user_id', user.id);

  // Find opponent (not yourself)
  const { data: opponent } = await service
    .from('arena_queue')
    .select('*')
    .neq('user_id', user.id)
    .order('joined_at')
    .limit(1)
    .single();

  if (opponent) {
    // Match found — create match, remove both from queue
    const matchId = Math.random().toString(36).slice(2, 10).toUpperCase();
    await service.from('arena_matches').insert({
      id: matchId,
      player1_id: opponent.user_id,
      player1_name: opponent.display_name,
      player2_id: user.id,
      player2_name: displayName.trim(),
      status: 'connecting',
    });
    await service.from('arena_queue').delete().eq('id', opponent.id);
    return NextResponse.json({ matchId, role: 'player2', opponentName: opponent.display_name });
  }

  // No opponent — join queue
  const { data: queued, error } = await service
    .from('arena_queue')
    .insert({ user_id: user.id, display_name: displayName.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ queueId: queued.id, waiting: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queueId = searchParams.get('queueId');
  const userId = searchParams.get('userId');
  if (!queueId || !userId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const service = createServiceClient();

  const since = new Date(Date.now() - 120_000).toISOString();

  // Check if matched as player1
  const { data: asP1 } = await service
    .from('arena_matches')
    .select('id, player2_name')
    .eq('player1_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (asP1) return NextResponse.json({ matchId: asP1.id, opponentName: asP1.player2_name, role: 'player1' });

  // Check if matched as player2 (created by opponent's poll)
  const { data: asP2 } = await service
    .from('arena_matches')
    .select('id, player1_name')
    .eq('player2_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (asP2) return NextResponse.json({ matchId: asP2.id, opponentName: asP2.player1_name, role: 'player2' });

  // Still in queue — try to match with someone else who is also waiting
  const { data: myEntry } = await service.from('arena_queue').select('*').eq('id', queueId).single();
  if (!myEntry) return NextResponse.json({ waiting: true }); // removed but no match yet, keep waiting

  const { data: opponent } = await service
    .from('arena_queue')
    .select('*')
    .neq('user_id', userId)
    .order('joined_at')
    .limit(1)
    .single();

  if (opponent) {
    // Both in queue — we create the match (we become player1, opponent becomes player2)
    const matchId = Math.random().toString(36).slice(2, 10).toUpperCase();
    const { error } = await service.from('arena_matches').insert({
      id: matchId,
      player1_id: userId,
      player1_name: myEntry.display_name,
      player2_id: opponent.user_id,
      player2_name: opponent.display_name,
      status: 'connecting',
    });
    if (!error) {
      await service.from('arena_queue').delete().in('id', [myEntry.id, opponent.id]);
      return NextResponse.json({ matchId, opponentName: opponent.display_name, role: 'player1' });
    }
  }

  return NextResponse.json({ waiting: true });
}

export async function DELETE(request: Request) {
  const { queueId } = await request.json();
  if (!queueId) return NextResponse.json({ ok: true });
  const service = createServiceClient();
  await service.from('arena_queue').delete().eq('id', queueId);
  return NextResponse.json({ ok: true });
}
