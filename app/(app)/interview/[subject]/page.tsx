'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';

interface Group { _id: string; name: string; slug: string }
interface Question { _id: string; question: string; answer?: string; tags?: string[] }

function QuestionCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex-shrink-0 mt-0.5 text-muted-foreground">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <div className="flex-1">
          <span className="font-medium text-sm">{q.question}</span>
          {q.tags && q.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {q.tags.map(t => (
                <span key={t} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{t}</span>
              ))}
            </div>
          )}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/10">
          {q.answer ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownView content={q.answer} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No answer yet. Click to add one.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewSubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: slug } = use(params);

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups', 'subject'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const group = groups.find(g => g.slug === slug);

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['questions', { subjectId: group?._id }],
    queryFn: async () => {
      if (!group) return [];
      const res = await fetch(`/api/questions?subjectId=${group._id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!group,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/interview">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{group?.name ?? slug}</h1>
          <p className="text-muted-foreground text-sm">{questions.length} questions</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add Question</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No questions yet. Add your first interview question.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map(q => <QuestionCard key={q._id} q={q} />)}
        </div>
      )}
    </div>
  );
}
