'use client';

import { use } from 'react';
import Link from 'next/link';
import { ProblemTable } from '@/components/problem/ProblemTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Convert slug back to pattern name
function slugToName(slug: string) {
  const map: Record<string, string> = {
    'sliding-window': 'Sliding Window',
    'two-pointers': 'Two Pointers',
    'binary-search': 'Binary Search',
    backtracking: 'Backtracking',
    dp: 'DP',
    graphs: 'Graphs',
    trees: 'Trees',
    greedy: 'Greedy',
    heap: 'Heap',
    trie: 'Trie',
    'segment-tree': 'Segment Tree',
    'bit-manipulation': 'Bit Manipulation',
  };
  return map[slug] ?? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function DSAPatternPage({ params }: { params: Promise<{ pattern: string }> }) {
  const { pattern: slug } = use(params);
  const patternName = slugToName(slug);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dsa">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{patternName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Pattern-wise DSA problems</p>
        </div>
      </div>

      <ProblemTable
        kind="pattern"
        group={patternName}
        groupLabel={patternName}
      />
    </div>
  );
}
