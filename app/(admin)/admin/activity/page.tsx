'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Activity } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Metric, PageHeading, Text } from '@/components/ui/typography';
import { DataTable, type Column } from '@/components/admin/DataTable';

interface ActivityRow {
  _id: string;
  actorId: string;
  targetUserId: string;
  kind: string;
  entity?: { type: string; title?: string };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Tone is a scanning aid only — the badge always carries the literal event
 * kind as its label, so nothing here is communicated by colour alone.
 */
const KIND_TONES: { match: (kind: string) => boolean; className: string }[] = [
  { match: (k) => k.endsWith('.completed'), className: 'bg-success-muted text-success' },
  { match: (k) => k.endsWith('.deleted') || k.endsWith('.removed'), className: 'bg-danger-muted text-destructive' },
  { match: (k) => k.endsWith('.added') || k.endsWith('.created'), className: 'bg-info-muted text-info' },
  { match: (k) => k.startsWith('user.'), className: 'bg-accent text-accent-foreground' },
];

function kindClassName(kind: string) {
  return KIND_TONES.find((t) => t.match(kind))?.className ?? 'bg-muted text-text-secondary';
}

function FilterField({
  label,
  ...props
}: React.ComponentProps<typeof Input> & { label: string }) {
  return (
    <label className="flex items-center gap-2">
      <Text size="micro" tone="muted" as="span" weight="medium">
        {label}
      </Text>
      <Input className="h-11 w-36 sm:h-9" {...props} />
    </label>
  );
}

export default function AdminActivityPage() {
  const [kindFilter, setKindFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading, error } = useQuery<{ data: ActivityRow[] }>({
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
  const distinctKinds = new Set(rows.map((row) => row.kind)).size;
  const hasDateFilter = Boolean(from || to);

  const columns: Column<ActivityRow>[] = [
    {
      id: 'kind',
      header: 'Event',
      primary: true,
      sortValue: (row) => row.kind,
      cell: (row) => (
        <Badge
          variant="secondary"
          className={cn('font-mono', kindClassName(row.kind))}
        >
          {row.kind}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Time',
      sortValue: (row) => row.createdAt ?? null,
      cell: (row) =>
        row.createdAt ? (
          <span
            title={format(parseISO(row.createdAt), 'PPpp')}
            className="whitespace-nowrap"
          >
            <Text size="caption" tone="muted" as="span" numeric>
              {formatDistanceToNow(parseISO(row.createdAt), { addSuffix: true })}
            </Text>
          </span>
        ) : (
          <Text size="caption" tone="muted" as="span">
            —
          </Text>
        ),
    },
    {
      id: 'entity',
      header: 'Entity',
      hideBelow: 'md',
      sortValue: (row) => row.entity?.type ?? null,
      cell: (row) =>
        row.entity ? (
          <span className="block min-w-0">
            <Text as="span" size="caption" tone="primary" weight="medium" className="block">
              {row.entity.type}
            </Text>
            {row.entity.title ? (
              <Text as="span" size="caption" tone="muted" className="block truncate">
                {row.entity.title}
              </Text>
            ) : null}
          </span>
        ) : (
          <Text size="caption" tone="muted" as="span">
            —
          </Text>
        ),
    },
    {
      id: 'actorId',
      header: 'Actor',
      hideBelow: 'lg',
      sortValue: (row) => row.actorId ?? null,
      cell: (row) => (
        <Text size="micro" tone="muted" as="span" className="font-mono">
          {row.actorId ? `${row.actorId.slice(-8)}` : '—'}
        </Text>
      ),
    },
    {
      id: 'metadata',
      header: 'Metadata',
      hideBelow: 'lg',
      className: 'max-w-xs',
      cell: (row) =>
        row.metadata ? (
          <Text
            size="micro"
            tone="muted"
            as="span"
            className="block truncate font-mono"
            title={JSON.stringify(row.metadata)}
          >
            {JSON.stringify(row.metadata)}
          </Text>
        ) : (
          <Text size="micro" tone="muted" as="span">
            —
          </Text>
        ),
    },
  ];

  return (
    <div className="animate-in-fade space-y-6">
      <PageHeading
        overline="Admin"
        title="Activity log"
        description="Platform-wide event stream. Filter by event kind or date range, then sort any column."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card size="sm">
          <CardContent className="space-y-0.5">
            <Text size="micro" tone="muted" weight="medium" className="uppercase tracking-[0.08em]">
              Events loaded
            </Text>
            <Metric className="text-xl sm:text-2xl">{rows.length}</Metric>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="space-y-0.5">
            <Text size="micro" tone="muted" weight="medium" className="uppercase tracking-[0.08em]">
              Distinct kinds
            </Text>
            <Metric className="text-xl sm:text-2xl">{distinctKinds}</Metric>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        error={error}
        search={kindFilter}
        onSearchChange={setKindFilter}
        searchPlaceholder="Filter by kind, e.g. problem.completed"
        emptyTitle="No activity yet"
        emptyDescription="Events appear here as people use the platform."
        emptyIcon={Activity}
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <FilterField
              label="From"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
            <FilterField
              label="To"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
            {hasDateFilter ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-11 sm:h-7"
                onClick={() => {
                  setFrom('');
                  setTo('');
                }}
              >
                Clear dates
              </Button>
            ) : null}
          </div>
        }
        pageSize={20}
      />
    </div>
  );
}
