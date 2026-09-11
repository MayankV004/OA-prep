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
  const [isCustomBucket, setIsCustomBucket] = useState(false);
  const [customBucket, setCustomBucket] = useState('');
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

  const availableBuckets = Array.from(
    new Set([
      ...CATEGORIES,
      ...Object.keys(data?.metrics?.bucketCounts || {}),
    ])
  );

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setUrl('');
    setDifficulty('Medium');
    setBucket(CATEGORIES[0]);
    setIsCustomBucket(false);
    setCustomBucket('');
    setNotes('');
    setTagsInput('');
  };

  const handleOpenEdit = (p: NonStandardProblemRow) => {
    setEditingId(p._id);
    setTitle(p.title);
    setUrl(p.url);
    setDifficulty(p.difficulty);
    if (CATEGORIES.includes(p.bucket)) {
      setBucket(p.bucket);
      setIsCustomBucket(false);
      setCustomBucket('');
    } else {
      setBucket('__custom__');
      setIsCustomBucket(true);
      setCustomBucket(p.bucket);
    }
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
    const finalBucket = isCustomBucket ? customBucket.trim() : bucket;
    if (!finalBucket) {
      toast.error('Bucket name is required');
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
      bucket: finalBucket,
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
            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => handleOpenEdit(row)}
            title="Edit challenge"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-rose-500"
            onClick={() => deleteMutation.mutate(row._id)}
            disabled={deleteMutation.isPending}
            title="Delete challenge"
          >
            <Trash2 className="h-3.5 w-3.5" />
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
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className="h-10 px-4 text-sm font-medium rounded-xl border-border/80 shadow-xs hover:bg-muted"
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', (isRefetching || isLoading) && 'animate-spin')} />
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
                  <Button className="h-10 px-5 text-sm font-semibold rounded-xl shadow-xs gap-2">
                    <Plus className="h-4 w-4" />
                    Add Non-Standard Problem
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-2xl md:max-w-3xl p-6 sm:p-8 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-1.5 pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Layers className="h-5 w-5" />
                    </span>
                    <DialogTitle className="text-xl font-bold tracking-tight">
                      {editingId ? 'Edit Non-Standard Challenge' : 'Add Non-Standard Challenge'}
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Provide challenge metadata and document the non-classical mathematical trick, simulation invariant, or observation required.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 pt-4 text-sm">
                  {/* Problem Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                      Problem Title <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Snowflake OA — Mutual Pursuit Points"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="h-11 text-sm bg-background/50 border-input"
                    />
                  </div>

                  {/* 2-Column: Category Bucket & Difficulty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                        Category Bucket <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={isCustomBucket ? '__custom__' : bucket}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsCustomBucket(true);
                          } else {
                            setIsCustomBucket(false);
                            setBucket(e.target.value);
                          }
                        }}
                        className="w-full h-11 rounded-lg border border-input bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 truncate"
                        required
                      >
                        {availableBuckets.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="__custom__">+ Create New Custom Bucket...</option>
                      </select>
                      {isCustomBucket && (
                        <div className="pt-2">
                          <Input
                            placeholder="Type new bucket name (e.g. Game Theory & Minimax Curveballs)..."
                            value={customBucket}
                            onChange={(e) => setCustomBucket(e.target.value)}
                            required
                            className="h-10 text-sm bg-background/60"
                          />
                          <p className="mt-1 text-xs text-muted-foreground">This bucket will be dynamically created and filterable.</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                        Difficulty Level <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full h-11 rounded-lg border border-input bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Problem Link */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                      Problem Link or Source Reference <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="https://leetcode.com/problems/... or Contest ID / Source URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      className="h-11 text-sm bg-background/50 border-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Direct link where candidates or admins can reference the original question prompt.
                    </p>
                  </div>

                  {/* Why Non-Standard Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                        Why is this Non-Standard? (Key Insight / Invariant)
                      </label>
                      <span className="text-xs text-muted-foreground">Key pedagogical note</span>
                    </div>
                    <textarea
                      placeholder="Explain why standard BFS/DP/Greedy patterns fail, and what mathematical invariant, coordinate transformation, or state machine trick is required..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={5}
                      className="w-full min-h-[130px] rounded-lg border border-input bg-background/50 p-3.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <p className="text-xs text-muted-foreground">
                      This explanation is highlighted for students under the problem solution card to guide their pattern-breaking intuition.
                    </p>
                  </div>

                  {/* Company Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Company / Source Tags
                    </label>
                    <Input
                      placeholder="e.g. Jane Street, Citadel, Snowflake, Optiver, AtCoder"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="h-11 text-sm bg-background/50 border-input"
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated firm names, contests, or platforms.</p>
                  </div>

                  <DialogFooter className="pt-4 mt-6 border-t border-border/40 flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={saveMutation.isPending}
                      className="h-10 px-5 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="h-10 px-6 text-sm font-medium shadow-sm"
                    >
                      {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Challenge' : 'Save Non-Standard Challenge'}
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
            <div className="text-2xl font-bold font-mono">{availableBuckets.length} Buckets</div>
            <p className="mt-1 text-xs text-muted-foreground">Specialized algorithmic domains</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by problem title, why non-standard note, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm rounded-xl"
          />
        </div>

        <select
          value={bucketFilter}
          onChange={(e) => setBucketFilter(e.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm max-w-xs truncate focus:outline-none focus:ring-1 focus:ring-primary/40"
        >
          <option value="all">All Buckets ({availableBuckets.length})</option>
          {availableBuckets.map((c) => (
            <option key={c} value={c}>
              {c.split('/')[0].trim()}
            </option>
          ))}
        </select>

        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
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
