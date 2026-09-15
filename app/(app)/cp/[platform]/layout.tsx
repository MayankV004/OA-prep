import type { Metadata } from 'next';

function slugToPlatform(slug: string) {
  const map: Record<string, string> = {
    codeforces: 'Codeforces',
    'leetcode-contest': 'LeetCode Contest',
    atcoder: 'AtCoder',
    codechef: 'CodeChef',
  };
  return map[slug] ?? slug;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const { platform: slug } = await params;
  const platformName = slugToPlatform(slug);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  return {
    title: `${platformName} Problems & Rating Analysis`,
    description: `Track ${platformName} contest performance, solved problems, and rating percentiles on BigO.`,
    alternates: {
      canonical: `${siteUrl}/cp/${slug}`,
    },
    openGraph: {
      title: `${platformName} | BigO CP Hub`,
      description: `Track ${platformName} contest performance and problem archives.`,
      url: `${siteUrl}/cp/${slug}`,
      type: 'website',
    },
  };
}

export default function CPPlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
