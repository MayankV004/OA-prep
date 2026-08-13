'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Plus, FileText } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeading, Text } from '@/components/ui/typography';

interface Group { _id: string; name: string; slug: string }
interface Topic { _id: string; title: string; body?: string; updatedAt: string }

export default function AdvancedGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: slug } = use(params);

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups', 'advanced'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=advanced');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const group = groups.find(g => g.slug === slug);

  const { data: topics = [], isLoading } = useQuery<Topic[]>({
    queryKey: ['topics', { groupId: group?._id }],
    queryFn: async () => {
      if (!group) return [];
      const res = await fetch(`/api/topics?groupId=${group._id}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: !!group,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to advanced topics"
          className="mt-1 shrink-0"
          render={<Link href="/advanced" />}
        >
          <ArrowLeft aria-hidden />
        </Button>

        <PageHeading
          className="min-w-0 flex-1"
          overline="Advanced track"
          title={group?.name ?? slug}
          description={
            isLoading
              ? 'Loading topics…'
              : `${topics.length} ${topics.length === 1 ? 'topic' : 'topics'} in this track`
          }
          actions={
            <Button size="lg" render={<Link href={`/advanced/${slug}/new`} />}>
              <Plus aria-hidden />
              New Topic
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div
          className="overflow-hidden rounded-xl bg-card shadow-e1"
          aria-busy="true"
          aria-label="Loading topics"
        >
          <div className="divide-y divide-divider">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-56 max-w-full" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : topics.length === 0 ? (
        <div className="rounded-xl bg-card shadow-e1">
          <EmptyState
            icon={FileText}
            title="No topics yet"
            description="Notes you add to this advanced track will be listed here."
            action={
              <Button size="lg" render={<Link href={`/advanced/${slug}/new`} />}>
                <Plus aria-hidden />
                Add your first note
              </Button>
            }
          />
        </div>
      ) : (
        <section aria-label="Topics" className="overflow-hidden rounded-xl bg-card shadow-e1">
          <ul className="divide-y divide-divider">
            {topics.map(topic => (
              <li key={topic._id}>
                <Link
                  href={`/advanced/${slug}/${topic._id}`}
                  className="group flex min-h-14 items-center gap-3 px-4 py-3 outline-none transition-colors duration-150 ease-out-quart hover:bg-surface-sunken focus-visible:bg-surface-sunken"
                >
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-primary"
                  >
                    <FileText className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <Text as="span" size="compact" weight="medium" tone="primary" className="block truncate">
                      {topic.title}
                    </Text>
                    <Text as="span" size="caption" tone="muted" className="block truncate">
                      Updated {formatDistanceToNow(parseISO(topic.updatedAt), { addSuffix: true })}
                    </Text>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 text-text-muted opacity-0 transition-opacity duration-150 ease-out-quart group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
