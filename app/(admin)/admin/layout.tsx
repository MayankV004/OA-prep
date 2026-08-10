'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';
import {
  Users,
  Mail,
  Database,
  Settings,
  Activity,
  FileText,
  LayoutDashboard,
  Shield,
  ChevronRight,
  LogOut,
  ArrowLeft,
  BookOpen,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ADMIN_NAV: {
  section: string;
  items: { name: string; href: string; icon: any; exact?: boolean }[];
}[] = [
  {
    section: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    section: 'User Management',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Invites', href: '/admin/invites', icon: Mail },
    ],
  },
  {
    section: 'Content',
    items: [
      { name: 'Problems', href: '/admin/content/problems', icon: Database },
      { name: 'Topics', href: '/admin/content/topics', icon: BookOpen },
      { name: 'Cheat Sheets', href: '/admin/content/cheatsheets', icon: FileText },
      { name: 'Questions', href: '/admin/content/questions', icon: FileText },
    ],
  },
  {
    section: 'System',
    items: [
      { name: 'Taxonomies', href: '/admin/taxonomies', icon: Tag },
      { name: 'Activity Log', href: '/admin/activity', icon: Activity },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as any;

  // Redirect if not admin
  useEffect(() => {
    if (!isPending && (!session || user?.role !== 'admin')) {
      router.replace('/dashboard');
    }
  }, [session, user, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Shield className="h-5 w-5 animate-pulse text-primary" />
          <span className="text-sm">Verifying access…</span>
        </div>
      </div>
    );
  }

  if (!session || user?.role !== 'admin') return null;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Admin Sidebar ── */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-border/60 bg-card">
        {/* Logo / brand */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/60">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Admin Panel</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">PlacementDeck</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {ADMIN_NAV.map((group) => (
            <div key={group.section}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                        <span className="flex-1">{item.name}</span>
                        {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/60 space-y-1">
          <Link href="/dashboard">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          {/* User chip */}
          <div className="mt-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <span className="ml-auto shrink-0 text-[9px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Admin
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b border-border/60 bg-card/50 backdrop-blur flex items-center px-6 gap-3 shrink-0">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Admin</span>
            {pathname !== '/admin' && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="capitalize">
                  {pathname.split('/').filter(Boolean).slice(1).join(' › ')}
                </span>
              </>
            )}
          </nav>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
