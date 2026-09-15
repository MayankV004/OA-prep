import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import { Assessment } from '@/models';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  let title = 'Online Assessment Briefing';
  let description = 'Timed company online assessment simulation.';

  try {
    await dbConnect();
    const assessment = await Assessment.findOne({ slug })
      .select('title company role description durationMinutes')
      .lean();
    const a = assessment as any;

    if (a) {
      title = `${a.company} ${a.role || 'Software Engineer'} Online Assessment`;
      description =
        a.description ||
        `Timed ${a.durationMinutes || 60}-minute technical assessment for ${a.company} ${a.role}. Includes authentic algorithmic problems and hidden test suites.`;
    }
  } catch {}

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/oa/${slug}`,
    },
    openGraph: {
      title: `${title} | BigO OA Simulator`,
      description,
      url: `${siteUrl}/oa/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function AssessmentBriefingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
