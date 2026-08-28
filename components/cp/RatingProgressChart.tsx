'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TrendingUp, LineChart as LineChartIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ChartPoint {
  date: string;
  codeforces?: number;
  leetcode?: number;
  atcoder?: number;
  codechef?: number;
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--popover)',
  color: 'var(--popover-foreground)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
  fontSize: '12px',
  padding: '10px 14px',
} as const;

export function RatingProgressChart({ data }: { data: ChartPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border border-border/60 bg-surface shadow-e1">
        <CardHeader className="pb-2 border-b border-border/40 bg-surface-sunken/30 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <TrendingUp className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-foreground">Contest Rating Progression</CardTitle>
              <CardDescription className="text-xs text-text-muted">
                Connect your CP profiles in your Profile settings to visualize your rating trajectory across platforms.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-56 flex items-center justify-center p-6">
          <EmptyState
            compact
            icon={LineChartIcon}
            title="No contest rating history yet"
            description="Connect your LeetCode or Codeforces handle in your Profile to import your rating trajectory."
          />
        </CardContent>
      </Card>
    );
  }

  // Extract all ratings to compute dynamic 100-step Y-axis ticks
  const allRatings: number[] = [];
  data.forEach((p) => {
    if (typeof p.codeforces === 'number' && p.codeforces > 0) allRatings.push(p.codeforces);
    if (typeof p.leetcode === 'number' && p.leetcode > 0) allRatings.push(p.leetcode);
    if (typeof p.atcoder === 'number' && p.atcoder > 0) allRatings.push(p.atcoder);
    if (typeof p.codechef === 'number' && p.codechef > 0) allRatings.push(p.codechef);
  });

  const minRating = allRatings.length > 0 ? Math.min(...allRatings) : 1000;
  const maxRating = allRatings.length > 0 ? Math.max(...allRatings) : 2000;

  // Round down min to nearest 100, round up max to nearest 100
  const yMin = Math.max(0, Math.floor((minRating - 50) / 100) * 100);
  const yMax = Math.ceil((maxRating + 50) / 100) * 100;

  const yTicks: number[] = [];
  for (let val = yMin; val <= yMax; val += 100) {
    yTicks.push(val);
  }

  return (
    <Card className="border border-border/60 bg-surface shadow-e2 overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-surface-sunken/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <TrendingUp className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-foreground">Contest Rating Trajectory</CardTitle>
              <CardDescription className="text-xs text-text-muted">
                Chronological rating progression over time across Codeforces, LeetCode, CodeChef, and AtCoder.
              </CardDescription>
            </div>
          </div>
          <span className="text-2xs font-mono text-text-muted px-2.5 py-1 rounded-md bg-surface-sunken border border-border/50">
            {data.length} rated events
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="h-[400px] sm:h-[440px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => {
                  try {
                    return format(parseISO(d), 'MMM yy');
                  } catch {
                    return d;
                  }
                }}
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={32}
              />
              <YAxis
                allowDecimals={false}
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[yMin, yMax]}
                ticks={yTicks}
                width={48}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={(d) => {
                  try {
                    return format(parseISO(d as string), 'MMMM d, yyyy');
                  } catch {
                    return d;
                  }
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="codeforces"
                name="Codeforces"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 5, stroke: 'var(--background)', strokeWidth: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="leetcode"
                name="LeetCode"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f59e0b' }}
                activeDot={{ r: 5, stroke: 'var(--background)', strokeWidth: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="codechef"
                name="CodeChef"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#e11d48' }}
                activeDot={{ r: 5, stroke: 'var(--background)', strokeWidth: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="atcoder"
                name="AtCoder"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#06b6d4' }}
                activeDot={{ r: 5, stroke: 'var(--background)', strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
