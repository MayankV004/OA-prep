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
  difficulty: string;
  createdAt: string;
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
      ? 'bg-success-muted text-success'
      : key === 'medium'
        ? 'bg-warning-muted text-warning'
        : key === 'hard'
          ? 'bg-danger-muted text-destructive'
          : 'bg-muted text-text-secondary';

  return (
    <Badge variant="secondary" className={cn('capitalize', tone)}>
      {value || 'Unrated'}
    </Badge>
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

  const { data, isLoading, error } = useQuery<{ data: Question[] }>({
    queryKey: ['admin', 'questions', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/content/questions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const questions = data?.data || [];

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

  // TODO: backend — bulk endpoint would replace this client-side loop
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
        <span
          title={row.question}
          className="line-clamp-2 font-medium text-foreground [overflow-wrap:anywhere]"
        >
          {row.question}
        </span>
      ),
    },
    {
      id: 'difficulty',
      header: 'Difficulty',
      sortValue: (row) => row.difficulty,
      cell: (row) => <DifficultyBadge value={row.difficulty} />,
    },
    {
      id: 'subjectId',
      header: 'Subject',
      hideBelow: 'lg',
      sortValue: (row) => row.subjectId,
      cell: (row) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-2xs text-text-secondary">
          {row.subjectId}
        </code>
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

  // Previously a dead control — now it opens the (submit-disabled) create panel.
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
        description="Theory and behavioural questions served across all subjects."
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
        searchPlaceholder="Search questions…"
        emptyTitle="No questions yet"
        emptyDescription="Interview questions will appear here once they exist."
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

      {/* TODO: backend — POST endpoint needed before this form can submit */}
      <SlideOver
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add question"
        description="Form is ready — the create endpoint is not."
        width="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled>Add question</Button>
          </>
        }
      >
        <form
          className="space-y-5"
          onSubmit={(e) => {
            // TODO: backend — POST endpoint needed before this form can submit
            e.preventDefault();
          }}
        >
          <div className="rounded-lg bg-warning-muted p-3">
            <Text size="caption" className="text-warning">
              Saving is disabled: there is no <code className="font-mono">POST</code>{' '}
              /api/questions endpoint yet. The fields below are wired to local state only.
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-body">Question</Label>
            <Textarea
              id="question-body"
              name="question"
              rows={4}
              placeholder="e.g. Explain the difference between a process and a thread."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="question-subject">Subject ID</Label>
              <Input id="question-subject" name="subjectId" placeholder="e.g. operating-systems" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-difficulty">Difficulty</Label>
              <select
                id="question-difficulty"
                name="difficulty"
                defaultValue="Medium"
                className="h-9 w-full rounded-lg bg-surface-sunken px-3 text-sm text-foreground outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-answer">Model answer</Label>
            <Textarea
              id="question-answer"
              name="answer"
              rows={6}
              placeholder="Optional reference answer…"
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
