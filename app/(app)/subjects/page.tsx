'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeading, Text } from '@/components/ui/typography';

interface Group { _id: string; name: string; slug: string; kind: string }

export default function SubjectsPage() {
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['groups', 'subject'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="space-y-8">
      <PageHeading
        overline="Reference"
        title="Core Subjects"
        description="OS, DBMS, CN, OOP, and more. Pick a subject to browse its concept notes."
        actions={
          !isLoading && groups.length > 0 ? (
            <Text size="caption" tone="muted" numeric>
              {groups.length} {groups.length === 1 ? 'subject' : 'subjects'}
            </Text>
          ) : null
        }
      />

      {isLoading ? (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Loading subjects"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-e2">
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32 max-w-full" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl bg-card shadow-e1">
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description={
              <>
                Nothing has been seeded for this workspace. Run{' '}
                <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-2xs text-foreground">
                  pnpm seed
                </code>{' '}
                to initialize the core subject set.
              </>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <Link
              key={group._id}
              href={`/subjects/${group.slug}`}
              className="group block rounded-xl outline-none focus-visible:shadow-glow"
            >
              <Card size="sm" interactive className="h-full">
                <CardContent className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary"
                  >
                    <BookOpen className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate">{group.name}</CardTitle>
                    <CardDescription className="text-xs">Core subject</CardDescription>
                  </div>
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 text-text-muted opacity-0 transition-opacity duration-150 ease-out-quart group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
