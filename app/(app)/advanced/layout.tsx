import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Advanced Computer Science Specializations',
  description:
    'Structured deep-dive tracks in DevOps, Cloud Architecture, Distributed Systems, and Cybersecurity for senior engineering roles.',
  alternates: {
    canonical: `${siteUrl}/advanced`,
  },
  openGraph: {
    title: 'Advanced Computer Science Specializations | BigO',
    description:
      'DevOps, Cloud, Distributed Systems, and Security curricula for senior software engineering interviews.',
    url: `${siteUrl}/advanced`,
    type: 'website',
  },
};

export default function AdvancedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
