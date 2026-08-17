'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, MailCheck } from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading, Text } from '@/components/ui/typography';
import {
  FormBanner,
  PasswordField,
  PasswordStrength,
} from '@/components/auth/AuthField';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: invite, isLoading, error: fetchError } = useQuery({
    queryKey: ['invite', token],
    queryFn: async () => {
      const res = await fetch(`/api/invites/${token}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Invalid invite');
      return json;
    },
    retry: false,
  });

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to accept invite');

      // Sign in automatically using the new credentials
      const { error: signInError } = await authClient.signIn.email({
        email: invite.email,
        password,
      });

      if (signInError) {
        // If sign in fails but account was created, redirect to sign in
        router.push('/sign-in?success=Account+created');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="animate-in-up text-center">
        <span
          aria-hidden
          className="mx-auto mb-5 grid size-12 place-items-center rounded-xl bg-danger-muted"
        >
          <AlertCircle className="size-6 text-destructive" />
        </span>
        <Heading level="page">Invite not valid</Heading>
        <Text size="compact" tone="muted" className="mx-auto mt-2 max-w-xs">
          {(fetchError as Error).message ||
            'This invite link is invalid or has expired.'}
        </Text>
        <Button
          size="xl"
          className="mt-7 w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-700 hover:via-rose-700 hover:to-red-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] border-none font-semibold cursor-pointer"
          onClick={() => router.push('/sign-in')}
        >
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in-up">
      <span
        aria-hidden
        className="mb-5 grid size-11 place-items-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20"
      >
        <MailCheck className="size-5" />
      </span>

      <div className="space-y-1.5">
        <Heading level="page">Join BigO</Heading>
        <Text size="compact" tone="muted">
          You&apos;ve been invited as{' '}
          <span className="font-medium text-foreground">{invite.email}</span>.
          Set a password to finish setting up.
        </Text>
      </div>

      <form onSubmit={handleAccept} className="mt-8 space-y-4">
        {error ? <FormBanner tone="error">{error}</FormBanner> : null}

        <div className="space-y-2">
          <PasswordField
            id="password"
            label="Create a password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            hint="At least 8 characters."
          />
          <PasswordStrength password={password} />
        </div>

        <Button
          type="submit"
          size="xl"
          className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-700 hover:via-rose-700 hover:to-red-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] border-none font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          loading={isSubmitting}
          disabled={!password}
        >
          Accept invite
        </Button>
      </form>
    </div>
  );
}
