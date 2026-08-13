'use client';

import { use, useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading, Text } from '@/components/ui/typography';
import { ArrowLeft, Loader2, Eye, Pencil, Check, FileText } from 'lucide-react';
import { MarkdownEditor } from '@/components/markdown/Editor';
import { MarkdownView } from '@/components/markdown/View';
import { cn } from '@/lib/utils';

interface Cheatsheet { _id: string; title: string; slug: string; body?: string; tags?: string[] }

/** Segmented control button — filled active state, no borders. */
const segmentClass =
  'press inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors duration-150 ease-out-quart outline-none focus-visible:shadow-glow';

export default function CheatsheetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(false);
  const [body, setBody] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch by slug — we need to find the sheet from the list first
  const { data: sheets = [] } = useQuery<Cheatsheet[]>({
    queryKey: ['cheatsheets'],
    queryFn: async () => {
      const res = await fetch('/api/cheatsheets');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const sheet = sheets.find(s => s.slug === slug);

  useEffect(() => {
    // eslint-disable-next-line
    if (sheet) setBody(sheet.body ?? '');
  }, [sheet]);

  const saveMutation = useMutation({
    mutationFn: async (val: string) => {
      if (!sheet) throw new Error('Not loaded');
      const res = await fetch(`/api/cheatsheets/${sheet._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: val }),
      });
      if (!res.ok) throw new Error('Save failed');
      return res.json();
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['cheatsheets'] });
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const handleChange = useCallback((val: string | undefined) => {
    const newVal = val ?? '';
    setBody(newVal);
    setSaveStatus('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveMutation.mutate(newVal), 800);
  }, [saveMutation]);

  const isLoading = !sheet && sheets.length === 0;

  return (
    <div className="max-w-4xl space-y-5 pb-12">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back to cheat sheets"
          className="shrink-0"
          render={<Link href="/cheatsheets" />}
        >
          <ArrowLeft aria-hidden />
        </Button>

        <Heading level="section" as="h1" className="min-w-0 flex-1 truncate">
          {sheet?.title ?? 'Loading...'}
        </Heading>

        <div className="flex items-center gap-2">
          <span aria-live="polite" className="min-w-0">
            {saveStatus === 'saving' && (
              <Text as="span" size="caption" tone="muted" className="inline-flex items-center gap-1">
                <Loader2 aria-hidden className="size-3 animate-spin" />
                Saving…
              </Text>
            )}
            {saveStatus === 'saved' && (
              <Text as="span" size="caption" tone="success" className="inline-flex items-center gap-1">
                <Check aria-hidden className="size-3" />
                Saved
              </Text>
            )}
          </span>

          <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5" role="group" aria-label="Editor mode">
            <button
              type="button"
              onClick={() => setPreview(false)}
              aria-pressed={!preview}
              className={cn(
                segmentClass,
                !preview
                  ? 'bg-surface text-foreground shadow-e1'
                  : 'text-text-muted hover:text-foreground'
              )}
            >
              <Pencil aria-hidden className="size-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              aria-pressed={preview}
              className={cn(
                segmentClass,
                preview
                  ? 'bg-surface text-foreground shadow-e1'
                  : 'text-text-muted hover:text-foreground'
              )}
            >
              <Eye aria-hidden className="size-3" />
              Preview
            </button>
          </div>
        </div>
      </div>

      {sheet?.tags && sheet.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sheet.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}

      <div className="min-h-[60vh]">
        {isLoading ? (
          <div className="space-y-3 rounded-xl bg-card p-5 shadow-e2" aria-busy role="status" aria-label="Loading cheat sheet">
            <span className="sr-only">Loading cheat sheet…</span>
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : preview ? (
          <div className="min-h-[400px] rounded-xl bg-card p-5 shadow-e2 sm:p-6">
            {body ? (
              <div className="prose-content prose prose-sm dark:prose-invert max-w-none">
                <MarkdownView content={body} />
              </div>
            ) : (
              <EmptyState
                compact
                icon={FileText}
                title="Empty cheat sheet"
                description="Switch to Edit and start writing — changes save automatically."
              />
            )}
          </div>
        ) : (
          <MarkdownEditor value={body} onChange={handleChange} />
        )}
      </div>
    </div>
  );
}
