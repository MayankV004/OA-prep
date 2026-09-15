import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Active Assessment Room',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AssessmentTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
