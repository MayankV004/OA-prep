'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  CheckSquare, Pencil, Plus, Trash2, LogIn, LogOut, FileText, AlertCircle
} from 'lucide-react';

interface ActivityEvent {
  _id: string;
  kind: string;
  entity?: { type: string; title?: string };
  actorId: string;
  createdAt: string;
}

const KIND_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: (e: ActivityEvent) => string }> = {
  'problem.completed':   { icon: CheckSquare, color: 'text-emerald-500', label: e => `Completed: ${e.entity?.title ?? 'a problem'}` },
  'problem.uncompleted': { icon: CheckSquare, color: 'text-muted-foreground', label: e => `Uncompleted: ${e.entity?.title ?? 'a problem'}` },
  'problem.created':     { icon: Plus, color: 'text-blue-500', label: e => `Added problem: ${e.entity?.title ?? ''}` },
  'problem.updated':     { icon: Pencil, color: 'text-amber-500', label: e => `Updated: ${e.entity?.title ?? 'a problem'}` },
  'problem.deleted':     { icon: Trash2, color: 'text-red-500', label: e => `Deleted: ${e.entity?.title ?? 'a problem'}` },
  'note.updated':        { icon: FileText, color: 'text-purple-500', label: e => `Updated notes: ${e.entity?.title ?? ''}` },
  'topic.created':       { icon: Plus, color: 'text-blue-500', label: e => `Created topic: ${e.entity?.title ?? ''}` },
  'topic.updated':       { icon: Pencil, color: 'text-amber-500', label: e => `Updated topic: ${e.entity?.title ?? ''}` },
  'topic.deleted':       { icon: Trash2, color: 'text-red-500', label: e => `Deleted topic: ${e.entity?.title ?? ''}` },
  'cheatsheet.created':  { icon: Plus, color: 'text-blue-500', label: e => `Created cheatsheet: ${e.entity?.title ?? ''}` },
  'cheatsheet.updated':  { icon: Pencil, color: 'text-amber-500', label: e => `Updated cheatsheet: ${e.entity?.title ?? ''}` },
  'question.created':    { icon: Plus, color: 'text-blue-500', label: e => `Added interview question` },
  'session.signed_in':   { icon: LogIn, color: 'text-muted-foreground', label: () => 'Signed in' },
  'session.signed_out':  { icon: LogOut, color: 'text-muted-foreground', label: () => 'Signed out' },
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (!events.length) return (
    <div className="text-center py-6 text-muted-foreground text-sm">
      No recent activity
    </div>
  );

  return (
    <ul className="space-y-3">
      {events.map(event => {
        const config = KIND_CONFIG[event.kind];
        const Icon = config?.icon ?? AlertCircle;
        const label = config ? config.label(event) : event.kind;
        const color = config?.color ?? 'text-muted-foreground';

        return (
          <li key={event._id} className="flex items-start gap-3">
            <span className={`mt-0.5 flex-shrink-0 ${color}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-snug truncate">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(parseISO(event.createdAt), { addSuffix: true })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
