'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

interface ActivityEvent {
  _id: string;
  kind: string;
  entity?: { type: string; title?: string };
  actorId: string;
  createdAt: string;
}

const KIND_LABEL: Record<string, (e: ActivityEvent) => string> = {
  'problem.completed':   e => `Completed: ${e.entity?.title ?? 'a problem'}`,
  'problem.uncompleted': e => `Uncompleted: ${e.entity?.title ?? 'a problem'}`,
  'problem.created':     e => `Added problem: ${e.entity?.title ?? ''}`,
  'problem.updated':     e => `Updated: ${e.entity?.title ?? 'a problem'}`,
  'problem.deleted':     e => `Deleted: ${e.entity?.title ?? 'a problem'}`,
  'note.updated':        e => `Updated notes: ${e.entity?.title ?? ''}`,
  'topic.created':       e => `Created topic: ${e.entity?.title ?? ''}`,
  'topic.updated':       e => `Updated topic: ${e.entity?.title ?? ''}`,
  'topic.deleted':       e => `Deleted topic: ${e.entity?.title ?? ''}`,
  'cheatsheet.created':  e => `Created cheatsheet: ${e.entity?.title ?? ''}`,
  'cheatsheet.updated':  e => `Updated cheatsheet: ${e.entity?.title ?? ''}`,
  'question.created':    () => 'Added interview question',
  'session.signed_in':   () => 'Signed in',
  'session.signed_out':  () => 'Signed out',
};

function getStatusColor(kind: string): string {
  if (kind.startsWith('problem.completed') || kind.includes('created') || kind === 'session.signed_in') {
    return 'bg-primary';
  }
  if (kind.includes('updated')) {
    return 'bg-warning';
  }
  if (kind.includes('deleted')) {
    return 'bg-destructive';
  }
  return 'bg-muted-foreground/60';
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (!events.length) return (
    <EmptyState
      compact
      icon={Inbox}
      title="No recent activity"
      description="Your recent problem actions will appear here."
    />
  );

  return (
    <div className="relative pl-1 space-y-3.5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border/60">
      {events.map((event) => {
        const labelFn = KIND_LABEL[event.kind];
        const label = labelFn ? labelFn(event) : event.kind;
        const dotColor = getStatusColor(event.kind);

        return (
          <div key={event._id} className="relative flex items-start gap-3 group">
            <span
              className={cn(
                'relative z-10 size-2.5 rounded-full mt-1 shrink-0 ring-4 ring-card transition-transform group-hover:scale-125',
                dotColor
              )}
            />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate leading-snug">
                {label}
              </p>
              <span className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(parseISO(event.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
