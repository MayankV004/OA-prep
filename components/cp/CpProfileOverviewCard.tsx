'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/typography';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy,
  ExternalLink,
  Settings,
  Sparkles,
  ArrowRight,
  Award,
} from 'lucide-react';

export interface UserCpProfileData {
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

const PLATFORMS = [
  {
    id: 'codeforces' as const,
    name: 'Codeforces',
    color: 'text-blue-500',
    border: 'border-blue-500/25',
    bg: 'bg-blue-500/10',
    url: (h: string) => `https://codeforces.com/profile/${h}`,
  },
  {
    id: 'leetcode' as const,
    name: 'LeetCode',
    color: 'text-amber-500',
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/10',
    url: (h: string) => `https://leetcode.com/${h}`,
  },
  {
    id: 'codechef' as const,
    name: 'CodeChef',
    color: 'text-rose-500',
    border: 'border-rose-500/25',
    bg: 'bg-rose-500/10',
    url: (h: string) => `https://www.codechef.com/users/${h}`,
  },
  {
    id: 'atcoder' as const,
    name: 'AtCoder',
    color: 'text-cyan-500',
    border: 'border-cyan-500/25',
    bg: 'bg-cyan-500/10',
    url: (h: string) => `https://atcoder.jp/users/${h}`,
  },
];

export function CpProfileOverviewCard({
  profile,
  isLoading,
}: {
  profile?: UserCpProfileData;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-44 w-full rounded-2xl" />;
  }

  const hasAnyConnected = Boolean(
    profile?.codeforces?.handle ||
      profile?.leetcode?.username ||
      profile?.codechef?.handle ||
      profile?.atcoder?.handle
  );

  return (
    <Card className="overflow-hidden border border-border/60 bg-gradient-to-b from-surface to-surface-sunken/40 shadow-e2">
      <CardHeader className="border-b border-border/40 bg-surface-sunken/30 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Trophy className="size-4.5" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Verified Coding Profiles & Ratings</span>
              </CardTitle>
              <CardDescription className="text-xs text-text-muted">
                Aggregated ratings and contest standings across active competitive programming handles.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {profile?.compositeScore !== undefined && profile.compositeScore > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Sparkles className="size-3.5 text-rose-500" />
                <span className="text-xs font-semibold text-foreground">
                  Score: <strong className="text-rose-500 font-mono">{profile.compositeScore}/100</strong>
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              render={<Link href="/profile" />}
              className="text-xs gap-1.5 h-8 font-medium border-border/70 hover:border-rose-500/40 hover:bg-rose-500/5"
            >
              <Settings className="size-3.5 text-rose-500" />
              <span>Manage in Profile</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!hasAnyConnected ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-dashed border-rose-500/30 bg-rose-500/5">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-semibold text-sm text-foreground flex items-center justify-center sm:justify-start gap-2">
                <Award className="size-4 text-rose-500" />
                <span>No coding handles connected yet</span>
              </span>
              <Text size="caption" tone="muted" className="text-xs max-w-md">
                Connect your LeetCode, Codeforces, CodeChef, and AtCoder handles in your Profile to automatically import your contest rating graph and upsolving logs.
              </Text>
            </div>

            <Button
              size="sm"
              render={<Link href="/profile" />}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs gap-1.5 shrink-0 shadow-sm"
            >
              <span>Connect Handles</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORMS.map((plat) => {
              const dataKey = plat.id as keyof UserCpProfileData;
              const data = profile?.[dataKey] as any;
              const isConnected = Boolean(data?.handle || data?.username);
              const handle = data?.handle || data?.username;

              return (
                <div
                  key={plat.id}
                  className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
                    isConnected
                      ? 'bg-surface border-border/70 hover:border-border hover:shadow-e1'
                      : 'bg-surface-sunken/40 border-border/40 opacity-70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-foreground">{plat.name}</span>
                      {isConnected ? (
                        <a
                          href={plat.url(handle)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-muted hover:text-rose-500 transition-colors"
                          title="View Public Profile"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-text-subtle font-mono">Not linked</span>
                      )}
                    </div>

                    {isConnected ? (
                      <div>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono text-xs font-bold text-foreground truncate max-w-[120px]">
                            {handle}
                          </span>
                          <span className="font-mono text-sm font-extrabold text-rose-500">
                            {data.rating > 0 ? data.rating : 'Unrated'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-1 flex-wrap">
                          {data.rank && <span className="capitalize">{data.rank}</span>}
                          {data.stars && <span>{data.stars}</span>}
                          {data.topPercentage > 0 && <span>Top {data.topPercentage}%</span>}
                          {data.maxRating > 0 && (
                            <span className="text-text-subtle font-mono">(Peak {data.maxRating})</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500 hover:underline"
                        >
                          <span>Connect in Profile</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
