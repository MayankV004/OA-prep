import { env } from '@/lib/config';
import { stripeAdapter } from './stripe';
import { mockPaymentAdapter } from './mock';
import type { PaymentProviderAdapter } from './types';

export * from './types';
export { stripeAdapter } from './stripe';
export { mockPaymentAdapter } from './mock';

export function getPaymentAdapter(): PaymentProviderAdapter {
  if (env.PAYMENT_PROVIDER === 'mock' || !stripeAdapter.isConfigured) {
    return mockPaymentAdapter;
  }
  return stripeAdapter;
}
