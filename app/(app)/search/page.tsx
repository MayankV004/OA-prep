'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search, Code2, FileText, BookOpen, HelpCircle, Loader2 } from 'lucide-react';

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

function HitLink({ hit }: { hit: SearchHit }) {
  const Icon = KIND_ICONS[hit._type] ?? FileText;
  const label = hit.title ?? hit.question ?? 'Untitled';
  let href = '#';
  if (hit._type === 'problem') href = `/dsa`;
  if (hit._type === 'topic') href = `/subjects`;
  if (hit._type === 'cheatsheet') href = `/cheatsheets`;
  if (hit._type === 'question') href = `/interview`;

  return (
    <Link href={href}>
      <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{label}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-muted-foreground capitalize">{hit._type}</span>
            {hit.difficulty && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{hit.difficulty}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<Kind>('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Search</h1>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-input"
          placeholder="Search problems, topics, cheat sheets..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10 h-10 text-base"
          autoFocus
        />
        {isFetching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Kind filter */}
      <div className="flex gap-1.5 flex-wrap">
        {kinds.map(k => (
          <button
            key={k.value}
            onClick={() => setKind(k.value)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              kind === k.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {debouncedQuery.length >= 2 && (
        <div>
          {results.length === 0 && !isFetching ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No results for &quot;{debouncedQuery}&quot;</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
              {results.map(hit => (
                <HitLink key={`${hit._type}-${hit._id}`} hit={hit} />
              ))}
            </div>
          )}
        </div>
      )}

      {!debouncedQuery && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Type at least 2 characters to search</p>
        </div>
      )}
    </div>
  );
}
