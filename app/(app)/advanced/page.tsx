'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, Cpu } from 'lucide-react';

interface Group { _id: string; name: string; slug: string }

export default function AdvancedPage() {
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['groups', 'advanced'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=advanced');
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Advanced Topics</h1>
        <p className="text-muted-foreground text-sm mt-1">DevOps, System Design, GenAI, Cloud, and more</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <Link key={group._id} href={`/advanced/${group.slug}`}>
              <div className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Cpu className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-sm">{group.name}</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
