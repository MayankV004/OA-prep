'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function AdminPatternsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'patterns'],
    queryFn: async () => {
      const res = await fetch(`/api/admin/content/patterns`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const patterns = (data?.data || []).filter((p: any) => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      if (!confirm('Are you sure you want to delete this pattern?')) return;
      await fetch(`/api/admin/content/patterns/${slug}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'patterns'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patterns</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage DSA patterns, variations, and problems.
          </p>
        </div>
        <Link href="/admin/content/patterns/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Pattern
          </Button>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patterns..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Variations</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Added</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border/50">
            {isLoading ? (
              [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-5 bg-muted animate-pulse rounded" /></td></tr>)
            ) : patterns.map((pattern: any) => (
              <tr key={pattern._id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{pattern.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{pattern.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">{pattern.variations?.length || 0}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDistanceToNow(parseISO(pattern.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                  <Link href={`/admin/content/patterns/${pattern.slug}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(pattern.slug)}>
                    <Trash2 className="h-4 w-4 text-destructive opacity-50 hover:opacity-100" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && patterns.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No patterns found</div>}
      </div>
    </div>
  );
}
