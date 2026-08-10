'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Taxonomy {
  _id: string;
  name: string;
  slug: string;
  kind: string;
  order?: number;
  icon?: string;
  createdAt: string;
}

export default function AdminTaxonomiesPage() {
  const queryClient = useQueryClient();
  const [kindFilter, setKindFilter] = useState('all');
  
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKind, setNewKind] = useState('pattern');

  const { data: taxonomies = [], isLoading } = useQuery<Taxonomy[]>({
    queryKey: ['admin', 'taxonomies', kindFilter],
    queryFn: async () => {
      const url = kindFilter === 'all' ? '/api/admin/taxonomies' : `/api/admin/taxonomies?kind=${kindFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      // The API returns an array directly because it returns await Taxonomy.find() inside withRole which does Response.json(result)
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/taxonomies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, kind: newKind }),
      });
      if (!res.ok) throw new Error('Failed to create');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomies'] });
      setNewName('');
      setIsCreating(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm('Are you sure you want to delete this taxonomy?')) return;
      await fetch(`/api/admin/taxonomies/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomies'] }),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Taxonomies</h1>
        <Button size="sm" onClick={() => setIsCreating(!isCreating)}>
          <Plus className="h-4 w-4 mr-1.5" />New Taxonomy
        </Button>
      </div>

      {isCreating && (
        <div className="rounded-xl border border-border p-4 bg-muted/20 flex items-end gap-3 flex-wrap">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-medium">Name</label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Arrays" className="h-9" />
          </div>
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs font-medium">Kind</label>
            <select
              value={newKind}
              onChange={e => setNewKind(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="pattern">Pattern (DSA)</option>
              <option value="subject">Subject</option>
              <option value="group">Group</option>
              <option value="platform">Platform (CP)</option>
              <option value="bucket">Bucket (Non-std)</option>
            </select>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!newName || createMutation.isPending} className="h-9">
            Save
          </Button>
        </div>
      )}

      <div className="flex gap-2 border-b border-border">
        {['all', 'pattern', 'subject', 'group', 'platform', 'bucket'].map(k => (
          <button
            key={k}
            onClick={() => setKindFilter(k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              kindFilter === k ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="capitalize">{k}</span>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kind</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border/50">
            {isLoading ? (
              [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-5 bg-muted animate-pulse rounded" /></td></tr>)
            ) : taxonomies.map((tax: Taxonomy) => (
              <tr key={tax._id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{tax.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{tax.slug}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-md capitalize">{tax.kind}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{tax.order ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(tax._id)}>
                    <Trash2 className="h-4 w-4 text-destructive opacity-50 hover:opacity-100" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && taxonomies.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No taxonomies found</div>}
      </div>
    </div>
  );
}
