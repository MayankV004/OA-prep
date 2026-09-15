import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your BigO account to continue your technical interview and online assessment preparation.',
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
