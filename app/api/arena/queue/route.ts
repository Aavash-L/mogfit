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

export async function DELETE(request: Request) {
  const { queueId } = await request.json();
  if (!queueId) return NextResponse.json({ ok: true });
  const service = createServiceClient();
  await service.from('arena_queue').delete().eq('id', queueId);
  return NextResponse.json({ ok: true });
}
