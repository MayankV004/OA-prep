'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronsUpDown,
  Download,
  LogOut,
  Shield,
  User,
  MessageSquare,
  HelpCircle,
  CreditCard,
  BadgeCheck,
} from 'lucide-react';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { useSubscription } from '@/hooks/useSubscription';

import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function isGoogleAccountImage(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes('googleusercontent.com') ||
    trimmed.includes('google.com') ||
    trimmed.includes('ggpht.com')
  );
}

function initialsOf(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split('@')[0] || '';
  if (!source) return 'OA';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export interface UserMenuProps {
  collapsed?: boolean;
  isAdmin?: boolean;
  side?: 'top' | 'bottom';
}

export function UserMenu({
  collapsed = false,
  isAdmin = false,
  side = 'bottom',
}: UserMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { isPro, cancelSubscription, isCancelingSubscription } = useSubscription();

  const [imgError, setImgError] = React.useState(false);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  const user = session?.user;
  const name = user?.name || user?.email || 'Candidate';
  const email = user?.email ?? '';

  const hasGoogleImage = Boolean(user?.image && isGoogleAccountImage(user.image) && !imgError);
  const initials = initialsOf(user?.name, user?.email);

  const handleSignOut = async () => {
    queryClient.clear();
    await authClient.signOut();
    router.push('/sign-in');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Candidate account menu"
          className={cn(
            'group relative flex items-center gap-2.5 rounded-xl p-1 text-left outline-none transition-all duration-200 cursor-pointer',
            'hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 data-[popup-open]:bg-white/15',
            'dark:hover:bg-muted/60 dark:focus-visible:ring-emerald-500/50 dark:data-[popup-open]:bg-muted/60',
            collapsed ? 'size-9 justify-center' : 'w-full px-2.5 py-1.5'
          )}
        >
          {/* Avatar: Google account photo OR Initials */}
          <div className="relative shrink-0">
            {hasGoogleImage ? (
              <img
                src={user!.image!}
                alt={name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="size-7.5 rounded-full object-cover ring-1.5 ring-white/40 group-hover:ring-white dark:ring-emerald-500/40 dark:group-hover:ring-emerald-500 transition-all shadow-xs"
              />
            ) : (
              <span
                aria-hidden
                className="grid size-7.5 place-items-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-[11px] font-mono font-bold tracking-tight text-white ring-1.5 ring-white/40 group-hover:ring-white dark:ring-emerald-500/40 dark:group-hover:ring-emerald-500 transition-all shadow-xs select-none"
              >
                {initials}
              </span>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-[#065f46] dark:ring-[#081e18]"
              title="Online Active"
            />
          </div>

          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 truncate text-xs font-semibold text-white dark:text-foreground">
                  <span className="truncate">{name}</span>
                  {isPro ? (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
                      PRO
                    </span>
                  ) : null}
                </span>
                {email ? (
                  <span className="block truncate text-[10px] text-white/70 dark:text-zinc-400 font-mono">
                    {email}
                  </span>
                ) : null}
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-white/70 group-hover:text-white dark:text-zinc-400 dark:group-hover:text-white transition-colors" aria-hidden />
            </>
          ) : null}
        </DropdownMenuTrigger>

        {/* ── Modern & Sleek Dropdown Menu Content ── */}
        <DropdownMenuContent
          align={collapsed ? 'start' : 'center'}
          side={side}
          sideOffset={8}
          className="w-72 p-1.5 rounded-2xl bg-popover/95 dark:bg-[#0c1412]/95 backdrop-blur-2xl border border-border/80 dark:border-emerald-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-popover-foreground z-50 overflow-hidden relative"
        >
          {/* Top specular accent highlight line */}
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

          {/* ── Section 1: Candidate Identity Header ── */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 dark:bg-white/[0.04] border border-border/50 dark:border-white/10 relative z-10 mb-1">
            <div className="relative shrink-0">
              {hasGoogleImage ? (
                <img
                  src={user!.image!}
                  alt={name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="size-9 rounded-full object-cover ring-1.5 ring-emerald-500/30 dark:ring-emerald-500/40 shadow-xs"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-mono font-bold tracking-tight text-white ring-1.5 ring-emerald-500/30 dark:ring-emerald-500/40 shadow-xs select-none"
                >
                  {initials}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card shadow-xs" />
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-semibold text-foreground tracking-tight">
                  {name}
                </span>
                <BadgeCheck size={13} className="text-emerald-500 shrink-0" />
              </div>

              {email ? (
                <p className="truncate text-[11px] text-muted-foreground font-mono">{email}</p>
              ) : null}

              <div className="flex items-center gap-1.5 pt-0.5">
                {isPro ? (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    PRO
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-mono font-medium uppercase tracking-wider bg-muted text-muted-foreground border border-border/60">
                    FREE TIER
                  </span>
                )}
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* ── Section 2: Account & Subscription ── */}
          <div className="space-y-0.5 relative z-10">
            {/* Candidate Profile */}
            <DropdownMenuItem
              render={<Link href="/profile" />}
              className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 dark:hover:bg-white/[0.08] dark:hover:text-white cursor-pointer transition-colors outline-none"
            >
              <div className="flex items-center gap-2.5">
                <User className="size-4 text-muted-foreground group-hover:text-foreground dark:text-zinc-400 dark:group-hover:text-white transition-colors" />
                <span>Candidate Profile</span>
              </div>
            </DropdownMenuItem>

            {/* Subscription */}
            {isPro ? (
              <DropdownMenuItem
                onClick={() => {
                  if (window.confirm('Cancel your recurring Cashfree subscription? Access remains active until the current period ends.')) {
                    cancelSubscription();
                  }
                }}
                disabled={isCancelingSubscription}
                className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 dark:hover:bg-white/[0.08] dark:hover:text-white cursor-pointer transition-colors outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="size-4 text-muted-foreground group-hover:text-foreground dark:text-zinc-400 dark:group-hover:text-white transition-colors" />
                  <span>Subscription</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground group-hover:text-destructive transition-colors">
                  {isCancelingSubscription ? 'Canceling...' : 'Cancel'}
                </span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                render={<Link href="/pricing" />}
                className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 cursor-pointer transition-colors outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Upgrade to Pro</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                  Unlock
                </span>
              </DropdownMenuItem>
            )}
          </div>

          <div className="my-1 border-t border-border/50 dark:border-white/[0.06]" />

          {/* ── Section 3: Preferences & Support ── */}
          <div className="space-y-0.5 relative z-10">
            {/* Report Bug / Feedback */}
            <DropdownMenuItem
              onClick={() => setFeedbackOpen(true)}
              className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 dark:hover:bg-white/[0.06] cursor-pointer transition-colors outline-none"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>Feedback & Bug Report</span>
              </div>
            </DropdownMenuItem>

            {/* Contact & Support */}
            <DropdownMenuItem
              render={<Link href="/contact" />}
              className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 dark:hover:bg-white/[0.06] cursor-pointer transition-colors outline-none"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>Help & Support</span>
              </div>
            </DropdownMenuItem>

            {/* Export Data */}
            <DropdownMenuItem
              render={<a href="/api/export" download />}
              className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 dark:hover:bg-white/[0.06] cursor-pointer transition-colors outline-none"
            >
              <div className="flex items-center gap-2.5">
                <Download className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>Export Activity</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">JSON</span>
            </DropdownMenuItem>
          </div>

          {/* ── Section 4: Admin Section ── */}
          {isAdmin ? (
            <>
              <div className="my-1 border-t border-border/50 dark:border-white/[0.06]" />
              <div className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Administration
              </div>
              <div className="space-y-0.5 relative z-10">
                <DropdownMenuItem
                  render={<Link href="/admin" />}
                  className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 dark:hover:bg-white/[0.06] cursor-pointer transition-colors outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>Admin Panel</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/admin/feedback" />}
                  className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 dark:hover:bg-white/[0.06] cursor-pointer transition-colors outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>User Feedback Admin</span>
                  </div>
                </DropdownMenuItem>
              </div>
            </>
          ) : null}

          <div className="my-1 border-t border-border/50 dark:border-white/[0.06]" />

          {/* ── Section 5: Sign Out ── */}
          <div className="relative z-10">
            <DropdownMenuItem
              onClick={handleSignOut}
              className="group flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/15 cursor-pointer transition-colors outline-none"
            >
              <LogOut className="size-4 text-muted-foreground group-hover:text-destructive transition-colors" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
