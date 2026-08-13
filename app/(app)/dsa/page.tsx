import { client } from '@/sanity/lib/client';
import DSAPageClient from './DSAPageClient';

export const revalidate = 60; // revalidate every 60 seconds

async function getPatterns() {
  return client.fetch(`*[_type == "pattern"] | order(title asc) {
    title,
    "slug": slug.current,
    timeComplexity,
    spaceComplexity,
    useCases
  }`);
}

export default async function DSAPage() {
  const patterns = await getPatterns();
  return <DSAPageClient initialPatterns={patterns} />;
}
