'use client';

import { ReactNode } from 'react';

import { authClient } from '@/lib/auth-client';
import { AppShell } from '@/components/shell/AppShell';
import { APP_NAV } from '@/components/shell/nav';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  return (
    <AppShell sections={APP_NAV} isAdmin={isAdmin} homeHref="/dashboard" idPrefix="app">
      {children}
    </AppShell>
  );
}
