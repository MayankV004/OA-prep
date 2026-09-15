import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Company Online Assessment (OA) Simulations',
  description:
    'Simulate real 45 to 70-minute timed Online Assessments from top tech companies (Google, Amazon, Uber, Microsoft). Hidden test cases, realistic proctoring, and comprehensive scorecards.',
  alternates: {
    canonical: `${siteUrl}/oa`,
  },
  openGraph: {
    title: 'Company Online Assessment (OA) Simulations | BigO',
    description:
      'Realistic timed OA simulations for top tech companies with comprehensive test suites and edge cases.',
    url: `${siteUrl}/oa`,
    type: 'website',
  },
};

export default function OALayout({ children }: { children: React.ReactNode }) {
  return children;
}
