'use client';

import { use } from 'react';
import Link from 'next/link';
import { ProblemTable } from '@/components/problem/ProblemTable';
import { Button } from '@/components/ui/button';
import { PageHeading } from '@/components/ui/typography';
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
    <div className="space-y-6 pb-12">
      <div className="flex items-start gap-3">
        <Button
          render={<Link href="/cp" />}
          variant="ghost"
          size="icon-xl"
          aria-label="Back to platforms"
          className="mt-0.5 shrink-0 sm:size-9"
        >
          <ArrowLeft aria-hidden />
        </Button>
        <PageHeading
          className="min-w-0 flex-1"
          overline="Competitive programming"
          title={platformName}
          description="Contest problems tracked for this platform."
        />
      </div>

      <ProblemTable kind="cp" group={platformName} groupLabel={platformName} showRating />
    </div>
  );
}
