import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import { Cheatsheet } from '@/models';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  try {
    await dbConnect();
    const sheetDoc = await Cheatsheet.findOne({ slug }).select('title body tags').lean();
    const sheet = sheetDoc as any;

    if (!sheet) {
      return {
        title: 'Cheatsheet Not Found',
      };
    }

    const title = `${sheet.title} Cheatsheet & Syntax Guide`;
    const description =
      sheet.body?.slice(0, 150).replace(/[#*`_]/g, '') ||
      `Complete quick-reference syntax and usage cheat sheet for ${sheet.title}.`;

    return {
      title,
      description,
      alternates: {
        canonical: `${siteUrl}/cheatsheets/${slug}`,
      },
      openGraph: {
        title: `${sheet.title} Cheatsheet | BigO`,
        description,
        url: `${siteUrl}/cheatsheets/${slug}`,
        type: 'article',
      },
      twitter: {
        card: 'summary',
        title: `${sheet.title} Cheatsheet`,
        description,
      },
    };
  } catch {
    return {
      title: 'Cheatsheet Details',
    };
  }
}

export default function CheatsheetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
