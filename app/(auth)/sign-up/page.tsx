'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import {
  AuthField,
  FormBanner,
  PasswordField,
  PasswordStrength,
} from '@/components/auth/AuthField';

import { useToast } from '@/components/ui/toast';

export default function SignUpPage() {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const authError = searchParams.get('error');

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

  const passwordError =
    touched.password && password && password.length < 8
      ? 'Use at least 8 characters'
      : null;

  const canSubmit =
    Boolean(name && email && password) && !emailError && !passwordError;

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

    // Unchanged better-auth contract: same method, same field names.
    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (signUpError) {
      setError(signUpError.message || 'Could not create your account');
      setLoading(false);
      return;
    }

    const targetUrl = getSafeRedirectUrl();
    window.location.href = targetUrl;
  };

  return (
    <div className="animate-in-up">
      <div className="space-y-1.5">
        <Heading level="page">Create your account</Heading>
        <Text size="compact" tone="muted">
          Start tracking your placement prep in one place.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error ? <FormBanner tone="error">{error}</FormBanner> : null}

        <AuthField
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Mayank Verma"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <AuthField
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@college.edu"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
          valid={Boolean(email) && !emailError}
          disabled={loading}
        />

        <div className="space-y-2">
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={passwordError}
            disabled={loading}
          />
          <PasswordStrength password={password} />
        </div>

        <Button
          type="submit"
          size="xl"
          className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-700 hover:via-rose-700 hover:to-red-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] border-none font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          loading={loading}
          disabled={!canSubmit}
        >
          Create account
        </Button>
      </form>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border/60"></div>
        </div>
        <div className="relative flex justify-center text-sm font-medium leading-6">
          <span className="bg-background dark:bg-slate-950 px-6 text-text-muted transition-colors duration-300">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="w-full border-border bg-background hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-foreground"
          onClick={async () => {
            await authClient.signIn.social({
              provider: "google",
              errorCallbackURL: "/sign-up"
            });
          }}
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google
        </Button>
        <Button
          variant="outline"
          className="w-full border-border bg-background hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-foreground"
          onClick={async () => {
            await authClient.signIn.social({
              provider: "github",
              errorCallbackURL: "/sign-up"
            });
          }}
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
            <path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
          </svg>
          GitHub
        </Button>
      </div>

      <Text size="compact" tone="muted" className="mt-6 text-center">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="rounded font-medium text-rose-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 outline-none hover:underline"
        >
          Sign in
        </Link>
      </Text>
    </div>
  );
}
