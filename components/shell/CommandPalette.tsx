'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CornerDownLeft, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { APP_NAV, ADMIN_NAV, type NavItem } from './nav';

type Command = {
  id: string;
  label: string;
  group: string;
  icon: NavItem['icon'];
  hint?: string;
  run: () => void;
};

/**
 * Cmd/Ctrl+K palette. Built on a plain overlay rather than a dialog primitive
 * so the list keyboard model stays fully under our control.
 */
function CommandPalette({
  open,
  onOpenChange,
  isAdmin = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const go = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  const commands = React.useMemo<Command[]>(() => {
    const navSections = isAdmin ? [...APP_NAV, ...ADMIN_NAV] : APP_NAV;

    const navCommands = navSections.flatMap((section) =>
      section.items.map((item) => ({
        id: `nav:${item.href}`,
        label: item.name,
        group: section.label,
        icon: item.icon,
        run: () => go(item.href),
      }))
    );

    const themeCommands: Command[] = [
      {
        id: 'theme:light',
        label: 'Switch to light theme',
        group: 'Appearance',
        icon: Sun,
        run: () => {
          setTheme('light');
          onOpenChange(false);
        },
      },
      {
        id: 'theme:dark',
        label: 'Switch to dark theme',
        group: 'Appearance',
        icon: Moon,
        run: () => {
          setTheme('dark');
          onOpenChange(false);
        },
      },
    ];

    return [...navCommands, ...themeCommands];
  }, [go, isAdmin, onOpenChange, setTheme]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // A free-text query can always fall through to the full search page.
  const fullTextCommand: Command | null = query.trim()
    ? {
        id: 'search:full',
        label: `Search all content for “${query.trim()}”`,
        group: 'Search',
        icon: Search,
        hint: 'Enter',
        // TODO: backend — /search currently ignores a ?q= param; wire it up to
        // prefill the query server-side.
        run: () => go(`/search?q=${encodeURIComponent(query.trim())}`),
      }
    : null;

  const items = React.useMemo(
    () => (fullTextCommand ? [fullTextCommand, ...results] : results),
    [fullTextCommand, results]
  );

  // Reset state each time the palette opens.
  React.useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  React.useEffect(() => setActive(0), [query]);

  // Keep the highlighted row in view while arrowing through a long list.
  React.useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`
    );
    node?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => (items.length ? (i + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        items[active]?.run();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, items, onOpenChange, open]);

  let lastGroup = '';

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-popover shadow-e4"
          >
            <div className="flex items-center gap-2.5 px-4">
              <Search className="size-4 shrink-0 text-text-muted" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages and actions…"
                aria-label="Search pages and actions"
                role="combobox"
                aria-expanded
                aria-controls="command-results"
                className="h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-text-muted"
              />
              <kbd className="hidden h-5 items-center rounded bg-muted px-1.5 font-mono text-2xs text-text-muted sm:inline-flex">
                ESC
              </kbd>
            </div>

            <div className="h-px bg-divider" />

            <div
              ref={listRef}
              id="command-results"
              role="listbox"
              className="max-h-[min(24rem,50vh)] overflow-y-auto p-2"
            >
              {items.length === 0 ? (
                <div className="px-3 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">
                    Nothing matches “{query}”
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Try a page name, or press Enter to search all content.
                  </p>
                </div>
              ) : (
                items.map((command, index) => {
                  const showGroup = command.group !== lastGroup;
                  lastGroup = command.group;
                  const Icon = command.icon;
                  const isActive = index === active;

                  return (
                    <React.Fragment key={command.id}>
                      {showGroup ? (
                        <p className="px-3 pb-1 pt-3 text-2xs font-semibold uppercase tracking-[0.1em] text-text-muted first:pt-1">
                          {command.group}
                        </p>
                      ) : null}

                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        data-index={index}
                        onMouseMove={() => setActive(index)}
                        onClick={command.run}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left outline-none',
                          isActive ? 'bg-muted' : 'bg-transparent'
                        )}
                      >
                        <Icon
                          className={cn(
                            'size-4 shrink-0',
                            isActive ? 'text-primary' : 'text-text-muted'
                          )}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                          {command.label}
                        </span>
                        {isActive ? (
                          <CornerDownLeft
                            className="size-3.5 shrink-0 text-text-muted"
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between bg-surface-sunken px-4 py-2">
              <span className="flex items-center gap-1 text-2xs text-text-muted">
                <ArrowRight className="size-3 rotate-90" aria-hidden />
                to navigate
              </span>
              <span className="text-2xs text-text-muted">
                Enter to select
              </span>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export { CommandPalette };
