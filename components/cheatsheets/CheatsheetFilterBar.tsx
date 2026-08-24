import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheatsheetFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  allTags: string[];
}

export function CheatsheetFilterBar({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  allTags,
}: CheatsheetFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-background/50 backdrop-blur-md border border-border/30">
      <div className="relative w-full sm:w-80">
        <input
          type="text"
          placeholder="Search cheat sheets..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 px-4 text-sm font-medium bg-background/80 rounded-xl border border-border/40 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => onTagChange('')}
            className={cn(
              'px-3 py-1 rounded-xl text-xs font-semibold transition-all',
              !selectedTag
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-background/80 text-muted-foreground hover:text-foreground border border-border/40'
            )}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagChange(tag === selectedTag ? '' : tag)}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1',
                selectedTag === tag
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-background/80 text-muted-foreground hover:text-foreground border border-border/40'
              )}
            >
              <Tag className="size-3 opacity-70" />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
