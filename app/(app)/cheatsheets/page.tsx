'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { cheatsheetQueries } from '@/lib/queries/cheatsheets';
import { CheatsheetFilterBar } from '@/components/cheatsheets/CheatsheetFilterBar';
import { CheatsheetGrid } from '@/components/cheatsheets/CheatsheetGrid';
import { CreateCheatsheetDialog } from '@/components/cheatsheets/CreateCheatsheetDialog';
import { useDebounce } from '@/hooks/use-debounce';

export default function CheatsheetsPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 200);

  // Centralized TanStack Query v5 queryOptions
  const { data: cheatsheets = [], isLoading } = useQuery(cheatsheetQueries.all());

  const allTags = useMemo(() => {
    return Array.from(new Set(cheatsheets.flatMap((c) => c.tags ?? [])));
  }, [cheatsheets]);

  const filtered = useMemo(() => {
    return cheatsheets.filter((c) => {
      const matchesTag = !tagFilter || c.tags?.includes(tagFilter);
      const matchesSearch =
        !debouncedSearch ||
        c.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.slug.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.tags?.some((t) => t.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return matchesTag && matchesSearch;
    });
  }, [cheatsheets, tagFilter, debouncedSearch]);

  return (
    <div className="space-y-8 pb-12 w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Quick <span className="text-rose-500">Cheat Sheets</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-light">
            Quick reference Markdown documents, formulas, key commands, and code snippets curated for your technical interview prep.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isLoading && cheatsheets.length > 0 && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/10 text-rose-500 font-mono text-xs font-bold">
              {cheatsheets.length} sheet{cheatsheets.length !== 1 ? 's' : ''} available
            </div>
          )}
          {isAdmin && (
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-bold shadow-md hover:shadow-lg transition-all border-none gap-2"
            >
              <Plus className="size-4" />
              New Cheat Sheet
            </Button>
          )}
        </div>
      </div>

      {/* 2. Search & Tag Filter Bar */}
      <CheatsheetFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={tagFilter}
        onTagChange={setTagFilter}
        allTags={allTags}
      />

      {/* 3. Cheatsheet Card Grid */}
      <CheatsheetGrid
        cheatsheets={filtered}
        isLoading={isLoading}
        searchQuery={searchQuery}
        selectedTag={tagFilter}
        isAdmin={isAdmin}
        onNewClick={() => setIsOpen(true)}
      />

      {/* 4. Create Sheet Dialog (Admin Only) */}
      {isAdmin && (
        <CreateCheatsheetDialog open={isOpen} onOpenChange={setIsOpen} />
      )}
    </div>
  );
}
