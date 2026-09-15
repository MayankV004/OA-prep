import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback & Bug Reports',
  description: 'Submit candidate feedback and bug reports to the BigO engineering team.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
