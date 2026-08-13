'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { AuthField, FormBanner, PasswordField } from '@/components/auth/AuthField';

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean }>({});

  // The invite flow can redirect here with ?success=Account+created. Read it
  // from location rather than useSearchParams to avoid a Suspense boundary.
  useEffect(() => {
    const success = new URLSearchParams(window.location.search).get('success');
    if (success) setNotice(success);
  }, []);

  const emailError =
    touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Enter a valid email address'
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Unchanged better-auth contract: same method, same field names.
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || 'Invalid email or password');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="animate-in-up">
      <div className="space-y-1.5">
        <Heading level="page">Welcome back</Heading>
        <Text size="compact" tone="muted">
          Sign in to pick up where you left off.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {notice ? <FormBanner tone="success">{notice}</FormBanner> : null}
        {error ? <FormBanner tone="error">{error}</FormBanner> : null}

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

        <div className="space-y-1.5">
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div className="flex justify-end">
            {/* TODO: backend — no password reset route exists yet. */}
            <Link
              href="/sign-in"
              className="rounded text-xs text-text-muted outline-none transition-colors hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          size="xl"
          className="w-full"
          loading={loading}
          disabled={!email || !password}
        >
          Sign in
        </Button>
      </form>

      <Text size="compact" tone="muted" className="mt-6 text-center">
        New here?{' '}
        <Link
          href="/sign-up"
          className="rounded font-medium text-primary outline-none hover:underline"
        >
          Create an account
        </Link>
      </Text>
    </div>
  );
}
