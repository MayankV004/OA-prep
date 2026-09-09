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
    <div className="space-y-8 pb-16 w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 pb-2">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-2xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
            <span>Engineering Quick Reference</span>
            <span className="text-border">·</span>
            <span>Handbooks & Syntax</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Cheat Sheets
          </h1>
          <p className="text-sm text-muted-foreground font-normal max-w-2xl">
            Quick reference syntax, methods, formulas, complexity tables, and code snippets curated for technical interviews.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          {!isLoading && cheatsheets.length > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-card border border-border/40 text-muted-foreground font-mono text-xs font-semibold shadow-2xs">
              {cheatsheets.length} sheet{cheatsheets.length !== 1 ? 's' : ''} available
            </div>
          )}
          {isAdmin && (
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs gap-1.5 shadow-xs"
            >
              <Plus className="size-3.5" />
              New Sheet
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
