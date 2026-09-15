import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile & Settings',
  description: 'Manage your BigO candidate account, handle linkages, preferences, and subscriptions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
