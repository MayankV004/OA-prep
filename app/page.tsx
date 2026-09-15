import type { Metadata } from 'next';
import { LandingPageClient } from '@/components/landing/LandingPageClient';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'BigO - Master DSA Patterns & Technical Online Assessments',
  description:
    'Structured DSA pattern roadmaps, interactive CS core modules, spaced-repetition flashcards, and real-time coding environments designed to help you crack engineering placements.',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'BigO - Master DSA Patterns & Technical Online Assessments',
    description:
      'Structured DSA pattern roadmaps, interactive CS core modules, spaced-repetition flashcards, and real-time coding environments designed to help you land top engineering roles.',
    url: siteUrl,
    type: 'website',
    siteName: 'BigO',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'BigO Technical Assessment Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BigO - Master DSA Patterns & Technical Online Assessments',
    description:
      'Structured DSA pattern roadmaps, interactive CS core modules, and timed OA simulations.',
    images: ['/icon.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#app`,
      name: 'BigO Technical Assessment Platform',
      url: siteUrl,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All modern web browsers',
      description:
        'Structured algorithmic problem roadmaps, CS core subjects, and timed online assessment simulations for engineering candidates.',
      featureList: [
        '14 Core DSA Pattern Roadmaps',
        'Timed 45-70 min Company Online Assessment Simulators',
        'Interactive CS Core Subjects (OS, DBMS, CN, System Design)',
        'Spaced Repetition Flashcards',
        'Competitive Programming Contest Radar',
        'Engineering Syntax Cheatsheets',
      ],
      teaches: [
        'Data Structures and Algorithms',
        'Operating Systems',
        'Database Management Systems',
        'Computer Networks',
        'System Design',
        'Competitive Programming',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': `${siteUrl}/#organization`,
      name: 'BigO',
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
      sameAs: [],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is BigO completely free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Core pattern roadmaps, full DSA problem trackers, CS core fundamentals (OS, DBMS, CN), and contest radar are 100% free forever with no credit card required.',
          },
        },
        {
          '@type': 'Question',
          name: 'How are pattern variations different from regular problem lists?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Instead of memorizing 200 isolated problems, we group problems into core algorithmic variations with universal templates so you can solve any related interview problem under timed exam conditions without freezing.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it cover CS core subjects for technical interviews?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. BigO includes dedicated high-yield revision sheets, subject Q&A interview drills, and flashcards for Operating Systems, DBMS, Computer Networks, and Object-Oriented Programming.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I simulate real company Online Assessments (OAs)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. BigO provides realistic 45 to 70-minute timed mock tests emulating actual OA environments from top tech companies with comprehensive edge case suites.',
          },
        },
      ],
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageClient />
    </>
  );
}
