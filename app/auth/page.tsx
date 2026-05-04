'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);

  const supabase = createClient();

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push(next);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.includes('Invalid login credentials')) setError('Wrong email or password.');
      else if (msg.includes('already registered')) { setError('Account exists — sign in instead.'); setMode('signin'); }
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#080809] px-6">
        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.04)] flex items-center justify-center text-2xl">
            📬
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-sans font-black text-white text-2xl tracking-tight">Check your email</h1>
            <p className="font-sans text-[#8A8680] text-sm leading-relaxed">
              Confirmation link sent to<br />
              <span className="text-[#F5F1EA] font-medium">{email}</span>
            </p>
          </div>
          <button
            onClick={() => { setCheckEmail(false); setMode('signin'); }}
            className="font-mono text-[11px] text-[#4A4742] hover:text-[#8A8680] underline transition-colors"
          >
            back to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080809]">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -15%, rgba(255,255,255,0.05) 0%, transparent 65%)' }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center px-8 py-5">
        <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">MOGFIT</span>
        </a>
      </nav>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px] flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col gap-1.5 text-center">
            <h1
              className="font-sans font-black text-white tracking-tight leading-[0.95]"
              style={{
                fontSize: 'clamp(40px, 8vw, 56px)',
                textShadow: '0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.25)',
              }}
            >
              {mode === 'signin' ? 'Welcome\nback.' : 'Join\nMogfit.'}
            </h1>
            <p className="font-mono text-[11px] text-[#4A4742] tracking-[0.15em] mt-1">
              {mode === 'signin' ? 'sign in to continue scanning' : 'first scan is on us'}
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[rgba(255,241,234,0.12)] bg-[rgba(255,241,234,0.04)] px-4 py-3.5 font-sans text-[14px] font-medium text-[#F5F1EA] hover:bg-[rgba(255,241,234,0.08)] transition-all disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="font-mono text-[12px] text-[#8A8680] tracking-[0.1em]">REDIRECTING...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[rgba(255,241,234,0.07)]" />
            <span className="font-mono text-[10px] text-[#4A4742]">or</span>
            <div className="h-px flex-1 bg-[rgba(255,241,234,0.07)]" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-3.5 font-mono text-[13px] text-[#F5F1EA] placeholder-[#4A4742] outline-none focus:border-[rgba(255,241,234,0.3)] transition-colors"
            />
            <input
              type="password"
              placeholder="password (min 6 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-3.5 font-mono text-[13px] text-[#F5F1EA] placeholder-[#4A4742] outline-none focus:border-[rgba(255,241,234,0.3)] transition-colors"
            />

            {error && (
              <p className="font-mono text-[11px] text-[#EF4444] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-full py-3.5 font-mono text-[12px] font-bold tracking-[0.15em] text-[#080809] bg-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ boxShadow: '0 0 24px rgba(255,255,255,0.2)' }}
            >
              {loading ? '...' : mode === 'signin' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
            </button>
          </form>

          {/* Toggle */}
          <p className="font-mono text-[11px] text-[#4A4742] text-center tracking-[0.08em]">
            {mode === 'signin' ? "no account? " : 'have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              className="text-[#8A8680] hover:text-[#F5F1EA] underline transition-colors"
            >
              {mode === 'signin' ? 'sign up' : 'sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
