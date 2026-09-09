'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeading } from '@/components/ui/typography';
import {
  BookOpen,
  Cpu,
  Database,
  Network,
  Layers,
  Code2,
  ArrowRight,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Group {
  _id: string;
  name: string;
  slug: string;
  kind: string;
  description?: string;
}

const SUBJECT_META: Record<
  string,
  { icon: typeof BookOpen; gradient: string; text: string; bg: string; border: string }
> = {
  os: {
    icon: Cpu,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  },
  'operating-systems': {
    icon: Cpu,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  },
  dbms: {
    icon: Database,
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
  },
  cn: {
    icon: Network,
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
  },
  'computer-networks': {
    icon: Network,
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
  },
  'system-design': {
    icon: Layers,
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
  },
  oops: {
    icon: Code2,
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
  },
};

function getSubjectMeta(slug: string, name: string) {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();

  for (const key of Object.keys(SUBJECT_META)) {
    if (s.includes(key) || n.includes(key)) {
      return SUBJECT_META[key];
    }
  }

  return {
    icon: BookOpen,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  };
}

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['groups', 'subject'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filteredGroups = useMemo(() => {
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* ── Header Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeading
          overline="Academic & Technical Foundations"
          title="Core Computer Science Subjects"
          description="High-yield engineering notes covering Operating Systems, DBMS, Computer Networks, OOPs, and System Design for technical interviews."
        />

        {!isLoading && groups.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-bold shrink-0 self-start sm:self-center">
            <Sparkles className="size-3.5" />
            <span>{groups.length} subjects curriculum</span>
          </div>
        )}
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search subjects (e.g. Operating Systems, DBMS, Networks)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-4 text-xs bg-card border border-border/70 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-foreground transition-all"
        />
      </div>

      {/* ── Subjects Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-card/60 border border-border/40 space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
          <CardContent className="p-0">
            <EmptyState
              title="No subjects found"
              description={
                searchQuery
                  ? `No subjects match "${searchQuery}". Try a different keyword.`
                  : 'Core computer science subjects will appear here once published.'
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => {
            const meta = getSubjectMeta(group.slug, group.name);
            const Icon = meta.icon;

            return (
              <Link
                key={group._id}
                href={`/subjects/${group.slug}`}
                className="group block outline-none"
              >
                <Card className="relative h-full flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs p-6 shadow-xs hover:shadow-e2 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1">
                  {/* Top Specular Ambient Wash */}
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-60 transition-opacity group-hover:opacity-100',
                      meta.gradient
                    )}
                  />

                  <div className="relative space-y-4">
                    {/* Icon & Category Pill */}
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={cn(
                          'grid size-11 place-items-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105',
                          meta.bg,
                          meta.text,
                          meta.border
                        )}
                      >
                        <Icon className="size-5.5" />
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-mono text-2xs font-semibold border border-border/60 uppercase tracking-wider">
                        Core Subject
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h2 className="font-display text-xl font-bold tracking-tight text-foreground group-hover:text-emerald-400 transition-colors">
                        {group.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 font-normal">
                        {group.description ||
                          `Comprehensive interactive concept notes and interview preparation guide for ${group.name}.`}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action Strip */}
                  <div className="relative pt-6 flex items-center justify-between text-xs border-t border-border/50 mt-6">
                    <span className="font-mono text-2xs text-muted-foreground uppercase tracking-wider">
                      /{group.slug}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all text-xs">
                      Explore Topics
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
