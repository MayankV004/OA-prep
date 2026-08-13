'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import { AppShell } from '@/components/shell/AppShell';
import { ADMIN_NAV } from '@/components/shell/nav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  // Unchanged role guard: this client-side redirect is still the only thing
  // protecting /admin — there is no middleware backstop.
  useEffect(() => {
    if (isPending) return;
    if (!session || !isAdmin) router.push('/dashboard');
  }, [isAdmin, isPending, router, session]);

  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-text-muted" aria-label="Loading" />
      </div>
    );
  }

  if (!session || !isAdmin) return null;

  return (
    <AppShell sections={ADMIN_NAV} isAdmin homeHref="/admin" idPrefix="admin">
      {children}
    </AppShell>
  );
}
