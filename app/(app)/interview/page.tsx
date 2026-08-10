'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';

interface Group { _id: string; name: string; slug: string }
interface Question { _id: string; question: string; answer?: string }

function QuestionCard({ question }: { question: Question }) {
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
        <span className="font-medium text-sm">{question.question}</span>
      </button>
      {open && question.answer && (
        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/10">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownView content={question.answer} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['groups', 'subject'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview Questions</h1>
        <p className="text-muted-foreground text-sm mt-1">Subject-wise Q&A flashcards</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map(group => (
            <Link key={group._id} href={`/interview/${group.slug}`}>
              <div className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-sm">{group.name}</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
