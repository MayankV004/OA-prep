'use client';

import * as React from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';

/**
 * Shared body for route error boundaries. Shows the digest rather than a raw
 * stack, since boundary messages are redacted in production anyway.
 */
function ErrorState({
  title = 'Something went wrong',
  description,
  error,
  onRetry,
  action,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  error?: Error & { digest?: string };
  onRetry?: () => void;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center',
        className
      )}
    >
      <span
        aria-hidden
        className="grid size-12 place-items-center rounded-xl bg-danger-muted text-destructive"
      >
        <TriangleAlert className="size-5" />
      </span>

      <div className="space-y-1.5">
        <Heading level="section" as="h2">
          {title}
        </Heading>
        <Text size="compact" tone="muted" className="mx-auto max-w-md">
          {description ??
            'This section failed to load. Retrying usually clears it — if not, the error reference below will help track it down.'}
        </Text>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button size="lg" onClick={onRetry}>
            <RefreshCw aria-hidden />
            Try again
          </Button>
        ) : null}
        {action}
      </div>

      {error?.digest ? (
        <Text size="micro" tone="muted" className="font-mono">
          Reference: {error.digest}
        </Text>
      ) : null}
    </div>
  );
}

export { ErrorState };
