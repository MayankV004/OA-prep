'use client';

import { use, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Edit } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { ReaderLayout } from '@/components/reader/ReaderLayout';

interface TopicNote {
  _id: string;
  title: string;
  body?: string;
  groupId: string;
  updatedAt?: string;
  createdAt?: string;
}

interface AdvancedGroup {
  _id: string;
  name: string;
  slug: string;
}

function relative(value?: string) {
  if (!value) return undefined;
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return undefined;
  }
}

export default function AdvancedTopicDetailPage({
  params,
}: {
  params: Promise<{ group: string; topic: string }>;
}) {
  const { group: groupSlug, topic: topicId } = use(params);
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

  // 1. Fetch Advanced Group info
  const { data: group, isLoading: groupLoading } = useQuery<AdvancedGroup>({
    queryKey: ['group', groupSlug],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupSlug}`);
      if (!res.ok) throw new Error('Track not found');
      return res.json();
    },
  });

  // 2. Fetch Topic Note detail
  const { data: topic, isLoading: topicLoading } = useQuery<TopicNote>({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${topicId}`);
      if (!res.ok) throw new Error('Topic note not found');
      return res.json();
    },
  });

  // 3. Fetch All Topics in this track for Prev/Next Navigation
  const { data: allTopicsData } = useQuery<{ data?: TopicNote[] } | TopicNote[]>({
    queryKey: ['topics', group?._id || groupSlug],
    queryFn: async () => {
      const targetId = group?._id || groupSlug;
      const res = await fetch(`/api/topics?groupId=${targetId}`);
      if (!res.ok) return { data: [] };
      return res.json();
    },
    enabled: Boolean(group?._id || groupSlug),
  });

  const allTopics: TopicNote[] = Array.isArray(allTopicsData)
    ? allTopicsData
    : allTopicsData?.data || [];

  // Compute Next and Previous Topics
  const { prevTopic, nextTopic } = useMemo(() => {
    if (!allTopics.length || !topic) return { prevTopic: null, nextTopic: null };
    const currentIndex = allTopics.findIndex((t) => t._id === topic._id);
    if (currentIndex === -1) return { prevTopic: null, nextTopic: null };

    const prev = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
    const next = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

    return {
      prevTopic: prev
        ? {
            title: prev.title,
            href: `/advanced/${groupSlug}/${prev._id}`,
            subtitle: `Module #${currentIndex}`,
          }
        : null,
      nextTopic: next
        ? {
            title: next.title,
            href: `/advanced/${groupSlug}/${next._id}`,
            subtitle: `Module #${currentIndex + 2}`,
          }
        : null,
    };
  }, [allTopics, topic, groupSlug]);

  const isLoading = groupLoading || topicLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4 max-w-4xl">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <Skeleton className="h-5 w-64 rounded-lg" />
        <div className="space-y-4 pt-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="py-12">
        <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
          <CardContent className="p-0">
            <EmptyState
              title="Topic note not found"
              description="The requested topic note could not be found or may have been relocated."
              action={
                <Link
                  href={`/advanced/${groupSlug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-xs"
                >
                  Return to {group?.name || 'Track'}
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ReaderLayout
      title={topic.title}
      category={group?.name || 'Advanced Topics'}
      categoryHref={`/advanced/${groupSlug}`}
      content={topic.body || ''}
      updatedAt={relative(topic.updatedAt || topic.createdAt)}
      prevItem={prevTopic}
      nextItem={nextTopic}
      actions={
        isAdmin ? (
          <Link
            href="/admin/content/topics"
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all shadow-2xs"
          >
            <Edit className="size-3.5" />
            <span className="hidden sm:inline">Edit in Admin</span>
          </Link>
        ) : null
      }
    />
  );
}

