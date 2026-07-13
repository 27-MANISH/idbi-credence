'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Landmark, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useLogin } from '@/lib/useApi';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { login: loginHook, loading, error } = useLogin();
  const { login: mockLogin } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginHook(email, password);
    if (ok) router.push('/');
  };

  // Quick dev access — bypasses real auth
  const devLogin = (role: 'MSME' | 'OFFICER') => {
    mockLogin(role === 'OFFICER' ? 'officer@idbi.in' : 'msme@example.in', role);
    router.push(role === 'OFFICER' ? '/officer/dashboard' : '/msme/onboarding');
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-4"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Landmark className="h-5 w-5 text-white" />
            <span className="text-white font-black text-sm tracking-tight">Credence AI</span>
          </div>
          <h1 className="text-xl font-black text-fin-text">Sign In</h1>
          <p className="text-[12px] text-fin-text-muted mt-1">Access the FinHealth platform</p>
        </div>

        {/* Form card */}
        <div className="bg-fin-surface border border-gray-200/40 rounded-2xl p-6 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono font-bold text-fin-text-muted uppercase tracking-wide block mb-1">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="officer@idbi.in"
                className="w-full bg-fin-surface-2 border border-gray-200/50 rounded-lg px-3 py-2 text-sm text-fin-text font-mono placeholder:text-fin-text-muted/50 focus:outline-none focus:ring-1 focus:ring-fin-primary transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-fin-text-muted uppercase tracking-wide block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-fin-surface-2 border border-gray-200/50 rounded-lg px-3 py-2 pr-10 text-sm text-fin-text font-mono placeholder:text-fin-text-muted/50 focus:outline-none focus:ring-1 focus:ring-fin-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fin-text-muted hover:text-fin-text transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-fin-error/10 border border-fin-error/30 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 text-fin-error shrink-0" />
                <p className="text-[11px] text-fin-error">{error}</p>
              </div>
            )}

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-60 hover:brightness-110 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-2 text-fin-text-muted">
            <div className="flex-1 h-px bg-gray-200/50" />
            <span className="text-[10px] font-mono">or dev access</span>
            <div className="flex-1 h-px bg-gray-200/50" />
          </div>

          {/* Dev quick-login buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id="dev-login-officer"
              onClick={() => devLogin('OFFICER')}
              className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-mono font-bold border border-gray-200/50 text-fin-text rounded-lg hover:bg-fin-surface-2 transition-all"
            >
              Officer Demo
            </button>
            <button
              id="dev-login-msme"
              onClick={() => devLogin('MSME')}
              className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-mono font-bold border border-gray-200/50 text-fin-text rounded-lg hover:bg-fin-surface-2 transition-all"
            >
              MSME Demo
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-fin-text-muted mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-fin-primary font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
