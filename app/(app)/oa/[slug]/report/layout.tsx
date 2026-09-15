import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assessment Evaluation Report',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AssessmentReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
