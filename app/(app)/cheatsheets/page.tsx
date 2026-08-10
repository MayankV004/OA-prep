'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Cheatsheet { _id: string; title: string; slug: string; tags?: string[]; updatedAt: string }

export default function CheatsheetsPage() {
  const { data: cheatsheets = [], isLoading } = useQuery<Cheatsheet[]>({
    queryKey: ['cheatsheets'],
    queryFn: async () => {
      const res = await fetch('/api/cheatsheets');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [tagFilter, setTagFilter] = useState('');
  const allTags = Array.from(new Set(cheatsheets.flatMap(c => c.tags ?? [])));
  const filtered = tagFilter ? cheatsheets.filter(c => c.tags?.includes(tagFilter)) : cheatsheets;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cheat Sheets</h1>
          <p className="text-muted-foreground text-sm mt-1">Quick reference Markdown documents</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New Cheat Sheet</Button>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTagFilter('')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              !tagFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                tagFilter === tag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No cheat sheets yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(sheet => (
            <Link key={sheet._id} href={`/cheatsheets/${sheet.slug}`}>
              <div className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer h-full flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-sm leading-tight">{sheet.title}</h3>
                </div>
                {sheet.tags && sheet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sheet.tags.map(tag => (
                      <span key={tag} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-auto">
                  {formatDistanceToNow(parseISO(sheet.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
