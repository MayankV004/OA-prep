'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/markdown/Editor';
import { MarkdownView } from '@/components/markdown/View';
import { Problem } from './ProblemRow';

interface NotesDrawerProps {
  problem: Problem;
  queryKey: unknown[];
  onClose: () => void;
}

export function NotesDrawer({ problem, queryKey, onClose }: NotesDrawerProps) {
  const [notes, setNotes] = useState(problem.notes ?? '');
  const [preview, setPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch(`/api/problems/${problem._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value }),
      });
      if (!res.ok) throw new Error('Save failed');
      return res.json();
    },
    onSuccess: (updated) => {
      // Update cache in-place
      queryClient.setQueryData(queryKey, (old: Problem[] | undefined) =>
        old?.map(p => p._id === problem._id ? { ...p, notes: updated.notes } : p)
      );
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Notes</p>
            <h3 className="font-semibold text-sm truncate">{problem.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Save indicator */}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {saveStatus === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && '✓ Saved'}
            </span>
            {/* Edit / Preview toggle */}
            <div className="flex rounded-md border border-border overflow-hidden text-xs">
              <button
                onClick={() => setPreview(false)}
                className={`px-2.5 py-1 ${!preview ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
              >
                Edit
              </button>
              <button
                onClick={() => setPreview(true)}
                className={`px-2.5 py-1 ${preview ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
              >
                Preview
              </button>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4">
          {preview ? (
            <MarkdownView content={notes} />
          ) : (
            <MarkdownEditor value={notes} onChange={handleChange} />
          )}
        </div>

        {/* Footer: problem metadata */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center gap-3 text-xs text-muted-foreground">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:underline"
          >
            Open problem ↗
          </a>
          <span>•</span>
          <span>{problem.difficulty}</span>
          {problem.pattern && <><span>•</span><span>{problem.pattern}</span></>}
          {problem.platform && <><span>•</span><span>{problem.platform}</span></>}
        </div>
      </div>
    </>
  );
}
