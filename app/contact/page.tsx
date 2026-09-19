import type { Metadata } from 'next';
import { ContactPageClient } from './ContactPageClient';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Contact & Engineering Support',
  description:
    'Get in touch with the BigO team for technical support, bug reports, and placement platform feedback. Rapid response for active OA issues.',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'Contact & Engineering Support | BigO',
    description:
      'Get in touch with the BigO team for technical support, bug reports, and placement platform feedback.',
    url: `${siteUrl}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact & Engineering Support | BigO',
    description:
      'Technical support, bug reports, and online assessment platform inquiries.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'BigO Technical Support & Contact',
  url: `${siteUrl}/contact`,
  description:
    'Official support channel for candidate feedback, test runner bug reporting, and technical inquiries.',
  mainEntity: {
    '@type': 'EducationalOrganization',
    name: 'BigO',
    url: siteUrl,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'technical support',
      availableLanguage: ['English'],
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactPageClient />
    </>
  );
}
