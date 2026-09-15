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
  let description = `Comprehensive high-yield notes, concepts, and technical interview questions for ${subjectName}.`;

  try {
    await dbConnect();
    const groupDoc = await Group.findOne({ slug, kind: 'subject' }).select('name description').lean();
    const group = groupDoc as any;
    if (group?.name) {
      subjectName = group.name;
      if (group.description) description = group.description;
    }
  } catch {}

  const title = `${subjectName} - CS Core Curriculum`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/subjects/${slug}`,
    },
    openGraph: {
      title: `${subjectName} | BigO Core CS`,
      description,
      url: `${siteUrl}/subjects/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${subjectName} Core CS Revision`,
      description,
    },
  };
}

export default async function SubjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subject: string }>;
}) {
  const { subject: slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';
  const subjectName = SUBJECT_NAMES[slug] || slug.toUpperCase();

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${siteUrl}/subjects/${slug}#course`,
    name: `${subjectName} Core Curriculum`,
    description: `Comprehensive syllabus, high-yield revision notes, and technical interview questions for ${subjectName}.`,
    provider: {
      '@type': 'Organization',
      name: 'BigO',
      sameAs: siteUrl,
    },
    educationalLevel: 'Beginner to Advanced Engineering Candidates',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online self-paced study',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      {children}
    </>
  );
}
