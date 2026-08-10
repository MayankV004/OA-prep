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
      <div className="p-4 text-sm text-muted-foreground italic border-t border-border">
        No problems assigned to this variation.
      </div>
    );
  }

  const difficultyColors = {
    easy: "text-green-500 bg-green-500/10 border-green-500/20",
    medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    hard: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="flex flex-col border-t border-border divide-y divide-border">
      {problems.map((p) => (
        <div 
          key={p._id.toString()}
          className="group flex items-center justify-between p-3 hover:bg-muted/50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => onToggleComplete?.(p._id.toString(), !p.completed)}
              className={cn(
                "flex items-center justify-center h-4 w-4 shrink-0 rounded-none border transition-colors duration-200",
                p.completed 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "border-input bg-background group-hover:border-primary/50"
              )}
            >
              {p.completed && <Check className="h-3 w-3" strokeWidth={3} />}
            </button>
            <Link
              href={p.url}
              target="_blank"
              className="text-sm font-medium hover:underline truncate flex items-center gap-1.5"
            >
              {p.title}
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <span className={cn(
              "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none border",
              difficultyColors[p.difficulty as keyof typeof difficultyColors] || "text-muted-foreground bg-muted border-border"
            )}>
              {p.difficulty}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
