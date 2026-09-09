import Stripe from 'stripe';
import { env } from '@/lib/config';
import {
  PLANS,
  type CreateCheckoutParams,
  type CheckoutResult,
  type CustomerPortalParams,
  type PaymentProviderAdapter,
} from './types';

function getStripeClient(): Stripe | null {
  const key = env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('sk_test_dummy') || key === 'sk_test_...') {
    return null;
  }
  return new Stripe(key);
}

export class StripeAdapter implements PaymentProviderAdapter {
  private stripe: Stripe | null;

  constructor() {
    this.stripe = getStripeClient();
  }

  get isConfigured(): boolean {
    return Boolean(this.stripe);
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment.');
    }

    const planConfig = PLANS[params.plan];
    if (!planConfig) {
      throw new Error(`Invalid plan: ${params.plan}`);
    }

    // Determine custom price IDs or fall back to dynamic price_data in USD
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    const priceId =
      params.plan === 'pro_monthly'
        ? env.STRIPE_PRO_MONTHLY_PRICE_ID
        : params.plan === 'pro_annual'
        ? env.STRIPE_PRO_ANNUAL_PRICE_ID
        : env.STRIPE_OA_PASS_PRICE_ID;

    const isRealPriceId = Boolean(
      priceId &&
      priceId.startsWith('price_') &&
      priceId !== 'price_...' &&
      !priceId.includes('...') &&
      priceId.length > 10
    );

    const hasCustomDiscount = params.discountedPriceUsd !== undefined && params.discountedPriceUsd !== planConfig.priceUsd;
    const finalPriceUsd = params.discountedPriceUsd !== undefined ? params.discountedPriceUsd : planConfig.priceUsd;

    if (isRealPriceId && !hasCustomDiscount) {
      lineItems = [{ price: priceId, quantity: 1 }];
    } else {
      // Dynamic inline pricing in USD
      lineItems = [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(finalPriceUsd * 100), // Cents
            product_data: {
              name: planConfig.name + (params.promoCode ? ` (Promo: ${params.promoCode})` : ''),
              description: planConfig.description,
            },
            ...(planConfig.mode === 'subscription'
              ? {
                  recurring: {
                    interval: planConfig.period === 'year' ? 'year' : 'month',
                  },
                }
              : {}),
          },
        },
      ];
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: planConfig.mode,
      customer_email: params.userEmail,
      client_reference_id: params.userId,
      line_items: lineItems,
      success_url: `${params.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        plan: params.plan,
        promoCode: params.promoCode || '',
        paidAmountUsd: String(finalPriceUsd),
      },
      subscription_data:
        planConfig.mode === 'subscription'
          ? {
              metadata: {
                userId: params.userId,
                plan: params.plan,
                promoCode: params.promoCode || '',
                paidAmountUsd: String(finalPriceUsd),
              },
            }
          : undefined,
    });

    if (!session.url) {
      throw new Error('Stripe failed to return a checkout URL');
    }

    return {
      url: session.url,
      provider: 'stripe',
      sessionId: session.id,
    };
  }

  async createPortalSession(params: CustomerPortalParams): Promise<{ url: string }> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });

    return { url: session.url };
  }

  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  constructWebhookEvent(rawBody: string | Buffer, signature: string): Stripe.Event {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }
    const secret = env.STRIPE_WEBHOOK_SECRET;
    if (!secret || secret.startsWith('whsec_...')) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}

export const stripeAdapter = new StripeAdapter();
