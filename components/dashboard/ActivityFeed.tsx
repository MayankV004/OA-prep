'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  CheckSquare, Pencil, Plus, Trash2, LogIn, LogOut, FileText, AlertCircle, Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

interface ActivityEvent {
  _id: string;
  kind: string;
  entity?: { type: string; title?: string };
  actorId: string;
  createdAt: string;
}

const KIND_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: (e: ActivityEvent) => string }> = {
  'problem.completed':   { icon: CheckSquare, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', label: e => `Completed: ${e.entity?.title ?? 'a problem'}` },
  'problem.uncompleted': { icon: CheckSquare, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', label: e => `Uncompleted: ${e.entity?.title ?? 'a problem'}` },
  'problem.created':     { icon: Plus, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: e => `Added problem: ${e.entity?.title ?? ''}` },
  'problem.updated':     { icon: Pencil, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', label: e => `Updated: ${e.entity?.title ?? 'a problem'}` },
  'problem.deleted':     { icon: Trash2, color: 'text-red-600 bg-red-600/10 border-red-600/20', label: e => `Deleted: ${e.entity?.title ?? 'a problem'}` },
  'note.updated':        { icon: FileText, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', label: e => `Updated notes: ${e.entity?.title ?? ''}` },
  'topic.created':       { icon: Plus, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: e => `Created topic: ${e.entity?.title ?? ''}` },
  'topic.updated':       { icon: Pencil, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', label: e => `Updated topic: ${e.entity?.title ?? ''}` },
  'topic.deleted':       { icon: Trash2, color: 'text-red-600 bg-red-600/10 border-red-600/20', label: e => `Deleted topic: ${e.entity?.title ?? ''}` },
  'cheatsheet.created':  { icon: Plus, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: e => `Created cheatsheet: ${e.entity?.title ?? ''}` },
  'cheatsheet.updated':  { icon: Pencil, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', label: e => `Updated cheatsheet: ${e.entity?.title ?? ''}` },
  'question.created':    { icon: Plus, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: e => `Added interview question` },
  'session.signed_in':   { icon: LogIn, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', label: () => 'Signed in' },
  'session.signed_out':  { icon: LogOut, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', label: () => 'Signed out' },
};

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
    <div className="relative pl-3 space-y-4 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/40">
      {events.map((event) => {
        const config = KIND_CONFIG[event.kind];
        const Icon = config?.icon ?? AlertCircle;
        const label = config ? config.label(event) : event.kind;
        const styleCls = config?.color ?? 'text-slate-400 bg-slate-500/10 border-slate-500/20';

        return (
          <div key={event._id} className="relative flex items-start gap-3 group">
            <div
              className={cn(
                'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-transform group-hover:scale-110',
                styleCls
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-xs font-semibold text-foreground truncate leading-snug">
                {label}
              </p>
              <span className="text-[10px] text-muted-foreground font-medium">
                {formatDistanceToNow(parseISO(event.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
