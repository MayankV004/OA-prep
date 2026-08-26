import DSAPageClient from './DSAPageClient';
import dbConnect from '@/lib/db';
import { Pattern } from '@/models';

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
