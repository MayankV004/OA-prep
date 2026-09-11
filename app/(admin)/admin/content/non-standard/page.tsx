'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  Compass,
  Lightbulb,
  Trophy,
  Puzzle,
  Boxes,
  Network,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeading, Text } from '@/components/ui/typography';
import { DataTable, type Column } from '@/components/admin/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const CATEGORIES = [
  'Ad-hoc / Simulation / State-Machine (no fixed algorithm)',
  'Geometry & Physical-Simulation Problems',
  'Math-Insight / \'Single Trick Observation\' Problems',
  'Contest Q3/Q4 Problems Needing Rare Techniques',
  'Puzzle-Style Problems (Quant Firms: Jane Street, Optiver, Akuna, DE Shaw, Citadel)',
  'Design / Data-Structure Problems With No Standard Blueprint',
  'Graph & Union-Find Curveballs',
  'String / Parsing Edge-Case Problems',
  'Number Theory & Combinatorics Curveballs',
];

interface NonStandardProblemRow {
  _id: string;
  title: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bucket: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export default function AdminNonStandardPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [bucketFilter, setBucketFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [bucket, setBucket] = useState(CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin-non-standard', search, bucketFilter, diffFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (bucketFilter !== 'all') params.set('bucket', bucketFilter);
      if (diffFilter !== 'all') params.set('difficulty', diffFilter);
      const res = await fetch(`/api/admin/content/non-standard?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch non-standard problems');
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const isEdit = Boolean(editingId);
      const res = await fetch('/api/admin/content/non-standard', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingId, ...payload } : payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save problem');
      return json;
    },
    onSuccess: () => {
      toast.success(editingId ? 'Problem updated' : 'Non-standard problem added');
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-non-standard'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Save failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/content/non-standard?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete problem');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Problem removed');
      queryClient.invalidateQueries({ queryKey: ['admin-non-standard'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Delete failed');
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setUrl('');
    setDifficulty('Medium');
    setBucket(CATEGORIES[0]);
    setNotes('');
    setTagsInput('');
  };

  const handleOpenEdit = (p: NonStandardProblemRow) => {
    setEditingId(p._id);
    setTitle(p.title);
    setUrl(p.url);
    setDifficulty(p.difficulty);
    setBucket(p.bucket);
    setNotes(p.notes || '');
    setTagsInput((p.tags || []).join(', '));
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    saveMutation.mutate({
      title: title.trim(),
      url: url.trim(),
      difficulty,
      bucket,
      notes: notes.trim(),
      tags,
    });
  };

  const problems: NonStandardProblemRow[] = data?.problems || [];
  const metrics = data?.metrics;

  const columns: Column<NonStandardProblemRow>[] = [
    {
      id: 'title',
      header: 'Problem Title',
      cell: (row) => (
        <div className="flex items-center gap-2 max-w-sm">
          <span className="font-semibold text-xs text-foreground truncate" title={row.title}>
            {row.title}
          </span>
          {row.url && (
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors shrink-0"
              title="Open problem link"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      id: 'bucket',
      header: 'Non-Standard Bucket',
      cell: (row) => (
        <Badge variant="outline" className="text-[10px] truncate max-w-[220px] font-normal" title={row.bucket}>
          {row.bucket.split('/')[0].trim()}
        </Badge>
      ),
    },
    {
      id: 'difficulty',
      header: 'Difficulty',
      cell: (row) => {
        const variants: Record<string, string> = {
          Easy: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
          Medium: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
          Hard: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
        };
        return (
          <Badge variant="outline" className={cn('text-[10px] uppercase font-mono', variants[row.difficulty])}>
            {row.difficulty}
          </Badge>
        );
      },
    },
    {
      id: 'why',
      header: 'Why Non-Standard / Insight',
      cell: (row) => (
        <span className="text-[11px] text-muted-foreground truncate max-w-[260px] block" title={row.notes}>
          {row.notes || '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => handleOpenEdit(row)}
            title="Edit challenge"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
            onClick={() => deleteMutation.mutate(row._id)}
            disabled={deleteMutation.isPending}
            title="Delete challenge"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeading
        title="Non-Standard DSA Challenges"
        description="Curate and manage tricky OA curveballs, quant puzzles, and single-trick observation problems that defy classical patterns."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
            >
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', (isRefetching || isLoading) && 'animate-spin')} />
              Refresh
            </Button>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger
                render={
                  <Button size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Non-Standard Problem
                  </Button>
                }
              />
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Non-Standard Challenge' : 'Add Non-Standard Challenge'}</DialogTitle>
                  <DialogDescription>
                    Provide the problem metadata and the specific insight or observation that makes it non-standard.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium">Problem Title</label>
                    <Input
                      placeholder="e.g. Snowflake OA — Mutual Pursuit Points"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-medium">Category Bucket</label>
                      <select
                        value={bucket}
                        onChange={(e) => setBucket(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs truncate"
                        required
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium">Difficulty Level</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium">Problem Link (LeetCode, Codeforces, etc.)</label>
                    <Input
                      placeholder="https://leetcode.com/problems/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium">Why is this Non-Standard? (Key Insight / Trick)</label>
                    <textarea
                      placeholder="Explain the unique mental model, simulation invariant, or mathematical observation..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-20 rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium">Company / Source Tags (Comma-separated)</label>
                    <Input
                      placeholder="e.g. Citadel, Snowflake, Jane Street, AtCoder"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={saveMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Challenge' : 'Add Challenge'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Total Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{metrics?.total ?? problems.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">Curated non-standard problems</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Puzzle className="h-4 w-4 text-amber-500" />
              Quant Firm Puzzles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {metrics?.bucketCounts?.[
                'Puzzle-Style Problems (Quant Firms: Jane Street, Optiver, Akuna, DE Shaw, Citadel)'
              ] ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Jane Street, Citadel, Optiver</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-rose-500" />
              Hard OA Curveballs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {metrics?.difficultyCounts?.Hard ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics?.total
                ? Math.round(((metrics?.difficultyCounts?.Hard || 0) / metrics.total) * 100)
                : 0}
              % hard difficulty mix
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Boxes className="h-4 w-4 text-blue-500" />
              Category Buckets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">9 Buckets</div>
            <p className="mt-1 text-xs text-muted-foreground">Specialized algorithmic domains</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by problem title, why non-standard note, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <select
          value={bucketFilter}
          onChange={(e) => setBucketFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs max-w-xs truncate"
        >
          <option value="all">All 9 Buckets</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.split('/')[0].trim()}
            </option>
          ))}
        </select>

        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={problems}
        getRowId={(row) => row._id}
        loading={isLoading}
        emptyTitle="No non-standard problems found"
        emptyDescription="Try adjusting your search criteria or add a new challenge."
        exportable
        exportFilename="bigo_non_standard_problems"
        columnVisibility
        pageSize={20}
      />
    </div>
  );
}
