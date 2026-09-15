import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Engineering Cheatsheets & Syntax Reference',
  description:
    'Concise, high-yield cheatsheets and syntax references for Python, Java, C++, TypeScript, Git, Docker, and core System Design patterns.',
  alternates: {
    canonical: `${siteUrl}/cheatsheets`,
  },
  openGraph: {
    title: 'Engineering Cheatsheets & Syntax Reference | BigO',
    description:
      'High-yield quick references for programming languages, algorithms, and system design.',
    url: `${siteUrl}/cheatsheets`,
    type: 'website',
  },
};

export default function CheatsheetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
