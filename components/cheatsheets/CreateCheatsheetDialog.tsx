'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { cheatsheetsApi } from '@/lib/api/cheatsheets';
import { queryKeys } from '@/lib/query-keys';

interface CreateCheatsheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCheatsheetDialog({ open, onOpenChange }: CreateCheatsheetDialogProps) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [body, setBody] = useState('');

  const createMutation = useMutation({
    mutationFn: cheatsheetsApi.create,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cheatsheets.all() });
      toast.add('Cheat Sheet Created!', {
        description: `"${created.title}" saved successfully.`,
        type: 'success',
      });
      onOpenChange(false);
      setTitle('');
      setSlug('');
      setTagsInput('');
      setBody('');
      router.push(`/cheatsheets/${created.slug}`);
    },
    onError: (err: Error) => {
      toast.add('Failed to Create Sheet', {
        description: err.message,
        type: 'error',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border-border/60 bg-background/95 backdrop-blur-xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="size-3.5" /> Admin Reference Guide
          </div>
          <DialogTitle className="text-2xl font-black font-display tracking-tight">
            Create Cheat Sheet
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a new Markdown reference document to the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
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
  );
}
