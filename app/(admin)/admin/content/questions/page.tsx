'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Question {
  _id: string;
  question: string;
  subjectId: string;
  difficulty: string;
  createdAt: string;
}

export default function AdminQuestionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<{ data: Question[] }>({
    queryKey: ['admin', 'questions', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/content/questions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const questions = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm('Are you sure you want to delete this question?')) return;
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Interview Questions</h1>
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add Question</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Question</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Difficulty</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border/50">
            {isLoading ? (
              [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-5 bg-muted animate-pulse rounded" /></td></tr>)
            ) : questions.map((q: Question) => (
              <tr key={q._id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium truncate max-w-md" title={q.question}>{q.question}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    q.difficulty === 'Easy' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/10' :
                    q.difficulty === 'Medium' ? 'border-amber-500/20 text-amber-600 bg-amber-500/10' :
                    'border-red-500/20 text-red-600 bg-red-500/10'
                  }`}>{q.difficulty}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{q.subjectId}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(q.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(q._id)}>
                    <Trash2 className="h-4 w-4 text-destructive opacity-50 hover:opacity-100" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && questions.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No questions found</div>}
      </div>
    </div>
  );
}
