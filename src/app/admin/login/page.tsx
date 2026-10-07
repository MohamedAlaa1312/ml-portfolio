'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Derive error banner from query params or form submission
  const isUnauthorized = searchParams.get('error') === 'unauthorized';
  const displayedError =
    errorMsg ||
    (isUnauthorized
      ? 'Access Denied: This account is authenticated, but does not possess Administrator privileges. Backend RLS strictly prohibits unauthorized access.'
      : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await AuthService.signIn(normalizedEmail, password);

      if (error) {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Strict Authorization Verification:
        // Authenticated user != automatically authorized admin.
        // Verify against public.admin_users table or JWT app_metadata.
        const metaRole = data.user.app_metadata?.role;
        const isAdminMetadata = metaRole === 'admin' || metaRole === 'superadmin';

        if (!isAdminMetadata) {
          const { data: adminRecord, error: adminQueryError } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          const dbRole = (adminRecord as unknown as { role?: string })?.role;
          const isDbAdmin = dbRole === 'admin' || dbRole === 'superadmin';

          if (adminQueryError || !isDbAdmin) {
            // Immediately terminate unauthorized session
            await AuthService.signOut();
            setErrorMsg(
              'Access Denied: This account is authenticated, but does not possess Administrator privileges. Backend RLS strictly prohibits unauthorized access.'
            );
            setLoading(false);
            return;
          }
        }

        // Successfully verified admin credentials
        const redirectParam = searchParams.get('redirect');
        const isSafeAdminPath =
          redirectParam &&
          redirectParam.startsWith('/admin') &&
          !redirectParam.startsWith('//') &&
          !redirectParam.includes('\\') &&
          !redirectParam.includes('@');
        const targetPath = isSafeAdminPath ? redirectParam : '/admin/dashboard';
        router.push(targetPath);
        router.refresh();
      }
    } catch {
      setErrorMsg('An unexpected authentication error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] flex items-center justify-center p-4 sm:p-6 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient background lighting */}
      <div className="absolute w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0D111A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Header with Monogram */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 mx-auto flex items-center justify-center font-bold text-black text-xl mb-3 shadow-lg shadow-amber-500/20">
            MK
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs font-mono text-amber-500/90 uppercase tracking-wider">
              MK Admin Control
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Sign in to your admin account
          </p>
        </div>

        {/* Error Feedback */}
        {displayedError && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed"
          >
            {displayedError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-mono text-slate-300 mb-1.5"
            >
              Email address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[#131926] border border-white/10 text-slate-100 text-sm focus-ring transition-colors placeholder:text-slate-500 min-h-[44px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-mono text-slate-300"
              >
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-[#131926] border border-white/10 text-slate-100 text-sm focus-ring transition-colors placeholder:text-slate-500 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-200 focus-ring rounded text-sm cursor-pointer"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#131926] border border-white/20 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-400">Remember me</span>
            </label>

            <span className="text-[11px] font-mono text-slate-500">
              Session Secured
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full text-xs font-mono font-semibold tracking-wide mt-2 min-h-[44px]"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center border-t border-white/5 pt-5">
          <Link
            href="/"
            className="text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors focus-ring rounded py-1 px-2"
          >
            ← Return to Public Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080B11]" />}>
      <LoginFormContent />
    </Suspense>
  );
}
