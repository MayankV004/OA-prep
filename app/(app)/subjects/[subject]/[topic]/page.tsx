'use client';

import { use, useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Eye, Pencil } from 'lucide-react';
import { MarkdownEditor } from '@/components/markdown/Editor';
import { MarkdownView } from '@/components/markdown/View';

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
      setBody(topic.body ?? '');
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

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/subjects/${subjectSlug}`}>
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          ) : (
            <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {saveStatus === 'saving' && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>}
            {saveStatus === 'saved' && '✓ Saved'}
          </span>
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            <button
              onClick={() => setPreview(false)}
              className={`px-2.5 py-1 flex items-center gap-1 ${!preview ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
            >
              <Pencil className="h-3 w-3" />Edit
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`px-2.5 py-1 flex items-center gap-1 ${preview ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
            >
              <Eye className="h-3 w-3" />Preview
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-[60vh]">
        {isLoading ? (
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        ) : preview ? (
          <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border p-5 min-h-[400px]">
            {body ? <MarkdownView content={body} /> : <p className="text-muted-foreground italic">Nothing to preview</p>}
          </div>
        ) : (
          <MarkdownEditor value={body} onChange={handleBodyChange} />
        )}
      </div>
    </div>
  );
}
