'use client';

import { use, useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Loader2, Eye, Pencil } from 'lucide-react';
import { MarkdownEditor } from '@/components/markdown/Editor';
import { MarkdownView } from '@/components/markdown/View';

import { Skeleton } from '@/components/ui/skeleton';
import { Heading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface Topic { _id: string; title: string; body?: string; groupId: string }

export default function TopicPage({
  params,
}: {
  params: Promise<{ subject: string; topic: string }>;
}) {
  const { subject: subjectSlug, topic: topicId } = use(params);
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(false);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isNew = topicId === 'new';

  const { data: topic, isLoading } = useQuery<Topic>({
    queryKey: ['topics', topicId],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${topicId}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (topic) {
      // eslint-disable-next-line
      setBody(topic.body ?? '');
      // eslint-disable-next-line
      setTitle(topic.title);
    }
  }, [topic]);

  const saveMutation = useMutation({
    mutationFn: async (payload: { body?: string; title?: string }) => {
      if (isNew) {
        // Would need groupId — redirect to proper creation flow
        throw new Error('Use topic creation form');
      }
      const res = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      return res.json();
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['topics', topicId] });
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const handleBodyChange = useCallback((val: string | undefined) => {
    const newVal = val ?? '';
    setBody(newVal);
    setSaveStatus('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveMutation.mutate({ body: newVal });
    }, 800);
  }, [saveMutation]);

  const segmentBase =
    'flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium outline-none transition-all duration-150 ease-out-quart focus-visible:shadow-glow sm:h-8 sm:flex-none';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to subject"
            className="mt-0.5 shrink-0"
            render={<Link href={`/subjects/${subjectSlug}`} />}
          >
            <ArrowLeft aria-hidden />
          </Button>

          <div className="min-w-0 flex-1 space-y-1">
            <Heading level="overline">{subjectSlug}</Heading>
            {isLoading ? (
              <Skeleton className="h-7 w-64 max-w-full" />
            ) : (
              <Heading level="section" as="h1" className="truncate">
                {title}
              </Heading>
            )}
          </div>
        </div>

        {/* Toolbar: save status + edit/preview switch */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite" className="min-h-5">
            {saveStatus === 'saving' && (
              <Text as="span" size="caption" tone="muted" className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin" aria-hidden />
                Saving…
              </Text>
            )}
            {saveStatus === 'saved' && (
              <Text as="span" size="caption" tone="success" className="inline-flex items-center gap-1.5">
                <Check className="size-3" aria-hidden />
                Saved
              </Text>
            )}
          </div>

          <div
            role="group"
            aria-label="Editor view"
            className="flex w-full gap-1 rounded-lg bg-surface-sunken p-1 sm:w-auto"
          >
            <button
              type="button"
              onClick={() => setPreview(false)}
              aria-pressed={!preview}
              className={cn(
                segmentBase,
                !preview
                  ? 'bg-card text-primary shadow-e1'
                  : 'text-text-secondary hover:text-foreground'
              )}
            >
              <Pencil className="size-3" aria-hidden />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              aria-pressed={preview}
              className={cn(
                segmentBase,
                preview
                  ? 'bg-card text-primary shadow-e1'
                  : 'text-text-secondary hover:text-foreground'
              )}
            >
              <Eye className="size-3" aria-hidden />
              Preview
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="min-h-[60vh]">
        {isLoading ? (
          <div className="space-y-3 rounded-xl bg-card p-5 shadow-e1" aria-busy="true" aria-label="Loading topic">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ) : preview ? (
          <div className="min-h-[400px] rounded-xl bg-card p-5 shadow-e1 sm:p-8">
            {body ? (
              <div className="prose prose-sm dark:prose-invert prose-content max-w-none [&>:not(pre):not(table):not(figure)]:max-w-[72ch]">
                <MarkdownView content={body} />
              </div>
            ) : (
              <Text size="compact" tone="muted" className="italic">
                Nothing to preview
              </Text>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-card shadow-e1">
            <MarkdownEditor value={body} onChange={handleBodyChange} />
          </div>
        )}
      </div>
    </div>
  );
}
