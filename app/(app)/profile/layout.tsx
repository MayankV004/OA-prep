import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile & Progress',
  description: 'Manage your BigO candidate account, track algorithmic pattern mastery, activity telemetry, and connected CP profiles.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
