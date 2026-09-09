import { LegalDocumentViewer } from '@/components/legal/LegalDocumentViewer';

export const metadata = {
  title: 'Privacy Policy | BigO Technical Assessment Platform',
  description: 'Learn how BigO protects candidate code, proctoring telemetry, and personal identity data with zero third-party advertising trackers.',
};

export default function PrivacyPage() {
  return <LegalDocumentViewer initialDoc="privacy" />;
}
