'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowRight,
  Cpu,
  Edit,
  Cloud,
  Sparkles,
  Shield,
  Layers,
  Terminal,
  Server,
  Search,
  BookOpen,
} from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeading } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface Group {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

const TRACK_META: Record<
  string,
  { icon: typeof Cpu; gradient: string; text: string; bg: string; border: string }
> = {
  devops: {
    icon: Terminal,
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
  },
  cloud: {
    icon: Cloud,
    gradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
    text: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/25',
  },
  genai: {
    icon: Sparkles,
    gradient: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
  },
  ai: {
    icon: Sparkles,
    gradient: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
  },
  'system-design': {
    icon: Layers,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  },
  microservices: {
    icon: Server,
    gradient: 'from-cyan-500/20 via-indigo-500/10 to-transparent',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
  },
  security: {
    icon: Shield,
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
  },
};

function getTrackMeta(slug: string, name: string) {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();

  for (const key of Object.keys(TRACK_META)) {
    if (s.includes(key) || n.includes(key)) {
      return TRACK_META[key];
    }
  }

  return {
    icon: Cpu,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  };
}

export default function AdvancedPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['groups', 'advanced'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=advanced');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      <PageHeading
        overline="Engineering Specializations"
        title="Advanced Topics"
        description="Master deep engineering disciplines — DevOps, System Architecture, GenAI, Cloud Computing, and beyond."
        actions={
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin/content/topics"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 transition-colors"
              >
                <Edit className="size-3.5" />
                <span>Admin Topics</span>
              </Link>
            )}
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search engineering tracks (e.g., DevOps, Cloud, GenAI)..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/80 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{filteredGroups.length} specialized {filteredGroups.length === 1 ? 'track' : 'tracks'}</span>
        </div>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Loading advanced topics"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-card/50 border border-border/30 p-5 space-y-3">
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-2/3 rounded-md" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 shadow-xs">
          <EmptyState
            icon={Cpu}
            title="No advanced tracks created yet"
            description="Add your first advanced track and topic notes in the Admin Panel to display them here."
            action={
              isAdmin ? (
                <Link
                  href="/admin/content/topics"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl transition-all shadow-xs"
                >
                  <Edit className="size-3.5" />
                  <span>Go to Admin Topics Manager</span>
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => {
            const meta = getTrackMeta(group.slug, group.name);
            const Icon = meta.icon;

            return (
              <Link
                key={group._id}
                href={`/advanced/${group.slug}`}
                className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                <div
                  className={cn(
                    'relative h-full overflow-hidden rounded-2xl border border-border/30 bg-card/70 hover:bg-card/90 backdrop-blur-xl p-5',
                    'transition-all duration-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5',
                    'flex flex-col justify-between space-y-4'
                  )}
                >
                  {/* Subtle top gradient glow */}
                  <div
                    className={cn(
                      'absolute -top-12 -right-12 size-32 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-40 bg-gradient-to-br',
                      meta.gradient
                    )}
                  />

                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          'grid size-11 place-items-center rounded-xl border transition-all duration-200',
                          meta.bg,
                          meta.border,
                          meta.text,
                          'group-hover:scale-105 group-hover:border-emerald-500/40 shadow-xs'
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded-full border border-border/40 bg-muted/40 text-muted-foreground">
                        Track
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                        {group.description || 'Deep-dive architectural patterns, production practices, and interview-ready concepts.'}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between pt-3 border-t border-border/20 text-xs font-semibold text-emerald-400">
                    <span className="group-hover:underline">Explore Syllabus</span>
                    <ArrowRight className="size-4 transform group-hover:translate-x-1 transition-transform" />
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

