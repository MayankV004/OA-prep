'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeading, Heading, Text } from '@/components/ui/typography';
import { Plus, FileText } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface Cheatsheet { _id: string; title: string; slug: string; tags?: string[]; updatedAt: string }

/** Filter pill — comfortable tap target on mobile, tighter on desktop. */
const chipClass =
  'press inline-flex min-h-11 items-center rounded-full px-3.5 text-xs font-medium transition-colors duration-150 ease-out-quart outline-none focus-visible:shadow-glow sm:min-h-8';

export default function CheatsheetsPage() {
  const { data: cheatsheets = [], isLoading } = useQuery<Cheatsheet[]>({
    queryKey: ['cheatsheets'],
    queryFn: async () => {
      const res = await fetch('/api/cheatsheets');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [tagFilter, setTagFilter] = useState('');
  const allTags = Array.from(new Set(cheatsheets.flatMap(c => c.tags ?? [])));
  const filtered = tagFilter ? cheatsheets.filter(c => c.tags?.includes(tagFilter)) : cheatsheets;

  return (
    <div className="space-y-8 pb-12">
      <PageHeading
        overline="Reference"
        title="Cheat Sheets"
        description="Quick reference Markdown documents you can edit inline."
        actions={
          <Button size="lg">
            <Plus aria-hidden />
            New Cheat Sheet
          </Button>
        }
      />

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
          <button
            type="button"
            onClick={() => setTagFilter('')}
            aria-pressed={!tagFilter}
            className={cn(
              chipClass,
              !tagFilter
                ? 'bg-primary text-primary-foreground shadow-e1'
                : 'bg-muted text-text-secondary hover:bg-surface-sunken hover:text-foreground'
            )}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
              aria-pressed={tagFilter === tag}
              className={cn(
                chipClass,
                tagFilter === tag
                  ? 'bg-primary text-primary-foreground shadow-e1'
                  : 'bg-muted text-text-secondary hover:bg-surface-sunken hover:text-foreground'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-4 rounded-xl bg-card p-4 shadow-e2"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        tagFilter ? (
          <EmptyState
            icon={FileText}
            title={`No cheat sheets tagged “${tagFilter}”`}
            description="Nothing matches this tag yet. Clear the filter to see everything."
            action={
              <Button variant="soft" size="lg" onClick={() => setTagFilter('')}>
                Clear filter
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="No cheat sheets yet"
            description="Create your first quick-reference sheet and it will live here."
            action={
              <Button size="lg">
                <Plus aria-hidden />
                New Cheat Sheet
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sheet, i) => (
            <Link
              key={sheet._id}
              href={`/cheatsheets/${sheet.slug}`}
              className="group block rounded-xl outline-none animate-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Card interactive className="h-full">
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"
                    >
                      <FileText className="size-4.5" />
                    </span>
                    <Heading level="card" className="min-w-0 flex-1 leading-snug">
                      {sheet.title}
                    </Heading>
                  </div>

                  {sheet.tags && sheet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sheet.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Text size="caption" tone="muted">
                    Updated {formatDistanceToNow(parseISO(sheet.updatedAt), { addSuffix: true })}
                  </Text>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
