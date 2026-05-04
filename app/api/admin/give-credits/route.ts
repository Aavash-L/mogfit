import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email, credits } = await request.json();
  if (!email || typeof credits !== 'number' || credits === 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const service = await createServiceClient();

  // Find the target user by email
  const { data: authList, error: listError } = await service.auth.admin.listUsers();
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  const target = authList.users.find(u => u.email === email);
  if (!target) return NextResponse.json({ error: `No account found for ${email}` }, { status: 404 });

  // Fetch current credits (ensure row exists first)
  await service.from('profiles').upsert({ id: target.id, credits: 0 }, { onConflict: 'id', ignoreDuplicates: true });

  const { data: profile } = await service
    .from('profiles')
    .select('credits')
    .eq('id', target.id)
    .single();

  const newCredits = Math.max(0, (profile?.credits ?? 0) + credits);

  const { error } = await service
    .from('profiles')
    .update({ credits: newCredits })
    .eq('id', target.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, newCredits });
}
