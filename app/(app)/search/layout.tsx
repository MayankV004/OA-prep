import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Search',
  description: 'Search algorithms, problem variations, CS topics, and assessments across BigO.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
