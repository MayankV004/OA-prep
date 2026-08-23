'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  User as UserIcon,
  Shield,
  Star,
  FileText,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit3,
  Loader2,
  BookOpen,
  Code2,
  Layers,
  Trophy,
  Activity as ActivityIcon,
  ArrowRight,
  Download,
  LogOut,
  X,
  Check,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Heading, Text } from '@/components/ui/typography';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

function initialsOf(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split('@')[0] || '?';
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    createdAt: string;
    lastSeenAt?: string;
  };
  stats: {
    grandTotalProblems: number;
    grandTotalCompleted: number;
    grandPct: number;
    totalPatternProblems: number;
    completedPatternProblems: number;
    difficultyMix: Record<'Easy' | 'Medium' | 'Hard', { total: number; completed: number }>;
    patternBreakdown: Array<{
      title: string;
      slug: string;
      total: number;
      completed: number;
      pct: number;
    }>;
    nonStandard: { total: number; completed: number };
    cp: { total: number; completed: number };
    revisionCount: number;
    notesCount: number;
  };
  heatmap: Array<{ date: string; count: number }>;
  recentActivity: Array<{
    _id: string;
    kind: string;
    entity?: { title?: string; type?: string };
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [imgError, setImgError] = useState(false);

  const { data, isLoading, error } = useQuery<ProfileData>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { name?: string; image?: string }) => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditing(false);
    },
  });

  const handleSignOut = async () => {
    queryClient.clear();
    await authClient.signOut();
    router.push('/sign-in');
  };

  const handleStartEdit = () => {
    if (data?.user) {
      setEditName(data.user.name);
      setEditImage(data.user.image || '');
      setIsEditing(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: editName,
      image: editImage,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
        <UserIcon className="size-12 text-destructive" />
        <Heading level="section" className="mt-4">
          Failed to load profile
        </Heading>
        <Text tone="muted" className="mt-2">
          Please check your connection and try refreshing the page.
        </Text>
      </div>
    );
  }

  const { user, stats, heatmap, recentActivity } = data;
  const memberSince = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently';
  const hasAvatar = Boolean(user.image && !imgError);

  const easyStats = stats.difficultyMix.Easy || { total: 0, completed: 0 };
  const mediumStats = stats.difficultyMix.Medium || { total: 0, completed: 0 };
  const hardStats = stats.difficultyMix.Hard || { total: 0, completed: 0 };

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Hero Header Card ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-red-600/15 via-rose-600/10 to-amber-500/10 dark:from-red-950/40 dark:via-rose-950/30 dark:to-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-e3">
        {/* Decorative background glow circles */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 size-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {hasAvatar ? (
                <img
                  src={user.image!}
                  alt={user.name}
                  onError={() => setImgError(true)}
                  className="size-20 sm:size-24 rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="grid size-20 sm:size-24 place-items-center rounded-full bg-gradient-to-br from-red-600 to-rose-600 text-2xl sm:text-3xl font-extrabold text-white border-4 border-background shadow-lg">
                  {initialsOf(user.name, user.email)}
                </div>
              )}
              <span
                className="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-500 border-2 border-background shadow-sm"
                title="Active account"
              />
            </div>

            {/* Info */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Heading level="page" className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                  {user.name}
                </Heading>
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className={cn(
                    'capitalize px-2.5 py-0.5 text-xs font-semibold',
                    user.role === 'admin'
                      ? 'bg-rose-600 text-white dark:bg-rose-500'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {user.role === 'admin' ? (
                    <span className="flex items-center gap-1">
                      <Shield className="size-3" /> Admin
                    </span>
                  ) : (
                    'Member'
                  )}
                </Badge>
              </div>

              <Text tone="muted" className="text-sm truncate">
                {user.email}
              </Text>

              <div className="flex items-center gap-4 text-xs text-text-muted pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" /> Joined {memberSince}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3.5" /> {stats.grandTotalCompleted} Solved
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="soft" size="sm" onClick={handleStartEdit} className="gap-2">
              <Edit3 className="size-3.5" /> Edit Profile
            </Button>
            <a href="/api/export" download>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="size-3.5" /> Export
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal / Form ──────────────────────────────────────── */}
      {isEditing && (
        <Card className="border-rose-500/30 bg-card/95 backdrop-blur shadow-e3 animate-in-up">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Edit Profile</CardTitle>
              <CardDescription className="text-xs">Update your display name and avatar URL</CardDescription>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(false)}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Avatar Image URL (Optional)</label>
                <Input
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={updateMutation.isPending} className="gap-1.5">
                  {updateMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── 2. Primary Metrics Cards Grid ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Solved Progress */}
        <Card className="shadow-e1 transition-all hover:shadow-e2">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider">
                Total Solved
              </Text>
              <span className="grid size-8 place-items-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Code2 className="size-4" />
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {stats.grandTotalCompleted}
                </span>
                <span className="text-xs text-text-muted">/ {stats.grandTotalProblems}</span>
              </div>
              <Progress value={stats.grandPct} className="mt-2 h-2" />
            </div>
            <Text size="micro" tone="muted" className="flex justify-between">
              <span>Overall Completion</span>
              <span className="font-semibold text-foreground">{stats.grandPct}%</span>
            </Text>
          </CardContent>
        </Card>

        {/* Card 2: Difficulty Mix */}
        <Card className="shadow-e1 transition-all hover:shadow-e2">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider">
                Difficulty Mix
              </Text>
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-4" />
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Easy</span>
                <span className="tabular-nums font-medium">{easyStats.completed} / {easyStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Medium</span>
                <span className="tabular-nums font-medium">{mediumStats.completed} / {mediumStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Hard</span>
                <span className="tabular-nums font-medium">{hardStats.completed} / {hardStats.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Revision Bookmarks */}
        <Card className="shadow-e1 transition-all hover:shadow-e2">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider">
                Revision Stars
              </Text>
              <span className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
                <Star className="size-4 fill-amber-500" />
              </span>
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-foreground">
                {stats.revisionCount}
              </span>
              <span className="block text-xs text-text-muted mt-1">Bookmarked for revision</span>
            </div>
            <Link href="/dsa" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              Review starred items <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 4: Personal Notes */}
        <Card className="shadow-e1 transition-all hover:shadow-e2">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider">
                Problem Notes
              </Text>
              <span className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
                <FileText className="size-4" />
              </span>
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-foreground">
                {stats.notesCount}
              </span>
              <span className="block text-xs text-text-muted mt-1">Notes written in Markdown</span>
            </div>
            <Text size="micro" tone="muted">
              Auto-saved per problem
            </Text>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Activity Heatmap & Recent Log ───────────────────────────── */}
      <Card className="shadow-e2 overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-surface-sunken/40 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ActivityIcon className="size-5 text-rose-500" />
              <div>
                <CardTitle className="font-display text-base font-bold">Activity & Practice Heatmap</CardTitle>
                <CardDescription className="text-xs">90-day record of problem completions and study notes</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <ActivityHeatmap data={heatmap} />

          {recentActivity.length > 0 && (
            <div className="space-y-3 pt-2">
              <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider">
                Recent Log
              </Text>
              <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-card overflow-hidden">
                {recentActivity.slice(0, 5).map((act) => (
                  <div key={act._id} className="flex items-center justify-between p-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        {act.entity?.title || act.kind.replace('.', ' ')}
                      </span>
                    </div>
                    <span className="text-text-muted shrink-0 text-2xs font-mono">
                      {format(new Date(act.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 4. DSA Pattern Progress Breakdown ─────────────────────────────── */}
      <Card className="shadow-e2">
        <CardHeader className="border-b border-border/40 bg-surface-sunken/40 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="size-5 text-primary" />
              <div>
                <CardTitle className="font-display text-base font-bold">DSA Pattern Mastery</CardTitle>
                <CardDescription className="text-xs">Per-pattern breakdown of solved problems</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {stats.completedPatternProblems} / {stats.totalPatternProblems} Solved
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.patternBreakdown.map((pat) => (
              <Link key={pat.slug} href={`/dsa/${pat.slug}`} className="group">
                <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-e2">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {pat.title}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-text-muted shrink-0">
                      {pat.completed}/{pat.total}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Progress value={pat.pct} className="h-1.5" />
                    <div className="flex items-center justify-between text-2xs text-text-muted">
                      <span>{pat.pct}% completed</span>
                      <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100 text-primary" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 5. Account Settings & Sign Out ────────────────────────────────── */}
      <Card className="shadow-e1 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Account Management</CardTitle>
          <CardDescription className="text-xs">Security, sessions, and data options</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">Logged in as {user.email}</p>
            <p className="text-2xs text-text-muted">Role: {user.role.toUpperCase()}</p>
          </div>

          <div className="flex items-center gap-2">
            <a href="/api/export" download>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="size-3.5" /> Export Data
              </Button>
            </a>
            <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-1.5">
              <LogOut className="size-3.5" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
