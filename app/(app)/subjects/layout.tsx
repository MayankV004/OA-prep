import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Core Computer Science Subjects',
  description:
    'Comprehensive curricula and interview revision notes for core Computer Science topics: Operating Systems, DBMS, Computer Networks, and System Design.',
  alternates: {
    canonical: `${siteUrl}/subjects`,
  },
  openGraph: {
    title: 'Core Computer Science Subjects | BigO',
    description:
      'Curated curricula for Operating Systems, Database Systems, Computer Networks, and System Design for technical interviews.',
    url: `${siteUrl}/subjects`,
    type: 'website',
  },
};

export default function SubjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
