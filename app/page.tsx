import { UploadZone } from '@/components/upload-zone';
import { Navbar } from '@/components/navbar';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let credits = 0;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();
    credits = profile?.credits ?? 0;
  }

  const navUser = user ? {
    id: user.id,
    email: user.email,
    displayName: (user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined),
  } : null;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080809]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -15%, rgba(255,255,255,0.06) 0%, transparent 65%)' }}
      />

      <Navbar user={navUser} credits={credits} />

      {/* Center everything */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6 w-full">
        {/* Title */}
        <h1
          className="font-sans font-black text-white leading-[0.88] tracking-tight select-none"
          style={{
            fontSize: 'clamp(88px, 18vw, 172px)',
            textShadow: '0 0 40px rgba(255,255,255,0.9), 0 0 80px rgba(255,255,255,0.5), 0 0 160px rgba(255,255,255,0.25)',
          }}
        >
          AURA<br />LAB
        </h1>

        <p className="font-mono text-[11px] text-[#4A4742] tracking-[0.2em] -mt-2">
          AI FASHION FORENSICS
        </p>

        {/* Upload */}
        <div className="w-full max-w-sm mt-2">
          <UploadZone isLoggedIn={!!user} credits={credits} />
        </div>

        <p className="font-sans text-[#4A4742] text-[12px]">
          first scan free · no account needed
        </p>
      </div>
    </main>
  );
}
