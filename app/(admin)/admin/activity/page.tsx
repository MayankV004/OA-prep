'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Activity, Filter } from 'lucide-react';

interface ActivityRow {
  _id: string;
  actorId: string;
  targetUserId: string;
  kind: string;
  entity?: { type: string; title?: string };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

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
      <h1 className="text-2xl font-bold">Activity Log</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Filter by kind (e.g. problem.completed)"
          value={kindFilter}
          onChange={e => setKindFilter(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
        <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40 h-8 text-sm" />
        <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40 h-8 text-sm" />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Time</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Kind</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Entity</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Metadata</th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border/50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-5 bg-muted animate-pulse rounded" /></td></tr>
              ))
            ) : rows.map(row => (
              <tr key={row._id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(parseISO(row.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.kind}</code>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.entity ? `${row.entity.type}: ${row.entity.title ?? row.entity.type}` : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono max-w-xs truncate">
                  {row.metadata ? JSON.stringify(row.metadata) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && rows.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">No activity found</div>
        )}
      </div>
    </div>
  );
}
