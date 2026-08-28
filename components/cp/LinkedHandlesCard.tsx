'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/typography';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Check,
  ExternalLink,
  HelpCircle,
  Info,
  Loader2,
  Plus,
  Trophy,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface UserCpProfileData {
  userId: string;
  codeforces?: {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    avatar?: string;
    lastSyncedAt: string;
  };
  leetcode?: {
    username: string;
    rating: number;
    globalRanking: number;
    topPercentage: number;
    attendedContestsCount: number;
    badge?: string;
    lastSyncedAt: string;
  };
  codechef?: {
    handle: string;
    rating: number;
    stars: string;
    globalRank: number;
    division: string;
    lastSyncedAt: string;
  };
  atcoder?: {
    handle: string;
    rating: number;
    highestRating: number;
    color: string;
    lastSyncedAt: string;
  };
  compositeScore: number;
}

const PLATFORM_CONFIGS = [
  {
    id: 'codeforces' as const,
    name: 'Codeforces',
    placeholder: 'e.g. tourist or codeforces.com/profile/tourist',
    exampleUrl: 'codeforces.com/profile/handle',
    color: 'text-blue-500',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
    url: (h: string) => `https://codeforces.com/profile/${h}`,
  },
  {
    id: 'leetcode' as const,
    name: 'LeetCode',
    placeholder: 'e.g. neal_wu or leetcode.com/u/neal_wu',
    exampleUrl: 'leetcode.com/u/username',
    color: 'text-amber-500',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    url: (h: string) => `https://leetcode.com/${h}`,
  },
  {
    id: 'codechef' as const,
    name: 'CodeChef',
    placeholder: 'e.g. chef_coder or codechef.com/users/chef_coder',
    exampleUrl: 'codechef.com/users/handle',
    color: 'text-rose-500',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
    url: (h: string) => `https://www.codechef.com/users/${h}`,
  },
  {
    id: 'atcoder' as const,
    name: 'AtCoder',
    placeholder: 'e.g. chokudai or atcoder.jp/users/chokudai',
    exampleUrl: 'atcoder.jp/users/handle',
    color: 'text-zinc-400',
    border: 'border-zinc-500/20',
    bg: 'bg-zinc-500/10',
    url: (h: string) => `https://atcoder.jp/users/${h}`,
  },
];

/**
 * Sanitizes input if user pasted a full profile URL
 */
function sanitizeHandleInput(input: string): string {
  let clean = input.trim();
  clean = clean.replace(/\/+$/, ''); // Remove trailing slash
  if (clean.includes('/')) {
    const parts = clean.split('/');
    clean = parts[parts.length - 1]; // Extract last path token
  }
  clean = clean.replace(/^@/, ''); // Remove leading @
  return clean;
}

