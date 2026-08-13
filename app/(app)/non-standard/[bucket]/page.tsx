'use client';

import { use } from 'react';
import Link from 'next/link';
import { ProblemTable } from '@/components/problem/ProblemTable';
import { Button } from '@/components/ui/button';
import { PageHeading } from '@/components/ui/typography';
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
    <div className="space-y-6 pb-12">
      <div className="flex items-start gap-3">
        <Button
          render={<Link href="/non-standard" />}
          variant="ghost"
          size="icon-xl"
          aria-label="Back to non-standard buckets"
          className="mt-0.5 shrink-0 sm:size-9"
        >
          <ArrowLeft aria-hidden />
        </Button>
        <PageHeading
          className="min-w-0 flex-1"
          overline="Non-standard"
          title={bucketName}
          description="Ad-hoc, constructive and math problems in this bucket."
        />
      </div>

      <ProblemTable kind="nonstandard" group={bucketName} groupLabel={bucketName} />
    </div>
  );
}
