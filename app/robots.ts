import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  const commonPublicAllow = [
    '/',
    '/dsa',
    '/dsa/',
    '/subjects',
    '/subjects/',
    '/cheatsheets',
    '/cheatsheets/',
    '/oa',
    '/oa/',
    '/interview',
    '/interview/',
    '/cp',
    '/cp/',
    '/non-standard',
    '/non-standard/',
    '/advanced',
    '/advanced/',
    '/pricing',
    '/contact',
    '/privacy',
    '/terms',
    '/llms.txt',
    '/llms-full.txt',
    '/sitemap.xml',
  ];

  const commonPrivateDisallow = [
    '/admin/',
    '/admin',
    '/api/',
    '/dashboard',
    '/profile',
    '/feedback',
    '/search',
    '/oa/*/test',
    '/oa/*/report',
    '/verify-email',
    '/invite/',
  ];

  return {
    rules: [
      // Standard search web crawlers
      {
        userAgent: '*',
        allow: commonPublicAllow,
        disallow: commonPrivateDisallow,
      },
      // OpenAI ChatGPT Search & Model Crawlers
      {
        userAgent: ['GPTBot', 'ChatGPT-User'],
        allow: commonPublicAllow,
        disallow: commonPrivateDisallow,
      },
      // Perplexity AI Answer Engine
      {
        userAgent: 'PerplexityBot',
        allow: commonPublicAllow,
        disallow: commonPrivateDisallow,
      },
      // Anthropic Claude Web Scrapers & Crawlers
      {
        userAgent: ['ClaudeBot', 'anthropic-ai'],
        allow: commonPublicAllow,
        disallow: commonPrivateDisallow,
      },
      // Google Gemini Grounding & Extended Crawler
      {
        userAgent: 'Google-Extended',
        allow: commonPublicAllow,
        disallow: commonPrivateDisallow,
      },
      // Apple Intelligence & Cohere AI
      {
        userAgent: ['Applebot-Extended', 'cohere-ai'],
        allow: commonPublicAllow,
        disallow: commonPrivateDisallow,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
