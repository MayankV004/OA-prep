import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your free BigO account to master DSA patterns, take timed mock assessments, and track interview preparation progress.',
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
