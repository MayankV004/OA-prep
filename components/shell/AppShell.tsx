'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { CommandPalette } from './CommandPalette';
import { Sidebar, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from './Sidebar';
import { Topbar } from './Topbar';
import { SidebarProvider, useSidebar } from './use-sidebar';
import type { NavSection } from './nav';

function ShellFrame({
  sections,
  isAdmin,
  homeHref,
  idPrefix,
  children,
}: {
  sections: NavSection[];
  isAdmin: boolean;
  homeHref: string;
  idPrefix: string;
  children: React.ReactNode;
}) {
  const { collapsed, ready } = useSidebar();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openPalette = React.useCallback(() => setPaletteOpen(true), []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        sections={sections}
        isAdmin={isAdmin}
        homeHref={homeHref}
        onSearch={openPalette}
        idPrefix={idPrefix}
      />

      <div
        style={{
          paddingLeft: `var(--shell-inset, 0px)`,
          ['--shell-inset' as string]: collapsed
            ? `${SIDEBAR_COLLAPSED_WIDTH}px`
            : `${SIDEBAR_WIDTH}px`,
        }}
        className={cn(
          'flex min-h-screen flex-col max-md:!pl-0',
          ready && 'transition-[padding] duration-250 ease-out-quart'
        )}
      >
        <Topbar onSearch={openPalette} />

        <main className="flex flex-1 flex-col p-4 lg:p-6">
          {/* Route changes cross-fade; short enough not to delay perceived load. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-1 flex-col gap-4 lg:gap-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        isAdmin={isAdmin}
      />
    </div>
  );
}

/**
 * Single application shell used by both the app and admin route groups.
 * Callers supply their own nav sections; nothing else differs.
 */
function AppShell({
  sections,
  isAdmin = false,
  homeHref = '/dashboard',
  idPrefix = 'nav',
  children,
}: {
  sections: NavSection[];
  isAdmin?: boolean;
  homeHref?: string;
  idPrefix?: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ShellFrame
        sections={sections}
        isAdmin={isAdmin}
        homeHref={homeHref}
        idPrefix={idPrefix}
      >
        {children}
      </ShellFrame>
    </SidebarProvider>
  );
}

export { AppShell };
