'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ArrowLeft, ArrowRight, Cpu, Edit, FileText, Layers } from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';
import remarkGfm from 'remark-gfm';

import { authClient } from '@/lib/auth-client';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface AdvancedGroup {
  _id: string;
  name: string;
  slug: string;
  kind: string;
  body?: string;
  description?: string;
  updatedAt?: string;
}

interface TopicNote {
  _id: string;
  title: string;
  body?: string;
  groupId: string;
  updatedAt?: string;
  createdAt?: string;
}

function relative(value?: string) {
  if (!value) return '—';
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return '—';
  }
}

export default function AdvancedGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: slug } = use(params);
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

  // 1. Fetch Advanced Track by slug
  const { data: group, isLoading: groupLoading } = useQuery<AdvancedGroup>({
    queryKey: ['group', slug],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${slug}`);
      if (!res.ok) throw new Error('Track not found');
      return res.json();
    },
  });

  // 2. Fetch Topic notes under this Track
  const { data: topicsData, isLoading: topicsLoading } = useQuery<{ data?: TopicNote[] } | TopicNote[]>({
    queryKey: ['topics', group?._id || slug],
    queryFn: async () => {
      const targetId = group?._id || slug;
      const res = await fetch(`/api/topics?groupId=${targetId}`);
      if (!res.ok) return { data: [] };
      return res.json();
    },
    enabled: Boolean(group?._id || slug),
  });

  const topics: TopicNote[] = Array.isArray(topicsData)
    ? topicsData
    : topicsData?.data || [];

  const isLoading = groupLoading || topicsLoading;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-4 border-b border-border/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 font-mono uppercase tracking-wider">
            <Cpu className="size-3.5 inline" />
            <span>Advanced Track</span>
            <span>·</span>
            <span>{group?.slug || slug}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {group?.name || slug}
          </h1>
          {group?.description && (
            <p className="text-sm text-muted-foreground font-light">{group.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/advanced"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3.5 py-1.5 rounded-xl border border-border/30 bg-background/50 flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Advanced Tracks</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/content/topics"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:underline px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20"
            >
              <Edit className="size-3.5" />
              <span>Edit Content</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Topic Notes List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : !group ? (
        <Card className="rounded-3xl border-none bg-background/50 p-8 text-center">
          <CardContent>
            <EmptyState
              title="Track not found"
              description="This advanced track does not exist or has been removed."
            />
          </CardContent>
        </Card>
      ) : topics.length === 0 ? (
        <div className="space-y-6">
          {group.body ? (
            <div className="p-6 sm:p-10 rounded-3xl bg-background/80 dark:bg-background/30 backdrop-blur-xl border border-border/30 shadow-sm space-y-6">
              <MarkdownView content={group.body} />
            </div>
          ) : (
            <Card className="rounded-3xl border-none bg-background/50 p-8 text-center">
              <CardContent>
                <EmptyState
                  icon={FileText}
                  title="No topics in this track yet"
                  description="Topics added in the Admin Panel will be listed here."
                  action={
                    isAdmin ? (
                      <Link
                        href="/admin/content/topics"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20"
                      >
                        <Edit className="size-3.5" />
                        <span>Add Topics in Admin Panel</span>
                      </Link>
                    ) : undefined
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
              <Layers className="size-3.5 text-rose-500" />
              <span>Track Topics ({topics.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((t, index) => (
              <Link
                key={t._id}
                href={`/advanced/${slug}/${t._id}`}
                className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
              >
                <div className="h-full p-5 rounded-2xl bg-background/80 dark:bg-background/40 backdrop-blur-xl border border-border/30 hover:border-rose-500/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold">
                        Topic #{index + 1}
                      </span>
                      <span>{relative(t.updatedAt || t.createdAt)}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground group-hover:text-rose-500 transition-colors line-clamp-2">
                      {t.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs font-semibold text-rose-500">
                    <span>Read Topic Note</span>
                    <ArrowRight className="size-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
