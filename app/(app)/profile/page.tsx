'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, type Variants } from 'framer-motion';
import {
  User as UserIcon,
  Shield,
  Star,
  FileText,
  Calendar,
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
  GraduationCap,
  Globe,
  ExternalLink,
  Search,
  Trophy,
  Flame,
  Zap,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ContestAlertPreferencesModal } from '@/components/contests/ContestAlertPreferencesModal';
import { LinkedHandlesCard } from '@/components/cp/LinkedHandlesCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

function isGoogleAccountImage(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes('googleusercontent.com') ||
    trimmed.includes('google.com') ||
    trimmed.includes('ggpht.com')
  );
}

function initialsOf(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split('@')[0] || '';
  if (!source) return 'OA';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/**
 * Creative candidate tier archetype derived from problem completion count.
 */
function getCandidateTier(completed: number): { label: string; badgeClass: string } {
  if (completed >= 120) {
    return {
      label: 'Grandmaster Architect',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    };
  }
  if (completed >= 60) {
    return {
      label: 'Master Problem Solver',
      badgeClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    };
  }
  if (completed >= 25) {
    return {
      label: 'Pattern Specialist',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    };
  }
  if (completed >= 10) {
    return {
      label: 'Blueprint Explorer',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    };
  }
  return {
    label: 'Algorithmic Initiate',
    badgeClass: 'bg-surface-sunken dark:bg-white/[0.06] text-muted-foreground',
  };
}

/**
 * Clean, borderless circular telemetry gauge for overall candidate readiness.
 */
function LargeRadialReadinessGauge({
  completed,
  total,
  pct,
}: {
  completed: number;
  total: number;
  pct: number;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius; // ~326.73
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative size-36 sm:size-40 flex items-center justify-center shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 130 130" aria-hidden="true">
        {/* Track */}
        <circle
          cx="65"
          cy="65"
          r={radius}
          className="stroke-surface-sunken dark:stroke-white/[0.06] fill-none"
          strokeWidth="6"
        />
        {/* Solid emerald arc without gradient */}
        <circle
          cx="65"
          cy="65"
          r={radius}
          className="stroke-primary fill-none transition-all duration-1000 ease-out"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="font-mono text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">
          {pct}%
        </span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-1">
          Readiness
        </span>
        <span className="text-2xs font-mono font-semibold text-primary mt-0.5">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
}

/**
 * Signature circular mastery ring for pattern cards (borderless & clean).
 */
function CircularMasteryRing({ pct, isMastered }: { pct: number; isMastered: boolean }) {
  const radius = 13;
  const circumference = 2 * Math.PI * radius; // ~81.68
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className={cn(
        'size-11 sm:size-12 rounded-2xl flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 shrink-0 relative',
        'bg-surface-sunken dark:bg-white/[0.04]',
        isMastered
          ? 'group-hover:bg-emerald-500/[0.08]'
          : 'group-hover:bg-primary/[0.08]'
      )}
      title={`${pct}% mastered`}
    >
      <svg className="size-8 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="stroke-foreground/10 dark:stroke-white/10 fill-none"
          strokeWidth="2.75"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          className={cn(
            'fill-none transition-all duration-500 ease-out',
            isMastered ? 'stroke-emerald-500' : 'stroke-primary'
          )}
          strokeWidth="2.75"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isMastered ? (
          <Check className="size-3.5 text-emerald-500 stroke-[3]" />
        ) : (
          <span className="text-[10px] font-mono font-bold text-foreground/90">
            {pct}%
          </span>
        )}
      </div>
    </div>
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

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

  // Pattern tab filtering states
  const [patternSearch, setPatternSearch] = useState('');
  const [patternStatusFilter, setPatternStatusFilter] = useState<'all' | 'in-progress' | 'mastered' | 'unstarted'>('all');

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
    onSuccess: (result: { user?: Partial<ProfileData['user']> }) => {
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
    onError: (err: Error) => {
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

  const patternBreakdown = data?.stats?.patternBreakdown;

  const filteredPatterns = useMemo(() => {
    if (!patternBreakdown) return [];
    return patternBreakdown.filter((pat) => {
      const q = patternSearch.toLowerCase().trim();
      const matchesSearch = !q || pat.title.toLowerCase().includes(q) || pat.slug.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      const isMastered = pat.total > 0 && pat.completed === pat.total;
      const isInProgress = pat.completed > 0 && pat.completed < pat.total;
      const isUnstarted = !pat.completed || pat.completed === 0;

      if (patternStatusFilter === 'mastered' && !isMastered) return false;
      if (patternStatusFilter === 'in-progress' && !isInProgress) return false;
      if (patternStatusFilter === 'unstarted' && !isUnstarted) return false;

      return true;
    });
  }, [patternBreakdown, patternSearch, patternStatusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-16">
        <div className="pt-1">
          <div className="space-y-2.5 max-w-3xl">
            <Skeleton className="h-12 w-80 sm:w-96 rounded-2xl" />
            <Skeleton className="h-4 w-full max-w-xl rounded-md" />
          </div>
        </div>
        <Skeleton className="h-72 w-full rounded-[32px]" />
        <Skeleton className="h-96 w-full rounded-[32px]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[32px] bg-card dark:bg-card/40 p-12 text-center shadow-e1">
        <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
          <UserIcon className="size-6" />
        </div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Failed to load candidate dossier
        </h2>
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          Please check your connection and try refreshing the page.
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['userProfile'] })}
          className="mt-4 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer shadow-xs"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const { user, stats, heatmap, recentActivity } = data;
  const memberSince = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently';
  const hasAvatar = Boolean(user.image && isGoogleAccountImage(user.image) && !imgError);

  const easyStats = stats.difficultyMix.Easy || { total: 0, completed: 0 };
  const mediumStats = stats.difficultyMix.Medium || { total: 0, completed: 0 };
  const hardStats = stats.difficultyMix.Hard || { total: 0, completed: 0 };
  const candidateTier = getCandidateTier(stats.grandTotalCompleted);

  const formatExternalUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

  return (
    <div className="space-y-7 pb-16">
      {/* ── 1. Page Cockpit Header (Clean & Borderless, No Ambient Gradient) ──── */}
      <div className="pt-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Candidate Dossier
            </span>
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-2xs font-mono text-muted-foreground">Live Telemetry</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
            Profile & <span className="text-emerald-600 dark:text-emerald-400">Mastery</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl font-normal leading-relaxed">
            Your personal interview intelligence hub: track algorithmic blueprint fluency, 365-day practice velocity, and competitive handles.
          </p>
        </div>

        {/* Quick Header Actions (Clean, Borderless Pills) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/dsa">
            <button className="px-4 py-2 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5">
              <span>Drill DSA Patterns</span>
              <ArrowRight className="size-3.5" />
            </button>
          </Link>
          <a href="/api/export" download>
            <button
              type="button"
              className="px-3.5 py-2 rounded-full text-xs font-semibold bg-surface-sunken dark:bg-white/[0.04] hover:bg-surface-sunken/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Download full candidate report JSON"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </a>
        </div>
      </div>

      {/* ── 2. The Borderless Bento Hero Pass (Clean Solid Surfaces) ─────────── */}
      <div
        className={cn(
          'p-6 sm:p-8 rounded-[32px] sm:rounded-[36px] transition-all duration-300 relative',
          'bg-card dark:bg-card/50 shadow-e1 hover:shadow-e2'
        )}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Identity & Bio Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
            {/* Avatar Studio */}
            <div className="relative group shrink-0">
              <div className="relative size-24 sm:size-28 rounded-full p-1 bg-surface-sunken dark:bg-white/[0.06] shadow-xs">
                {hasAvatar ? (
                  <img
                    src={user.image!}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="size-full rounded-full object-cover bg-background"
                  />
                ) : (
                  <div className="grid size-full place-items-center rounded-full bg-emerald-600 text-3xl font-mono font-black text-white select-none">
                    {initialsOf(user.name, user.email)}
                  </div>
                )}

                {/* Change Avatar Overlay */}
                <button
                  type="button"
                  onClick={handleStartEdit}
                  title="Change Avatar"
                  className="absolute inset-1 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 backdrop-blur-xs cursor-pointer"
                >
                  <Camera className="size-4" />
                  <span>Change</span>
                </button>
              </div>

              {/* Status beacon ring */}
              <span
                className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 ring-4 ring-card shadow-xs"
                title="Active Candidate"
              />
            </div>

            {/* Profile Meta & Clean Chips */}
            <div className="space-y-2 min-w-0 flex-1">
              {/* Badges Row (Borderless) */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'px-3 py-0.5 rounded-full text-xs font-semibold font-mono',
                    user.role === 'admin'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'bg-surface-sunken dark:bg-white/[0.06] text-muted-foreground'
                  )}
                >
                  {user.role === 'admin' ? (
                    <span className="flex items-center gap-1">
                      <Shield className="size-3 text-emerald-500" /> Admin
                    </span>
                  ) : (
                    <span>Candidate Pro</span>
                  )}
                </span>

                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono flex items-center gap-1',
                    candidateTier.badgeClass
                  )}
                >
                  <Zap className="size-3 text-emerald-500" />
                  <span>{candidateTier.label}</span>
                </span>
              </div>

              {/* Name & Email */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-foreground tracking-tight">
                  {user.name}
                </h2>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {user.email}
                </p>
              </div>

              {/* Bio & University */}
              <div className="space-y-1.5 pt-0.5">
                {user.bio ? (
                  <p className="text-xs text-muted-foreground leading-relaxed italic bg-surface-sunken/60 dark:bg-white/[0.03] px-3 py-2 rounded-xl">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-xs text-primary hover:underline block cursor-pointer font-medium"
                  >
                    + Add candidate bio headline
                  </button>
                )}

                {user.college && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-sunken dark:bg-white/[0.04] text-xs text-foreground font-medium">
                    <GraduationCap className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{user.college}</span>
                  </div>
                )}
              </div>

              {/* Floating Social Pill Handles (Borderless) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                {user.github && (
                  <a
                    href={formatExternalUrl(user.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-sunken/80 dark:bg-white/[0.04] hover:bg-surface-sunken text-xs font-mono text-foreground transition-all group"
                  >
                    <GithubIcon className="size-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span>{user.github.replace(/^https?:\/\/(www\.)?github\.com\/?/, '')}</span>
                    <ExternalLink className="size-2.5 text-muted-foreground group-hover:text-primary" />
                  </a>
                )}

                {user.linkedin && (
                  <a
                    href={formatExternalUrl(user.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-sunken/80 dark:bg-white/[0.04] hover:bg-surface-sunken text-xs font-mono text-foreground transition-all group"
                  >
                    <LinkedinIcon className="size-3 text-blue-500 shrink-0" />
                    <span>{user.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '')}</span>
                    <ExternalLink className="size-2.5 text-muted-foreground group-hover:text-primary" />
                  </a>
                )}

                {user.portfolio && (
                  <a
                    href={formatExternalUrl(user.portfolio)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-sunken/80 dark:bg-white/[0.04] hover:bg-surface-sunken text-xs font-mono text-foreground transition-all group"
                  >
                    <Globe className="size-3 text-emerald-500 shrink-0" />
                    <span>{user.portfolio.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="size-2.5 text-muted-foreground group-hover:text-primary" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-sunken/60 dark:bg-white/[0.04] hover:bg-surface-sunken text-2xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <Edit3 className="size-2.5" />
                  <span>Edit Links</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Section: Large Radial Readiness HUD & Mini-Metrics (Clean & Borderless) */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shrink-0 lg:pl-8">
            {/* The Large Radial Dial */}
            <LargeRadialReadinessGauge
              completed={stats.grandTotalCompleted}
              total={stats.grandTotalProblems}
              pct={stats.grandPct}
            />

            {/* Quick Micro-Vitals Stack (Borderless) */}
            <div className="flex flex-col gap-2 w-full sm:w-44">
              <Link href="/dsa" className="group">
                <div className="p-3 rounded-2xl bg-surface-sunken/70 dark:bg-white/[0.04] hover:bg-surface-sunken transition-colors">
                  <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="size-3 text-amber-500 fill-amber-500" /> Starred
                    </span>
                    <strong className="text-foreground">{stats.revisionCount}</strong>
                  </div>
                  <span className="text-[10px] text-primary group-hover:underline block mt-0.5">
                    Drill marked →
                  </span>
                </div>
              </Link>

              <div className="p-3 rounded-2xl bg-surface-sunken/70 dark:bg-white/[0.04]">
                <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="size-3 text-teal-500" /> Notes
                  </span>
                  <strong className="text-foreground">{stats.notesCount}</strong>
                </div>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Solution blueprints
                </span>
              </div>

              <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-primary" /> Member
                </span>
                <span>{memberSince}</span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="mt-1 text-2xs text-destructive hover:underline font-mono text-left px-2 cursor-pointer flex items-center gap-1"
              >
                <LogOut className="size-2.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Borderless View Switcher Island ───────────────────────────────── */}
      <div className="p-1.5 rounded-2xl bg-surface-sunken/80 dark:bg-card/50 shadow-e1 flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
            activeTab === 'overview'
              ? 'bg-card dark:bg-card/80 text-foreground font-bold shadow-e1'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
          )}
        >
          <ActivityIcon className="size-3.5" />
          <span>Intelligence Radar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('patterns')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
            activeTab === 'patterns'
              ? 'bg-card dark:bg-card/80 text-foreground font-bold shadow-e1'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
          )}
        >
          <Layers className="size-3.5" />
          <span>
            Algorithmic Blueprints ({stats.completedPatternProblems}/{stats.totalPatternProblems})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cp')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
            activeTab === 'cp'
              ? 'bg-card dark:bg-card/80 text-foreground font-bold shadow-e1'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
          )}
        >
          <Globe className="size-3.5" />
          <span>Competitive Handles & Tracks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
            activeTab === 'settings'
              ? 'bg-card dark:bg-card/80 text-foreground font-bold shadow-e1'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
          )}
        >
          <Settings className="size-3.5" />
          <span>Contest Radar & Alerts</span>
        </button>
      </div>

      {/* ── 4. Dynamic Workspace Panels (Clean & Borderless) ──────────────────── */}

      {/* TAB 1: Borderless Intelligence Bento Matrix ─────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 2-Part Bento Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Bento Card A: Algorithmic DNA & Difficulty Spectrum (5 cols) */}
            <div
              className={cn(
                'lg:col-span-5 p-6 rounded-[28px] sm:rounded-3xl transition-all duration-300 relative flex flex-col justify-between',
                'bg-card dark:bg-card/50 shadow-e1 hover:shadow-e2'
              )}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Code2 className="size-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        Difficulty DNA
                      </h3>
                      <p className="text-2xs font-mono text-muted-foreground">
                        Distribution across cognitive levels
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Telemetry
                  </span>
                </div>

                {/* Proportional Spectrum Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-2xs font-mono text-muted-foreground">
                    <span>Solved Ratio</span>
                    <span className="text-foreground font-semibold">
                      {stats.grandTotalCompleted} problems
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-surface-sunken dark:bg-white/[0.06] overflow-hidden flex">
                    <div
                      style={{
                        width: stats.grandTotalCompleted > 0 ? `${(easyStats.completed / stats.grandTotalCompleted) * 100}%` : '0%',
                      }}
                      className="h-full bg-emerald-500"
                      title={`Easy: ${easyStats.completed}`}
                    />
                    <div
                      style={{
                        width: stats.grandTotalCompleted > 0 ? `${(mediumStats.completed / stats.grandTotalCompleted) * 100}%` : '0%',
                      }}
                      className="h-full bg-amber-500"
                      title={`Medium: ${mediumStats.completed}`}
                    />
                    <div
                      style={{
                        width: stats.grandTotalCompleted > 0 ? `${(hardStats.completed / stats.grandTotalCompleted) * 100}%` : '0%',
                      }}
                      className="h-full bg-rose-500"
                      title={`Hard: ${hardStats.completed}`}
                    />
                  </div>
                </div>

                {/* Difficulty Levels Breakdown Cards (Borderless) */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-surface-sunken/70 dark:bg-white/[0.04] text-center">
                    <span className="text-2xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      Easy
                    </span>
                    <span className="font-mono text-lg font-black text-foreground block my-0.5">
                      {easyStats.completed}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      of {easyStats.total}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-sunken/70 dark:bg-white/[0.04] text-center">
                    <span className="text-2xs font-mono font-bold text-amber-600 dark:text-amber-400 block">
                      Medium
                    </span>
                    <span className="font-mono text-lg font-black text-foreground block my-0.5">
                      {mediumStats.completed}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      of {mediumStats.total}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-sunken/70 dark:bg-white/[0.04] text-center">
                    <span className="text-2xs font-mono font-bold text-rose-500 block">
                      Hard
                    </span>
                    <span className="font-mono text-lg font-black text-foreground block my-0.5">
                      {hardStats.completed}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      of {hardStats.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guidance Footer */}
              <div className="pt-4 mt-4 flex items-center justify-between text-2xs font-mono text-muted-foreground">
                <span>OA Benchmark</span>
                <span className="text-primary font-bold">Medium-focused drill</span>
              </div>
            </div>

            {/* Bento Card B: 365-Day Consistency Terminal (7 cols, Borderless) */}
            <div
              className={cn(
                'lg:col-span-7 p-6 rounded-[28px] sm:rounded-3xl transition-all duration-300 relative flex flex-col justify-between',
                'bg-card dark:bg-card/50 shadow-e1 hover:shadow-e2'
              )}
            >
              <div className="space-y-4">
                {/* Terminal Header with macOS dots */}
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-emerald-500/80" />
                      <span className="size-2.5 rounded-full bg-amber-500/80" />
                      <span className="size-2.5 rounded-full bg-teal-500/80" />
                    </div>
                    <span className="text-2xs font-mono text-muted-foreground pl-2">
                      candidate-telemetry://consistency.log
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                    <Flame className="size-3.5 text-amber-500 fill-amber-500" />
                    <span>365-Day Grid</span>
                  </div>
                </div>

                {/* Heatmap Component Container (Borderless) */}
                <div className="p-3 sm:p-4 rounded-2xl bg-surface-sunken/60 dark:bg-white/[0.02] overflow-hidden">
                  <ActivityHeatmap data={heatmap} borderless />
                </div>
              </div>

              <div className="pt-3 mt-3 flex items-center justify-between text-2xs font-mono text-muted-foreground">
                <span>Auto-synchronized</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="size-3" /> Real-time active
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bento Row: Live Telemetry Stream & Quick Track Jumpers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Live Activity Telemetry Feed (7 cols, Borderless) */}
            <div
              className={cn(
                'lg:col-span-7 p-6 rounded-[28px] sm:rounded-3xl transition-all duration-300 relative',
                'bg-card dark:bg-card/50 shadow-e1'
              )}
            >
              <div className="flex items-center justify-between pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <ActivityIcon className="size-4 text-primary" />
                  <h4 className="font-display text-sm font-bold text-foreground">
                    Telemetry Event Stream
                  </h4>
                </div>
                <span className="text-2xs font-mono text-muted-foreground">
                  Last 5 actions
                </span>
              </div>

              {recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {recentActivity.slice(0, 5).map((act) => (
                    <div
                      key={act._id}
                      className="p-3 rounded-xl bg-surface-sunken/50 dark:bg-white/[0.02] hover:bg-surface-sunken transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="size-2 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                        <span className="font-medium text-foreground truncate">
                          {act.entity?.title || act.kind.replace('.', ' ')}
                        </span>
                      </div>
                      <span className="text-muted-foreground shrink-0 text-2xs font-mono">
                        {format(new Date(act.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-mono py-4 text-center">
                  No activity logged yet. Solve your first problem to start the telemetry stream!
                </p>
              )}
            </div>

            {/* Quick Track Jumpers (5 cols, Borderless) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
              <Link href="/dsa" className="group">
                <div
                  className={cn(
                    'p-4 rounded-2xl sm:rounded-3xl transition-all duration-300 relative',
                    'bg-card dark:bg-card/50 shadow-e1 hover:shadow-e2'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground">
                        Core Blueprint
                      </span>
                      <h4 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        DSA Patterns Catalog
                      </h4>
                    </div>
                    <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>

              <Link href="/non-standard" className="group">
                <div
                  className={cn(
                    'p-4 rounded-2xl sm:rounded-3xl transition-all duration-300 relative',
                    'bg-card dark:bg-card/50 shadow-e1 hover:shadow-e2'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground">
                        Advanced Archetype
                      </span>
                      <h4 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        Non-Standard OA Track
                      </h4>
                    </div>
                    <span className="size-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>

              <Link href="/cp" className="group">
                <div
                  className={cn(
                    'p-4 rounded-2xl sm:rounded-3xl transition-all duration-300 relative',
                    'bg-card dark:bg-card/50 shadow-e1 hover:shadow-e2'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground">
                        Competition
                      </span>
                      <h4 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        Competitive Arena
                      </h4>
                    </div>
                    <span className="size-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Algorithmic Blueprints (Borderless Cards) ────────────────────── */}
      {activeTab === 'patterns' && (
        <div className="space-y-5">
          {/* Pattern Search & Status Controls (Borderless) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card dark:bg-card/50 shadow-e1">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search pattern blueprints by name..."
                value={patternSearch}
                onChange={(e) => setPatternSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-8 text-xs font-medium bg-surface-sunken dark:bg-white/[0.04] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
              />
              {patternSearch && (
                <button
                  type="button"
                  onClick={() => setPatternSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-surface-sunken dark:bg-white/[0.04] shrink-0">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'in-progress', label: 'In Progress' },
                  { id: 'mastered', label: 'Mastered' },
                  { id: 'unstarted', label: 'Unstarted' },
                ] as const
              ).map((tab) => {
                const isActive = patternStatusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPatternStatusFilter(tab.id)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                      isActive
                        ? 'bg-card text-foreground font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid of Borderless Course Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2"
          >
            {filteredPatterns.map((pat) => {
              const isMastered = pat.total > 0 && pat.completed === pat.total;
              const isInProgress = pat.completed > 0 && pat.completed < pat.total;

              return (
                <motion.div key={pat.slug} variants={itemVariants}>
                  <Link href={`/dsa/${pat.slug}`} className="group block h-full">
                    <div
                      className={cn(
                        'h-full flex flex-col justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl transition-all duration-300 relative',
                        'bg-card dark:bg-card/50 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5'
                      )}
                    >
                      <div className="space-y-3">
                        {/* 1. Header Row */}
                        <div className="flex items-start justify-between gap-3">
                          {/* Status Badge */}
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold',
                              isMastered
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isInProgress
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-surface-sunken dark:bg-white/[0.06] text-muted-foreground'
                            )}
                          >
                            {isMastered ? 'Mastered' : isInProgress ? 'In Progress' : 'Roadmap'}
                          </span>

                          {/* Circular Mastery Ring */}
                          <CircularMasteryRing pct={pat.pct} isMastered={isMastered} />
                        </div>

                        {/* 2. Title */}
                        <div>
                          <h3 className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {pat.title}
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {pat.completed} of {pat.total} problems solved
                          </p>
                        </div>

                        {/* 3. Progress bar */}
                        <div className="h-1.5 w-full rounded-full bg-surface-sunken dark:bg-white/[0.06] overflow-hidden">
                          <div
                            style={{ width: `${pat.pct}%` }}
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isMastered ? 'bg-emerald-500' : 'bg-primary'
                            )}
                          />
                        </div>
                      </div>

                      {/* 4. Action Row (Clean Spacing, No Border) */}
                      <div className="pt-3.5 mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-mono font-medium text-muted-foreground">
                          {pat.pct}% complete
                        </span>

                        <div className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 shrink-0">
                          <span>{isMastered ? 'Review' : isInProgress ? 'Continue' : 'Practice'}</span>
                          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {filteredPatterns.length === 0 && (
            <div className="text-center py-12 rounded-2xl bg-card/60 shadow-e1">
              <p className="text-xs text-muted-foreground font-mono">
                No algorithmic patterns matched your filter criteria.
              </p>
              <button
                onClick={() => {
                  setPatternSearch('');
                  setPatternStatusFilter('all');
                }}
                className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Competitive Handles & Track Telemetry (Borderless) ──────────── */}
      {activeTab === 'cp' && (
        <div className="space-y-6">
          {/* Linked Handles Card Component */}
          <div className="rounded-[28px] sm:rounded-3xl bg-card dark:bg-card/50 shadow-e1 p-6">
            <LinkedHandlesCard />
          </div>

          {/* Other Prep Tracks (Non-Standard & CP problem sets) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/non-standard" className="group">
              <div className="p-5 rounded-2xl sm:rounded-3xl transition-all duration-300 relative h-full flex flex-col justify-between bg-card dark:bg-card/50 shadow-e1 hover:shadow-e2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      Track
                    </span>
                    <span className="size-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Layers className="size-3.5" />
                    </span>
                  </div>
                  <h4 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    Non-Standard DSA Track
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    {stats.nonStandard.completed} of {stats.nonStandard.total} solved
                  </p>
                </div>

                <div className="pt-3 mt-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    {stats.nonStandard.total > 0
                      ? Math.round((stats.nonStandard.completed / stats.nonStandard.total) * 100)
                      : 0}
                    % Complete
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                    Explore <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            </Link>

            <Link href="/cp" className="group">
              <div className="p-5 rounded-2xl sm:rounded-3xl transition-all duration-300 relative h-full flex flex-col justify-between bg-card dark:bg-card/50 shadow-e1 hover:shadow-e2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      Track
                    </span>
                    <span className="size-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Trophy className="size-3.5" />
                    </span>
                  </div>
                  <h4 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    Competitive Programming Track
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    {stats.cp.completed} of {stats.cp.total} solved
                  </p>
                </div>

                <div className="pt-3 mt-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    {stats.cp.total > 0
                      ? Math.round((stats.cp.completed / stats.cp.total) * 100)
                      : 0}
                    % Complete
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                    Explore <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* TAB 4: Alerts & Settings (Borderless) ──────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-[28px] sm:rounded-3xl bg-card dark:bg-card/50 shadow-e1 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <BellRing className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Contest Radar & Email Alerts
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Automated reminders before LeetCode, Codeforces, CodeChef, and AtCoder contests.
                  </p>
                </div>
              </div>

              <ContestAlertPreferencesModal
                trigger={
                  <Button
                    size="sm"
                    className="rounded-full gap-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs cursor-pointer"
                  >
                    <BellRing className="size-3.5" />
                    <span>Configure Radar</span>
                  </Button>
                }
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Receive precision automated reminders (24 hours, 2 hours, or 30 minutes before contest launch) directly in your inbox with 1-click Google Calendar sync links, local timezone offsets, and division filters.
            </p>

            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-surface-sunken/60 dark:bg-white/[0.03]">
                <span className="text-xs font-bold text-foreground block">Multi-Platform</span>
                <span className="text-2xs text-muted-foreground">LeetCode, CF, CodeChef, AtCoder</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-sunken/60 dark:bg-white/[0.03]">
                <span className="text-xs font-bold text-foreground block">Flexible Timing</span>
                <span className="text-2xs text-muted-foreground">24h, 2h, and 30m countdowns</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-sunken/60 dark:bg-white/[0.03]">
                <span className="text-xs font-bold text-foreground block">Calendar Ready</span>
                <span className="text-2xs text-muted-foreground">Instant Google Calendar additions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Comprehensive Edit Profile Modal (Clean & Borderless) ─────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={cn(
              'w-full max-w-2xl relative max-h-[90vh] flex flex-col',
              'bg-card dark:bg-card/95 shadow-e4',
              'rounded-[28px] sm:rounded-3xl'
            )}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 bg-surface-sunken/50 dark:bg-white/[0.02] shrink-0 rounded-t-[28px] sm:rounded-t-3xl">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Edit Candidate Profile
                </h3>
                <p className="text-xs text-muted-foreground font-normal">
                  Update your candidate headline, university affiliation, avatar, and public links.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="size-8 rounded-full bg-surface-sunken dark:bg-white/[0.06] hover:bg-surface-sunken/80 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-2xl bg-destructive/10 text-destructive text-xs font-medium">
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
                    className="bg-surface-sunken dark:bg-white/[0.04] text-xs rounded-xl focus:ring-2 focus:ring-primary/20 border-0"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex justify-between">
                    <span>Bio / Headline</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{editBio.length}/300</span>
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="e.g. Aspiring Software Engineer | Problem Solver | CP enthusiast"
                    maxLength={300}
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-surface-sunken dark:bg-white/[0.04] text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-sans"
                  />
                </div>

                {/* College / University */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">College / University</label>
                  <Input
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    placeholder="e.g. Indian Institute of Technology Bombay"
                    className="bg-surface-sunken dark:bg-white/[0.04] text-xs rounded-xl focus:ring-2 focus:ring-primary/20 border-0"
                  />
                </div>

                {/* Avatar Options */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Avatar Option</span>
                    <span className="text-[10px] text-muted-foreground">Initials badge or synced Google photo</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditImage('')}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-2xl transition-all text-left cursor-pointer',
                        !editImage
                          ? 'bg-primary/10 ring-2 ring-primary/30'
                          : 'bg-surface-sunken dark:bg-white/[0.04] hover:bg-surface-sunken/80'
                      )}
                    >
                      <div className="grid size-10 place-items-center rounded-full bg-emerald-600 text-xs font-mono font-bold text-white shrink-0 shadow-xs">
                        {initialsOf(editName || user.name, user.email)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground">Name Initials</p>
                        <p className="text-[10px] text-muted-foreground">Clean typography badge</p>
                      </div>
                      {!editImage && <Check className="size-4 text-primary shrink-0" />}
                    </button>

                    {data?.user?.image && isGoogleAccountImage(data.user.image) ? (
                      <button
                        type="button"
                        onClick={() => setEditImage(data.user.image || '')}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-2xl transition-all text-left cursor-pointer',
                          editImage === data.user.image
                            ? 'bg-primary/10 ring-2 ring-primary/30'
                            : 'bg-surface-sunken dark:bg-white/[0.04] hover:bg-surface-sunken/80'
                        )}
                      >
                        <img
                          src={data.user.image}
                          alt="Google Account"
                          referrerPolicy="no-referrer"
                          className="size-10 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground">Google Account</p>
                          <p className="text-[10px] text-muted-foreground">Synced profile picture</p>
                        </div>
                        {editImage === data.user.image && <Check className="size-4 text-primary shrink-0" />}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Custom Google Avatar URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Google Photo URL (Optional)</label>
                  <Input
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="https://lh3.googleusercontent.com/..."
                    className="bg-surface-sunken dark:bg-white/[0.04] text-xs rounded-xl focus:ring-2 focus:ring-primary/20 font-mono text-[11px] border-0"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Only Google account photos (e.g. googleusercontent.com) are accepted, or leave blank for initials.
                  </p>
                </div>

                {/* Social & Professional Links */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-foreground block">
                    Public Links & Profiles
                  </span>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-muted-foreground flex items-center gap-1">
                        <GithubIcon className="size-3 text-muted-foreground" /> GitHub
                      </label>
                      <Input
                        value={editGithub}
                        onChange={(e) => setEditGithub(e.target.value)}
                        placeholder="username or URL"
                        className="bg-surface-sunken dark:bg-white/[0.04] text-xs rounded-xl h-8 focus:ring-2 focus:ring-primary/20 border-0"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-muted-foreground flex items-center gap-1">
                        <LinkedinIcon className="size-3 text-blue-500" /> LinkedIn
                      </label>
                      <Input
                        value={editLinkedin}
                        onChange={(e) => setEditLinkedin(e.target.value)}
                        placeholder="in/username or URL"
                        className="bg-surface-sunken dark:bg-white/[0.04] text-xs rounded-xl h-8 focus:ring-2 focus:ring-primary/20 border-0"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Globe className="size-3 text-emerald-500" /> Portfolio
                      </label>
                      <Input
                        value={editPortfolio}
                        onChange={(e) => setEditPortfolio(e.target.value)}
                        placeholder="https://yourportfolio.dev"
                        className="bg-surface-sunken dark:bg-white/[0.04] text-xs rounded-xl h-8 focus:ring-2 focus:ring-primary/20 border-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-xs rounded-full cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-full shadow-xs cursor-pointer"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
