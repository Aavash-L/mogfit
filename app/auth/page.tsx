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
  const [error, setError] = useState('');

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push(next);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080809]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(255,255,255,0.04) 0%, transparent 60%)',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center px-8 py-5">
        <a href="/" className="flex items-center gap-2">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white opacity-90" />
          <span className="font-mono text-[11px] text-[#F5F1EA] tracking-[0.25em] font-bold">AURA LAB</span>
        </a>
      </nav>

      {/* Form */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="font-sans font-black text-white text-3xl tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="font-mono text-[11px] text-[#4A4742] tracking-[0.15em]">
              {mode === 'signin' ? 'sign in to scan your fit' : 'one free scan on us'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-3 font-mono text-[13px] text-[#F5F1EA] placeholder-[#4A4742] outline-none focus:border-[rgba(255,241,234,0.25)] transition-colors"
            />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-[rgba(255,241,234,0.1)] bg-[rgba(255,241,234,0.03)] px-4 py-3 font-mono text-[13px] text-[#F5F1EA] placeholder-[#4A4742] outline-none focus:border-[rgba(255,241,234,0.25)] transition-colors"
            />

            {error && (
              <p className="font-mono text-[11px] text-[#EF4444] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3 font-mono text-[12px] font-bold tracking-[0.15em] text-[#080809] bg-white transition-opacity disabled:opacity-50"
            >
              {loading ? 'SCANNING...' : mode === 'signin' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
            </button>
          </form>

          <p className="font-mono text-[11px] text-[#4A4742] text-center tracking-[0.1em]">
            {mode === 'signin' ? "don't have an account? " : 'already have an account? '}
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
