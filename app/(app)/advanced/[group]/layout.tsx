import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import { Group } from '@/models';

const TRACK_NAMES: Record<string, string> = {
  devops: 'DevOps Engineering',
  cloud: 'Cloud Architecture & AWS',
  distributed: 'Distributed Systems',
  security: 'Cybersecurity & Application Security',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group: slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  let trackName = TRACK_NAMES[slug] || slug.toUpperCase();
  let description = `Comprehensive syllabus and interview revision materials for ${trackName}.`;

  try {
    await dbConnect();
    const groupDoc = await Group.findOne({ slug, kind: 'advanced' }).select('name description').lean();
    const g = groupDoc as any;
    if (g?.name) {
      trackName = g.name;
      if (g.description) description = g.description;
    }
  } catch {}

  const title = `${trackName} - Advanced Specialization`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/advanced/${slug}`,
    },
    openGraph: {
      title: `${title} | BigO`,
      description,
      url: `${siteUrl}/advanced/${slug}`,
      type: 'article',
    },
  };
}

export default function AdvancedGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
