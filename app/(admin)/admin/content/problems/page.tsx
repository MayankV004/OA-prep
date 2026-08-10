'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Problem {
  _id: string;
  title: string;
  url: string;
  difficulty: string;
  kind: string;
  pattern?: string;
  bucket?: string;
  platform?: string;
  createdAt: string;
}

export default function AdminProblemsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('all');

  const { data, isLoading } = useQuery<{ data: Problem[] }>({
    queryKey: ['admin', 'problems', search, kindFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      if (kindFilter !== 'all') params.set('kind', kindFilter);
      // Hit the admin global content API
      const res = await fetch(`/api/admin/content/problems?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      // Always { data: [...] } from this new endpoint
      return res.json();
    },
  });

  const problems = data?.data || [];


  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm('Are you sure you want to delete this problem?')) return;
      await fetch(`/api/problems/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'problems'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Problems</h1>
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add Problem</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <select
          value={kindFilter}
          onChange={e => setKindFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Kinds</option>
          <option value="pattern">Pattern DSA</option>
          <option value="nonstandard">Non-Standard</option>
          <option value="cp">Comp. Prog.</option>
        </select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Difficulty</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kind & Group</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Added</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border/50">
            {isLoading ? (
              [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-5 bg-muted animate-pulse rounded" /></td></tr>)
            ) : problems.map((problem: Problem) => (
              <tr key={problem._id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{problem.title}</span>
                    <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    problem.difficulty === 'Easy' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/10' :
                    problem.difficulty === 'Medium' ? 'border-amber-500/20 text-amber-600 bg-amber-500/10' :
                    'border-red-500/20 text-red-600 bg-red-500/10'
                  }`}>{problem.difficulty}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <span className="capitalize font-medium">{problem.kind}</span>
                  {(problem.pattern || problem.bucket || problem.platform) && (
                    <>
                      <span className="mx-1">→</span>
                      <span>{problem.pattern || problem.bucket || problem.platform}</span>
                    </>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(problem.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(problem._id)}>
                    <Trash2 className="h-4 w-4 text-destructive opacity-50 hover:opacity-100" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && problems.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No problems found</div>}
      </div>
    </div>
  );
}
