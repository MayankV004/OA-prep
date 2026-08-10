'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Plus, FileText } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Group { _id: string; name: string; slug: string }
interface Topic { _id: string; title: string; body?: string; updatedAt: string }

export default function AdvancedGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: slug } = use(params);

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups', 'advanced'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=advanced');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const group = groups.find(g => g.slug === slug);

  const { data: topics = [], isLoading } = useQuery<Topic[]>({
    queryKey: ['topics', { groupId: group?._id }],
    queryFn: async () => {
      if (!group) return [];
      const res = await fetch(`/api/topics?groupId=${group._id}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: !!group,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/advanced">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{group?.name ?? slug}</h1>
      </div>

      <div className="flex justify-end">
        <Link href={`/advanced/${slug}/new`}>
          <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New Topic</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No topics yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topics.map(topic => (
            <Link key={topic._id} href={`/advanced/${slug}/${topic._id}`}>
              <div className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 hover:border-primary/40 transition-all cursor-pointer">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{topic.title}</h3>
                  <p className="text-xs text-muted-foreground">Updated {formatDistanceToNow(parseISO(topic.updatedAt), { addSuffix: true })}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
