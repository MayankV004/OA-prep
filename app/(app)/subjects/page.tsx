'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

interface Group { _id: string; name: string; slug: string; kind: string }

export default function SubjectsPage() {
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['groups', 'subject'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Core Subjects</h1>
        <p className="text-muted-foreground text-sm mt-1">OS, DBMS, CN, OOP, and more</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <Link key={group._id} href={`/subjects/${group.slug}`}>
              <div className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">Core subject</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              </div>
            </Link>
          ))}
          {groups.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-sm">No subjects found. Run <code className="bg-muted px-1 rounded">pnpm seed</code> to initialize.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
