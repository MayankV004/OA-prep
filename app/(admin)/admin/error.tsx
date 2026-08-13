'use client';

import { ErrorState } from '@/components/ui/error-state';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Admin section failed to load"
      description="The request behind this screen errored. Retry, and if it persists check the server logs for the reference below."
      error={error}
      onRetry={reset}
    />
  );
}
