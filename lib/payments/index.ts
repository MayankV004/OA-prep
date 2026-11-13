import { env } from '@/lib/config';
import { cashfreeAdapter } from './cashfree';
import { mockPaymentAdapter } from './mock';
import type { PaymentProviderAdapter } from './types';

export * from './types';
export * from './pricingService';
export { cashfreeAdapter } from './cashfree';
export { mockPaymentAdapter } from './mock';

export function getPaymentAdapter(): PaymentProviderAdapter {
  if (env.PAYMENT_PROVIDER === 'mock' || !cashfreeAdapter.isConfigured) {
    return mockPaymentAdapter;
  }
  return cashfreeAdapter;
}
