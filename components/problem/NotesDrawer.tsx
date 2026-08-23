'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check, Loader2, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading, Text } from '@/components/ui/typography';
import { MarkdownEditor } from '@/components/markdown/Editor';
import { MarkdownView } from '@/components/markdown/View';
import { Problem } from './ProblemRow';

interface NotesDrawerProps {
  problem: Problem;
  queryKey: unknown[];
  onClose: () => void;
}

export function NotesDrawer({ problem, queryKey, onClose }: NotesDrawerProps) {
  const [notes, setNotes] = useState(problem.notes || problem.userNotes || '');
  const [preview, setPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  // Fetch per-user note on mount
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/problems/notes?problemId=${problem._id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (isMounted && data && data.userNotes !== undefined) {
          setNotes(data.userNotes);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [problem._id]);

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch('/api/problems/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem._id, userNotes: value }),
      });
      if (!res.ok) throw new Error('Save failed');
      return res.json();
    },
    onSuccess: (updated) => {
      const newNote = updated.userNotes ?? updated.notes ?? '';
      // Update cache in-place
      queryClient.setQueryData(queryKey, (old: Problem[] | undefined) =>
        old?.map(p => p._id === problem._id ? { ...p, notes: newNote, userNotes: newNote } : p)
      );
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  // 800ms debounced auto-save
  const handleChange = useCallback((val: string | undefined) => {
    const newVal = val ?? '';
    setNotes(newVal);
    setSaveStatus('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveMutation.mutate(newVal);
    }, 800);
  }, [saveMutation]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const label = problem.name || problem.title || 'this problem';

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className="animate-in-fade fixed inset-0 z-40 bg-foreground/35 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer — elevation, not a rule, separates it from the page */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Notes for ${label}`}
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-xl flex-col bg-surface shadow-e4"
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-surface-sunken px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <Heading level="overline">Notes</Heading>
            <Heading level="card" as="h2" className="truncate">
              {problem.name || problem.title}
            </Heading>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Save indicator */}
            <Text as="span" size="micro" tone="muted" className="flex items-center gap-1" aria-live="polite">
              {saveStatus === 'saving' && <Loader2 aria-hidden className="size-3 animate-spin" />}
              {saveStatus === 'saving' && 'Saving…'}
              {saveStatus === 'saved' && (
                <>
                  <Check aria-hidden className="size-3 text-success" />
                  Saved
                </>
              )}
            </Text>

            {/* Edit / Preview toggle */}
            <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5" role="group" aria-label="Editor mode">
              <Button
                variant={!preview ? 'default' : 'ghost'}
                size="xs"
                aria-pressed={!preview}
                onClick={() => setPreview(false)}
              >
                Edit
              </Button>
              <Button
                variant={preview ? 'default' : 'ghost'}
                size="xs"
                aria-pressed={preview}
                onClick={() => setPreview(true)}
              >
                Preview
              </Button>
            </div>

            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close notes">
              <X aria-hidden className="size-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4">
          {preview ? (
            notes.trim() ? (
              <MarkdownView content={notes} />
            ) : (
              <EmptyState
                icon={NotebookPen}
                title="No notes yet"
                description="Switch to Edit and jot down the intuition, edge cases or the trick that unlocked this problem."
                action={
                  <Button variant="soft" size="sm" onClick={() => setPreview(false)}>
                    Start writing
                  </Button>
                }
              />
            )
          ) : (
            <MarkdownEditor value={notes} onChange={handleChange} />
          )}
        </div>

        {/* Footer: problem metadata */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-sunken px-5 py-3">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Open problem ↗
          </a>
          <Badge variant="secondary">{problem.difficulty}</Badge>
          {problem.pattern && (
            <Text as="span" size="micro" tone="muted">
              {problem.pattern}
            </Text>
          )}
          {problem.platform && (
            <Text as="span" size="micro" tone="muted" className="uppercase tracking-[0.08em]">
              {problem.platform}
            </Text>
          )}
        </div>
      </div>
    </>
  );
}
