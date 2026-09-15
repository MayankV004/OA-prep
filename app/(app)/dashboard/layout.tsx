import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Candidate Dashboard',
  description: 'Track your DSA problem progress, OA mock simulation history, and daily practice streak.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
