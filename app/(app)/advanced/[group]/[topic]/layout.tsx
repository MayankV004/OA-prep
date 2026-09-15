import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import { Topic } from '@/models';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string; topic: string }>;
}): Promise<Metadata> {
  const { group, topic: topicId } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  let title = 'Advanced Engineering Topic';
  let description = 'In-depth notes and interview prep for this specialization topic.';

  try {
    await dbConnect();
    const topicDoc = await Topic.findById(topicId).select('title body').lean();
    const t = topicDoc as any;
    if (t?.title) {
      title = `${t.title} - ${group.toUpperCase()} Notes`;
      if (t.body) {
        description = t.body.slice(0, 150).replace(/[#*`_]/g, '');
      }
    }
  } catch {}

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/advanced/${group}/${topicId}`,
    },
    openGraph: {
      title: `${title} | BigO`,
      description,
      url: `${siteUrl}/advanced/${group}/${topicId}`,
      type: 'article',
    },
  };
}

export default function AdvancedTopicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
