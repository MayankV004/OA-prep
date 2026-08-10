'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, FileText, Clock } from 'lucide-react';
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
      if (!confirm('Delete this cheat sheet? This cannot be undone.')) return;
      await fetch(`/api/cheatsheets/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cheatsheets'] }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Cheat Sheets
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {cheatsheets.length} cheat sheets across all users
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cheat sheets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Author</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Created</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : (
              cheatsheets.map((sheet) => (
                <tr key={sheet._id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{sheet.title}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      {sheet.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {sheet.userId ? (
                      <span>
                        <span className="font-medium text-foreground">{sheet.userId.name}</span>{' '}
                        <span className="opacity-60">({sheet.userId.email})</span>
                      </span>
                    ) : (
                      <span className="italic">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(parseISO(sheet.createdAt), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteMutation.mutate(sheet._id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive opacity-50 hover:opacity-100 transition-opacity" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!isLoading && cheatsheets.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <FileText className="h-8 w-8 mx-auto mb-3 opacity-30" />
            No cheat sheets found
          </div>
        )}
      </div>
    </div>
  );
}
