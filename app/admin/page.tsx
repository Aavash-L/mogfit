import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { AdminActions, AdminSeedButton } from './admin-actions';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth?next=/admin');
  if (!isAdmin(user.email)) {
    // Logged in but not admin — show who you are so we can debug
    return (
      <main className="min-h-screen bg-[#080809] flex items-center justify-center">
        <div className="flex flex-col gap-3 text-center">
          <p className="font-mono text-[#EF4444] text-sm">Access denied</p>
          <p className="font-mono text-[#4A4742] text-[11px]">signed in as: {user.email}</p>
        </div>
      </main>
    );
  }

  const service = createServiceClient();

  // Fetch all users from auth
  const { data: authList } = await service.auth.admin.listUsers();
  const authUsers = authList?.users ?? [];

  // Fetch all profiles (credits)
  const { data: profiles } = await service
    .from('profiles')
    .select('id, credits, created_at')
    .order('created_at', { ascending: false });

  // Fetch recent scans
  const { data: scans } = await service
    .from('scans')
    .select('id, user_id, archetype_name, aura_score, tier, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  // Build user map
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

  const users = authUsers.map(u => ({
    id: u.id,
    email: u.email ?? '',
    name: (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || '',
    credits: profileMap.get(u.id)?.credits ?? 0,
    joined: u.created_at,
    provider: u.app_metadata?.provider ?? 'email',
  })).sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());

  const totalCredits = users.reduce((s, u) => s + u.credits, 0);
  const totalScans = scans?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#080809] text-[#F5F1EA]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[rgba(255,241,234,0.07)]">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-[12px] h-[12px] rounded-[3px] bg-white opacity-90" />
            <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">MOGFIT</span>
          </Link>
          <span className="font-mono text-[10px] text-[#4A4742]">/</span>
          <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.15em]">ADMIN</span>
        </div>
        <span className="font-mono text-[9px] text-[#4A4742] tracking-[0.1em]">{user?.email}</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'TOTAL USERS', value: users.length },
            { label: 'TOTAL SCANS', value: totalScans },
            { label: 'CREDITS IN CIRCULATION', value: totalCredits },
            { label: 'SCANS TODAY', value: scans?.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length ?? 0 },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-[rgba(255,241,234,0.07)] bg-[rgba(255,241,234,0.02)] p-5 flex flex-col gap-1">
              <span className="font-mono text-[9px] text-[#4A4742] tracking-[0.2em]">{stat.label}</span>
              <span className="font-sans font-black text-[#F5F1EA] text-3xl">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Give / adjust credits */}
        <AdminActions />
        <AdminSeedButton />

        {/* Users table */}
        <div>
          <p className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em] mb-4">ALL USERS ({users.length})</p>
          <div className="rounded-2xl border border-[rgba(255,241,234,0.07)] overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 border-b border-[rgba(255,241,234,0.07)] px-5 py-2.5 bg-[rgba(255,241,234,0.02)]">
              {['EMAIL / NAME', 'PROVIDER', 'CREDITS', 'JOINED'].map(h => (
                <span key={h} className="font-mono text-[9px] text-[#4A4742] tracking-[0.18em]">{h}</span>
              ))}
            </div>
            {users.map((u, i) => (
              <div
                key={u.id}
                className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center ${i < users.length - 1 ? 'border-b border-[rgba(255,241,234,0.05)]' : ''} hover:bg-[rgba(255,241,234,0.02)] transition-colors`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-sans text-[13px] text-[#F5F1EA] truncate">{u.email}</span>
                  {u.name && <span className="font-sans text-[11px] text-[#4A4742] truncate">{u.name}</span>}
                </div>
                <span className="font-mono text-[10px] text-[#8A8680] tracking-[0.1em]">{u.provider}</span>
                <span className={`font-mono text-[13px] font-bold w-12 text-right ${u.credits > 0 ? 'text-[#4ADE80]' : 'text-[#4A4742]'}`}>
                  ⚡{u.credits}
                </span>
                <span className="font-mono text-[10px] text-[#4A4742] w-24 text-right">
                  {new Date(u.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent scans */}
        {(scans?.length ?? 0) > 0 && (
          <div>
            <p className="font-mono text-[10px] text-[#8A8680] tracking-[0.2em] mb-4">RECENT SCANS</p>
            <div className="rounded-2xl border border-[rgba(255,241,234,0.07)] overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 border-b border-[rgba(255,241,234,0.07)] px-5 py-2.5 bg-[rgba(255,241,234,0.02)]">
                {['ARCHETYPE', 'TIER', 'SCORE', 'WHEN'].map(h => (
                  <span key={h} className="font-mono text-[9px] text-[#4A4742] tracking-[0.18em]">{h}</span>
                ))}
              </div>
              {scans!.map((s, i) => {
                const owner = authUsers.find(u => u.id === s.user_id);
                return (
                  <div
                    key={s.id}
                    className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 items-center ${i < scans!.length - 1 ? 'border-b border-[rgba(255,241,234,0.05)]' : ''}`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-sans text-[13px] text-[#F5F1EA] truncate">{s.archetype_name}</span>
                      <span className="font-mono text-[10px] text-[#4A4742] truncate">{owner?.email ?? 'guest'}</span>
                    </div>
                    <span className={`font-mono text-[10px] font-bold tracking-[0.1em] ${s.tier === 'ELITE' ? 'text-[#FF6B00]' : s.tier === 'HIGH' ? 'text-[#4ADE80]' : s.tier === 'LOW' ? 'text-[#EF4444]' : 'text-[#8A8680]'}`}>
                      {s.tier}
                    </span>
                    <span className="font-mono text-[13px] font-bold text-[#FF6B00] w-12 text-right">{s.aura_score}</span>
                    <span className="font-mono text-[10px] text-[#4A4742] w-24 text-right">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
