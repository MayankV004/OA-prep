'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { SlideOver } from '@/components/admin/SlideOver';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { PageHeading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface Question {
  _id: string;
  question: string;
  subjectId: string;
  difficulty?: string;
  companyTags?: string[];
  tags?: string[];
  createdAt?: string;
}

interface Group {
  _id: string;
  name: string;
  slug: string;
}

function relative(value?: string) {
  if (!value) return '—';
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return '—';
  }
}

/** Difficulty is never colour-only — the label always rides along in the badge. */
function DifficultyBadge({ value }: { value?: string }) {
  const key = (value ?? '').toLowerCase();
  const tone =
    key === 'easy'
      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
      : key === 'medium'
        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
        : key === 'hard'
          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          : 'bg-muted text-muted-foreground';

  return (
    <span className={cn('px-2 py-0.5 rounded-md text-2xs font-semibold uppercase tracking-wider', tone)}>
      {value || 'Medium'}
    </span>
  );
}

export default function AdminQuestionsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [confirming, setConfirming] = useState<Question | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<{
    ids: string[];
    clear: () => void;
  } | null>(null);

  // Form State
  const [formQuestion, setFormQuestion] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [formCompanyTags, setFormCompanyTags] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formKeyPoints, setFormKeyPoints] = useState('');
  const [formAnswer, setFormAnswer] = useState('');

  // Fetch Subject Groups
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups', 'subject'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const subjectMap = new Map(groups.map((g) => [g._id, g.name]));

  // Fetch Questions
  const { data, isLoading, error } = useQuery<{ data: Question[] }>({
    queryKey: ['admin', 'questions', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/content/questions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      return res.json();
    },
  });

  const questions = data?.data || [];

  // Create Question Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: {
      question: string;
      subjectId: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      companyTags: string[];
      tags: string[];
      keyPoints: string[];
      answer: string;
      isSystem: boolean;
    }) => {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || 'Failed to create question');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.add('Question created successfully', { type: 'success' });
      setCreateOpen(false);
      // Reset form
      setFormQuestion('');
      setFormSubjectId('');
      setFormDifficulty('Medium');
      setFormCompanyTags('');
      setFormTags('');
      setFormKeyPoints('');
      setFormAnswer('');
    },
    onError: (err: unknown) => {
      toast.add("Couldn't create question", {
        description: err instanceof Error ? err.message : undefined,
        type: 'error',
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formSubjectId) {
      toast.add('Please enter a question and select a subject', { type: 'error' });
      return;
    }

    const companyTags = formCompanyTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = formTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const keyPoints = formKeyPoints
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    createMutation.mutate({
      question: formQuestion.trim(),
      subjectId: formSubjectId,
      difficulty: formDifficulty,
      companyTags,
      tags,
      keyPoints,
      answer: formAnswer.trim(),
      isSystem: true,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to delete question');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.add('Question deleted', { type: 'success' });
      setConfirming(null);
    },
    onError: (err: unknown) => {
      toast.add("Couldn't delete question", {
        description: err instanceof Error ? err.message : undefined,
        type: 'error',
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(id);
        })
      );
      return {
        succeeded: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
      };
    },
    onSuccess: ({ succeeded, failed }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.add(`${succeeded} deleted, ${failed} failed`, {
        type: failed > 0 ? 'error' : 'success',
      });
      bulkConfirm?.clear();
      setBulkConfirm(null);
    },
    onError: () => {
      toast.add("Couldn't delete the selected questions", { type: 'error' });
    },
  });

  const columns: Column<Question>[] = [
    {
      id: 'question',
      header: 'Question',
      primary: true,
      className: 'max-w-md',
      sortValue: (row) => row.question,
      cell: (row) => (
        <div className="space-y-1 py-1">
          <span
            title={row.question}
            className="line-clamp-2 font-medium text-foreground [overflow-wrap:anywhere]"
          >
            {row.question}
          </span>
          {row.companyTags && row.companyTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {row.companyTags.slice(0, 3).map((comp) => (
                <span
                  key={comp}
                  className="text-3xs font-mono px-1.5 py-0.5 rounded bg-surface-sunken text-muted-foreground border border-border/40"
                >
                  {comp}
                </span>
              ))}
              {row.companyTags.length > 3 && (
                <span className="text-3xs text-muted-foreground">+{row.companyTags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'difficulty',
      header: 'Difficulty',
      sortValue: (row) => row.difficulty ?? 'Medium',
      cell: (row) => <DifficultyBadge value={row.difficulty} />,
    },
    {
      id: 'subjectId',
      header: 'Subject',
      hideBelow: 'lg',
      sortValue: (row) => subjectMap.get(row.subjectId) || row.subjectId,
      cell: (row) => (
        <span className="rounded bg-muted/70 px-2 py-1 font-mono text-xs text-foreground font-medium">
          {subjectMap.get(row.subjectId) || row.subjectId}
        </span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      hideBelow: 'md',
      sortValue: (row) => row.createdAt ?? null,
      cell: (row) => (
        <Text as="span" size="caption" tone="muted" numeric>
          {relative(row.createdAt)}
        </Text>
      ),
    },
  ];

  const addQuestionButton = (
    <Button onClick={() => setCreateOpen(true)}>
      <Plus className="size-4" aria-hidden />
      Add question
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Content"
        title="Interview questions"
        description="Core CS theory and placement interview questions across subjects."
        actions={addQuestionButton}
      />

      <DataTable
        data={questions}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search questions by text…"
        emptyTitle="No questions yet"
        emptyDescription="Interview questions will appear here once seeded or created."
        emptyIcon={MessageSquareText}
        emptyAction={addQuestionButton}
        rowActions={(row) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete question"
            className="size-11 text-text-muted hover:text-destructive md:size-8"
            onClick={() => setConfirming(row)}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        )}
        bulkActions={(ids, clear) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkConfirm({ ids, clear })}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Delete
          </Button>
        )}
        pageSize={15}
      />

      {/* Add Question SlideOver */}
      <SlideOver
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add Curated Question"
        description="Add a placement interview question to the platform bank. Markdown formatting is supported."
        width="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={createMutation.isPending || !formQuestion.trim() || !formSubjectId}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Question'}
            </Button>
          </>
        }
      >
        <form className="space-y-5" onSubmit={handleCreateSubmit}>
          <div className="space-y-2">
            <Label htmlFor="question-body">Question Title *</Label>
            <Textarea
              id="question-body"
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              rows={3}
              required
              placeholder="e.g. Explain how Virtual Memory and Paging work, and what causes Thrashing."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="question-subject">Subject *</Label>
              <select
                id="question-subject"
                value={formSubjectId}
                onChange={(e) => setFormSubjectId(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-border/50 bg-surface-sunken px-3 text-sm text-foreground outline-none focus:border-emerald-500/50"
              >
                <option value="">Select a subject...</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-difficulty">Difficulty</Label>
              <select
                id="question-difficulty"
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as any)}
                className="h-10 w-full rounded-lg border border-border/50 bg-surface-sunken px-3 text-sm text-foreground outline-none focus:border-emerald-500/50"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-tags">Company Tags</Label>
              <Input
                id="company-tags"
                value={formCompanyTags}
                onChange={(e) => setFormCompanyTags(e.target.value)}
                placeholder="e.g. Google, Amazon, Uber"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic-tags">Topic Tags</Label>
              <Input
                id="topic-tags"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g. Memory, Linux, Paging"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key-points">Key Bullets (1 per line for quick flashcard recall)</Label>
            <Textarea
              id="key-points"
              value={formKeyPoints}
              onChange={(e) => setFormKeyPoints(e.target.value)}
              rows={3}
              placeholder="Process has isolated virtual memory space&#10;MMU translates virtual to physical address&#10;Thrashing happens when page fault rate surges"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-answer">Model Answer (Markdown)</Label>
            <Textarea
              id="question-answer"
              value={formAnswer}
              onChange={(e) => setFormAnswer(e.target.value)}
              rows={8}
              placeholder="Structured explanation with architecture trade-offs, diagrams, and examples..."
              className="font-mono text-xs leading-relaxed"
            />
          </div>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        itemName={
          confirming
            ? confirming.question.length > 60
              ? `${confirming.question.slice(0, 60)}…`
              : confirming.question
            : 'this question'
        }
        action="delete"
        pending={deleteMutation.isPending}
        onConfirm={() => confirming && deleteMutation.mutate(confirming._id)}
      />

      <ConfirmDialog
        open={Boolean(bulkConfirm)}
        onOpenChange={(open) => !open && setBulkConfirm(null)}
        itemName={`${bulkConfirm?.ids.length ?? 0} questions`}
        action="delete"
        confirmLabel="Yes, delete all"
        description={`This will permanently delete ${bulkConfirm?.ids.length ?? 0} questions. This action cannot be undone.`}
        pending={bulkDeleteMutation.isPending}
        onConfirm={() => bulkConfirm && bulkDeleteMutation.mutate(bulkConfirm.ids)}
      />
    </div>
  );
}
