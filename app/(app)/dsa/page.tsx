import type { Metadata } from 'next';
import DSAPageClient from './DSAPageClient';
import dbConnect from '@/lib/db';
import { Pattern } from '@/models';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'DSA Patterns & Variation Roadmap',
  description:
    'Master 14+ core Data Structures and Algorithms patterns: Sliding Window, Two Pointers, Monotonic Stack, Intervals, Dynamic Programming, and Graph Traversals with reusable code blueprints.',
  alternates: {
    canonical: `${siteUrl}/dsa`,
  },
  openGraph: {
    title: 'DSA Patterns & Variation Roadmap | BigO',
    description:
      'Master Data Structures and Algorithms by learning pattern variations instead of memorizing random questions.',
    url: `${siteUrl}/dsa`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'DSA Patterns Roadmap | BigO',
    description: 'Master core algorithmic variations and interview templates.',
  },
};

export const revalidate = 60;

async function getPatterns() {
  try {
    await dbConnect();
    const patterns = await Pattern.find()
      .select('title slug timeComplexity spaceComplexity useCases description concept variations')
      .sort({ title: 1 })
      .lean();
    
    return JSON.parse(JSON.stringify(patterns));
  } catch (error) {
    console.error('Failed to fetch patterns during build/rendering:', error);
    return [];
  }
}

export default async function DSAPage() {
  const patterns = await getPatterns();
  return <DSAPageClient initialPatterns={patterns} />;
}
