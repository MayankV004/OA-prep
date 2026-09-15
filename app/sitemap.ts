import type { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import { Pattern, Cheatsheet, Group, Assessment } from '@/models';
import { getNonStandardCategories } from '@/lib/non-standard-dsa';

export const revalidate = 3600; // revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';
  const now = new Date();

  // 1. Static high-value routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dsa`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/subjects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/cheatsheets`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/oa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/interview`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/cp`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/cp/contests`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/non-standard`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/advanced`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. Non-standard DSA categories
  const nonStandardEntries: MetadataRoute.Sitemap = getNonStandardCategories().map((cat) => ({
    url: `${siteUrl}/non-standard/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 3. Competitive programming platforms
  const cpPlatforms = ['codeforces', 'leetcode-contest', 'atcoder', 'codechef'];
  const cpPlatformEntries: MetadataRoute.Sitemap = cpPlatforms.map((p) => ({
    url: `${siteUrl}/cp/${p}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // 4. Dynamic database-backed routes
  let patternEntries: MetadataRoute.Sitemap = [];
  let cheatsheetEntries: MetadataRoute.Sitemap = [];
  let subjectEntries: MetadataRoute.Sitemap = [];
  let assessmentEntries: MetadataRoute.Sitemap = [];

  try {
    await dbConnect();

    const [patterns, sheets, subjectGroups, assessments] = await Promise.all([
      Pattern.find().select('slug updatedAt').lean(),
      Cheatsheet.find().select('slug updatedAt').lean(),
      Group.find({ kind: 'subject' }).select('slug updatedAt').lean(),
      Assessment.find().select('slug updatedAt').lean(),
    ]);

    if (patterns?.length) {
      patternEntries = patterns.map((p: any) => ({
        url: `${siteUrl}/dsa/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    if (sheets?.length) {
      cheatsheetEntries = sheets.map((s: any) => ({
        url: `${siteUrl}/cheatsheets/${s.slug}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    if (subjectGroups?.length) {
      subjectEntries = subjectGroups.map((g: any) => ({
        url: `${siteUrl}/subjects/${g.slug}`,
        lastModified: g.updatedAt ? new Date(g.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    if (assessments?.length) {
      assessmentEntries = assessments.map((a: any) => ({
        url: `${siteUrl}/oa/${a.slug}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Failed to query dynamic sitemap entries from database:', error);
  }

  return [
    ...staticRoutes,
    ...patternEntries,
    ...cheatsheetEntries,
    ...subjectEntries,
    ...assessmentEntries,
    ...nonStandardEntries,
    ...cpPlatformEntries,
  ];
}
