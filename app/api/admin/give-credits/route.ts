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

  const service = createServiceClient();

  // Find user by email — paginate to make sure we get everyone
  let target: { id: string; email?: string } | null = null;
  let page = 1;
  while (!target) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const found = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (found) { target = found; break; }
    if (data.users.length < 1000) break; // last page, not found
    page++;
  }

  if (!target) return NextResponse.json({ error: `No account found for ${email}` }, { status: 404 });

  // Ensure profile row exists
  const { error: upsertError } = await service
    .from('profiles')
    .upsert({ id: target.id, credits: 0 }, { onConflict: 'id', ignoreDuplicates: true });

  if (upsertError) return NextResponse.json({ error: `Upsert failed: ${upsertError.message}` }, { status: 500 });

  // Read current credits
  const { data: profile, error: selectError } = await service
    .from('profiles')
    .select('credits')
    .eq('id', target.id)
    .single();

  if (selectError) return NextResponse.json({ error: `Select failed: ${selectError.message}` }, { status: 500 });

  const before = profile?.credits ?? 0;
  const newCredits = Math.max(0, before + credits);

  // Update
  const { data: updated, error: updateError } = await service
    .from('profiles')
    .update({ credits: newCredits })
    .eq('id', target.id)
    .select('credits')
    .single();

  if (updateError) return NextResponse.json({ error: `Update failed: ${updateError.message}` }, { status: 500 });
  if (!updated) return NextResponse.json({ error: 'Update returned no rows — check service role key has correct permissions' }, { status: 500 });

  return NextResponse.json({ ok: true, before, newCredits: updated.credits, userId: target.id });
}
