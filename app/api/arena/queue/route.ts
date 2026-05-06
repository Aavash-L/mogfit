import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });

  const { displayName } = await request.json();
  if (!displayName?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service.rpc('arena_match', {
    p_user_id: user.id,
    p_display_name: displayName.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queueId = searchParams.get('queueId');
  const userId = searchParams.get('userId');
  const queuedAt = searchParams.get('queuedAt');
  if (!queueId || !userId || !queuedAt) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service.rpc('arena_poll', {
    p_user_id: userId,
    p_queue_id: queueId,
    p_queued_at: queuedAt,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { queueId } = await request.json();
  if (!queueId) return NextResponse.json({ ok: true });
  const service = createServiceClient();
  await service.from('arena_queue').delete().eq('id', queueId);
  return NextResponse.json({ ok: true });
}
