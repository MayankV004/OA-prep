'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buildCrumbs } from './nav';
import { useSidebar } from './use-sidebar';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';

/** Sticky header. The shadow appears only once the page has actually scrolled. */
function Topbar({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebar();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const crumbs = buildCrumbs(pathname);

  return (
    <header
      className={cn(
        'surface-blur sticky top-0 z-20 flex h-14 items-center justify-between gap-3 px-4 lg:px-6',
        'transition-shadow duration-200 ease-out-quart',
        scrolled && 'shadow-e2'
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="press grid size-11 shrink-0 place-items-center rounded-lg text-text-secondary outline-none hover:bg-muted hover:text-foreground md:hidden"
        >
          <Menu className="size-5" />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-1 overflow-hidden">
            {crumbs.map((crumb, i) => (
              <li key={crumb.href} className="flex min-w-0 items-center gap-1">
                {i > 0 ? (
                  <ChevronRight
                    className="size-3.5 shrink-0 text-text-muted"
                    aria-hidden
                  />
                ) : null}

                {crumb.isLast ? (
                  <span
                    aria-current="page"
                    className="truncate font-display text-sm font-semibold text-foreground"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className={cn(
                      'truncate rounded px-1 text-sm text-text-muted outline-none',
                      'transition-colors hover:text-foreground',
                      i > 0 && 'hidden sm:inline'
                    )}
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Top Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          className="press grid size-10 shrink-0 place-items-center rounded-xl text-text-secondary outline-none hover:bg-muted hover:text-foreground md:hidden"
        >
          <Search className="size-5" />
        </button>

        {/* Ripple Theme Toggle positioned on Top Right */}
        <AnimatedThemeToggle />
      </div>
    </header>
  );
}

export { Topbar };
