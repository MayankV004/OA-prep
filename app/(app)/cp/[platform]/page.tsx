'use client';

import { use } from 'react';
import Link from 'next/link';
import { ProblemTable } from '@/components/problem/ProblemTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function slugToPlatform(slug: string) {
  const map: Record<string, string> = {
    codeforces: 'Codeforces',
    'leetcode-contest': 'LeetCode Contest',
    atcoder: 'AtCoder',
    codechef: 'CodeChef',
  };
  return map[slug] ?? slug;
}

export default function CPPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform: slug } = use(params);
  const platformName = slugToPlatform(slug);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/cp">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{platformName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Competitive programming problems</p>
        </div>
      </div>
      <ProblemTable kind="cp" group={platformName} groupLabel={platformName} showRating />
    </div>
  );
}
