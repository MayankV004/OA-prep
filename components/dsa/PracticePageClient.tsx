'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ExternalLink,
  Check,
  Star,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Save,
  StickyNote,
  Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/typography';

interface Problem {
  _id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: string;
  link: string;
  priority?: string;
  company_tags?: string[];
}

interface PracticePageClientProps {
  problems: Problem[];
  patternTitle: string;
  variationTitle: string;
}

/* ── Difficulty colour tokens ───────────────────────────────────────────── */
const DIFF_STYLE = {
  Easy: 'bg-success-muted text-success border border-success/20',
  Medium: 'bg-warning-muted text-warning border border-warning/20',
  Hard: 'bg-destructive/10 text-destructive border border-destructive/20',
} as const;

/* ── Individual problem row ─────────────────────────────────────────────── */
function ProblemRow({
  problem,
  index,
  completed,
  revision,
  userNotes,
  onToggleComplete,
  onToggleRevision,
  onSaveNotes,
}: {
  problem: Problem;
  index: number;
  completed: boolean;
  revision: boolean;
  userNotes: string;
  onToggleComplete: (id: string, val: boolean) => void;
  onToggleRevision: (id: string, val: boolean) => void;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(userNotes);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveNotes(problem._id, draft);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenNotes = () => {
    setNotesOpen((o) => !o);
    if (!notesOpen) {
      setDraft(userNotes); // sync draft when opening
    }
  };

  return (
    <li className={cn(
      'group transition-colors duration-150',
      completed ? 'opacity-70' : '',
      notesOpen ? 'bg-card rounded-xl shadow-e1 mb-2' : 'border-b border-divider last:border-0'
    )}>
      {/* Main row */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4',
        !notesOpen && 'hover:bg-accent/40'
      )}>
        {/* Index */}
        <span className="w-6 shrink-0 text-center text-xs font-medium tabular-nums text-text-muted">
          {index + 1}
        </span>

        {/* Completion toggle */}
        <button
          type="button"
          onClick={() => onToggleComplete(problem._id, !completed)}
          aria-pressed={completed}
          aria-label={`Mark ${problem.name} as ${completed ? 'incomplete' : 'complete'}`}
          className="press grid size-8 shrink-0 place-items-center rounded-full outline-none"
        >
          <span
            aria-hidden
            className={cn(
              'grid size-6 place-items-center rounded-full border-2 transition-all duration-200',
              completed
                ? 'border-rose-500 bg-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]'
                : 'border-muted-foreground/30 bg-transparent text-transparent group-hover:border-rose-500/50'
            )}
          >
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        </button>

        {/* Problem name + link */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <Link
            href={problem.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group/link inline-flex min-w-0 items-center gap-1.5 text-sm font-medium transition-colors duration-150 hover:text-primary',
              completed ? 'text-text-muted line-through decoration-text-muted/50' : 'text-foreground'
            )}
          >
            <span className="truncate">{problem.name}</span>
            <ExternalLink
              aria-hidden
              className="size-3 shrink-0 opacity-0 transition-opacity duration-150 group-hover/link:opacity-100"
            />
          </Link>

          <div className="flex items-center gap-1.5">
            {problem.platform && (
              <span className="text-2xs font-semibold uppercase tracking-widest text-text-muted">
                {problem.platform}
              </span>
            )}
            {problem.company_tags && problem.company_tags.length > 0 && (
              <div className="hidden items-center gap-1 sm:flex">
                {problem.company_tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="ghost" className="h-4 max-w-[72px] truncate px-1 text-2xs bg-muted text-text-secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right-side controls */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Difficulty badge */}
          <Badge
            variant="secondary"
            className={cn('text-xs font-semibold', DIFF_STYLE[problem.difficulty] || 'bg-muted text-text-muted')}
          >
            {problem.difficulty}
          </Badge>

          {/* Revision star */}
          <button
            type="button"
            onClick={() => onToggleRevision(problem._id, !revision)}
            aria-pressed={revision}
            aria-label={revision ? 'Remove from revision' : 'Mark for revision'}
            className="press grid size-8 shrink-0 place-items-center rounded-lg outline-none transition-colors hover:bg-warning-muted"
          >
            <Star
              className={cn(
                'size-4 transition-colors duration-150',
                revision
                  ? 'fill-warning text-warning'
                  : 'fill-transparent text-text-muted group-hover:text-warning/70'
              )}
            />
          </button>

          {/* Notes toggle */}
          <button
            type="button"
            onClick={handleOpenNotes}
            aria-expanded={notesOpen}
            aria-label="Toggle notes"
            className={cn(
              'press grid size-8 shrink-0 place-items-center rounded-lg outline-none transition-colors',
              notesOpen ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-accent hover:text-accent-foreground',
              userNotes ? 'text-primary' : ''
            )}
          >
            <StickyNote className="size-4" />
          </button>
        </div>
      </div>

      {/* Notes panel — expandable */}
      {notesOpen && (
        <div className="border-t border-divider px-3 pb-3 pt-3 sm:px-4">
          {/* Edit/Preview toggle */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <Text size="micro" tone="muted" weight="medium" className="uppercase tracking-wider">
              📝 Notes
            </Text>
            <div className="flex items-center gap-1 rounded-lg bg-surface-sunken p-0.5">
              <button
                type="button"
                onClick={() => { setEditMode(false); }}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  !editMode ? 'bg-card text-foreground shadow-e1' : 'text-text-muted hover:text-foreground'
                )}
              >
                <Eye className="size-3" /> Preview
              </button>
              <button
                type="button"
                onClick={() => { setEditMode(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  editMode ? 'bg-card text-foreground shadow-e1' : 'text-text-muted hover:text-foreground'
                )}
              >
                <Pencil className="size-3" /> Edit
              </button>
            </div>
          </div>

          {editMode ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write your notes in Markdown…&#10;&#10;**Key insight:** ...&#10;&#10;```java&#10;// Code snippet&#10;```"
                className="min-h-[140px] w-full resize-y rounded-lg border border-input bg-input-background px-3 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring/50 font-mono leading-relaxed"
                spellCheck={false}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setEditMode(false); setDraft(userNotes); }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-e1 transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Save className="size-3" />
                  )}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'min-h-[60px] cursor-text rounded-lg border border-dashed border-border bg-surface-sunken/60 px-3 py-2.5',
                !userNotes && 'flex items-center justify-center'
              )}
              onClick={() => setEditMode(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setEditMode(true)}
            >
              {userNotes ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{userNotes}</ReactMarkdown>
                </div>
              ) : (
                <Text size="caption" tone="muted" className="text-center">
                  Click to add notes in Markdown…
                </Text>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function PracticePageClient({
  problems,
  patternTitle,
  variationTitle,
}: PracticePageClientProps) {
  const queryClient = useQueryClient();
  const progressKey = ['problems', 'practice-progress', variationTitle];

  /* Fetch all progress for this variation in a single call */
  const { data: progressData = {} } = useQuery<Record<string, { completed: boolean; revision: boolean; userNotes: string }>>({
    queryKey: progressKey,
    queryFn: async () => {
      const ids = problems.map((p) => p._id).join(',');
      if (!ids) return {};
      const [completedRes, revisionRes] = await Promise.all([
        fetch(`/api/problems/progress?kind=pattern&returnType=ids`),
        fetch(`/api/problems/revision`),
      ]);
      const completedIds: string[] = completedRes.ok ? await completedRes.json() : [];
      const revisionIds: string[] = revisionRes.ok ? await revisionRes.json() : [];

      const result: Record<string, { completed: boolean; revision: boolean; userNotes: string }> = {};
      for (const p of problems) {
        result[p._id] = {
          completed: completedIds.includes(p._id),
          revision: revisionIds.includes(p._id),
          userNotes: '',
        };
      }
      return result;
    },
  });

  /* Toggle completion */
  const completeMutation = useMutation({
    mutationFn: async ({ problemId, completed }: { problemId: string; completed: boolean }) => {
      const res = await fetch('/api/problems/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, completed }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onMutate: ({ problemId, completed }) => {
      queryClient.setQueryData<Record<string, any>>(progressKey, (old = {}) => ({
        ...old,
        [problemId]: { ...old[problemId], completed },
      }));
    },
  });

  /* Toggle revision */
  const revisionMutation = useMutation({
    mutationFn: async ({ problemId, revision }: { problemId: string; revision: boolean }) => {
      const res = await fetch('/api/problems/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, revision }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onMutate: ({ problemId, revision }) => {
      queryClient.setQueryData<Record<string, any>>(progressKey, (old = {}) => ({
        ...old,
        [problemId]: { ...old[problemId], revision },
      }));
    },
  });

  /* Save notes */
  const saveNotes = useCallback(async (problemId: string, userNotes: string) => {
    const res = await fetch('/api/problems/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, userNotes }),
    });
    if (!res.ok) throw new Error('Failed to save notes');
    queryClient.setQueryData<Record<string, any>>(progressKey, (old = {}) => ({
      ...old,
      [problemId]: { ...old[problemId], userNotes },
    }));
  }, [queryClient, progressKey]);

  /* Aggregate stats */
  const completedCount = problems.filter((p) => progressData[p._id]?.completed).length;
  const revisionCount = problems.filter((p) => progressData[p._id]?.revision).length;
  const progressPct = problems.length > 0 ? Math.round((completedCount / problems.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 shadow-e1 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-xs text-text-muted">Solved</p>
            <p className="text-sm font-semibold tabular-nums text-foreground">{completedCount} / {problems.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-warning/10 text-warning">
            <Star className="size-4" />
          </span>
          <div>
            <p className="text-xs text-text-muted">Revision</p>
            <p className="text-sm font-semibold tabular-nums text-foreground">{revisionCount}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-muted sm:w-48">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className={cn(
            'text-sm font-semibold tabular-nums',
            progressPct === 100 ? 'text-success' : 'text-primary'
          )}>
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Problem table header */}
      <div className="hidden grid-cols-[24px_32px_1fr_80px_32px_32px] items-center gap-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted sm:grid sm:px-5">
        <span>#</span>
        <span>Done</span>
        <span>Problem</span>
        <span className="text-center">Difficulty</span>
        <span className="text-center">Rev</span>
        <span className="text-center">Notes</span>
      </div>

      {/* Problems list */}
      <div className="rounded-xl bg-card shadow-e1 overflow-hidden">
        <ul className="divide-y divide-divider">
          {problems.map((p, i) => (
            <ProblemRow
              key={p._id}
              problem={p}
              index={i}
              completed={progressData[p._id]?.completed ?? false}
              revision={progressData[p._id]?.revision ?? false}
              userNotes={progressData[p._id]?.userNotes ?? ''}
              onToggleComplete={(id, val) => completeMutation.mutate({ problemId: id, completed: val })}
              onToggleRevision={(id, val) => revisionMutation.mutate({ problemId: id, revision: val })}
              onSaveNotes={saveNotes}
            />
          ))}
        </ul>
      </div>

      {problems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-sunken py-16 text-center">
          <span className="text-4xl">🎯</span>
          <p className="mt-3 text-sm font-medium text-foreground">No problems yet</p>
          <p className="mt-1 text-xs text-text-muted">Problems for this variation haven't been added yet.</p>
        </div>
      )}
    </div>
  );
}
