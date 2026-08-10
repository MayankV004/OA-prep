'use client';

import { use } from 'react';
import Link from 'next/link';
import { ProblemTable } from '@/components/problem/ProblemTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function slugToBucket(slug: string) {
  const map: Record<string, string> = {
    'ad-hoc': 'Ad-hoc',
    constructive: 'Constructive',
    math: 'Math',
  };
  return map[slug] ?? slug;
}

export default function NonStandardBucketPage({ params }: { params: Promise<{ bucket: string }> }) {
  const { bucket: slug } = use(params);
  const bucketName = slugToBucket(slug);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/non-standard">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{bucketName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Non-standard problems</p>
        </div>
      </div>
      <ProblemTable kind="nonstandard" group={bucketName} groupLabel={bucketName} />
    </div>
  );
}
