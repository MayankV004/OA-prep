import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Tag } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Cheatsheet } from '@/types/cheatsheet';

interface CheatsheetCardProps {
  sheet: Cheatsheet;
}

export function CheatsheetCard({ sheet }: CheatsheetCardProps) {
  return (
    <Link href={`/cheatsheets/${sheet.slug}`} className="group block outline-none">
      <Card className="h-full flex flex-col justify-between p-6 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-foreground group-hover:text-rose-500 transition-colors truncate">
              {sheet.title}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-mono text-[11px] font-semibold shrink-0">
              Cheat Sheet
            </span>
          </div>

          {sheet.tags && sheet.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sheet.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 dark:text-rose-400 font-medium text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground line-clamp-2">
              Quick Markdown reference sheet for {sheet.title}.
            </p>
          )}
        </div>

        <div className="pt-6 flex items-center justify-between text-xs border-t border-border/20 mt-4">
          <span className="text-rose-500 font-bold group-hover:underline">
            View Sheet &rarr;
          </span>
          <span className="text-muted-foreground font-mono">
            {formatDistanceToNow(parseISO(sheet.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </Card>
    </Link>
  );
}