export function LinkedHandlesCard() {
  const queryClient = useQueryClient();
  const [inputHandles, setInputHandles] = useState<Record<string, string>>({});
  const [activeError, setActiveError] = useState<Record<string, string>>({});
  const [showGuide, setShowGuide] = useState(false);

  const { data, isLoading } = useQuery<{ success: boolean; profile: UserCpProfileData }>({
    queryKey: ['userCpHandles'],
    queryFn: async () => {
      const res = await fetch('/api/cp/handles');
      if (!res.ok) throw new Error('Failed to load handles');
      return res.json();
    },
  });

  const profile = data?.profile;

  // Link mutation
  const linkMutation = useMutation({
    mutationFn: async ({ platform, handle }: { platform: string; handle: string }) => {
      setActiveError((prev) => ({ ...prev, [platform]: '' }));
      const cleanHandle = sanitizeHandleInput(handle);
      const res = await fetch('/api/cp/handles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, handle: cleanHandle }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to verify handle');
      }
      return resData;
    },
    onSuccess: (_, variables) => {
      setInputHandles((prev) => ({ ...prev, [variables.platform]: '' }));
      queryClient.invalidateQueries({ queryKey: ['userCpHandles'] });
      queryClient.invalidateQueries({ queryKey: ['cpPerformance'] });
    },
    onError: (err: Error, variables) => {
      setActiveError((prev) => ({ ...prev, [variables.platform]: err.message }));
    },
  });

  // Unlink mutation
  const unlinkMutation = useMutation({
    mutationFn: async ({ platform }: { platform: string }) => {
      const res = await fetch('/api/cp/handles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      if (!res.ok) throw new Error('Failed to unlink handle');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCpHandles'] });
      queryClient.invalidateQueries({ queryKey: ['cpPerformance'] });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64 rounded-2xl w-full" />;
  }

  return (
    <Card className="border border-border/60 shadow-e1">
      <CardHeader className="pb-3 border-b border-border/40 bg-surface-sunken/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-primary shrink-0" />
            <div>
              <CardTitle className="text-base font-bold">Connected Competitive Coding Profiles</CardTitle>
              <CardDescription className="text-xs">
                Link your public handles to auto-track ratings, past contest performance, and upsolving queues.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGuide((prev) => !prev)}
              className="text-xs gap-1.5 h-8 font-medium border-border/70"
            >
              <HelpCircle className="size-3.5 text-primary" />
              <span>How to Connect?</span>
              {showGuide ? <ChevronUp className="size-3 text-text-muted" /> : <ChevronDown className="size-3 text-text-muted" />}
            </Button>

            {profile?.compositeScore !== undefined && profile.compositeScore > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20">
                <Trophy className="size-3.5 text-primary" />
                <span className="text-xs font-semibold text-text">
                  CP Score: <strong className="text-primary font-mono">{profile.compositeScore}/100</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* ── How to Connect Quick Guide (Collapsible / Expandable) ──────────── */}
        {showGuide && (
          <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-2.5 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-semibold text-text">
              <Info className="size-4 text-primary shrink-0" />
              <span>How to Connect & Find Your Username:</span>
            </div>

            <ol className="space-y-1.5 list-decimal list-inside text-text-muted pl-1">
              <li>
                <strong>No passwords or login required</strong> — All contest rankings and ratings are 100% public.
              </li>
              <li>
                <strong>Find your handle</strong>: Open your profile page on LeetCode, Codeforces, CodeChef, or AtCoder and copy your username (or paste the entire profile URL into the box).
              </li>
              <li>
                Click <strong>&quot;Connect&quot;</strong> — Our system instantly validates the handle with the platform and imports your past contest ratings and history.
              </li>
            </ol>
          </div>
        )}

        {/* ── Platform Grid ─────────────────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2">
          {PLATFORM_CONFIGS.map((cfg) => {
            const dataKey = cfg.id as keyof UserCpProfileData;
            const connectedData = profile?.[dataKey] as any;
            const isConnected = Boolean(connectedData?.handle || connectedData?.username);
            const handleValue = connectedData?.handle || connectedData?.username;
            const isPending =
              linkMutation.isPending && linkMutation.variables?.platform === cfg.id;
            const isUnlinkPending =
              unlinkMutation.isPending && unlinkMutation.variables?.platform === cfg.id;

            return (
              <div
                key={cfg.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-surface transition-all hover:border-border"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-text">{cfg.name}</span>
                      {isConnected ? (
                        <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] py-0 px-1.5 font-mono">
                          <Check className="size-2.5 mr-0.5" /> VERIFIED
                        </Badge>
                      ) : (
                        <Badge className="bg-surface-sunken text-text-subtle border-border/50 text-[10px] py-0 px-1.5">
                          NOT CONNECTED
                        </Badge>
                      )}
                    </div>

                    {isConnected && (
                      <a
                        href={cfg.url(handleValue)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-text"
                        title="View Public Profile"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>

                  {isConnected ? (
                    <div className="space-y-1.5 py-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium text-text">{handleValue}</span>
                        <span className="text-xs font-bold font-mono text-primary">
                          {connectedData.rating > 0 ? `${connectedData.rating} rating` : 'Unrated'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-text-muted">
                        {connectedData.rank && (
                          <span className="capitalize">{connectedData.rank}</span>
                        )}
                        {connectedData.stars && <span>{connectedData.stars}</span>}
                        {connectedData.topPercentage > 0 && (
                          <span>Top {connectedData.topPercentage}%</span>
                        )}
                        {connectedData.maxRating > 0 && (
                          <span className="text-text-subtle font-mono">(Peak: {connectedData.maxRating})</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-1">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder={cfg.placeholder}
                          value={inputHandles[cfg.id] || ''}
                          onChange={(e) =>
                            setInputHandles((prev) => ({ ...prev, [cfg.id]: e.target.value }))
                          }
                          className="h-8 text-xs bg-surface-sunken"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!inputHandles[cfg.id] || isPending}
                          onClick={() =>
                            linkMutation.mutate({
                              platform: cfg.id,
                              handle: inputHandles[cfg.id] || '',
                            })
                          }
                          className="h-8 text-xs shrink-0 font-medium gap-1"
                        >
                          {isPending ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <>
                              <Plus className="size-3" /> Connect
                            </>
                          )}
                        </Button>
                      </div>

                      <span className="text-[10px] text-text-subtle block font-mono">
                        Format: {cfg.exampleUrl}
                      </span>

                      {activeError[cfg.id] && (
                        <Text size="caption" className="text-rose-500 text-[11px]">
                          {activeError[cfg.id]}
                        </Text>
                      )}
                    </div>
                  )}
                </div>

                {isConnected && (
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2">
                    <span className="text-[10px] text-text-subtle font-mono">
                      Synced {connectedData.lastSyncedAt ? new Date(connectedData.lastSyncedAt).toLocaleDateString() : 'recently'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isUnlinkPending}
                      onClick={() => unlinkMutation.mutate({ platform: cfg.id })}
                      className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                    >
                      {isUnlinkPending ? <Loader2 className="size-3 animate-spin" /> : 'Unlink'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
