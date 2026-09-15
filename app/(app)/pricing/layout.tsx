import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  title: 'Pro Membership & Pricing Plans',
  description:
    'Compare BigO plans. Unlock real-time timed company OA simulations, algorithmic pattern blueprints, in-depth CS core interview drills, and detailed testcase telemetry.',
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
  openGraph: {
    title: 'Pro Membership & Pricing Plans | BigO',
    description:
      'Unlock real-time timed OA simulations, advanced algorithmic pattern blueprints, and interview modules.',
    url: `${siteUrl}/pricing`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pro Membership & Pricing Plans | BigO',
    description:
      'Affordable plans for engineers and candidates aiming for tier-1 tech placements.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
