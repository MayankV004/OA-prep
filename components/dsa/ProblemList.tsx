'use client';

import { ExternalLink, Check, ListChecks } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Problem } from "@/components/problem/ProblemRow";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/typography";

interface ProblemListProps {
  problems: Problem[];
  onToggleComplete?: (problemId: string, completed: boolean) => void;
}

/** Difficulty always carries its label — colour is reinforcement, never the signal. */
const DIFFICULTY_TONE: Record<string, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-warning-muted text-warning",
  hard: "bg-danger-muted text-destructive",
};

export function ProblemList({ problems, onToggleComplete }: ProblemListProps) {
  if (!problems.length) {
    return (
      <EmptyState
        compact
        icon={ListChecks}
        title="No problems yet"
        description="This variation has no practice problems assigned to it."
        className="rounded-xl bg-card shadow-e1"
      />
    );
  }

  return (
    <ul className="flex flex-col overflow-hidden rounded-xl bg-card shadow-e1">
      {problems.map((p, i) => {
        const label = p.name || p.title || 'problem';
        const platform = p.platform || (p as any).source;
        const tone =
          DIFFICULTY_TONE[String(p.difficulty).toLowerCase()] ?? "bg-muted text-text-muted";

        return (
          <li
            key={p._id.toString()}
            className="group animate-in-up flex items-start gap-2 px-2 py-1.5 transition-colors duration-150 ease-out-quart odd:bg-surface-sunken/60 hover:bg-accent/50 sm:items-center sm:gap-3 sm:px-3"
            style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
          >
            {/* Completion toggle — 44px touch target on small screens */}
            <button
              type="button"
              onClick={() => onToggleComplete?.(p._id.toString(), !p.completed)}
              aria-pressed={p.completed}
              aria-label={`Mark ${label} as ${p.completed ? 'incomplete' : 'complete'}`}
              className="press -ml-1 grid size-11 shrink-0 place-items-center rounded-lg outline-none sm:size-9"
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-5 place-items-center rounded-full transition-colors duration-150 ease-out-quart",
                  p.completed
                    ? "bg-primary text-primary-foreground shadow-e1"
                    : "bg-muted text-transparent group-hover:bg-surface-sunken"
                )}
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            </button>

            <div className="flex min-w-0 flex-1 flex-col gap-1 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <Link
                href={p.link || (p as any).url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group/link inline-flex min-w-0 items-center gap-1.5 text-sm font-medium transition-colors duration-150 ease-out-quart hover:text-primary",
                  p.completed ? "text-text-muted" : "text-foreground"
                )}
              >
                <span className="truncate">{p.name || p.title}</span>
                <ExternalLink
                  aria-hidden
                  className="size-3 shrink-0 text-text-muted opacity-0 transition-opacity duration-150 group-hover/link:opacity-100"
                />
              </Link>

              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                {platform && (
                  <Text as="span" size="micro" tone="muted" weight="medium" className="uppercase tracking-[0.08em]">
                    {platform}
                  </Text>
                )}

                {p.company_tags && p.company_tags.length > 0 && (
                  <div className="hidden gap-1 md:flex">
                    {p.company_tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="ghost" className="max-w-[72px] truncate bg-muted text-text-secondary" title={tag}>
                        {tag}
                      </Badge>
                    ))}
                    {p.company_tags.length > 2 && (
                      <Badge variant="ghost" className="bg-muted text-text-secondary tabular-nums">
                        +{p.company_tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                <Badge variant="secondary" className={cn("font-semibold", tone)}>
                  {p.difficulty}
                </Badge>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
