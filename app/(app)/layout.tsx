'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import { AppShell } from '@/components/shell/AppShell';
import { APP_NAV } from '@/components/shell/nav';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push(`/sign-in?redirectTo=${encodeURIComponent(pathname)}`);
      } else if (session?.user && !(session.user as any).emailVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(session.user.email || '')}&unverified=true`);
      }
    }
  }, [session, isPending, router, pathname]);

  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-rose-500" aria-label="Loading session" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AppShell sections={APP_NAV} isAdmin={isAdmin} homeHref="/dashboard" idPrefix="app">
      {children}
    </AppShell>
  );
}
