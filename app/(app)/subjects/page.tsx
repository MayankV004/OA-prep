'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Group {
  _id: string;
  name: string;
  slug: string;
  kind: string;
  description?: string;
}

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['groups', 'subject'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Core <span className="text-rose-500">CS Subjects</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl font-light">
            Operating Systems, DBMS, Computer Networks, System Design, OOPs, and more. Pick a subject to study interactive concept notes.
          </p>
        </div>

        {!isLoading && groups.length > 0 && (
          <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/10 text-rose-500 font-mono text-xs font-bold shrink-0">
            {groups.length} subject{groups.length !== 1 ? 's' : ''} available
          </div>
        )}
      </div>

      {/* 2. Search Control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-background/50 backdrop-blur-md border border-border/30">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 text-sm font-medium bg-background/80 rounded-xl border border-border/40 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
        </div>
      </div>

      {/* 3. Subjects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-background/60 backdrop-blur-xl space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card className="rounded-3xl border-none bg-background/50 p-8 text-center">
          <CardContent>
            <EmptyState
              title="No subjects found"
              description={
                searchQuery
                  ? `No subject matches "${searchQuery}".`
                  : 'No core subjects have been published yet.'
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Link
              key={group._id}
              href={`/subjects/${group.slug}`}
              className="group block outline-none"
            >
              <Card className="h-full flex flex-col justify-between p-6 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground group-hover:text-rose-500 transition-colors truncate">
                      {group.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-mono text-[11px] font-semibold shrink-0">
                      Core Subject
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {group.description || `Master essential concepts and interview notes for ${group.name}.`}
                  </p>
                </div>

                <div className="pt-6 flex items-center justify-between text-xs border-t border-border/20 mt-4">
                  <span className="text-rose-500 font-bold group-hover:underline">
                    Browse Notes
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {group.slug}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
