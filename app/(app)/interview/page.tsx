'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, ChevronDown, BookOpen, Layers } from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';
import { PageHeading, Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface Group { _id: string; name: string; slug: string }
interface Question { _id: string; question: string; answer?: string }

function QuestionCard({ question }: { question: Question }) {
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
        <Text as="span" size="compact" tone="primary" weight="medium">
          {question.question}
        </Text>
      </button>
      {open && question.answer && (
        <div className="bg-surface-sunken px-4 pt-3 pb-4">
          <div className="prose-content prose prose-sm dark:prose-invert max-w-none">
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
    <div className="space-y-8 pb-12">
      <PageHeading
        overline="Prep"
        title="Interview Questions"
        description="Subject-wise Q&A flashcards. Pick a subject to drill through its questions."
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-e2"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No subjects yet"
          description="Interview subjects will appear here once they have been added to your workspace."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, i) => (
            <Link
              key={group._id}
              href={`/interview/${group.slug}`}
              className="group block rounded-xl outline-none animate-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Card interactive className="h-full justify-center">
                <div className="flex min-h-11 items-center gap-3 px-(--card-spacing)">
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"
                  >
                    <BookOpen className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Heading level="card" className="truncate">
                      {group.name}
                    </Heading>
                    <Text size="caption" tone="muted">
                      Open question set
                    </Text>
                  </div>
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 text-text-muted transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
