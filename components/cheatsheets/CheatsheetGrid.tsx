import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, FileCode2 } from 'lucide-react';
import { CheatsheetCard } from './CheatsheetCard';
import type { Cheatsheet } from '@/types/cheatsheet';

interface CheatsheetGridProps {
  cheatsheets: Cheatsheet[];
  isLoading: boolean;
  searchQuery: string;
  selectedTag: string;
  isAdmin: boolean;
  onNewClick: () => void;
}

export function CheatsheetGrid({
  cheatsheets,
  isLoading,
  searchQuery,
  selectedTag,
  isAdmin,
  onNewClick,
}: CheatsheetGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-card/50 border border-border/30 p-5 space-y-3">
            <Skeleton className="size-9 rounded-xl" />
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-1/2 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (cheatsheets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center shadow-xs">
        <EmptyState
          icon={FileCode2}
          title={searchQuery || selectedTag ? 'No matching cheat sheets' : 'No cheat sheets created yet'}
          description={
            searchQuery || selectedTag
              ? 'Try clearing your search query or tag filter.'
              : 'Cheat sheets published by admins will appear here.'
          }
          action={
            isAdmin ? (
              <Button
                onClick={onNewClick}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs gap-1.5 shadow-xs"
              >
                <Plus className="size-3.5" />
                New Cheat Sheet
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cheatsheets.map((sheet) => (
        <CheatsheetCard key={sheet._id} sheet={sheet} />
      ))}
    </div>
  );
}

