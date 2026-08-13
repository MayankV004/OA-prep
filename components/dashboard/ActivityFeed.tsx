'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  CheckSquare, Pencil, Plus, Trash2, LogIn, LogOut, FileText, AlertCircle, Inbox
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/typography';
import { EmptyState } from '@/components/ui/empty-state';

interface ActivityEvent {
  _id: string;
  kind: string;
  entity?: { type: string; title?: string };
  actorId: string;
  createdAt: string;
}

const KIND_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: (e: ActivityEvent) => string }> = {
  'problem.completed':   { icon: CheckSquare, color: 'text-success', label: e => `Completed: ${e.entity?.title ?? 'a problem'}` },
  'problem.uncompleted': { icon: CheckSquare, color: 'text-text-muted', label: e => `Uncompleted: ${e.entity?.title ?? 'a problem'}` },
  'problem.created':     { icon: Plus, color: 'text-info', label: e => `Added problem: ${e.entity?.title ?? ''}` },
  'problem.updated':     { icon: Pencil, color: 'text-warning', label: e => `Updated: ${e.entity?.title ?? 'a problem'}` },
  'problem.deleted':     { icon: Trash2, color: 'text-destructive', label: e => `Deleted: ${e.entity?.title ?? 'a problem'}` },
  'note.updated':        { icon: FileText, color: 'text-primary', label: e => `Updated notes: ${e.entity?.title ?? ''}` },
  'topic.created':       { icon: Plus, color: 'text-info', label: e => `Created topic: ${e.entity?.title ?? ''}` },
  'topic.updated':       { icon: Pencil, color: 'text-warning', label: e => `Updated topic: ${e.entity?.title ?? ''}` },
  'topic.deleted':       { icon: Trash2, color: 'text-destructive', label: e => `Deleted topic: ${e.entity?.title ?? ''}` },
  'cheatsheet.created':  { icon: Plus, color: 'text-info', label: e => `Created cheatsheet: ${e.entity?.title ?? ''}` },
  'cheatsheet.updated':  { icon: Pencil, color: 'text-warning', label: e => `Updated cheatsheet: ${e.entity?.title ?? ''}` },
  'question.created':    { icon: Plus, color: 'text-info', label: e => `Added interview question` },
  'session.signed_in':   { icon: LogIn, color: 'text-text-muted', label: () => 'Signed in' },
  'session.signed_out':  { icon: LogOut, color: 'text-text-muted', label: () => 'Signed out' },
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (!events.length) return (
    <EmptyState
      compact
      icon={Inbox}
      title="No recent activity"
      description="Complete a problem or update your notes and it will show up here."
    />
  );

  return (
    <ul className="divide-y divide-divider">
      {events.map(event => {
        const config = KIND_CONFIG[event.kind];
        const Icon = config?.icon ?? AlertCircle;
        const label = config ? config.label(event) : event.kind;
        const color = config?.color ?? 'text-text-muted';

        return (
          <li key={event._id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
            <span
              aria-hidden
              className={cn(
                'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-muted',
                color
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <Text size="compact" tone="primary" className="truncate leading-snug">
                {label}
              </Text>
              <Text size="caption" tone="muted" numeric className="mt-0.5">
                {formatDistanceToNow(parseISO(event.createdAt), { addSuffix: true })}
              </Text>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
