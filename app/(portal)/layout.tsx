'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  Award,
  Users,
  Eye,
  LogOut,
  ExternalLink,
  Loader2,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const institutionIdParam = searchParams.get('institutionId');

  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const { data: portalData, isLoading: isPortalLoading, error } = useQuery({
    queryKey: ['portal-overview', institutionIdParam],
    queryFn: async () => {
      const url = institutionIdParam
        ? `/api/portal/overview?institutionId=${institutionIdParam}`
        : '/api/portal/overview';
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || err.error || 'Access denied');
      }
      return res.json();
    },
    enabled: !!session,
    retry: false,
  });

  if (isAuthPending || (session && isPortalLoading)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-7 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Authenticating Campus Portal Access...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-4">
        <div className="max-w-md w-full rounded-xl border border-border/80 bg-card p-6 text-center space-y-4">
          <ShieldAlert className="size-10 mx-auto text-amber-500" />
          <h2 className="text-lg font-bold">Authentication Required</h2>
          <p className="text-xs text-muted-foreground">
            Please sign in with your authorized institutional email to access the placement cell control room.
          </p>
          <Button onClick={() => router.push('/sign-in')} className="w-full">
            Sign In to BigO
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-4">
        <div className="max-w-md w-full rounded-xl border border-border/80 bg-card p-6 text-center space-y-4">
          <ShieldAlert className="size-10 mx-auto text-rose-500" />
          <h2 className="text-lg font-bold">Campus Access Denied</h2>
          <p className="text-xs text-muted-foreground">
            {(error as any).message || 'You do not have active coordinator credentials for any partner campus.'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
              Return to Student Dashboard
            </Button>
            <Button onClick={() => router.refresh()} className="flex-1">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const institution = portalData?.institution;
  const role = portalData?.currentRole || 'coordinator';
  const isObserver = Boolean(portalData?.isSuperAdminObserver);

  const roleLabels: Record<string, string> = {
    head: 'TPC Head',
    coordinator: 'Placement Coordinator',
    invigilator: 'Live Invigilator',
    admin: 'SuperAdmin Observer',
  };

  const navItems = [
    { label: 'Overview', href: '/portal', icon: LayoutDashboard },
    { label: 'Placement Drives', href: '/portal/drives', icon: Calendar },
    { label: 'Scorecards', href: '/portal/results', icon: Award },
    { label: 'Team Roster', href: '/portal/team', icon: Users },
  ];

  // Helper to preserve query param for observer mode
  const buildHref = (path: string) => {
    if (institutionIdParam) {
      return `${path}?institutionId=${institutionIdParam}`;
    }
    return path;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* SuperAdmin Observer Mode Warning Bar */}
      {isObserver && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>SuperAdmin Observer Mode:</strong> Auditing {institution?.name} as read/write observer.
            </span>
          </div>
          <Link href={`/admin/institutions/${institution?.id}`}>
            <Button variant="outline" size="sm" className="h-6 text-[11px] border-amber-500/40 text-amber-300">
              <ArrowLeft className="mr-1 h-3 w-3" /> Exit to Admin Hub
            </Button>
          </Link>
        </div>
      )}

      {/* Main Institutional Header */}
      <header className="border-b border-border/60 bg-card/40 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Campus Identity */}
          <div className="flex items-center gap-4">
            <Link href={buildHref('/portal')} className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>{institution?.name || 'Campus Partner'}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                    TPC PORTAL
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  BigO Enterprise Assessment Platform
                </div>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={buildHref(item.href)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Role Chip & Actions */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs bg-card/60">
              {roleLabels[role] || role}
            </Badge>

            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Exit Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-border/40 px-4 py-2 flex items-center justify-around bg-card/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={buildHref(item.href)}
                className={cn(
                  'flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded',
                  isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Portal Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
