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
} from 'lucide-react';
import { Sparkles } from '@/components/animate-ui/icons/sparkles';
import { ChevronRight } from '@/components/animate-ui/icons/chevron-right';
import { BadgeCheck } from '@/components/animate-ui/icons/badge-check';
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
  const { isPro, openPortal } = useSubscription();

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
            'group relative flex items-center gap-2.5 rounded-full p-1 text-left outline-none transition-all duration-200 cursor-pointer',
            'hover:ring-2 hover:ring-emerald-500/30 focus-visible:ring-2 focus-visible:ring-emerald-500/50 data-[popup-open]:ring-2 data-[popup-open]:ring-emerald-500/50',
            collapsed ? 'size-9 justify-center' : 'w-full px-2 py-1.5 hover:bg-muted/60 data-[popup-open]:bg-muted/60'
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
                className="size-7.5 rounded-full object-cover ring-1.5 ring-emerald-500/40 group-hover:ring-emerald-500 transition-all shadow-xs"
              />
            ) : (
              <span
                aria-hidden
                className="grid size-7.5 place-items-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-[11px] font-mono font-bold tracking-tight text-white ring-1.5 ring-emerald-500/40 group-hover:ring-emerald-500 transition-all shadow-xs select-none"
              >
                {initials}
              </span>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background"
              title="Online Active"
            />
          </div>

          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 truncate text-xs font-bold text-foreground">
                  <span className="truncate">{name}</span>
                  {isPro ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      PRO
                    </span>
                  ) : null}
                </span>
                {email ? (
                  <span className="block truncate text-[10px] text-muted-foreground font-mono">{email}</span>
                ) : null}
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            </>
          ) : null}
        </DropdownMenuTrigger>

        {/* ── Redesigned Luxury Dropdown Menu Content ── */}
        <DropdownMenuContent
          align="end"
          side={side}
          sideOffset={8}
          className="w-80 p-2.5 rounded-3xl bg-card/95 dark:bg-[#0B0F17]/95 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-foreground z-50 overflow-hidden relative"
        >
          {/* Top specular beam & ambient glow */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-emerald-500/10 blur-2xl" />

          {/* ── Section 1: Candidate Identity Header ── */}
          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-surface-sunken/60 border border-border/50 relative z-10">
            <div className="relative shrink-0 mt-0.5">
              {hasGoogleImage ? (
                <img
                  src={user!.image!}
                  alt={name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="size-11 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-xs"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-sm font-mono font-bold tracking-wider text-white ring-2 ring-emerald-500/40 shadow-xs select-none"
                >
                  {initials}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-card shadow-xs" />
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-extrabold text-foreground tracking-tight">
                  {name}
                </span>
                <BadgeCheck size={14} animateOnView className="text-emerald-500 shrink-0" />
              </div>

              {email ? (
                <p className="truncate text-xs text-muted-foreground font-mono">{email}</p>
              ) : null}

              <div className="flex items-center gap-1.5 pt-1">
                {isPro ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 shadow-2xs">
                    <Sparkles size={10} animateOnView /> PRO MEMBER
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/60">
                    FREE TIER
                  </span>
                )}
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                  Placement Ready
                </span>
              </div>
            </div>
          </div>

          {/* ── Section 2: Grouped Action Items ── */}
          <div className="mt-2 space-y-1 relative z-10">
            {/* Subscription & Billing Item */}
            {isPro ? (
              <DropdownMenuItem
                onClick={() => openPortal()}
                className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors group/item"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover/item:bg-amber-500/20 transition-colors">
                  <CreditCard className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground">Manage Subscription</p>
                  <p className="text-[11px] text-muted-foreground truncate">Billing, portal & invoices</p>
                </div>
                <ChevronRight size={13} animateOnHover className="text-muted-foreground group-hover/item:text-foreground group-hover/item:translate-x-0.5 transition-all" />
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                render={<Link href="/pricing" />}
                className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group/item"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500 group-hover/item:bg-emerald-500/30 transition-colors">
                  <Sparkles size={14} animateOnView />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Upgrade to BigO Pro</p>
                  <p className="text-[11px] text-muted-foreground truncate">Unlock all company OA mocks</p>
                </div>
                <ChevronRight size={13} animateOnHover className="text-emerald-500 group-hover/item:translate-x-0.5 transition-all" />
              </DropdownMenuItem>
            )}

            {/* Profile */}
            <DropdownMenuItem
              render={<Link href="/profile" />}
              className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors group/item"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover/item:bg-blue-500/20 transition-colors">
                <User className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground">Candidate Profile</p>
                <p className="text-[11px] text-muted-foreground truncate">Bio, target companies & handles</p>
              </div>
              <ChevronRight size={13} animateOnHover className="text-muted-foreground group-hover/item:text-foreground group-hover/item:translate-x-0.5 transition-all" />
            </DropdownMenuItem>

            {/* Report Bug / Feedback */}
            <DropdownMenuItem
              onClick={() => setFeedbackOpen(true)}
              className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors group/item"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover/item:bg-rose-500/20 transition-colors">
                <MessageSquare className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground">Report Bug / Feedback</p>
                <p className="text-[11px] text-muted-foreground truncate">Submit feedback to engineers</p>
              </div>
              <ChevronRight size={13} animateOnHover className="text-muted-foreground group-hover/item:text-foreground group-hover/item:translate-x-0.5 transition-all" />
            </DropdownMenuItem>

            {/* Contact & Support */}
            <DropdownMenuItem
              render={<Link href="/contact" />}
              className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors group/item"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20 group-hover/item:bg-teal-500/20 transition-colors">
                <HelpCircle className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground">Contact & Support</p>
                <p className="text-[11px] text-muted-foreground truncate">Help docs & candidate support</p>
              </div>
              <ChevronRight size={13} animateOnHover className="text-muted-foreground group-hover/item:text-foreground group-hover/item:translate-x-0.5 transition-all" />
            </DropdownMenuItem>

            {/* Export Data */}
            <DropdownMenuItem
              render={<a href="/api/export" download />}
              className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors group/item"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover/item:bg-purple-500/20 transition-colors">
                <Download className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground">Export Data</p>
                <p className="text-[11px] text-muted-foreground truncate">Download JSON activity & code</p>
              </div>
              <ChevronRight size={13} animateOnHover className="text-muted-foreground group-hover/item:text-foreground group-hover/item:translate-x-0.5 transition-all" />
            </DropdownMenuItem>

            {/* ── Admin Section ── */}
            {isAdmin ? (
              <>
                <div className="my-1.5 border-t border-border/50" />
                <div className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Administration
                </div>
                <DropdownMenuItem
                  render={<Link href="/admin" />}
                  className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors group/item"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover/item:bg-amber-500/20 transition-colors">
                    <Shield className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">Admin Panel</p>
                    <p className="text-[11px] text-muted-foreground truncate">System metrics, users & logs</p>
                  </div>
                  <ChevronRight size={13} animateOnHover className="text-muted-foreground group-hover/item:text-foreground group-hover/item:translate-x-0.5 transition-all" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/admin/feedback" />}
                  className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-muted/80 focus:bg-muted/80 transition-colors group/item"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover/item:bg-indigo-500/20 transition-colors">
                    <MessageSquare className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">User Feedback Admin</p>
                    <p className="text-[11px] text-muted-foreground truncate">Triage bug reports & suggestions</p>
                  </div>
                  <ChevronRight size={13} animateOnHover className="text-muted-foreground group-hover/item:text-foreground group-hover/item:translate-x-0.5 transition-all" />
                </DropdownMenuItem>
              </>
            ) : null}

            {/* ── Sign Out ── */}
            <div className="my-1.5 border-t border-border/50" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors group/item"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20 group-hover/item:bg-destructive/20 transition-colors">
                <LogOut className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-destructive">Sign out</p>
                <p className="text-[11px] text-muted-foreground truncate">End candidate session</p>
              </div>
              <ChevronRight size={13} animateOnHover className="text-destructive/70 group-hover/item:translate-x-0.5 transition-all" />
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
