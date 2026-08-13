'use client';

import * as React from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // The resolved theme is unknown until hydration, so the checkmark waits.
  React.useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className={cn(
          'press relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg',
          'bg-muted/60 text-text-secondary outline-none',
          'hover:bg-muted hover:text-foreground',
          'data-[popup-open]:bg-muted data-[popup-open]:text-foreground',
          className,
        )}
      >
        <Sun
          className="size-[1.1rem] rotate-0 scale-100 transition-transform duration-300 ease-out-quart dark:-rotate-90 dark:scale-0"
          aria-hidden
        />
        <Moon
          className="absolute size-[1.1rem] rotate-90 scale-0 transition-transform duration-300 ease-out-quart dark:rotate-0 dark:scale-100"
          aria-hidden
        />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="gap-2"
          >
            <Icon className="size-4 text-text-muted" aria-hidden />
            <span className="flex-1">{label}</span>
            {mounted && theme === value ? (
              <Check className="size-3.5 text-primary" aria-hidden />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
