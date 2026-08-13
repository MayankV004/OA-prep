'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error interrupted this page."
        error={error}
        onRetry={reset}
        action={
          <Button variant="ghost" size="lg" render={<Link href="/dashboard" />}>
            Back to dashboard
          </Button>
        }
      />
    </div>
  );
}
