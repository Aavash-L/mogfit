import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const serviceClient = await createServiceClient();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (!profile || profile.credits < 1) {
    return NextResponse.json({ error: 'No credits' }, { status: 402 });
  }

  await serviceClient
    .from('profiles')
    .update({ credits: profile.credits - 1 })
    .eq('id', user.id);

  return NextResponse.json({ credits: profile.credits - 1 });
}
