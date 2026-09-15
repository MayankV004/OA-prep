import type { Metadata } from 'next';
import { LegalDocumentViewer } from '@/components/legal/LegalDocumentViewer';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how BigO protects candidate code, proctoring telemetry, and personal identity data with zero third-party advertising trackers.',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | BigO Technical Assessment Platform',
    description:
      'Zero third-party advertising trackers. How BigO secures candidate submissions and proctoring telemetry.',
    url: `${siteUrl}/privacy`,
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <LegalDocumentViewer initialDoc="privacy" />;
}
