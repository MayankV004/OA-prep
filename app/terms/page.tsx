import { LegalDocumentViewer } from '@/components/legal/LegalDocumentViewer';

export const metadata = {
  title: 'Terms and Conditions | BigO Technical Assessment Platform',
  description: 'Candidate terms of service, sandbox compute guidelines, test room honor code, and platform licensing rules for BigO.',
};

export default function TermsPage() {
  return <LegalDocumentViewer initialDoc="terms" />;
}
