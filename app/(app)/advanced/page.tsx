'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
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
  X,
  RotateCcw,
} from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Group {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

const TRACK_META: Record<
  string,
  { icon: typeof Cpu; gradient: string; text: string; bg: string; border: string; label: string }
> = {
  devops: {
    icon: Terminal,
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    label: 'DevOps & SRE',
  },
  cloud: {
    icon: Cloud,
    gradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
    text: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/25',
    label: 'Cloud Architecture',
  },
  genai: {
    icon: Sparkles,
    gradient: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
    label: 'Generative AI',
  },
  ai: {
    icon: Sparkles,
    gradient: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
    label: 'AI & ML Systems',
  },
  'system-design': {
    icon: Layers,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    label: 'Distributed Systems',
  },
  microservices: {
    icon: Server,
    gradient: 'from-cyan-500/20 via-indigo-500/10 to-transparent',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
    label: 'Microservices',
  },
  security: {
    icon: Shield,
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    label: 'Security & Auth',
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
    label: 'Advanced Track',
  };
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function AdvancedPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      {/* ── 1. Page Header (Modern Cockpit Header) ── */}
      <div className="pt-2 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
              Advanced{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
                Topics
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-normal">
              Master deep engineering disciplines — DevOps, System Architecture, GenAI, Cloud Computing, Microservices, and Security.
            </p>
          </div>

          {isAdmin && (
            <Link
              href="/admin/content/topics"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs shrink-0 self-start sm:self-center cursor-pointer"
            >
              <Edit className="size-3.5" />
              <span>Admin Topics</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── 2. Search & Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search engineering tracks (e.g. DevOps, Cloud, GenAI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-10 text-xs sm:text-sm font-medium bg-background/80 rounded-xl border border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans placeholder:text-muted-foreground/60"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/50 rounded pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {!isLoading && groups.length > 0 && (
          <div className="text-xs font-mono text-muted-foreground px-2 flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Showing <strong className="text-foreground">{filteredGroups.length}</strong> of {groups.length} specialized {groups.length === 1 ? 'track' : 'tracks'}
            </span>
          </div>
        )}
      </div>

      {/* ── 3. Advanced Tracks Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl bg-card/60 dark:bg-card/30 border border-border/70 dark:border-white/10 backdrop-blur-xl space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="size-11 sm:size-12 rounded-2xl shrink-0" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-4/5 rounded" />
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
          <CardContent className="p-0">
            <EmptyState
              icon={Cpu}
              title={searchQuery ? 'No matching tracks' : 'No advanced tracks created yet'}
              description={
                searchQuery
                  ? `No engineering tracks matched "${searchQuery}". Try a different keyword.`
                  : 'Add your first advanced track and topic notes in the Admin Panel to display them here.'
              }
              action={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Clear Search</span>
                  </button>
                ) : isAdmin ? (
                  <Link
                    href="/admin/content/topics"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-full transition-all shadow-xs"
                  >
                    <Edit className="size-3.5" />
                    <span>Go to Admin Topics Manager</span>
                  </Link>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredGroups.map((group) => {
            const meta = getTrackMeta(group.slug, group.name);
            const Icon = meta.icon;

            return (
              <motion.div key={group._id} variants={itemVariants} className="h-full">
                <Link
                  href={`/advanced/${group.slug}`}
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
                      {/* Header Row: Track Badge + Squircle Icon */}
                      <div className="flex items-start justify-between gap-3">
                        <span className="px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md bg-foreground/[0.04] dark:bg-white/[0.06] text-muted-foreground border-border/70 dark:border-white/10">
                          {meta.label}
                        </span>

                        <div
                          className={cn(
                            'size-11 sm:size-12 rounded-2xl flex items-center justify-center border shadow-2xs backdrop-blur-md transition-all duration-300 group-hover:scale-105 shrink-0',
                            'bg-foreground/[0.03] dark:bg-white/[0.06] border-border/70 dark:border-white/10',
                            'group-hover:border-primary/40 group-hover:bg-primary/[0.05]'
                          )}
                        >
                          <Icon className="size-5 text-foreground/80 group-hover:text-primary transition-colors" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {group.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1.5 font-normal">
                          {group.description ||
                            'Deep-dive architectural patterns, production practices, and interview-ready concepts.'}
                        </p>
                      </div>

                      {/* Meta tag */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
                          Specialization Track
                        </span>
                      </div>
                    </div>

                    {/* Single-Line Footer Action Row */}
                    <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        /{group.slug}
                      </span>

                      <div className="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                        <span>Explore Syllabus</span>
                        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
