import type { Metadata } from 'next';
import { LegalDocumentViewer } from '@/components/legal/LegalDocumentViewer';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Candidate terms of service, sandbox compute guidelines, test room honor code, and platform licensing rules for BigO.',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: 'Terms and Conditions | BigO Technical Assessment Platform',
    description:
      'Candidate terms of service, sandbox compute guidelines, and platform licensing rules for BigO.',
    url: `${siteUrl}/terms`,
    type: 'website',
  },
};

export default function TermsPage() {
  return <LegalDocumentViewer initialDoc="terms" />;
}
