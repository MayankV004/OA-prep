import { type ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { AppShell } from '@/components/shell/AppShell';

/**
 * Server Component layout — auth check runs on the server before rendering.
 * Benefits vs the previous 'use client' approach:
 *   - No hydration loading spinner on protected page navigation
 *   - Better TTFB: server redirects unauthenticated users before sending HTML
 *   - RSC streaming works for child pages
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/sign-in');
  }

  if (!(session.user as any).emailVerified) {
    const email = session.user.email ?? '';
    redirect(`/verify-email?email=${encodeURIComponent(email)}&unverified=true`);
  }

  if ((session.user as any).disabled) {
    redirect('/sign-in?error=account_disabled');
  }

  const isAdmin = (session.user as any).role === 'admin';

  return (
    <AppShell variant="app" isAdmin={isAdmin} homeHref="/dashboard" idPrefix="app">
      {children}
    </AppShell>
  );
}
