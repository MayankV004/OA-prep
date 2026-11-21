'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Code2, PanelLeftClose, PanelLeftOpen, Search, X, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarNav } from './SidebarNav';
import { UserMenu } from './UserMenu';
import { useSidebar } from './use-sidebar';
import { useSubscription } from '@/hooks/useSubscription';
import { type NavSection } from './nav';

const EXPANDED = 264;
const COLLAPSED = 68;

import { BigOIcon } from '@/components/ui/big-o-logo';

function Brand({ collapsed, href }: { collapsed: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex h-10 items-center gap-3 rounded-xl px-2 outline-none group transition-all duration-200',
        collapsed && 'justify-center px-0'
      )}
      aria-label="BigO home"
    >
      <BigOIcon className="size-8 shrink-0 bg-white text-[#065f46] dark:bg-primary dark:text-primary-foreground shadow-sm" />
      <span
        className={cn(
          'truncate font-display text-base font-black tracking-tight text-white dark:text-foreground',
          'transition-opacity duration-200 ease-out-quart',
          collapsed && 'w-0 opacity-0'
        )}
      >
        Big<span className="text-emerald-300 dark:text-primary">O</span>
      </span>
    </Link>
  );
}

function SearchTrigger({
  collapsed,
  onOpen,
}: {
  collapsed: boolean;
  onOpen: () => void;
}) {
  const trigger = (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'press group flex h-9 w-full items-center rounded-lg px-3 text-sm outline-none transition-colors cursor-pointer',
        'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-white/15',
        'dark:bg-white/[0.06] dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/[0.1] dark:hover:text-white dark:hover:border-emerald-500/30',
        collapsed && 'justify-center px-0'
      )}
    >
      <Search className="size-4 shrink-0 text-white/80 group-hover:text-white dark:text-zinc-300 dark:group-hover:text-white transition-colors" aria-hidden />
      {!collapsed ? (
        <>
          <span className="ml-2.5 flex-1 text-left text-xs font-medium">Search</span>
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded px-1.5 font-mono text-2xs font-medium border shadow-xs bg-white/15 text-white/90 border-white/20 dark:bg-white/10 dark:text-zinc-200 dark:border-white/15">
            <span className="text-xs">⌘</span>K
          </kbd>
        </>
      ) : null}
    </button>
  );

  if (!collapsed) return trigger;

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent side="right" sideOffset={8}>
        Search — ⌘K
      </TooltipContent>
    </Tooltip>
  );
}

