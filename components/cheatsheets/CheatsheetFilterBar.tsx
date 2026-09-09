import { Tag, Search } from 'lucide-react';
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search cheat sheets by language or concept..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/80 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-2xs"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => onTagChange('')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all',
              !selectedTag
                ? 'bg-emerald-500 text-black font-bold shadow-2xs'
                : 'bg-card/70 text-muted-foreground hover:text-foreground border border-border/40'
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
                'px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1',
                selectedTag === tag
                  ? 'bg-emerald-500 text-black font-bold shadow-2xs'
                  : 'bg-card/70 text-muted-foreground hover:text-foreground border border-border/40'
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

