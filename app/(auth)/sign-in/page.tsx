'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ChevronRight, Loader2 } from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import { FormBanner } from '@/components/auth/AuthField';
import { AuthSegmentedTabs } from '@/components/auth/AuthSegmentedTabs';
import { authContainerVariants, authItemVariants } from '@/lib/motion-theme';
import { useToast } from '@/components/ui/toast';

export default function SignInPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean }>({});

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get('success');
    const authError = searchParams.get('error');

    if (success) setNotice(success);

    if (authError === 'account_not_linked') {
      toast.add('Email already used', {
        description: 'Please sign in with the original provider or link your account.',
        type: 'error',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const emailError =
    touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Enter a valid email address'
      : null;

  function getSafeRedirectUrl(): string {
    if (typeof window === 'undefined') return '/dashboard';
    const searchParams = new URLSearchParams(window.location.search);
    const redirectTo = searchParams.get('redirectTo');
    if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
      return redirectTo;
    }
    return '/dashboard';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: signInData, error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || 'Invalid email or password');
      setLoading(false);
      return;
    }

    const user = signInData?.user as { emailVerified?: boolean } | undefined;
    if (user && !user.emailVerified) {
      try {
        await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (e) {
        console.error('Failed to trigger OTP on sign in:', e);
      }
      router.push(`/verify-email?email=${encodeURIComponent(email)}&unverified=true`);
      return;
    }

    const targetUrl = getSafeRedirectUrl();
    window.location.href = targetUrl;
  };

  return (
    <motion.div
      variants={authContainerVariants}
      initial="hidden"
      animate="show"
      className="w-full space-y-6"
    >
      {/* ── Segmented Pill Toggle at the Top ── */}
      <motion.div variants={authItemVariants}>
        <AuthSegmentedTabs />
      </motion.div>

      {/* ── Header Eyebrow, Title, and Subtitle ── */}
      <motion.div variants={authItemVariants} className="space-y-1.5 text-left">
        <span className="text-xs sm:text-sm font-semibold text-emerald-400 tracking-wide uppercase">
          Welcome back
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Sign in
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
          Continue where you left off with your latest coursework and quiz progress.
        </p>
      </motion.div>

      {/* ── Google Social Button (Full Pill) ── */}
      <motion.div variants={authItemVariants} className="pt-2">
        <button
          type="button"
          onClick={async () => {
            await authClient.signIn.social({
              provider: 'google',
              errorCallbackURL: '/sign-in',
            });
          }}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-full border border-white/10 bg-[#141414] hover:bg-[#1f1f1f] text-white text-sm font-medium transition-all cursor-pointer shadow-sm hover:border-white/20 active:scale-[0.99]"
        >
          {/* Multi-Color Google G Logo */}
          <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </motion.div>

      {/* ── Divider ── */}
      <motion.div variants={authItemVariants} className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative bg-[#0B0C0E] px-4 text-xs text-zinc-500">
          or continue with email
        </span>
      </motion.div>

      {/* ── Borderless Form ── */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {notice ? (
          <motion.div variants={authItemVariants}>
            <FormBanner tone="success">{notice}</FormBanner>
          </motion.div>
        ) : null}
        {error ? (
          <motion.div variants={authItemVariants}>
            <FormBanner tone="error">{error}</FormBanner>
          </motion.div>
        ) : null}

        {/* Borderless Email Input */}
        <motion.div variants={authItemVariants} className="space-y-1">
          <div className="group relative flex items-center border-b border-white/15 focus-within:border-emerald-500 transition-colors py-2">
            <Mail className="size-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors shrink-0 mr-3.5" />
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              disabled={loading}
              className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-white placeholder:text-zinc-500 text-sm py-1"
            />
          </div>
          {emailError && (
            <p className="text-xs text-red-400 pt-1">{emailError}</p>
          )}
        </motion.div>

        {/* Borderless Password Input */}
        <motion.div variants={authItemVariants} className="space-y-1">
          <div className="group relative flex items-center border-b border-white/15 focus-within:border-emerald-500 transition-colors py-2">
            <Lock className="size-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors shrink-0 mr-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-white placeholder:text-zinc-500 text-sm py-1 pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {/* Forgot Password Right-Aligned */}
          <div className="flex justify-end pt-2">
            <Link
              href="/sign-in"
              className="text-xs sm:text-sm font-normal text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </motion.div>

        {/* Large Rounded Emerald CTA Button */}
        <motion.div variants={authItemVariants} className="pt-4">
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-full bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-black font-bold py-3.5 px-6 h-12 flex items-center justify-center gap-1.5 text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ChevronRight className="size-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </motion.div>
      </form>

      {/* ── Footer Disclaimer ── */}
      <motion.p
        variants={authItemVariants}
        className="text-center text-xs text-zinc-400/80 pt-4 leading-relaxed"
      >
        By continuing, you agree to our{' '}
        <Link href="/terms" className="text-emerald-400 hover:underline underline-offset-2">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-emerald-400 hover:underline underline-offset-2">
          Privacy Policy
        </Link>
      </motion.p>
    </motion.div>
  );
}