function UpgradeBanner({ collapsed }: { collapsed: boolean }) {
  const { isPro } = useSubscription();
  if (isPro || collapsed) return null;

  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-left dark:border-amber-500/25 dark:bg-amber-500/10">
      <div className="font-semibold text-xs text-amber-300 dark:text-amber-400">
        Upgrade to BigO Pro
      </div>
      <p className="mt-1 text-[11px] text-white/80 dark:text-zinc-300 leading-tight">
        Unlock timed mock OAs & AI testcase debugger.
      </p>
      <Link
        href="/pricing"
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 dark:text-amber-400 dark:hover:text-amber-300 hover:underline"
      >
        <span>View Plans</span>
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function SidebarBody({
  sections,
  collapsed,
  isAdmin,
  homeHref,
  onNavigate,
  onSearch,
  idPrefix,
}: {
  sections: NavSection[];
  collapsed: boolean;
  isAdmin: boolean;
  homeHref: string;
  onNavigate?: () => void;
  onSearch: () => void;
  idPrefix: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-3">
      <Brand collapsed={collapsed} href={homeHref} />

      <SearchTrigger collapsed={collapsed} onOpen={onSearch} />

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        <SidebarNav
          sections={sections}
          collapsed={collapsed}
          onNavigate={onNavigate}
          idPrefix={idPrefix}
        />
      </div>

      <div className="flex flex-col gap-2">
        <UpgradeBanner collapsed={collapsed} />
        <UserMenu collapsed={collapsed} isAdmin={isAdmin} side="top" />
      </div>
    </div>
  );
}

/**
 * Desktop rail plus mobile drawer. Separation from the page comes from the
 * sidebar surface tone and a shadow, never an edge border.
 */
function Sidebar({
  sections,
  isAdmin = false,
  homeHref = '/',
  onSearch,
  idPrefix = 'nav',
}: {
  sections: NavSection[];
  isAdmin?: boolean;
  homeHref?: string;
  onSearch: () => void;
  idPrefix?: string;
}) {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, ready } = useSidebar();

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────────────── */}
      <aside
        style={{ width: collapsed ? COLLAPSED : EXPANDED }}
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r shadow-xl md:block',
          // Light mode: Vibrant Executive Emerald gradient
          'bg-gradient-to-b from-[#047857] via-[#065f46] to-[#064e3b] text-white border-white/10',
          // Dark mode: High-contrast Cyber-Emerald Obsidian gradient with vibrant emerald border
          'dark:bg-gradient-to-b dark:from-[#081e18] dark:via-[#061713] dark:to-[#030d0a] dark:text-white dark:border-emerald-500/20 dark:shadow-[4px_0_30px_rgba(0,0,0,0.7)]',
          ready && 'transition-[width] duration-250 ease-out-quart'
        )}
      >
        <SidebarBody
          sections={sections}
          collapsed={collapsed}
          isAdmin={isAdmin}
          homeHref={homeHref}
          onSearch={onSearch}
          idPrefix={idPrefix}
        />

        {/* Collapse handle sits on the sidebar edge. */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!collapsed}
                className={cn(
                  'press absolute -right-3 top-16 grid size-6 place-items-center rounded-full outline-none cursor-pointer',
                  // Light mode
                  'bg-white text-[#065f46] border border-[#065f46]/20 shadow-md hover:bg-emerald-50 hover:text-[#064e3b]',
                  // Dark mode: Luminous high-contrast toggle
                  'dark:bg-[#0a1f18] dark:text-emerald-400 dark:border-emerald-500/35 dark:shadow-[0_0_14px_rgba(16,185,129,0.25)] dark:hover:bg-emerald-950 dark:hover:text-emerald-300'
                )}
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-3.5" />
                ) : (
                  <PanelLeftClose className="size-3.5" />
                )}
              </button>
            }
          />
          <TooltipContent side="right" sideOffset={6}>
            {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </TooltipContent>
        </Tooltip>
      </aside>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.4, right: 0 }}
              onDragEnd={(_, info) => {
                // Swipe left far enough (or fast enough) to dismiss.
                if (info.offset.x < -70 || info.velocity.x < -450) {
                  setMobileOpen(false);
                }
              }}
              className="absolute inset-y-0 left-0 w-[min(19rem,85vw)] bg-gradient-to-b from-[#047857] via-[#065f46] to-[#064e3b] text-white dark:bg-gradient-to-b dark:from-[#081e18] dark:via-[#061713] dark:to-[#030d0a] dark:text-white dark:border-r dark:border-emerald-500/20 shadow-e4"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="press absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white dark:text-text-muted dark:hover:bg-muted dark:hover:text-foreground outline-none"
              >
                <X className="size-4" />
              </button>

              <SidebarBody
                sections={sections}
                collapsed={false}
                isAdmin={isAdmin}
                homeHref={homeHref}
                onNavigate={() => setMobileOpen(false)}
                onSearch={() => {
                  setMobileOpen(false);
                  onSearch();
                }}
                idPrefix={`${idPrefix}-mobile`}
              />

              {/* Grab affordance for the swipe gesture. */}
              <span
                aria-hidden
                className="absolute right-1 top-1/2 h-10 w-1 -translate-y-1/2 rounded-full bg-divider"
              />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export { Sidebar, EXPANDED as SIDEBAR_WIDTH, COLLAPSED as SIDEBAR_COLLAPSED_WIDTH };
