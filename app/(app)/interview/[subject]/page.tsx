'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading, Text } from '@/components/ui/typography';
import { ArrowLeft, ChevronDown, Plus, HelpCircle } from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';
import { cn } from '@/lib/utils';

interface Group { _id: string; name: string; slug: string }
interface Question { _id: string; question: string; answer?: string; tags?: string[] }

function QuestionCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-e1">
      <button
        type="button"
        aria-expanded={open}
        className={cn(
          'flex min-h-11 w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-out-quart',
          open ? 'bg-accent' : 'hover:bg-surface-sunken'
        )}
        onClick={() => setOpen(o => !o)}
      >
        <ChevronDown
          aria-hidden
          className={cn(
            'mt-0.5 size-4 shrink-0 text-text-muted transition-transform duration-200 ease-out-quart',
            open && 'rotate-180 text-primary'
          )}
        />
        <span className="min-w-0 flex-1">
          <Text as="span" size="compact" tone="primary" weight="medium" className="block">
            {q.question}
          </Text>
          {q.tags && q.tags.length > 0 && (
            <span className="mt-2 flex flex-wrap gap-1.5">
              {q.tags.map(t => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </span>
          )}
        </span>
      </button>
      {open && (
        <div className="bg-surface-sunken px-4 pt-3 pb-4">
          {q.answer ? (
            <div className="prose-content prose prose-sm dark:prose-invert max-w-none">
              <MarkdownView content={q.answer} />
            </div>
          ) : (
            <Text size="caption" tone="muted">
              No answer yet. Click to add one.
            </Text>
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
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back to subjects"
          className="mt-1 shrink-0"
          render={<Link href="/interview" />}
        >
          <ArrowLeft aria-hidden />
        </Button>

        <div className="min-w-0 flex-1 space-y-1">
          <Heading level="overline">Interview</Heading>
          <Heading level="page" className="truncate">
            {group?.name ?? slug}
          </Heading>
          <Text size="compact" tone="muted" numeric>
            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
          </Text>
        </div>

        <Button size="lg" className="shrink-0">
          <Plus aria-hidden />
          Add Question
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-card px-4 py-3.5 shadow-e1"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Skeleton className="size-4 shrink-0 rounded-md" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions yet"
          description="Add your first interview question for this subject and it will show up here."
          action={
            <Button size="lg">
              <Plus aria-hidden />
              Add Question
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {questions.map(q => <QuestionCard key={q._id} q={q} />)}
        </div>
      )}
    </div>
  );
}
