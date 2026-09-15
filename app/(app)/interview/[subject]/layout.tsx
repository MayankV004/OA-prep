import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import { Group } from '@/models';

const SUBJECT_NAMES: Record<string, string> = {
  os: 'Operating Systems',
  dbms: 'Database Management Systems',
  cn: 'Computer Networks',
  oops: 'Object-Oriented Programming',
  system_design: 'System Design',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject: slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  let subjectName = SUBJECT_NAMES[slug] || slug.toUpperCase();

  try {
    await dbConnect();
    const groupDoc = await Group.findOne({ slug }).select('name').lean();
    const group = groupDoc as any;
    if (group?.name) subjectName = group.name;
  } catch {}

  const title = `${subjectName} Interview Questions & Flashcards`;
  const description = `Practice high-yield technical interview questions, answers, and spaced repetition flashcards for ${subjectName}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/interview/${slug}`,
    },
    openGraph: {
      title: `${title} | BigO`,
      description,
      url: `${siteUrl}/interview/${slug}`,
      type: 'article',
    },
  };
}

export default function InterviewSubjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
