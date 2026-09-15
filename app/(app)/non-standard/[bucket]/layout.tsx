import type { Metadata } from 'next';
import { getNonStandardCategoryBySlug, slugToBucketName } from '@/lib/non-standard-dsa';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bucket: string }>;
}): Promise<Metadata> {
  const { bucket: slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  const category = getNonStandardCategoryBySlug(slug);
  const title = category ? category.shortName : slugToBucketName(slug);
  const description =
    category?.note || 'Ad-hoc, constructive, geometric, and mathematical invariant problems.';

  return {
    title: `${title} - Non-Standard DSA`,
    description,
    alternates: {
      canonical: `${siteUrl}/non-standard/${slug}`,
    },
    openGraph: {
      title: `${title} | BigO Non-Standard DSA`,
      description,
      url: `${siteUrl}/non-standard/${slug}`,
      type: 'article',
    },
  };
}

export default function NonStandardBucketLayout({ children }: { children: React.ReactNode }) {
  return children;
}
