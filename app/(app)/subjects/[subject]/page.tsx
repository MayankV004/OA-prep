'use client';

import { use, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Edit,
  FileText,
  Layers,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';

import { authClient } from '@/lib/auth-client';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { queryKeys, STALE_TIMES } from '@/lib/query-keys';

interface SubjectGroup {
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

export default function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: slug } = use(params);
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

  // 1. Fetch Subject by slug
  const { data: subject, isLoading: subjectLoading } = useQuery<SubjectGroup>({
    queryKey: queryKeys.groups.detail(slug),
    queryFn: async () => {
      const res = await fetch(`/api/groups/${slug}`);
      if (!res.ok) throw new Error('Subject not found');
      return res.json();
    },
    staleTime: STALE_TIMES.static,
  });

  // 2. Fetch Topic notes under this Subject (runs in parallel via slug)
  const { data: topicsData, isLoading: topicsLoading } = useQuery<{ data?: TopicNote[] } | TopicNote[]>({
    queryKey: ['topics', slug],
    queryFn: async () => {
      const res = await fetch(`/api/topics?groupId=${slug}`);
      if (!res.ok) return { data: [] };
      return res.json();
    },
    staleTime: STALE_TIMES.static,
    enabled: Boolean(slug),
  });

  const topics: TopicNote[] = Array.isArray(topicsData)
    ? topicsData
    : topicsData?.data || [];

  const isLoading = subjectLoading || topicsLoading;

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Top Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 pb-5 border-b border-border/60">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-2xs font-bold text-emerald-500 font-mono uppercase tracking-wider">
            <BookOpen className="size-3.5 inline" />
            <span>Core Subject</span>
            <span className="text-border">·</span>
            <span>/{subject?.slug || slug}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {subject?.name || slug}
          </h1>
          {subject?.description && (
            <p className="text-sm text-muted-foreground font-normal max-w-2xl">{subject.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <Link
            href="/subjects"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-all px-3.5 py-1.5 rounded-xl border border-border/70 bg-card hover:bg-muted shadow-2xs flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Subjects</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/content/topics"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 shadow-2xs"
            >
              <Edit className="size-3.5" />
              <span>Edit in Admin</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── 2. Topics Syllabus Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : !subject ? (
        <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
          <CardContent className="p-0">
            <EmptyState
              title="Subject not found"
              description="This subject does not exist or has been archived."
            />
          </CardContent>
        </Card>
      ) : topics.length === 0 ? (
        <div className="space-y-6">
          {subject.body ? (
            <div className="p-6 sm:p-10 rounded-3xl bg-card/70 border border-border/70 shadow-xs backdrop-blur-xs space-y-6">
              <MarkdownView content={subject.body} />
            </div>
          ) : (
            <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
              <CardContent className="p-0">
                <EmptyState
                  icon={FileText}
                  title="No topics in this subject yet"
                  description="Topics added in the Admin Panel will be listed here."
                  action={
                    isAdmin ? (
                      <Link
                        href="/admin/content/topics"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20"
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
            <h2 className="text-2xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
              <Layers className="size-3.5 text-emerald-500" />
              <span>Syllabus Topics ({topics.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((t, index) => {
              const estMinutes = Math.max(2, Math.ceil((t.body ? t.body.split(/\s+/).length : 250) / 200));

              return (
                <Link
                  key={t._id}
                  href={`/subjects/${slug}/${t._id}`}
                  className="group block rounded-2xl outline-none"
                >
                  <div className="h-full p-5 rounded-2xl bg-card/70 border border-border/70 hover:border-emerald-500/40 shadow-xs hover:shadow-e2 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4 backdrop-blur-xs">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground/70" />
                          <span>{estMinutes} min</span>
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-foreground group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {t.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs font-semibold text-emerald-500">
                      <span>Read Topic</span>
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
