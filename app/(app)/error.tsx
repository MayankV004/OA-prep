'use client';

import { ErrorState } from '@/components/ui/error-state';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="This page didn't load"
      description="Something failed while loading this section. Your progress is safe \u2014 retrying usually clears it."
      error={error}
      onRetry={reset}
    />
  );
}
