'use client';

import { useState } from 'react';
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

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

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

    router.push('/dashboard');
    router.refresh();
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
          className="w-full"
          loading={loading}
          disabled={!canSubmit}
        >
          Create account
        </Button>
      </form>

      <Text size="compact" tone="muted" className="mt-6 text-center">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="rounded font-medium text-primary outline-none hover:underline"
        >
          Sign in
        </Link>
      </Text>
    </div>
  );
}
