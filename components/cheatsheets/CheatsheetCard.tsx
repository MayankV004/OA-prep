import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Tag, ArrowRight, FileCode2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Cheatsheet } from '@/types/cheatsheet';
import { cn } from '@/lib/utils';

interface CheatsheetCardProps {
  sheet: Cheatsheet;
}

export function CheatsheetCard({ sheet }: CheatsheetCardProps) {
  return (
    <Link href={`/cheatsheets/${sheet.slug}`} className="group block outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-2xl">
      <div className={cn(
        'h-full flex flex-col justify-between p-5 rounded-2xl',
        'border border-border/30 bg-card/70 hover:bg-card/95 backdrop-blur-xl',
        'transition-all duration-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5'
      )}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <FileCode2 className="size-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-muted/50 border border-border/40 text-muted-foreground font-mono text-2xs font-semibold shrink-0">
              Reference
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-display text-base font-bold tracking-tight text-foreground group-hover:text-emerald-400 transition-colors line-clamp-1">
              {sheet.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              Syntax, methods, operational time complexities, and interview patterns for {sheet.title}.
            </p>
          </div>

          {sheet.tags && sheet.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sheet.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-2xs font-medium"
                >
                  #{tag}
                </span>
              ))}
              {sheet.tags.length > 3 && (
                <span className="text-2xs font-mono text-muted-foreground/60 px-1 py-0.5">
                  +{sheet.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-between text-xs border-t border-border/20 mt-4">
          <span className="text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
            Open Sheet
            <ArrowRight className="size-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="text-muted-foreground/80 font-mono text-2xs">
            {formatDistanceToNow(parseISO(sheet.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
}

