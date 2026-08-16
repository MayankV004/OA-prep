'use client';

import { use, useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Cpu, Edit, Layers } from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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

interface SectionHeading {
  id: string;
  title: string;
  level: number;
}

function relative(value?: string) {
  if (!value) return '—';
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return '—';
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

  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  // 1. Fetch Advanced Group info
  const { data: group } = useQuery<AdvancedGroup>({
    queryKey: ['group', groupSlug],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupSlug}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  // 2. Fetch Topic Note detail
  const { data: topic, isLoading } = useQuery<TopicNote>({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${topicId}`);
      if (!res.ok) throw new Error('Topic note not found');
      return res.json();
    },
  });

  const activeBody = topic?.body || '';

  // Extract TOC headings (# Heading)
  const sectionHeadings = useMemo<SectionHeading[]>(() => {
    if (!activeBody) return [];
    const lines = activeBody.split('\n');
    const headings: SectionHeading[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const title = match[2].trim().replace(/[*_~`]/g, '');
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ id, title, level });
      }
    });

    return headings;
  }, [activeBody]);

  // Dynamically track active section heading as user scrolls
  useEffect(() => {
    if (sectionHeadings.length === 0) {
      setActiveHeadingId('');
      return;
    }

    setActiveHeadingId(sectionHeadings[0].id);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      let currentActiveId = sectionHeadings[0].id;

      for (const heading of sectionHeadings) {
        const el = document.getElementById(heading.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentActiveId = heading.id;
          }
        }
      }
      setActiveHeadingId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionHeadings]);

  const scrollToHeading = (id: string) => {
    setActiveHeadingId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Detail Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-4 border-b border-border/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 font-mono uppercase tracking-wider">
            <Cpu className="size-3.5 inline" />
            <span>Advanced Topic Note</span>
            <span>·</span>
            <span>{group?.name || groupSlug}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {topic?.title || 'Loading topic...'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/advanced/${groupSlug}`}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3.5 py-1.5 rounded-xl border border-border/30 bg-background/50 flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to {group?.name || 'Track Topics'}</span>
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

      {/* 2. Main Content Workspace */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
          <div className="md:col-span-8 space-y-4">
            <Skeleton className="h-10 w-2/3 rounded-xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      ) : !topic ? (
        <Card className="rounded-3xl border-none bg-background/50 p-8 text-center">
          <CardContent>
            <EmptyState
              title="Topic note not found"
              description="This topic note does not exist or has been removed."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Table of Contents */}
          <aside className="md:col-span-4 lg:col-span-3 sticky top-20 space-y-5 p-4 rounded-3xl bg-background/80 dark:bg-background/40 backdrop-blur-xl border border-border/40 shadow-md max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Layers className="size-3.5 text-rose-500" />
                  <span>On This Page</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-mono text-2xs font-bold">
                  {sectionHeadings.length}
                </span>
              </div>

              {sectionHeadings.length === 0 ? (
                <p className="text-xs text-muted-foreground italic px-2 py-2">
                  No section headings in this note.
                </p>
              ) : (
                <nav className="space-y-1">
                  {sectionHeadings.map((heading, i) => {
                    const isActive = activeHeadingId === heading.id;
                    return (
                      <button
                        key={i}
                        onClick={() => scrollToHeading(heading.id)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-xl text-xs block truncate transition-all duration-150 border',
                          heading.level === 1 ? 'font-bold' : heading.level === 2 ? 'pl-5 font-semibold' : 'pl-7 text-2xs font-medium',
                          isActive
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 font-bold shadow-2xs'
                            : 'bg-background/40 border-border/20 text-muted-foreground hover:text-foreground hover:bg-background/80'
                        )}
                      >
                        <span className={cn('mr-1.5 font-mono text-2xs', isActive ? 'text-rose-500 font-bold' : 'text-muted-foreground/60')}>#</span>
                        {heading.title}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          </aside>

          {/* Main Markdown Body Workspace */}
          <main className="md:col-span-8 lg:col-span-9 space-y-6 min-w-0">
            <div className="p-6 sm:p-10 rounded-3xl bg-background/80 dark:bg-background/30 backdrop-blur-xl border border-border/30 shadow-sm space-y-8">
              <div className="space-y-2 pb-6 border-b border-border/20">
                <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
                  {topic.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                  <span>Last Updated {relative(topic.updatedAt || topic.createdAt)}</span>
                </div>
              </div>

              <div className="space-y-4">
                {activeBody ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => {
                        const titleStr = String(children || '').replace(/[*_~`]/g, '');
                        const id = titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        return (
                          <h1 id={id} className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground mt-10 mb-4 pb-2 border-b border-border/30 scroll-mt-24">
                            {children}
                          </h1>
                        );
                      },
                      h2: ({ children }) => {
                        const titleStr = String(children || '').replace(/[*_~`]/g, '');
                        const id = titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        return (
                          <h2 id={id} className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-8 mb-4 scroll-mt-24">
                            {children}
                          </h2>
                        );
                      },
                      h3: ({ children }) => {
                        const titleStr = String(children || '').replace(/[*_~`]/g, '');
                        const id = titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        return (
                          <h3 id={id} className="font-display text-xl font-bold tracking-tight text-foreground mt-6 mb-3 scroll-mt-24">
                            {children}
                          </h3>
                        );
                      },
                      h4: ({ children }) => (
                        <h4 className="font-display text-lg font-bold text-foreground mt-4 mb-2">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => (
                        <div className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 font-light">
                          {children}
                        </div>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-2.5 my-4 text-foreground pl-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-2.5 my-4 text-foreground pl-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                          {children}
                        </li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-rose-500 bg-rose-500/10 p-4 rounded-r-2xl my-6 text-foreground font-medium italic">
                          {children}
                        </blockquote>
                      ),
                      pre: ({ children }) => (
                        <pre className="p-5 rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-xs sm:text-sm overflow-x-auto my-6 border border-border/20 shadow-sm leading-relaxed whitespace-pre font-normal">
                          {children}
                        </pre>
                      ),
                      code: ({ inline, className, children, ...props }: any) => {
                        if (inline) {
                          return (
                            <code className="px-2 py-0.5 rounded-lg bg-muted text-rose-500 font-mono text-xs font-semibold border border-border/30" {...props}>
                              {children}
                            </code>
                          );
                        }
                        return <code className="font-mono text-xs sm:text-sm whitespace-pre" {...props}>{children}</code>;
                      },
                      img: ({ src, alt }) => (
                        <img
                          src={src}
                          alt={alt || 'Attached image'}
                          className="rounded-3xl shadow-lg max-h-[550px] w-full object-cover my-6 border border-border/30"
                        />
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6 rounded-2xl border border-border/30 shadow-sm">
                          <table className="w-full text-left border-collapse text-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="bg-muted/80 p-3.5 font-bold text-foreground border-b border-border/30 font-display">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="p-3.5 border-b border-border/20 text-muted-foreground">
                          {children}
                        </td>
                      ),
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-rose-500 font-semibold underline hover:text-rose-400">
                          {children}
                        </a>
                      ),
                      hr: () => <hr className="my-8 border-border/30" />,
                    }}
                  >
                    {activeBody}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">No content notes written for this topic yet.</p>
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
