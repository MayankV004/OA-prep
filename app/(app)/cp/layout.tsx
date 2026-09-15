import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Competitive Programming Hub',
  description:
    'Track ratings, contest histories, and performance analytics across Codeforces, LeetCode, CodeChef, and AtCoder with automatic contest alerts.',
  alternates: {
    canonical: `${siteUrl}/cp`,
  },
  openGraph: {
    title: 'Competitive Programming Hub | BigO',
    description:
      'Multi-platform competitive programming tracker, rating analytics, and upcoming contest alerts.',
    url: `${siteUrl}/cp`,
    type: 'website',
  },
};

export default function CPLayout({ children }: { children: React.ReactNode }) {
  return children;
}
