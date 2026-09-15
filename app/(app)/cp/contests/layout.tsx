import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Competitive Programming Contest Radar',
  description:
    'Real-time aggregated schedule of upcoming programming contests from LeetCode, Codeforces, CodeChef, AtCoder, and HackerEarth with calendar alerts.',
  alternates: {
    canonical: `${siteUrl}/cp/contests`,
  },
  openGraph: {
    title: 'Competitive Programming Contest Radar | BigO',
    description:
      'Never miss a contest: live schedule for LeetCode, Codeforces, CodeChef, and AtCoder.',
    url: `${siteUrl}/cp/contests`,
    type: 'website',
  },
};

export default function ContestsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
