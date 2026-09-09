'use client';

import { use, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Edit,
  FileText,
  Layers,
  Clock,
  Search,
} from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';

import { authClient } from '@/lib/auth-client';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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

function estimateReadTime(text?: string): number {
  if (!text) return 3;
  const words = text.trim().split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 200));
}

export default function AdvancedGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: slug } = use(params);
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';
  const [topicSearch, setTopicSearch] = useState('');

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

  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return topics;
    const q = topicSearch.toLowerCase();
    return topics.filter((t) => t.title.toLowerCase().includes(q));
  }, [topics, topicSearch]);

  const isLoading = groupLoading || topicsLoading;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 pb-5 border-b border-border/50">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-2xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
            <Cpu className="size-3.5 inline" />
            <span>Advanced Specialization</span>
            <span className="text-border">·</span>
            <span>/{group?.slug || slug}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {group?.name || slug}
          </h1>
          {group?.description && (
            <p className="text-sm text-muted-foreground font-normal max-w-2xl">{group.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <Link
            href="/advanced"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-all px-3.5 py-1.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card shadow-2xs flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Tracks</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/content/topics"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 shadow-2xs transition-colors"
            >
              <Edit className="size-3.5" />
              <span>Edit Track</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Topic Notes List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-card/50 border border-border/30 p-5 space-y-3">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : !group ? (
        <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
          <CardContent className="p-0">
            <EmptyState
              title="Track not found"
              description="This advanced track does not exist or has been removed."
              action={
                <Link
                  href="/advanced"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-xs"
                >
                  Return to Advanced Tracks
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : topics.length === 0 ? (
        <div className="space-y-6">
          {group.body ? (
            <div className="p-6 sm:p-10 rounded-3xl bg-card/70 border border-border/60 shadow-xs backdrop-blur-xs space-y-6">
              <MarkdownView content={group.body} />
            </div>
          ) : (
            <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
              <CardContent className="p-0">
                <EmptyState
                  icon={FileText}
                  title="No topics in this track yet"
                  description="Topics added in the Admin Panel will be listed here."
                  action={
                    isAdmin ? (
                      <Link
                        href="/admin/content/topics"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl transition-all shadow-xs"
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
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
              <Layers className="size-3.5 text-emerald-400" />
              <span>Syllabus Curriculum ({topics.length} modules)</span>
            </h2>

            {topics.length > 3 && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="Filter curriculum..."
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-card/70 border border-border/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((t, index) => {
              const readMin = estimateReadTime(t.body);
              const padIndex = String(index + 1).padStart(2, '0');

              return (
                <Link
                  key={t._id}
                  href={`/advanced/${slug}/${t._id}`}
                  className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                >
                  <div
                    className={cn(
                      'relative h-full rounded-2xl border border-border/30 bg-card/70 hover:bg-card/95 backdrop-blur-xl p-5',
                      'transition-all duration-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5',
                      'flex flex-col justify-between space-y-4'
                    )}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground">
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          MODULE {padIndex}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground/80">
                          <Clock className="size-3 text-muted-foreground/60" />
                          {readMin} min read
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-foreground group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                        {t.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/20 text-xs font-semibold text-emerald-400">
                      <span className="group-hover:underline">Read Module Note</span>
                      <ArrowRight className="size-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

