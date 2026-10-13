'use client';

import { use, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  FileText,
  Clock,
  Search,
  BookOpen,
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

  const topics: TopicNote[] = useMemo(() => {
    return Array.isArray(topicsData)
      ? topicsData
      : topicsData?.data || [];
  }, [topicsData]);

  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return topics;
    const q = topicSearch.toLowerCase();
    return topics.filter((t) => t.title.toLowerCase().includes(q));
  }, [topics, topicSearch]);

  const isLoading = groupLoading || topicsLoading;

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Cockpit Header ── */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/advanced"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all px-3 py-1.5 rounded-xl border border-border/70 dark:border-white/10 bg-card/60 backdrop-blur-md shadow-2xs group"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>All Specializations</span>
          </Link>
          <span className="text-xs font-mono text-muted-foreground/60">/ {slug}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-foreground leading-[1.08]">
              {group?.name || slug}{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
                Curriculum
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-normal">
              {group?.description ||
                'Master architectural patterns, enterprise blueprints, and production-tested interview concepts.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            {isAdmin && (
              <Link
                href="/admin/content/topics"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Edit className="size-3.5" />
                <span>Edit Track</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Topic Search & Syllabus Overview ── */}
      {topics.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder="Search curriculum modules by concept..."
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm font-medium bg-background/80 rounded-xl border border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="text-xs font-mono text-muted-foreground px-2 flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Showing <strong className="text-foreground">{filteredTopics.length}</strong> of {topics.length} modules
            </span>
          </div>
        </div>
      )}

      {/* ── 3. Module Notes Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl bg-card/60 dark:bg-card/30 border border-border/70 dark:border-white/10 backdrop-blur-xl space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="size-11 sm:size-12 rounded-2xl shrink-0" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-3.5 w-full rounded" />
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs"
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
            <div className="p-6 sm:p-10 rounded-[28px] sm:rounded-3xl bg-card/70 border border-border/80 dark:border-white/10 shadow-xs backdrop-blur-2xl space-y-6">
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-full transition-all shadow-xs"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((t, index) => {
            const readMin = estimateReadTime(t.body);
            const padIndex = String(index + 1).padStart(2, '0');

            return (
              <Link
                key={t._id}
                href={`/advanced/${slug}/${t._id}`}
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
                    {/* Header Row: Module Pill + Read Time Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25">
                        Module {padIndex}
                      </span>

                      <div
                        className={cn(
                          'size-11 sm:size-12 rounded-2xl flex items-center justify-center border shadow-2xs backdrop-blur-md transition-all duration-300 group-hover:scale-105 shrink-0',
                          'bg-foreground/[0.03] dark:bg-white/[0.06] border-border/70 dark:border-white/10',
                          'group-hover:border-primary/40 group-hover:bg-primary/[0.05]'
                        )}
                      >
                        <BookOpen className="size-5 text-foreground/80 group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {t.title}
                      </h2>
                    </div>

                    {/* Meta tag */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
                        <Clock className="size-3 text-muted-foreground/70" />
                        {readMin} min read
                      </span>
                    </div>
                  </div>

                  {/* Single-Line Footer Action Row */}
                  <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      Module Note
                    </span>

                    <div className="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                      <span>Read Note</span>
                      <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
