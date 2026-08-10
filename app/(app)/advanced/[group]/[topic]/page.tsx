'use client';

import { use, useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Eye, Pencil } from 'lucide-react';
import { MarkdownEditor } from '@/components/markdown/Editor';
import { MarkdownView } from '@/components/markdown/View';

interface Topic { _id: string; title: string; body?: string }

export default function AdvancedTopicPage({ params }: { params: Promise<{ group: string; topic: string }> }) {
  const { group: groupSlug, topic: topicId } = use(params);
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(false);
  const [body, setBody] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: topic, isLoading } = useQuery<Topic>({
    queryKey: ['topics', topicId],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${topicId}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: topicId !== 'new',
  });

  useEffect(() => { 
    // eslint-disable-next-line
    if (topic) setBody(topic.body ?? ''); 
  }, [topic]);

  const saveMutation = useMutation({
    mutationFn: async (val: string) => {
      const res = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: val }),
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

  const handleChange = useCallback((val: string | undefined) => {
    const newVal = val ?? '';
    setBody(newVal);
    setSaveStatus('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveMutation.mutate(newVal), 800);
  }, [saveMutation]);

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/advanced/${groupSlug}`}>
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold flex-1 truncate">{topic?.title ?? 'Loading...'}</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {saveStatus === 'saving' && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Saving...</span>}
            {saveStatus === 'saved' && '✓ Saved'}
          </span>
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            <button onClick={() => setPreview(false)} className={`px-2.5 py-1 ${!preview ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
              <Pencil className="h-3 w-3 inline mr-1" />Edit
            </button>
            <button onClick={() => setPreview(true)} className={`px-2.5 py-1 ${preview ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
              <Eye className="h-3 w-3 inline mr-1" />Preview
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[60vh]">
        {isLoading ? <div className="h-64 bg-muted animate-pulse rounded-lg" /> :
          preview ? (
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border p-5 min-h-[400px]">
              {body ? <MarkdownView content={body} /> : <p className="text-muted-foreground italic">Nothing to preview</p>}
            </div>
          ) : (
            <MarkdownEditor value={body} onChange={handleChange} />
          )
        }
      </div>
    </div>
  );
}
