'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Code2, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarNav } from './SidebarNav';
import { UserMenu } from './UserMenu';
import { useSidebar } from './use-sidebar';
import type { NavSection } from './nav';

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
      <BigOIcon className="size-8 shrink-0" />
      <span
        className={cn(
          'truncate font-display text-base font-black tracking-tight text-foreground',
          'transition-opacity duration-200 ease-out-quart',
          collapsed && 'w-0 opacity-0'
        )}
      >
        Big<span className="text-rose-500">O</span>
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
        'press group flex h-9 w-full items-center rounded-lg bg-input-background px-3 text-sm outline-none',
        'text-text-muted hover:bg-muted hover:text-foreground',
        collapsed && 'justify-center px-0'
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden />
      {!collapsed ? (
        <>
          <span className="ml-2.5 flex-1 text-left">Search</span>
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded bg-surface px-1.5 font-mono text-2xs font-medium text-text-muted shadow-e1">
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

      <div className="flex flex-col gap-1">
        <UserMenu collapsed={collapsed} isAdmin={isAdmin} />
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
  homeHref = '/dashboard',
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
          'fixed inset-y-0 left-0 z-30 hidden bg-sidebar/80 backdrop-blur-xl border-r border-border/50 shadow-xl md:block',
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
                  'press absolute -right-3 top-16 grid size-6 place-items-center rounded-full',
                  'bg-surface text-text-muted shadow-e2 outline-none',
                  'hover:text-foreground'
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
              className="absolute inset-y-0 left-0 w-[min(19rem,85vw)] bg-sidebar shadow-e4"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="press absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-lg text-text-muted outline-none hover:bg-muted hover:text-foreground"
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
