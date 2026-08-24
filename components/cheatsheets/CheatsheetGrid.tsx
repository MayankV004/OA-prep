import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-background/60 backdrop-blur-xl space-y-3">
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (cheatsheets.length === 0) {
    return (
      <Card className="rounded-3xl border-none bg-background/50 p-8 text-center">
        <CardContent>
          <EmptyState
            title={searchQuery || selectedTag ? 'No matching cheat sheets' : 'No cheat sheets created yet'}
            description={
              searchQuery || selectedTag
                ? 'Try clearing your search query or tag filter.'
                : 'Cheat sheets published by admins will appear here.'
            }
            action={
              isAdmin ? (
                <Button
                  size="lg"
                  onClick={onNewClick}
                  className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-bold shadow-md"
                >
                  <Plus className="size-4" />
                  New Cheat Sheet
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cheatsheets.map((sheet) => (
        <CheatsheetCard key={sheet._id} sheet={sheet} />
      ))}
    </div>
  );
}
