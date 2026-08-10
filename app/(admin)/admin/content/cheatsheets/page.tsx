'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Cheatsheet {
  _id: string;
  title: string;
  slug: string;
  userId?: { name: string; email: string };
  tags: string[];
  createdAt: string;
}

export default function AdminCheatsheetsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<{ data: Cheatsheet[] }>({
    queryKey: ['admin', 'cheatsheets', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/content/cheatsheets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const cheatsheets = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm('Are you sure you want to delete this cheatsheet?')) return;
      await fetch(`/api/cheatsheets/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cheatsheets'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cheat Sheets</h1>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cheat sheets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Author</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border/50">
            {isLoading ? (
              [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-5 bg-muted animate-pulse rounded" /></td></tr>)
            ) : cheatsheets.map((sheet: Cheatsheet) => (
              <tr key={sheet._id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{sheet.title}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{sheet.slug}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {sheet.userId ? `${sheet.userId.name} (${sheet.userId.email})` : 'System / Unknown'}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(sheet.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(sheet._id)}>
                    <Trash2 className="h-4 w-4 text-destructive opacity-50 hover:opacity-100" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && cheatsheets.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No cheat sheets found</div>}
      </div>
    </div>
  );
}
