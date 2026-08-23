'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, Check, FileText, Tag, Sparkles, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';

interface Cheatsheet {
  _id: string;
  title: string;
  slug: string;
  body?: string;
  tags?: string[];
  updatedAt: string;
}

export default function CheatsheetsPage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [body, setBody] = useState('');

  const { data: cheatsheets = [], isLoading } = useQuery<Cheatsheet[]>({
    queryKey: ['cheatsheets'],
    queryFn: async () => {
      const res = await fetch('/api/cheatsheets');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { title: string; slug?: string; body?: string; tags?: string[] }) => {
      const res = await fetch('/api/cheatsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to create cheat sheet');
      }
      return res.json();
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['cheatsheets'] });
      toast.add('Cheat Sheet Created!', {
        description: `"${created.title}" saved successfully.`,
        type: 'success',
      });
      setIsOpen(false);
      setTitle('');
      setSlug('');
      setTagsInput('');
      setBody('');
      router.push(`/cheatsheets/${created.slug}`);
    },
    onError: (err: any) => {
      toast.add('Failed to Create Sheet', {
        description: err.message,
        type: 'error',
      });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createMutation.mutate({
      title: title.trim(),
      slug: slug.trim() || undefined,
      body: body.trim() || undefined,
      tags,
    });
  };

  const allTags = useMemo(() => {
    return Array.from(new Set(cheatsheets.flatMap((c) => c.tags ?? [])));
  }, [cheatsheets]);

  const filtered = useMemo(() => {
    return cheatsheets.filter((c) => {
      const matchesTag = !tagFilter || c.tags?.includes(tagFilter);
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTag && matchesSearch;
    });
  }, [cheatsheets, tagFilter, searchQuery]);

  return (
    <div className="space-y-8 pb-12 w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Quick <span className="text-rose-500">Cheat Sheets</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-light">
            Quick reference Markdown documents, formulas, key commands, and code snippets curated for your technical interview prep.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isLoading && cheatsheets.length > 0 && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/10 text-rose-500 font-mono text-xs font-bold">
              {cheatsheets.length} sheet{cheatsheets.length !== 1 ? 's' : ''} available
            </div>
          )}
          {isAdmin && (
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-bold shadow-md hover:shadow-lg transition-all border-none gap-2"
            >
              <Plus className="size-4" />
              New Cheat Sheet
            </Button>
          )}
        </div>
      </div>

      {/* 2. Search & Tag Filter Control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-background/50 backdrop-blur-md border border-border/30">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search cheat sheets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 text-sm font-medium bg-background/80 rounded-xl border border-border/40 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setTagFilter('')}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-semibold transition-all',
                !tagFilter
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-background/80 text-muted-foreground hover:text-foreground border border-border/40'
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
                className={cn(
                  'px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1',
                  tagFilter === tag
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-background/80 text-muted-foreground hover:text-foreground border border-border/40'
                )}
              >
                <Tag className="size-3 opacity-70" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Cheat Sheets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-background/60 backdrop-blur-xl space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-3xl border-none bg-background/50 p-8 text-center">
          <CardContent>
            <EmptyState
              title={searchQuery || tagFilter ? 'No matching cheat sheets' : 'No cheat sheets created yet'}
              description={
                searchQuery || tagFilter
                  ? 'Try clearing your search query or tag filter.'
                  : 'Cheat sheets published by admins will appear here.'
              }
              action={
                isAdmin ? (
                  <Button
                    size="lg"
                    onClick={() => setIsOpen(true)}
                    className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-bold shadow-md"
                  >
                    <Plus className="size-4" />
                    New Cheat Sheet
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((sheet) => (
            <Link
              key={sheet._id}
              href={`/cheatsheets/${sheet.slug}`}
              className="group block outline-none"
            >
              <Card className="h-full flex flex-col justify-between p-6 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground group-hover:text-rose-500 transition-colors truncate">
                      {sheet.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-mono text-[11px] font-semibold shrink-0">
                      Cheat Sheet
                    </span>
                  </div>

                  {sheet.tags && sheet.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sheet.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 dark:text-rose-400 font-medium text-[11px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      Quick Markdown reference sheet for {sheet.title}.
                    </p>
                  )}
                </div>

                <div className="pt-6 flex items-center justify-between text-xs border-t border-border/20 mt-4">
                  <span className="text-rose-500 font-bold group-hover:underline">
                    View Sheet &rarr;
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {formatDistanceToNow(parseISO(sheet.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 4. Create Cheat Sheet Dialog (Admin Only) */}
      {isAdmin && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-lg rounded-3xl border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-2xl">
            <DialogHeader className="space-y-1.5">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="size-3.5" /> Admin Reference Guide
              </div>
              <DialogTitle className="text-2xl font-black font-display tracking-tight">Create Cheat Sheet</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add a new Markdown reference document to the platform.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Big-O Complexity & Data Structures"
                  required
                  className="rounded-xl border-border/60 focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Custom Slug (Optional)</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. big-o-reference"
                  className="rounded-xl font-mono text-xs border-border/60 focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tags (Comma-separated)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. DSA, Algorithms, Time Complexity"
                  className="rounded-xl border-border/60 focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Initial Content (Markdown)</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="# Big-O Reference&#10;&#10;## Time Complexities&#10;- Array Lookup: O(1)"
                  rows={5}
                  className="rounded-xl font-mono text-xs border-border/60 focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending || !title.trim()}
                  className="rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-bold shadow-md gap-1.5"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  Create Sheet
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
