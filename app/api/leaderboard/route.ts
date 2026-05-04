import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') ?? 'all';

  const service = createServiceClient();

  let query = service
    .from('scans')
    .select('id, user_id, archetype_name, archetype_tag, aura_score, tier, encoded_result, created_at')
    .order('aura_score', { ascending: false })
    .limit(50);

  if (period === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    query = query.gte('created_at', start.toISOString());
  } else if (period === 'week') {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    query = query.gte('created_at', start.toISOString());
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
