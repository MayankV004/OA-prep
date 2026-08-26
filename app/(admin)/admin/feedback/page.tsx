'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  Bug,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeading, Text, Metric } from '@/components/ui/typography';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FeedbackItemDTO as FeedbackItem, FeedbackStats } from '@/types/feedback';

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="space-y-0.5">
        <Text size="micro" tone="muted" weight="medium" className="uppercase tracking-[0.08em]">
          {label}
        </Text>
        <Metric className="text-xl sm:text-2xl">{value}</Metric>
        {sub ? (
          <Text size="micro" tone="muted">
            {sub}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState<string>('resolved');

  const { data, isLoading, refetch, isRefetching } = useQuery<{
    items: FeedbackItem[];
    stats: {
      total: number;
      pendingCount: number;
      bugCount: number;
      feedbackCount: number;
    };
  }>({
    queryKey: ['admin', 'feedback', typeFilter, statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '100' });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/feedback?${params}`);
      if (!res.ok) throw new Error('Failed to fetch feedback reports');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: string;
      adminNotes?: string;
    }) => {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || 'Failed to update feedback');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.add('Feedback updated!', { type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
      setSelectedItem(null);
    },
    onError: (err: any) => {
      toast.add('Update failed', {
        description: err.message || 'Please try again',
        type: 'error',
      });
    },
  });

  const items = data?.items || [];
  const stats = data?.stats || {
    total: 0,
    pendingCount: 0,
    bugCount: 0,
    feedbackCount: 0,
  };

  const handleOpenDetail = (item: FeedbackItem) => {
    setSelectedItem(item);
    setAdminNotes(item.adminNotes || '');
    setUpdateStatus(item.status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 gap-1">
            <Clock className="size-3" /> Pending
          </Badge>
        );
      case 'in_review':
        return (
          <Badge variant="outline" className="border-blue-500/40 text-blue-500 bg-blue-500/10 gap-1">
            <RefreshCw className="size-3" /> In Review
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 gap-1">
            <CheckCircle2 className="size-3" /> Resolved
          </Badge>
        );
      case 'dismissed':
        return (
          <Badge variant="outline" className="border-slate-500/40 text-slate-400 bg-slate-500/10 gap-1">
            <XCircle className="size-3" /> Dismissed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-red-500/40 text-red-500 bg-red-500/10">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-slate-500/40 text-slate-400">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="animate-in-fade space-y-6">
      <PageHeading
        overline="Admin"
        title="Feedback & Bug Reports"
        description="Review and respond to user bug reports, feature suggestions, and general feedback."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Reports" value={stats.total} sub="all-time submissions" />
        <SummaryCard label="Pending Action" value={stats.pendingCount} sub="requires review" />
        <SummaryCard label="Bugs Reported" value={stats.bugCount} sub="technical issues" />
        <SummaryCard label="Feedback" value={stats.feedbackCount} sub="suggestions & ideas" />
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/60">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, description, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50 text-xs">
            <Filter className="size-3.5 text-muted-foreground ml-1.5" />
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'all' ? 'bg-background font-semibold text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('bug')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${typeFilter === 'bug' ? 'bg-background font-semibold text-rose-600 dark:text-rose-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Bug className="size-3" /> Bugs
            </button>
            <button
              onClick={() => setTypeFilter('feedback')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${typeFilter === 'feedback' ? 'bg-background font-semibold text-blue-600 dark:text-blue-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <MessageSquare className="size-3" /> Feedback
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-background border border-input text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading submissions...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center space-y-2 rounded-2xl border border-dashed border-border/80 p-8">
          <MessageSquare className="size-8 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No reports found</h3>
          <p className="text-xs text-muted-foreground">No bug reports or feedback match the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isBug = item.type === 'bug';
            return (
              <div
                key={item._id}
                onClick={() => handleOpenDetail(item)}
                className="p-4 rounded-xl border border-border/60 bg-card hover:border-rose-500/40 transition-all cursor-pointer space-y-2 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isBug ? (
                      <Badge variant="outline" className="border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10 gap-1 text-2xs">
                        <Bug className="size-3" /> BUG
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 gap-1 text-2xs">
                        <MessageSquare className="size-3" /> FEEDBACK
                      </Badge>
                    )}

                    {getSeverityBadge(item.severity)}
                    {getStatusBadge(item.status)}

                    {item.category && (
                      <span className="text-2xs text-muted-foreground uppercase tracking-wider font-mono">
                        [{item.category}]
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <h4 className="text-base font-display font-semibold text-foreground leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-2xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {item.name ? `${item.name} (${item.email})` : item.email}
                    </span>
                  </div>

                  {item.pageUrl && (
                    <span className="truncate max-w-xs text-rose-500 dark:text-rose-400 hover:underline">
                      {item.pageUrl}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail & Action Modal */}
      {selectedItem && (
        <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="sm:max-w-xl border-border/60 bg-background p-6 rounded-2xl">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                {selectedItem.type === 'bug' ? (
                  <Badge variant="outline" className="border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10 gap-1">
                    <Bug className="size-3.5" /> BUG REPORT
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 gap-1">
                    <MessageSquare className="size-3.5" /> FEEDBACK
                  </Badge>
                )}
                {getSeverityBadge(selectedItem.severity)}
                {getStatusBadge(selectedItem.status)}
              </div>

              <DialogTitle className="text-xl font-display font-bold text-foreground">
                {selectedItem.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Submitted by {selectedItem.name || 'User'} ({selectedItem.email}) on{' '}
                {new Date(selectedItem.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs sm:text-sm">
              {/* Detailed Description */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Description
                </span>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              {/* Context Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedItem.pageUrl && (
                  <div className="p-2.5 rounded-lg bg-card border border-border/50">
                    <span className="text-2xs text-muted-foreground block">Page URL</span>
                    <a
                      href={selectedItem.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-500 hover:underline flex items-center gap-1 font-mono text-2xs truncate"
                    >
                      {selectedItem.pageUrl} <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </div>
                )}

                {selectedItem.category && (
                  <div className="p-2.5 rounded-lg bg-card border border-border/50">
                    <span className="text-2xs text-muted-foreground block">Category</span>
                    <span className="font-semibold text-foreground uppercase">{selectedItem.category}</span>
                  </div>
                )}
              </div>

              {selectedItem.userAgent && (
                <div className="p-2.5 rounded-lg bg-card border border-border/50 text-2xs text-muted-foreground font-mono truncate">
                  User-Agent: {selectedItem.userAgent}
                </div>
              )}

              {/* Admin Actions */}
              <div className="pt-3 border-t border-border/60 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Update Report Status</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-background border border-input text-xs font-medium text-foreground focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Admin Resolution Notes</Label>
                    <Textarea
                      rows={3}
                      placeholder="Add notes about actions taken or bug fix commit hashes..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    loading={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: selectedItem._id,
                        status: updateStatus,
                        adminNotes,
                      })
                    }
                    className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
