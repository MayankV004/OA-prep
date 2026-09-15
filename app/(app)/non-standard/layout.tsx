import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Non-Standard DSA & Mathematical Invariants',
  description:
    'Curated ad-hoc, constructive, geometric, and math-insight problems that do not fit classical patterns. Master the unexpected tricks common in online assessments.',
  alternates: {
    canonical: `${siteUrl}/non-standard`,
  },
  openGraph: {
    title: 'Non-Standard DSA & Mathematical Invariants | BigO',
    description:
      'Curated ad-hoc, constructive, and math-insight problems that break classical DSA templates.',
    url: `${siteUrl}/non-standard`,
    type: 'website',
  },
};

export default function NonStandardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
