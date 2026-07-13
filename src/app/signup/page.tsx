'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Landmark, Loader2, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useSignup } from '@/lib/useApi';

const ROLES = [
  { value: 'CREDIT_OFFICER', label: 'Credit Officer (IDBI Bank)' },
  { value: 'MSME_BORROWER', label: 'MSME Borrower' },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading, error } = useSignup();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CREDIT_OFFICER' });
  const [showPassword, setShowPassword] = useState(false);

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await signup(form);
    if (ok) router.push('/');
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-4"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Landmark className="h-5 w-5 text-white" />
            <span className="text-white font-black text-sm tracking-tight">Credence AI</span>
          </div>
          <h1 className="text-xl font-black text-fin-text">Create Account</h1>
          <p className="text-[12px] text-fin-text-muted mt-1">Register for FinHealth platform access</p>
        </div>

        <div className="bg-fin-surface border border-gray-200/40 rounded-2xl p-6 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Shashank Kotagi', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'officer@idbi.in', type: 'email' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-mono font-bold text-fin-text-muted uppercase tracking-wide block mb-1">
                  {f.label}
                </label>
                <input
                  id={`signup-${f.key}`}
                  type={f.type}
                  required
                  value={(form as any)[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-fin-surface-2 border border-gray-200/50 rounded-lg px-3 py-2 text-sm text-fin-text font-mono placeholder:text-fin-text-muted/50 focus:outline-none focus:ring-1 focus:ring-fin-primary transition-all"
                />
              </div>
            ))}

            <div>
              <label className="text-[11px] font-mono font-bold text-fin-text-muted uppercase tracking-wide block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min 8 characters"
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

            <div>
              <label className="text-[11px] font-mono font-bold text-fin-text-muted uppercase tracking-wide block mb-1">
                Role
              </label>
              <select
                id="signup-role"
                value={form.role}
                onChange={e => set('role', e.target.value)}
                className="w-full bg-fin-surface-2 border border-gray-200/50 rounded-lg px-3 py-2 text-sm text-fin-text font-mono focus:outline-none focus:ring-1 focus:ring-fin-primary"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-fin-error/10 border border-fin-error/30 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 text-fin-error shrink-0" />
                <p className="text-[11px] text-fin-error">{error}</p>
              </div>
            )}

            <button
              id="btn-signup-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-60 hover:brightness-110 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-fin-text-muted mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-fin-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
