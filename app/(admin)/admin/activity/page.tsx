'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Activity, Filter, Clock } from 'lucide-react';

interface ActivityRow {
  _id: string;
  actorId: string;
  targetUserId: string;
  kind: string;
  entity?: { type: string; title?: string };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const KIND_COLORS: Record<string, string> = {
  'problem.completed': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'problem.added': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  'problem.deleted': 'bg-destructive/10 text-destructive',
  'user.signin': 'bg-primary/10 text-primary',
  'user.invite': 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
};

export default function AdminActivityPage() {
  const [kindFilter, setKindFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading } = useQuery<{ data: ActivityRow[] }>({
    queryKey: ['admin', 'activity', kindFilter, from, to],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '100' });
      if (kindFilter) params.set('kind', kindFilter);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/admin/activity?${params}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Activity Log
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform-wide event stream — {rows.length} events loaded
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap p-4 rounded-xl border border-border bg-muted/30">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          placeholder="Filter by kind (e.g. problem.completed)"
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">From</span>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36 h-8 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">To</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36 h-8 text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Event</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="px-4 py-3">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : (
              rows.map((row) => (
                <tr key={row._id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(parseISO(row.createdAt), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-mono ${
                        KIND_COLORS[row.kind] ?? 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {row.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {row.entity ? (
                      <span>
                        <span className="font-medium text-foreground">{row.entity.type}</span>
                        {row.entity.title ? `: ${row.entity.title}` : ''}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono max-w-xs truncate">
                    {row.metadata ? JSON.stringify(row.metadata) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!isLoading && rows.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Activity className="h-8 w-8 mx-auto mb-3 opacity-30" />
            No activity found for selected filters
          </div>
        )}
      </div>
    </div>
  );
}
