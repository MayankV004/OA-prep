'use client';

import { use, useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Eye, Pencil } from 'lucide-react';
import { MarkdownEditor } from '@/components/markdown/Editor';
import { MarkdownView } from '@/components/markdown/View';

interface Cheatsheet { _id: string; title: string; slug: string; body?: string; tags?: string[] }

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
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/cheatsheets">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold flex-1 truncate">{sheet?.title ?? 'Loading...'}</h1>
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

      {sheet?.tags && sheet.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {sheet.tags.map(tag => (
            <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{tag}</span>
          ))}
        </div>
      )}

      <div className="min-h-[60vh]">
        {isLoading ? <div className="h-64 bg-muted animate-pulse rounded-lg" /> :
          preview ? (
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border p-5 min-h-[400px]">
              {body ? <MarkdownView content={body} /> : <p className="text-muted-foreground italic">Empty cheat sheet</p>}
            </div>
          ) : (
            <MarkdownEditor value={body} onChange={handleChange} />
          )
        }
      </div>
    </div>
  );
}
