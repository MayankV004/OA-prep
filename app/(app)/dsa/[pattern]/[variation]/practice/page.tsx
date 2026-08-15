import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Pattern } from '@/models';
import PracticePageClient from '@/components/dsa/PracticePageClient';

export const revalidate = 60;

export default async function PracticePage({
  params,
}: {
  params: Promise<{ pattern: string; variation: string }>;
}) {
  const { pattern: patternSlug, variation: variationId } = await params;

  await dbConnect();
  const patternDoc = await Pattern.findOne({ slug: patternSlug }).lean();
  const pattern = patternDoc ? JSON.parse(JSON.stringify(patternDoc)) : null;

  if (!pattern) notFound();

  const variation = (pattern.variations || []).find(
    (v: any) => (v._id?.toString() || v.id?.toString()) === variationId
  );

  if (!variation) notFound();

  const problems = (variation.problems || []).map((p: any) => ({
    _id: p._id?.toString() || p.id?.toString(),
    name: p.name,
    difficulty: p.difficulty,
    platform: p.platform,
    link: p.link,
    priority: p.priority,
    company_tags: p.company_tags || [],
  }));

  const varTitle = variation.variation || variation.title;

  return (
    <div className="pb-24 space-y-8">
      {/* 1. Header Section with Tall Display Typography */}
      <header className="flex flex-col gap-4 pt-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              {varTitle}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-light">
              {problems.length} problem{problems.length !== 1 ? 's' : ''} · Interactive practice session
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-rose-500/10 text-rose-500 text-xs font-bold font-mono">
            <span>Practice Session</span>
          </div>
        </div>
      </header>

      {/* 2. Practice Page Client */}
      <div>
        <PracticePageClient
          problems={problems}
          patternTitle={pattern.title}
          variationTitle={varTitle}
        />
      </div>
    </div>
  );
}
