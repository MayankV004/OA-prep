'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/lib/query-keys';
import { dashboardQueries } from '@/lib/queries/dashboard';
import { cheatsheetQueries } from '@/lib/queries/cheatsheets';
import { isNavItemActive, type NavItem, type NavSection } from './nav';

/**
 * Navigation list. The active state is a shared `layoutId` pill, so moving
 * between routes slides the highlight rather than snapping it.
 */
function SidebarNav({
  sections,
  collapsed,
  onNavigate,
  idPrefix = 'nav',
}: {
  sections: NavSection[];
  collapsed: boolean;
  onNavigate?: () => void;
  idPrefix?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5" aria-label="Main">
      {sections.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          {/* The label collapses to a hairline rather than disappearing abruptly. */}
          <p
            className={cn(
              'px-3 text-2xs font-semibold uppercase tracking-[0.1em] text-text-muted',
              'transition-all duration-200 ease-out-quart',
              collapsed
                ? 'h-0 overflow-hidden opacity-0'
                : 'h-4 opacity-100'
            )}
            aria-hidden={collapsed}
          >
            {section.label}
          </p>

          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <li key={item.href}>
                <SidebarNavLink
                  item={item}
                  active={isNavItemActive(pathname, item)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  layoutId={`${idPrefix}-active`}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarNavLink({
  item,
  active,
  collapsed,
  onNavigate,
  layoutId,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
  layoutId: string;
}) {
  const Icon = item.icon;
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    const href = item.href;
    try {
      if (href === '/dashboard') {
        queryClient.prefetchQuery(dashboardQueries.stats('me'));
      } else if (href === '/subjects' || href === '/interview') {
        queryClient.prefetchQuery({
          queryKey: queryKeys.groups.byKind('subject'),
          queryFn: async () => {
            const res = await fetch('/api/groups?kind=subject');
            return res.ok ? res.json() : [];
          },
          staleTime: STALE_TIMES.static,
        });
      } else if (href === '/cheatsheets') {
        queryClient.prefetchQuery(cheatsheetQueries.all());
      } else if (href === '/cp/contests' || href === '/cp') {
        queryClient.prefetchQuery({
          queryKey: queryKeys.contests.list('all'),
          queryFn: async () => {
            const res = await fetch('/api/contests?status=UPCOMING,RUNNING');
            return res.ok ? res.json() : { contests: [] };
          },
          staleTime: STALE_TIMES.shared,
        });
      } else if (href === '/pricing') {
        queryClient.prefetchQuery({
          queryKey: queryKeys.pricing.plans(),
          queryFn: async () => {
            const res = await fetch('/api/pricing');
            return res.ok ? res.json() : { plans: {} };
          },
          staleTime: STALE_TIMES.shared,
        });
      } else if (href === '/oa') {
        queryClient.prefetchQuery({
          queryKey: queryKeys.oa.assessments(),
          queryFn: async () => {
            const res = await fetch('/api/oa/assessments');
            return res.ok ? res.json() : { success: false, assessments: [] };
          },
          staleTime: STALE_TIMES.shared,
        });
      }
    } catch {
      // Non-blocking prefetch failure
    }
  };

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      onMouseEnter={handleMouseEnter}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex h-9 items-center rounded-lg px-3 text-sm font-medium outline-none',
        'transition-colors duration-150 ease-out-quart',
        collapsed && 'justify-center px-0',
        active
          ? 'text-primary font-bold'
          : 'text-text-secondary hover:bg-muted/60 hover:text-foreground'
      )}
    >
      {active ? (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-xl bg-primary/12 border border-primary/25 shadow-[0_0_14px_rgba(99,102,241,0.18)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          aria-hidden
        />
      ) : null}

      <Icon
        className={cn(
          'relative z-10 size-4 shrink-0 transition-colors',
          active ? 'text-primary' : 'text-text-muted group-hover:text-foreground'
        )}
      />

      <span
        className={cn(
          'relative z-10 truncate transition-[opacity,margin] duration-200 ease-out-quart',
          collapsed ? 'ml-0 w-0 opacity-0' : 'ml-2.5 opacity-100'
        )}
      >
        {item.name}
      </span>
    </Link>
  );

  // Collapsed rail relies on tooltips to stay legible.
  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right" sideOffset={8}>
        {item.name}
      </TooltipContent>
    </Tooltip>
  );
}

export { SidebarNav };
