'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  CheckCircle2,
  RotateCcw,
  PlusCircle,
  FileCode,
  Trash2,
  FileText,
  BookOpen,
  FileSpreadsheet,
  HelpCircle,
  LogIn,
  LogOut,
  Activity,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

interface ActivityEvent {
  _id: string;
  kind: string;
  entity?: { type?: string; id?: string; title?: string };
  actorId: string;
  createdAt: string;
}

interface EventConfig {
  label: (e: ActivityEvent) => string;
  icon: typeof Activity;
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

const EVENT_CONFIGS: Record<string, EventConfig> = {
  'problem.completed': {
    label: (e) => `Completed: ${e.entity?.title || 'a problem'}`,
    icon: CheckCircle2,
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/20',
  },
  'problem.uncompleted': {
    label: (e) => `Reopened: ${e.entity?.title || 'a problem'}`,
    icon: RotateCcw,
    color: 'text-amber-500',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/20',
  },
  'problem.created': {
    label: (e) => `Created problem: ${e.entity?.title || ''}`,
    icon: PlusCircle,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/20',
  },
  'problem.updated': {
    label: (e) => `Updated: ${e.entity?.title || 'a problem'}`,
    icon: FileCode,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/20',
  },
  'problem.deleted': {
    label: (e) => `Removed: ${e.entity?.title || 'a problem'}`,
    icon: Trash2,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/20',
  },
  'note.updated': {
    label: (e) => `Updated study notes: ${e.entity?.title || ''}`,
    icon: FileText,
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/20',
  },
  'topic.created': {
    label: (e) => `Created topic: ${e.entity?.title || ''}`,
    icon: BookOpen,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/20',
  },
  'topic.updated': {
    label: (e) => `Updated topic: ${e.entity?.title || ''}`,
    icon: BookOpen,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/20',
  },
  'cheatsheet.created': {
    label: (e) => `Created cheatsheet: ${e.entity?.title || ''}`,
    icon: FileSpreadsheet,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/20',
  },
  'cheatsheet.updated': {
    label: (e) => `Updated cheatsheet: ${e.entity?.title || ''}`,
    icon: FileSpreadsheet,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/20',
  },
  'question.created': {
    label: () => 'Added interview question',
    icon: HelpCircle,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/20',
  },
  'session.signed_in': {
    label: () => 'Signed into workspace',
    icon: LogIn,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/20',
  },
  'session.signed_out': {
    label: () => 'Signed out of workspace',
    icon: LogOut,
    color: 'text-muted-foreground',
    badgeBg: 'bg-muted',
    badgeBorder: 'border-border/60',
  },
};

const DEFAULT_CONFIG: EventConfig = {
  label: (e) => e.kind.replace(/_/g, ' '),
  icon: Activity,
  color: 'text-muted-foreground',
  badgeBg: 'bg-muted',
  badgeBorder: 'border-border/60',
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (!events.length) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center">
        <EmptyState
          compact
          icon={Activity}
          title="No recent activity recorded"
          description="Solve a problem or take a diagnostic assessment to initiate telemetry."
        />
        <Link
          href="/dsa"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          <span>Practice DSA Problems</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative pl-2 space-y-2.5 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-px before:bg-border/60">
      {events.map((event) => {
        const config = EVENT_CONFIGS[event.kind] || DEFAULT_CONFIG;
        const label = config.label(event);
        const IconComponent = config.icon;
        const isProblem = event.kind.startsWith('problem.') || event.entity?.type === 'problem';

        return (
          <div
            key={event._id}
            className="group relative flex items-start gap-3 p-2 rounded-xl transition-colors hover:bg-muted/40"
          >
            {/* Semantic Icon Pill */}
            <div
              className={cn(
                'relative z-10 size-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                config.badgeBg,
                config.badgeBorder
              )}
            >
              <IconComponent className={cn('size-3.5', config.color)} />
            </div>

            {/* Event Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-medium text-foreground truncate leading-snug">
                  {label}
                </p>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0 tabular-nums">
                  {formatDistanceToNow(parseISO(event.createdAt), { addSuffix: true })}
                </span>
              </div>

              {isProblem && (
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
                    Algorithmic Problem
                  </span>
                  <Link
                    href="/dsa"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span>View in DSA</span>
                    <ArrowRight className="size-2.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
