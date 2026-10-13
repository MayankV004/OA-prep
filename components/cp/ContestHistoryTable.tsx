'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ExternalLink, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export interface ContestHistoryRecord {
  _id?: string;
  platform: 'codeforces' | 'leetcode' | 'codechef' | 'atcoder';
  contestId: string;
  contestName: string;
  contestUrl: string;
  contestDate: string | Date;
  rank: number;
  totalParticipants?: number;
  problemsSolved?: number;
  totalProblems?: number;
  oldRating: number;
  newRating: number;
  ratingDelta: number;
}

const PLATFORM_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  codeforces: { label: 'Codeforces', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/25' },
  leetcode: { label: 'LeetCode', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/25' },
  codechef: { label: 'CodeChef', bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/25' },
  atcoder: { label: 'AtCoder', bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/25' },
};

export function ContestHistoryTable({ contests }: { contests: ContestHistoryRecord[] }) {
  const [displayCount, setDisplayCount] = useState(10);

  if (!contests || contests.length === 0) {
    return null;
  }

  const visibleContests = contests.slice(0, displayCount);

  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-xs rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <History className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-foreground">Past Contest Performance Log</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Historical record of participated contests, rank standings, and rating deltas.
              </CardDescription>
            </div>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground px-2.5 py-1 rounded-lg bg-muted/60 border border-border/50 self-start sm:self-center">
            {contests.length} Contests Logged
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/50 bg-muted/30 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Platform</th>
                <th className="py-3 px-5">Contest</th>
                <th className="py-3 px-5">Rank</th>
                <th className="py-3 px-5">Solved</th>
                <th className="py-3 px-5">Rating</th>
                <th className="py-3 px-5 text-right">Rating Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {visibleContests.map((c, i) => {
                const style = PLATFORM_STYLES[c.platform] || {
                  label: c.platform,
                  bg: 'bg-muted',
                  text: 'text-foreground',
                  border: 'border-border',
                };

                let formattedDate = 'Recently';
                try {
                  const d = typeof c.contestDate === 'string' ? parseISO(c.contestDate) : c.contestDate;
                  formattedDate = format(d, 'MMM d, yyyy');
                } catch {
                  formattedDate = String(c.contestDate);
                }

                const isPositive = c.ratingDelta > 0;
                const isNegative = c.ratingDelta < 0;

                return (
                  <tr key={c._id || `${c.platform}-${c.contestId}-${i}`} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-muted-foreground whitespace-nowrap">
                      {formattedDate}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold font-mono border ${style.bg} ${style.text} ${style.border}`}>
                        {style.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-medium text-foreground max-w-sm">
                      <a
                        href={c.contestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline inline-flex items-center gap-1.5 line-clamp-1 transition-colors cursor-pointer"
                      >
                        <span>{c.contestName}</span>
                        <ExternalLink className="size-3 text-muted-foreground/70 shrink-0" />
                      </a>
                    </td>

                    <td className="py-3.5 px-5 font-mono font-semibold text-foreground whitespace-nowrap">
                      #{c.rank.toLocaleString()}
                      {c.totalParticipants ? (
                        <span className="text-muted-foreground text-[10px] font-normal"> / {c.totalParticipants.toLocaleString()}</span>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-5 font-mono whitespace-nowrap">
                      {c.problemsSolved !== undefined ? (
                        <span className="text-foreground font-medium">
                          {c.problemsSolved} / {c.totalProblems || 4}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 font-mono font-bold text-foreground whitespace-nowrap">
                      {c.newRating > 0 ? c.newRating : '-'}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-right whitespace-nowrap">
                      {isPositive ? (
                        <span className="inline-flex items-center text-emerald-500 font-bold">
                          <ArrowUpRight className="size-3.5 mr-0.5" />+{c.ratingDelta}
                        </span>
                      ) : isNegative ? (
                        <span className="inline-flex items-center text-rose-500 font-bold">
                          <ArrowDownRight className="size-3.5 mr-0.5" />{c.ratingDelta}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-muted-foreground">
                          <Minus className="size-3.5 mr-0.5" />0
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {contests.length > displayCount && (
          <div className="p-3.5 text-center border-t border-border/40 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDisplayCount((prev) => prev + 15)}
              className="text-xs font-semibold text-primary hover:text-primary-hover hover:bg-primary/10 rounded-xl cursor-pointer"
            >
              Show More Contests ({contests.length - displayCount} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
