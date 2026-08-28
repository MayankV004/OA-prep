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
  Calendar,
  Sparkles,
  Edit3,
  Loader2,
  Code2,
  Activity as ActivityIcon,
  ArrowRight,
  Download,
  LogOut,
  X,
  Check,
  BellRing,
  Camera,
  Layers,
  Settings,
  Flame,
  Zap,
  GraduationCap,
  Globe,
  ExternalLink,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ContestAlertPreferencesModal } from '@/components/contests/ContestAlertPreferencesModal';
import { LinkedHandlesCard } from '@/components/cp/LinkedHandlesCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Heading, Text } from '@/components/ui/typography';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function initialsOf(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split('@')[0] || '?';
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aiden',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Cyber',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Matrix',
];

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    bio?: string;
    college?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'cp' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  const [imgError, setImgError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<ProfileData>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      name?: string;
      image?: string;
      bio?: string;
      college?: string;
      github?: string;
      linkedin?: string;
      portfolio?: string;
    }) => {
      setErrorMessage(null);
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.error?.message || result?.message || 'Failed to update profile');
      }
      return result;
    },
    onSuccess: (result: any) => {
      if (result?.user) {
        queryClient.setQueryData(['userProfile'], (prev: ProfileData | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            user: {
              ...prev.user,
              ...result.user,
            },
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditing(false);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update profile');
    },
  });

  const handleSignOut = async () => {
    queryClient.clear();
    await authClient.signOut();
    router.push('/sign-in');
  };

  const handleStartEdit = () => {
    if (data?.user) {
      setEditName(data.user.name || '');
      setEditImage(data.user.image || '');
      setEditBio(data.user.bio || '');
      setEditCollege(data.user.college || '');
      setEditGithub(data.user.github || '');
      setEditLinkedin(data.user.linkedin || '');
      setEditPortfolio(data.user.portfolio || '');
      setImgError(false);
      setErrorMessage(null);
      setIsEditing(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: editName,
      image: editImage,
      bio: editBio,
      college: editCollege,
      github: editGithub,
      linkedin: editLinkedin,
      portfolio: editPortfolio,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16">
        <div className="lg:col-span-4">
          <Skeleton className="h-[550px] w-full rounded-3xl" />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface p-12 text-center shadow-e1">
        <UserIcon className="size-12 text-rose-500" />
        <Heading level="section" className="mt-4 font-bold text-foreground">
          Failed to load profile
        </Heading>
        <Text tone="muted" className="mt-2 text-xs">
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

  const formatExternalUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

  return (
    <div className="space-y-6 pb-20">
      {/* ── Main 2-Column Sidebar Grid Layout ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* ── LEFT COLUMN (4 Cols): Candidate Identity Sidebar ───────────────── */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
          <Card className="overflow-hidden border border-border/70 bg-gradient-to-b from-surface via-surface to-surface-sunken/40 shadow-e3">
            {/* Ambient banner backdrop */}
            <div className="h-24 w-full bg-gradient-to-r from-rose-600/30 via-rose-500/20 to-amber-500/20 relative">
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEdit}
                  className="h-7 px-2.5 text-xs bg-surface/80 backdrop-blur-md hover:bg-surface border border-border/60 text-foreground font-semibold gap-1 shadow-xs"
                >
                  <Edit3 className="size-3 text-rose-500" />
                  <span>Edit</span>
                </Button>
              </div>
            </div>

            <CardContent className="p-6 pt-0 relative space-y-5">
              {/* Avatar Studio Positioned Over Banner */}
              <div className="flex justify-between items-end -mt-12 mb-2">
                <div className="relative group">
                  <div className="relative size-24 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 shadow-xl shadow-rose-500/20">
                    {hasAvatar ? (
                      <img
                        src={user.image!}
                        alt={user.name}
                        onError={() => setImgError(true)}
                        className="size-full rounded-full object-cover bg-surface"
                      />
                    ) : (
                      <div className="grid size-full place-items-center rounded-full bg-gradient-to-br from-rose-600 to-rose-800 text-2xl font-extrabold text-white">
                        {initialsOf(user.name, user.email)}
                      </div>
                    )}

                    {/* Change Avatar Overlay */}
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      title="Change Avatar"
                      className="absolute inset-1 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 backdrop-blur-xs"
                    >
                      <Camera className="size-4" />
                      <span>Change</span>
                    </button>
                  </div>

                  <span
                    className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 ring-4 ring-surface shadow-sm"
                    title="Active Account"
                  />
                </div>

                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className={cn(
                    'capitalize px-2.5 py-0.5 text-xs font-semibold font-mono shadow-xs',
                    user.role === 'admin'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-surface-sunken text-foreground border-border/60'
                  )}
                >
                  {user.role === 'admin' ? (
                    <span className="flex items-center gap-1">
                      <Shield className="size-3" /> Admin
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3 text-rose-500" /> Candidate Pro
                    </span>
                  )}
                </Badge>
              </div>

              {/* Name & Bio */}
              <div className="space-y-1.5">
                <Heading level="page" className="text-xl font-extrabold text-foreground tracking-tight">
                  {user.name}
                </Heading>
                <Text tone="muted" className="text-xs font-mono break-all text-text-muted">
                  {user.email}
                </Text>

                {user.bio ? (
                  <p className="text-xs text-text-secondary leading-relaxed pt-1 italic border-l-2 border-rose-500/40 pl-2.5 my-2">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-xs text-rose-500 hover:underline pt-1 block"
                  >
                    + Add your bio
                  </button>
                )}
              </div>

              {/* College & University */}
              {user.college && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-sunken border border-border/60 text-xs text-foreground font-medium">
                  <GraduationCap className="size-4 text-rose-500 shrink-0" />
                  <span className="truncate">{user.college}</span>
                </div>
              )}

              {/* Social & Professional Links */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-2xs font-bold uppercase tracking-wider text-text-subtle block">
                  Online Profiles & Portfolio
                </span>

                <div className="flex flex-col gap-1.5">
                  {user.github ? (
                    <a
                      href={formatExternalUrl(user.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-sunken/60 hover:bg-surface-sunken hover:border-border border border-border/40 text-xs text-foreground transition-all group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GithubIcon className="size-3.5 text-text-muted group-hover:text-foreground shrink-0" />
                        <span className="truncate font-mono">{user.github.replace(/^https?:\/\/(www\.)?github\.com\/?/, '')}</span>
                      </div>
                      <ExternalLink className="size-3 text-text-subtle group-hover:text-rose-500" />
                    </a>
                  ) : null}

                  {user.linkedin ? (
                    <a
                      href={formatExternalUrl(user.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-sunken/60 hover:bg-surface-sunken hover:border-border border border-border/40 text-xs text-foreground transition-all group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <LinkedinIcon className="size-3.5 text-blue-500 shrink-0" />
                        <span className="truncate font-mono">{user.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '')}</span>
                      </div>
                      <ExternalLink className="size-3 text-text-subtle group-hover:text-rose-500" />
                    </a>
                  ) : null}

                  {user.portfolio ? (
                    <a
                      href={formatExternalUrl(user.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-sunken/60 hover:bg-surface-sunken hover:border-border border border-border/40 text-xs text-foreground transition-all group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="size-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate font-mono">{user.portfolio.replace(/^https?:\/\//, '')}</span>
                      </div>
                      <ExternalLink className="size-3 text-text-subtle group-hover:text-rose-500" />
                    </a>
                  ) : null}

                  {!user.github && !user.linkedin && !user.portfolio && (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="text-xs text-text-muted hover:text-rose-500 border border-dashed border-border/60 rounded-xl p-2.5 text-center transition-colors"
                    >
                      + Add GitHub, LinkedIn & Portfolio
                    </button>
                  )}
                </div>
              </div>

              {/* Account Meta & Actions */}
              <div className="pt-2 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between text-2xs text-text-muted font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-rose-500" /> Joined {memberSince}
                  </span>
                  <span className="text-emerald-500 font-semibold">
                    {stats.grandTotalCompleted} Solved
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a href="/api/export" download className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-medium h-8 gap-1 border-border/70 shadow-xs">
                      <Download className="size-3" />
                      <span>Export</span>
                    </Button>
                  </a>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex-1 text-xs text-destructive hover:bg-destructive/10 h-8 gap-1"
                  >
                    <LogOut className="size-3" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT COLUMN (8 Cols): Stats Ribbon & Segmented Workspace ───────── */}
        <div className="lg:col-span-8 space-y-6">
          {/* ── 1. Primary Metrics Ribbon ─────────────────────────────────────── */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Total Solved */}
            <Card className="border border-border/60 bg-surface shadow-e1 hover:border-rose-500/30 transition-all duration-200">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider text-2xs">
                    Solved
                  </Text>
                  <span className="grid size-7 place-items-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    <Code2 className="size-3.5" />
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-xl font-bold text-foreground">
                      {stats.grandTotalCompleted}
                    </span>
                    <span className="text-2xs text-text-muted font-mono">/ {stats.grandTotalProblems}</span>
                  </div>
                  <Progress value={stats.grandPct} className="mt-2 h-1.5" />
                </div>
                <div className="flex justify-between text-[10px] text-text-muted font-mono">
                  <span>Rate</span>
                  <span className="text-rose-500 font-bold">{stats.grandPct}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 2: Difficulty Mix */}
            <Card className="border border-border/60 bg-surface shadow-e1 hover:border-rose-500/30 transition-all duration-200">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider text-2xs">
                    Difficulty
                  </Text>
                  <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Flame className="size-3.5" />
                  </span>
                </div>
                <div className="space-y-1 text-2xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-emerald-500 font-semibold">Easy</span>
                    <span className="text-foreground">{easyStats.completed}/{easyStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-500 font-semibold">Med</span>
                    <span className="text-foreground">{mediumStats.completed}/{mediumStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-500 font-semibold">Hard</span>
                    <span className="text-foreground">{hardStats.completed}/{hardStats.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metric 3: Revision Stars */}
            <Card className="border border-border/60 bg-surface shadow-e1 hover:border-rose-500/30 transition-all duration-200">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider text-2xs">
                    Revision
                  </Text>
                  <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Star className="size-3.5 fill-amber-500" />
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xl font-bold text-foreground">
                    {stats.revisionCount}
                  </span>
                  <span className="block text-2xs text-text-muted mt-0.5">Starred items</span>
                </div>
                <Link href="/dsa" className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:underline">
                  <span>Review</span> <ArrowRight className="size-2.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Metric 4: Personal Notes */}
            <Card className="border border-border/60 bg-surface shadow-e1 hover:border-rose-500/30 transition-all duration-200">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider text-2xs">
                    Notes
                  </Text>
                  <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <FileText className="size-3.5" />
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xl font-bold text-foreground">
                    {stats.notesCount}
                  </span>
                  <span className="block text-2xs text-text-muted mt-0.5">Markdown notes</span>
                </div>
                <span className="text-[10px] text-text-subtle font-mono">Auto-saved</span>
              </CardContent>
            </Card>
          </div>

          {/* ── 2. Smart Segmented Tab Navigation Island ──────────────────────── */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-surface-sunken border border-border/70 scrollbar-none sticky top-4 z-20 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-text-muted hover:text-foreground hover:bg-surface/60'
              }`}
            >
              <ActivityIcon className="size-3.5" />
              <span>Practice Heatmap</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('patterns')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'patterns'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-text-muted hover:text-foreground hover:bg-surface/60'
              }`}
            >
              <Layers className="size-3.5" />
              <span>DSA Patterns ({stats.completedPatternProblems}/{stats.totalPatternProblems})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cp')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'cp'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-text-muted hover:text-foreground hover:bg-surface/60'
              }`}
            >
              <Zap className="size-3.5" />
              <span>Connected CP Handles</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-text-muted hover:text-foreground hover:bg-surface/60'
              }`}
            >
              <Settings className="size-3.5" />
              <span>Alert Preferences</span>
            </button>
          </div>

          {/* ── 3. Tab Panels (Smooth Animated Transitions) ───────────────────── */}

          {/* TAB 1: Activity Heatmap & Recent Feed */}
          {activeTab === 'overview' && (
            <Card className="border border-border/60 bg-surface shadow-e2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CardHeader className="border-b border-border/40 bg-surface-sunken/30 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    <ActivityIcon className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="font-display text-base font-bold text-foreground">
                      Consistency & Activity Heatmap
                    </CardTitle>
                    <CardDescription className="text-xs text-text-muted">
                      90-day tracking of problem completions, revision stars, and study logs.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <ActivityHeatmap data={heatmap} />

                {recentActivity.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider text-2xs">
                      Recent Activity Feed
                    </Text>
                    <div className="divide-y divide-border/40 rounded-2xl border border-border/60 bg-surface-sunken/40 overflow-hidden">
                      {recentActivity.slice(0, 5).map((act) => (
                        <div key={act._id} className="flex items-center justify-between p-3.5 text-xs hover:bg-surface-sunken/80 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
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
          )}

          {/* TAB 2: DSA Patterns Breakdown */}
          {activeTab === 'patterns' && (
            <Card className="border border-border/60 bg-surface shadow-e2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CardHeader className="border-b border-border/40 bg-surface-sunken/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <Code2 className="size-4" />
                    </span>
                    <div>
                      <CardTitle className="font-display text-base font-bold text-foreground">
                        DSA Pattern Mastery Breakdown
                      </CardTitle>
                      <CardDescription className="text-xs text-text-muted">
                        Track your problem coverage across essential algorithmic patterns.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">
                    {stats.completedPatternProblems} / {stats.totalPatternProblems} Solved
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {stats.patternBreakdown.map((pat) => (
                    <Link key={pat.slug} href={`/dsa/${pat.slug}`} className="group">
                      <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-surface p-4 transition-all duration-200 hover:border-rose-500/40 hover:shadow-e2">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-semibold text-sm text-foreground group-hover:text-rose-500 transition-colors line-clamp-1">
                            {pat.title}
                          </span>
                          <span className="text-xs font-mono font-semibold tabular-nums text-text-muted shrink-0">
                            {pat.completed}/{pat.total}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <Progress value={pat.pct} className="h-1.5" />
                          <div className="flex items-center justify-between text-2xs text-text-muted">
                            <span className="font-mono">{pat.pct}% completed</span>
                            <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100 text-rose-500" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: Connected CP Profiles */}
          {activeTab === 'cp' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <LinkedHandlesCard />
            </div>
          )}

          {/* TAB 4: Alerts & Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="border border-border/60 bg-surface shadow-e1">
                <CardHeader className="pb-3 border-b border-border/40 bg-surface-sunken/30 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        <BellRing className="size-4" />
                      </span>
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">Contest Email Alerts</CardTitle>
                        <CardDescription className="text-xs text-text-muted">
                          Automated reminders before LeetCode, Codeforces, CodeChef, and AtCoder contests
                        </CardDescription>
                      </div>
                    </div>
                    <ContestAlertPreferencesModal
                      trigger={
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold border-rose-500/30 hover:bg-rose-500/10">
                          <BellRing className="size-3.5 text-rose-500" />
                          <span>Configure Timing</span>
                        </Button>
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-xs text-text-muted leading-relaxed">
                    Receive email reminders (24 hours, 2 hours, or 30 minutes before contests) with direct Google Calendar links and local timezone conversions.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* ── Comprehensive Edit Profile Modal ─────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl border-rose-500/40 bg-surface shadow-e4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40 bg-surface-sunken/30 px-6 py-4 sticky top-0 bg-surface/95 backdrop-blur-md z-10">
              <div>
                <CardTitle className="text-base font-bold text-foreground">Edit Profile & Public Links</CardTitle>
                <CardDescription className="text-xs text-text-muted">
                  Update your personal bio, university details, avatar, and social links.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(false)}>
                <X className="size-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Mayank V"
                    required
                    className="bg-surface-sunken border-border/70 text-xs"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex justify-between">
                    <span>Bio / Headline</span>
                    <span className="text-[10px] text-text-muted">{editBio.length}/300</span>
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="e.g. Aspiring Software Engineer | Problem Solver | CP enthusiast"
                    maxLength={300}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-border/70 bg-surface-sunken text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                  />
                </div>

                {/* College / University */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">College / University</label>
                  <Input
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    placeholder="e.g. Indian Institute of Technology Bombay"
                    className="bg-surface-sunken border-border/70 text-xs"
                  />
                </div>

                {/* Avatar Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Avatar Preset Gallery</span>
                    <span className="text-[10px] text-text-muted">Click to select</span>
                  </label>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {AVATAR_PRESETS.map((preset, index) => {
                      const isSelected = editImage === preset;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setEditImage(preset)}
                          className={`relative size-12 rounded-2xl p-1 border transition-all hover:scale-105 ${
                            isSelected
                              ? 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/40 shadow-sm'
                              : 'border-border/60 bg-surface-sunken hover:border-border'
                          }`}
                        >
                          <img src={preset} alt={`Preset ${index + 1}`} className="size-full rounded-xl object-contain" />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="size-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Avatar URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Or Custom Avatar URL</label>
                  <Input
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="bg-surface-sunken border-border/70 text-xs"
                  />
                </div>

                {/* Social & Professional Links */}
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <span className="text-xs font-bold text-foreground block">
                    Public Links & Profiles
                  </span>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-text-muted flex items-center gap-1">
                        <GithubIcon className="size-3 text-text-muted" /> GitHub
                      </label>
                      <Input
                        value={editGithub}
                        onChange={(e) => setEditGithub(e.target.value)}
                        placeholder="username or URL"
                        className="bg-surface-sunken border-border/70 text-xs h-8"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-text-muted flex items-center gap-1">
                        <LinkedinIcon className="size-3 text-blue-500" /> LinkedIn
                      </label>
                      <Input
                        value={editLinkedin}
                        onChange={(e) => setEditLinkedin(e.target.value)}
                        placeholder="in/username or URL"
                        className="bg-surface-sunken border-border/70 text-xs h-8"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-text-muted flex items-center gap-1">
                        <Globe className="size-3 text-emerald-500" /> Portfolio
                      </label>
                      <Input
                        value={editPortfolio}
                        onChange={(e) => setEditPortfolio(e.target.value)}
                        placeholder="https://yourportfolio.dev"
                        className="bg-surface-sunken border-border/70 text-xs h-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    Save Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
