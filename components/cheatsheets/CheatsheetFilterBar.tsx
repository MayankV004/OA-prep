import { useRef, useEffect } from 'react';
import { Tag, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheatsheetFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  allTags: string[];
  totalCount?: number;
  filteredCount?: number;
}

export function CheatsheetFilterBar({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  allTags,
  totalCount,
  filteredCount,
}: CheatsheetFilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="p-2.5 sm:p-3 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs space-y-3">
      {/* Top Search Input & Count Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search cheat sheets by language, method, or concept..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-10 text-xs sm:text-sm font-medium bg-background/80 rounded-xl border border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans placeholder:text-muted-foreground/60"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/50 rounded pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {totalCount !== undefined && filteredCount !== undefined && totalCount > 0 && (
          <div className="text-xs font-mono text-muted-foreground px-2 flex items-center gap-2 shrink-0">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Showing <strong className="text-foreground">{filteredCount}</strong> of {totalCount} sheets
            </span>
          </div>
        )}
      </div>

      {/* Bottom Tag Filter Chips */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs scrollbar-none">
          <button
            type="button"
            onClick={() => onTagChange('')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0',
              !selectedTag
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-foreground/[0.03] dark:bg-white/[0.04] text-muted-foreground hover:text-foreground border border-border/60 dark:border-white/10'
            )}
          >
            All Languages & Topics
          </button>
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(isSelected ? '' : tag)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-foreground/[0.03] dark:bg-white/[0.04] text-muted-foreground hover:text-foreground border border-border/60 dark:border-white/10'
                )}
              >
                <Tag className="size-3 opacity-70" />
                <span>#{tag}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
