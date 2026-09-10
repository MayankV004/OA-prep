'use client';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

import { ToastProvider, Toaster } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute default freshness
            gcTime: 10 * 60 * 1000, // 10 minutes cache lifetime
            retry: 1,
            refetchOnWindowFocus: false, // prevents refetch spam when switching tabs
            placeholderData: (previousData: any) => previousData, // smooth transitions without blank skeletons
          },
        },
      })
  );

  const [persister] = useState(() => {
    if (typeof window !== 'undefined') {
      return createSyncStoragePersister({
        storage: window.localStorage,
        key: 'BIGO_QUERY_CACHE_V1',
      });
    }
    return undefined;
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: persister || {
          persistClient: () => {},
          restoreClient: () => undefined,
          removeClient: () => {},
        },
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist successful queries; skip mutations or errors
            return query.state.status === 'success';
          },
        },
      }}
    >
      <ToastProvider>
        {children}
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </PersistQueryClientProvider>
  );
}
