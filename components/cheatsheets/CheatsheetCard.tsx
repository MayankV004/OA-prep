import Link from 'next/link';
import { ArrowRight, FileCode2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Cheatsheet } from '@/types/cheatsheet';
import { cn } from '@/lib/utils';

interface CheatsheetCardProps {
  sheet: Cheatsheet;
}

export function CheatsheetCard({ sheet }: CheatsheetCardProps) {
  const updatedText = (() => {
    try {
      return formatDistanceToNow(parseISO(sheet.updatedAt), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  })();

  return (
    <Link
      href={`/cheatsheets/${sheet.slug}`}
      className="group block h-full outline-none"
    >
      <div
        className={cn(
          'h-full flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl border transition-all duration-300 relative overflow-hidden',
          // Frosted glass styling
          'bg-card/70 dark:bg-card/35 backdrop-blur-2xl',
          'border-border/80 dark:border-white/10',
          'hover:border-foreground/20 dark:hover:border-white/20',
          'shadow-xs hover:shadow-xl hover:-translate-y-0.5',
          // Top specular sheen
          'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent'
        )}
      >
        <div className="space-y-3.5">
          {/* Header Row: Reference Pill + Squircle Icon */}
          <div className="flex items-start justify-between gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md bg-foreground/[0.04] dark:bg-white/[0.06] text-muted-foreground border-border/70 dark:border-white/10">
              Reference Guide
            </span>

            <div
              className={cn(
                'size-11 sm:size-12 rounded-2xl flex items-center justify-center border shadow-2xs backdrop-blur-md transition-all duration-300 group-hover:scale-105 shrink-0',
                'bg-foreground/[0.03] dark:bg-white/[0.06] border-border/70 dark:border-white/10',
                'group-hover:border-primary/40 group-hover:bg-primary/[0.05]'
              )}
            >
              <FileCode2 className="size-5 text-foreground/80 group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {sheet.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1.5 font-normal">
              Syntax, methods, operational time complexities, and interview patterns for {sheet.title}.
            </p>
          </div>

          {/* Tag Badges */}
          {sheet.tags && sheet.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {sheet.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs"
                >
                  #{tag}
                </span>
              ))}
              {sheet.tags.length > 3 && (
                <span className="px-2 py-0.5 rounded-lg bg-foreground/[0.02] dark:bg-white/[0.02] border border-border/40 font-mono text-[11px] text-muted-foreground/60">
                  +{sheet.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Single-Line Footer Action Row */}
        <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {updatedText}
          </span>

          <div className="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0">
            <span>Open Sheet</span>
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
