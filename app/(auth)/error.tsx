'use client';

import { ErrorState } from '@/components/ui/error-state';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="We couldn't load this form"
      description="Sign-in is temporarily unavailable. Retrying usually clears it."
      error={error}
      onRetry={reset}
    />
  );
}
