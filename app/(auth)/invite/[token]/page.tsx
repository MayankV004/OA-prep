'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code2, Loader2, AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

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
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Invite</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {(fetchError as Error).message || 'This invite link is invalid or has expired.'}
          </p>
          <Button className="w-full" onClick={() => router.push('/sign-in')}>
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Join PlacementDeck</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            You've been invited to join as <span className="font-medium text-foreground">{invite.email}</span>
          </p>
        </div>

        <form onSubmit={handleAccept} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Create a password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={isSubmitting || !password}>
            {isSubmitting ? 'Creating account...' : 'Accept Invite'}
          </Button>
        </form>
      </div>
    </div>
  );
}
