'use client';

import { ExternalLink, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Problem } from "@/components/problem/ProblemRow";

interface ProblemListProps {
  problems: Problem[];
  onToggleComplete?: (problemId: string, completed: boolean) => void;
}

export function ProblemList({ problems, onToggleComplete }: ProblemListProps) {
  if (!problems.length) {
    return (
      <div className="p-6 text-sm text-muted-foreground italic text-center rounded-xl bg-muted/20 border border-border/50">
        No problems assigned to this variation yet.
      </div>
    );
  }

  const difficultyColors = {
    easy: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    medium: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
    hard: "text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  };

  return (
    <div className="flex flex-col gap-1.5 p-1">
      {problems.map((p, i) => (
        <div 
          key={p._id.toString()}
          className="group relative flex items-center justify-between p-3.5 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/40 transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: `${Math.min(i * 50, 500)}ms`, animationFillMode: 'both' }}
        >
          {/* Subtle gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex items-center gap-4 overflow-hidden relative z-10 w-full">
            <button
              onClick={() => onToggleComplete?.(p._id.toString(), !p.completed)}
              className={cn(
                "relative flex items-center justify-center h-5 w-5 shrink-0 rounded-full border shadow-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                p.completed 
                  ? "bg-primary border-primary text-primary-foreground scale-100" 
                  : "border-input bg-background/50 hover:border-primary/50 hover:bg-muted scale-95 hover:scale-100"
              )}
            >
              {p.completed && (
                <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" strokeWidth={3} />
              )}
            </button>
            
            <div className="flex items-center justify-between w-full">
              <Link
                href={p.link || (p as any).url || '#'}
                target="_blank"
                className="text-sm font-semibold text-foreground/90 hover:text-primary transition-colors truncate flex items-center gap-2 group/link"
              >
                {p.name || p.title}
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
              </Link>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                {(p.platform || (p as any).source) && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted rounded-md border border-border/50 uppercase tracking-wider hidden sm:inline-block">
                    {p.platform || (p as any).source}
                  </span>
                )}
                
                {p.company_tags && p.company_tags.length > 0 && (
                  <div className="hidden md:flex gap-1">
                    {p.company_tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-primary/5 text-primary/80 border border-primary/10 rounded-sm truncate max-w-[60px]" title={tag}>
                        {tag}
                      </span>
                    ))}
                    {p.company_tags.length > 2 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-primary/5 text-primary/80 border border-primary/10 rounded-sm">
                        +{p.company_tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                <span className={cn(
                  "px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border backdrop-blur-sm shadow-sm transition-colors duration-300",
                  difficultyColors[p.difficulty.toLowerCase() as keyof typeof difficultyColors] || "text-muted-foreground bg-muted border-border"
                )}>
                  {p.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
