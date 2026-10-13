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

  const handleResetFilters = () => {
    setSearchQuery('');
    setTagFilter('');
  };

  return (
    <div className="space-y-8 pb-16 w-full">
      {/* ── 1. Page Header (Modern Cockpit Header) ── */}
      <div className="pt-2 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
              Engineering{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
                Cheat Sheets
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-normal">
              High-yield syntax reference, operational time complexities, formulas, method signatures, and essential templates for technical interviews.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {isAdmin && (
              <Button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>New Sheet</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Search & Tag Filter Bar ── */}
      <CheatsheetFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={tagFilter}
        onTagChange={setTagFilter}
        allTags={allTags}
        totalCount={cheatsheets.length}
        filteredCount={filtered.length}
      />

      {/* ── 3. Cheatsheet Card Grid ── */}
      <CheatsheetGrid
        cheatsheets={filtered}
        isLoading={isLoading}
        searchQuery={searchQuery}
        selectedTag={tagFilter}
        isAdmin={isAdmin}
        onNewClick={() => setIsOpen(true)}
        onResetFilters={handleResetFilters}
      />

      {/* ── 4. Create Sheet Dialog (Admin Only) ── */}
      {isAdmin && (
        <CreateCheatsheetDialog open={isOpen} onOpenChange={setIsOpen} />
      )}
    </div>
  );
}
