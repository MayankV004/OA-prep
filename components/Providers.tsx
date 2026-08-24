'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

import { ToastProvider, Toaster } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // staleTime is intentionally NOT set globally.
            // Each query should declare its own via STALE_TIMES from lib/query-keys.ts
            // to match how frequently that specific data actually changes.
            retry: 1,
            refetchOnWindowFocus: false, // prevents refetch spam when switching tabs
          },
        },
      })
  );

  // ThemeProvider lives in app/layout.tsx — a second nested instance here was
  // redundant and fought the root one over the `class` attribute.
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  );
}
