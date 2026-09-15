import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Technical Interview Questions & Flashcards',
  description:
    'Master technical interview questions across OS, DBMS, Computer Networks, and OOP with spaced-repetition flashcards and high-yield interview questions.',
  alternates: {
    canonical: `${siteUrl}/interview`,
  },
  openGraph: {
    title: 'Technical Interview Questions & Flashcards | BigO',
    description:
      'High-yield computer science interview Q&A and spaced-repetition flashcards for software engineering interviews.',
    url: `${siteUrl}/interview`,
    type: 'website',
  },
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
