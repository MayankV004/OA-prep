'use client';

import { Suspense, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading, Text } from '@/components/ui/typography';
import Link from 'next/link';
import { Search, SearchX, Code2, FileText, BookOpen, HelpCircle, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

type Kind = 'all' | 'problems' | 'topics' | 'cheatsheets' | 'questions';

interface SearchHit {
  _id: string;
  _type: string;
  title?: string;
  question?: string;
  difficulty?: string;
  kind?: string;
}

const KIND_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  problem: Code2,
  topic: BookOpen,
  cheatsheet: FileText,
  question: HelpCircle,
};

/** Display order and labels for the result groups. */
const TYPE_ORDER = ['problem', 'topic', 'cheatsheet', 'question'];
const TYPE_LABELS: Record<string, string> = {
  problem: 'Problems',
  topic: 'Topics',
  cheatsheet: 'Cheat Sheets',
  question: 'Interview Questions',
};

/** Filter pill — comfortable tap target on mobile, tighter on desktop. */
const chipClass =
  'press inline-flex min-h-11 items-center rounded-full px-3.5 text-xs font-medium transition-colors duration-150 ease-out-quart outline-none focus-visible:shadow-glow sm:min-h-8';

function HitLink({ hit }: { hit: SearchHit }) {
  const Icon = KIND_ICONS[hit._type] ?? FileText;
  const label = hit.title ?? hit.question ?? 'Untitled';
  let href = '#';
  if (hit._type === 'problem') href = `/dsa`;
  if (hit._type === 'topic') href = `/subjects`;
  if (hit._type === 'cheatsheet') href = `/cheatsheets`;
  if (hit._type === 'question') href = `/interview`;

  return (
    <Link href={href} className="group block outline-none">
      <div className="flex min-h-14 items-start gap-3 px-4 py-3 transition-colors duration-150 ease-out-quart hover:bg-surface-sunken">
        <span
          aria-hidden
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-text-muted transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <Text size="compact" tone="primary" weight="medium" className="truncate">
            {label}
          </Text>
          <div className="mt-0.5 flex items-center gap-1.5">
            <Text as="span" size="caption" tone="muted" className="capitalize">
              {hit._type}
            </Text>
            {hit.difficulty && (
              <>
                <Text as="span" size="caption" tone="muted" aria-hidden>·</Text>
                <Text as="span" size="caption" tone="muted">{hit.difficulty}</Text>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SearchSurface() {
  // The ⌘K palette hands off here as /search?q=… — seed the existing client
  // state from the param. No fetching behaviour changes: the same debounced
  // state drives the same query.
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState<Kind>('all');
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = useQuery<SearchHit[]>({
    queryKey: ['search', debouncedQuery, kind],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&kind=${kind}&scope=me&limit=20`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: debouncedQuery.trim().length >= 2,
  });

  const kinds: { value: Kind; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'problems', label: 'Problems' },
    { value: 'topics', label: 'Topics' },
    { value: 'cheatsheets', label: 'Sheets' },
    { value: 'questions', label: 'Questions' },
  ];

  // Presentation-only regroup of the same result array, so hits arrive under a
  // labelled heading instead of one undifferentiated list.
  const groups = Array.from(new Set(results.map(hit => hit._type)))
    .sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a);
      const bi = TYPE_ORDER.indexOf(b);
      return (ai === -1 ? TYPE_ORDER.length : ai) - (bi === -1 ? TYPE_ORDER.length : bi);
    })
    .map(type => ({
      type,
      label: TYPE_LABELS[type] ?? type,
      hits: results.filter(hit => hit._type === type),
    }));

  const hasQuery = debouncedQuery.trim().length >= 2;
  const isTooShort = debouncedQuery.trim().length > 0 && debouncedQuery.trim().length < 2;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <Heading level="page">Search</Heading>

      {/* Search input */}
      <div>
        <label htmlFor="search-input" className="sr-only">
          Search problems, topics, cheat sheets and interview questions
        </label>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted"
          />
          <Input
            id="search-input"
            type="search"
            placeholder="Search problems, topics, cheat sheets..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-12 pl-11 text-base shadow-e1"
            autoFocus
          />
        </div>
      </div>

      {/* Kind filter */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter results by type">
        {kinds.map(k => (
          <button
            key={k.value}
            type="button"
            onClick={() => setKind(k.value)}
            aria-pressed={kind === k.value}
            className={cn(
              chipClass,
              kind === k.value
                ? 'bg-primary text-primary-foreground shadow-e1'
                : 'bg-muted text-text-secondary hover:bg-surface-sunken hover:text-foreground'
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {hasQuery && (
        <div aria-live="polite">
          {isFetching && results.length === 0 ? (
            <div className="space-y-2" role="status" aria-label="Searching">
              <span className="sr-only">Searching…</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-e1"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Skeleton className="size-8 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={`No results for “${debouncedQuery}”`}
              description={
                kind === 'all'
                  ? 'Try a shorter or differently spelled term.'
                  : 'Nothing of this type matched. Try searching across everything.'
              }
              action={
                kind !== 'all' ? (
                  <Button variant="soft" size="lg" onClick={() => setKind('all')}>
                    Search all types
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-5">
              {groups.map(group => (
                <section key={group.type} className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2 px-1">
                    <Heading level="overline">{group.label}</Heading>
                    <Badge variant="secondary" className="tabular-nums">{group.hits.length}</Badge>
                  </div>
                  <div className="overflow-hidden rounded-xl bg-card shadow-e1 divide-y divide-divider">
                    {group.hits.map(hit => (
                      <HitLink key={`${hit._type}-${hit._id}`} hit={hit} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      {isTooShort && (
        <EmptyState
          compact
          icon={Keyboard}
          title="Keep typing"
          description="Enter at least 2 characters to start searching."
        />
      )}

      {!debouncedQuery && (
        <EmptyState
          icon={Search}
          title="Search everything"
          description="Problems, topics, cheat sheets and interview questions — all in one place. Press ⌘K anywhere to jump straight here."
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl space-y-6 pb-12" aria-busy role="status" aria-label="Loading search">
          <span className="sr-only">Loading search…</span>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
      }
    >
      <SearchSurface />
    </Suspense>
  );
}
