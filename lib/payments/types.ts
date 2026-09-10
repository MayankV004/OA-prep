export type CheckoutPlanKey = 'pro_monthly' | 'pro_annual' | 'oa_pass';

export interface PlanPricingDetail {
  id: CheckoutPlanKey;
  name: string;
  badge?: string;
  priceUsd: number;
  period: 'month' | 'year' | '75_days';
  mode: 'subscription' | 'payment';
  description: string;
  features: string[];
  aiCredits: number;
}

export const PLANS: Record<CheckoutPlanKey, PlanPricingDetail> = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'BigO Pro (Monthly)',
    priceUsd: 14,
    period: 'month',
    mode: 'subscription',
    description: 'Billed monthly. Cancel anytime with 1 click.',
    features: [
      'Unlimited Company Mock OA Simulators',
      'Recent 60-day company question bank',
      'AI Edge-Case & Failing Input Debugger',
      'Full System Design & Advanced CS deep dives',
      'In-browser Monaco code execution',
    ],
    aiCredits: 100,
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'BigO Pro (Annual)',
    badge: 'Save 47% — Best Value',
    priceUsd: 89,
    period: 'year',
    mode: 'subscription',
    description: 'Equivalent to $7.40/mo. Perfect for full year recruitment cycles.',
    features: [
      'Everything in Pro Monthly',
      'Save 47% over monthly billing',
      'Priority access to new company OA packs',
      'Full season interview revision & flashcards',
      'Exclusive placement prep webinars & community',
    ],
    aiCredits: 1500,
  },
  oa_pass: {
    id: 'oa_pass',
    name: 'OA Season Pass',
    badge: 'One-Time Purchase',
    priceUsd: 39,
    period: '75_days',
    mode: 'payment',
    description: '75 days of full Pro access for your campus placement drive. No recurring auto-charge.',
    features: [
      'Full Pro access for 75 days',
      'No subscription or recurring charges',
      'Target company crash course packs',
      'Timed OA simulator & leaderboard analytics',
    ],
    aiCredits: 250,
  },
};

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  plan: CheckoutPlanKey;
  successUrl: string;
  cancelUrl: string;
  promoCode?: string;
  discountedPriceUsd?: number;
}

export interface CheckoutResult {
  url: string;
  provider: 'stripe' | 'mock';
  sessionId?: string;
}

export interface CustomerPortalParams {
  customerId: string;
  returnUrl: string;
}

export interface PaymentProviderAdapter {
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult>;
  createPortalSession(params: CustomerPortalParams): Promise<{ url: string }>;
}
