'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Download, LogOut, Settings, Shield, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

function initialsOf(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split('@')[0] || '?';
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Sidebar footer identity chip. Auth calls are the pre-existing better-auth
 * client methods — only the presentation is new.
 */
function UserMenu({
  collapsed = false,
  isAdmin = false,
}: {
  collapsed?: boolean;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const user = session?.user;
  const name = user?.name || user?.email || 'Account';
  const email = user?.email ?? '';

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/sign-in');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          'press flex w-full items-center gap-2.5 rounded-lg p-2 text-left outline-none',
          'hover:bg-muted data-[popup-open]:bg-muted',
          collapsed && 'justify-center'
        )}
      >
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-2xs font-semibold text-primary-foreground"
        >
          {initialsOf(user?.name, user?.email)}
        </span>

        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {name}
              </span>
              {email ? (
                <span className="block truncate text-2xs text-text-muted">{email}</span>
              ) : null}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-text-muted" aria-hidden />
          </>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="top" className="min-w-56">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          {email ? (
            <p className="truncate text-2xs text-text-muted">{email}</p>
          ) : null}
        </div>

        <Separator className="my-1" />

        <DropdownMenuItem render={<Link href="/dashboard" />} className="gap-2">
          <User className="size-4 text-text-muted" aria-hidden />
          Profile
        </DropdownMenuItem>

        {/* TODO: backend — no user-facing settings route exists yet. */}
        <DropdownMenuItem render={<Link href="/dashboard" />} className="gap-2">
          <Settings className="size-4 text-text-muted" aria-hidden />
          Preferences
        </DropdownMenuItem>

        <DropdownMenuItem render={<a href="/api/export" download />} className="gap-2">
          <Download className="size-4 text-text-muted" aria-hidden />
          Export data
        </DropdownMenuItem>

        {isAdmin ? (
          <DropdownMenuItem render={<Link href="/admin" />} className="gap-2">
            <Shield className="size-4 text-text-muted" aria-hidden />
            Admin panel
          </DropdownMenuItem>
        ) : null}

        <Separator className="my-1" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="gap-2 text-destructive"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };
