import crypto from 'node:crypto';
import { env } from '@/lib/config';
import {
  PLANS,
  type CancelSubscriptionParams,
  type CheckoutPlanKey,
  type CreateCheckoutParams,
  type CheckoutResult,
  type PaymentProviderAdapter,
} from './types';

interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
  order_amount: number;
  order_currency: string;
  order_tags?: Record<string, string>;
}

interface CashfreeSubscriptionResponse {
  cf_subscription_id: string;
  subscription_id: string;
  subscription_status: string;
  subscription_session_id: string;
  subscription_expiry_time?: string;
  subscription_tags?: Record<string, string>;
  plan_details?: {
    plan_currency?: string;
    plan_recurring_amount?: number;
    plan_interval_type?: string;
  };
}

export interface CashfreeOrderStatus extends CashfreeOrderResponse {
  customer_details?: {
    customer_email?: string;
    customer_phone?: string;
  };
}

export interface CashfreeSubscriptionStatus extends CashfreeSubscriptionResponse {
  customer_details?: {
    customer_email?: string;
    customer_phone?: string;
  };
}

function isConfigured() {
  return Boolean(env.CASHFREE_CLIENT_ID && env.CASHFREE_CLIENT_SECRET);
}

function baseUrl() {
  return env.CASHFREE_ENVIRONMENT === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

function idempotencyKey() {
  return crypto.randomUUID();
}

function merchantId(prefix: string, userId: string) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(-12) || 'user';
  return `bigo_${prefix}_${safeUserId}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`.slice(0, 45);
}

function subscriptionId(plan: CheckoutPlanKey, userId: string) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(-24) || 'user';
  return `bigo-${plan}-${safeUserId}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`.slice(0, 250);
}

function gatewayTags(params: { userId: string; plan: CheckoutPlanKey; currency: string; amount: number; promoCode?: string }) {
  return {
    userId: params.userId,
    plan: params.plan,
    currency: params.currency,
    amount: String(params.amount),
    ...(params.promoCode ? { promoCode: params.promoCode } : {}),
  };
}

function customerPhone(userPhone?: string) {
  const configured = (userPhone || env.CASHFREE_DEFAULT_CUSTOMER_PHONE || '').replace(/\D/g, '');
  if (configured.length >= 10) return configured.slice(-10);
  throw new Error('Add a valid phone number to your profile before starting Cashfree checkout.');
}

function cashfreeHeaders(idempotency?: string): HeadersInit {
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    'x-api-version': env.CASHFREE_API_VERSION,
    'x-client-id': env.CASHFREE_CLIENT_ID,
    'x-client-secret': env.CASHFREE_CLIENT_SECRET,
    ...(idempotency ? { 'x-idempotency-key': idempotency } : {}),
  };
}

async function cashfreeRequest<T>(path: string, init: RequestInit = {}, idempotency?: string): Promise<T> {
  if (!isConfigured()) {
    throw new Error('Cashfree is not configured. Set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET.');
  }

  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { ...cashfreeHeaders(idempotency), ...(init.headers || {}) },
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.text();
  let parsed: unknown = null;
  try {
    parsed = body ? JSON.parse(body) : null;
  } catch {
    parsed = body;
  }

  if (!response.ok) {
    const message = typeof parsed === 'object' && parsed && 'message' in parsed
      ? String((parsed as { message?: unknown }).message)
      : `Cashfree API request failed with ${response.status}`;
    throw new Error(message);
  }

  return parsed as T;
}

export function verifyCashfreeWebhookSignature(rawBody: string, timestamp: string, receivedSignature: string) {
  if (!timestamp || !receivedSignature || !env.CASHFREE_CLIENT_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', env.CASHFREE_CLIENT_SECRET)
    .update(`${timestamp}${rawBody}`)
    .digest('base64');
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(receivedSignature);
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export class CashfreeAdapter implements PaymentProviderAdapter {
  get isConfigured() {
    return isConfigured();
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const planConfig = PLANS[params.plan];
    if (!planConfig) throw new Error(`Invalid plan: ${params.plan}`);

    if (planConfig.mode === 'payment') {
      const orderId = merchantId('order', params.userId);
      const response = await cashfreeRequest<CashfreeOrderResponse>(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            order_id: orderId,
            order_amount: params.amount,
            order_currency: params.currency,
            customer_details: {
              customer_id: params.userId.replace(/[^a-zA-Z0-9]/g, '').slice(-50) || 'user',
              customer_name: 'BigO Candidate',
              customer_email: params.userEmail,
              customer_phone: customerPhone(params.userPhone),
            },
            order_meta: {
              return_url: `${params.successUrl}&order_id=${encodeURIComponent(orderId)}`,
              notify_url: `${new URL('/api/webhooks/cashfree', params.successUrl).toString()}`,
            },
            order_note: `${planConfig.name}${params.promoCode ? ` - Promo ${params.promoCode}` : ''}`
              .replace(/[^a-zA-Z0-9 _-]/g, '')
              .slice(0, 200),
            order_tags: gatewayTags(params),
          }),
        },
        idempotencyKey()
      );

      return {
        url: '',
        provider: 'cashfree',
        sessionId: response.payment_session_id,
        sessionType: 'order',
        orderId: response.order_id || orderId,
      };
    }

    const merchantSubscriptionId = subscriptionId(params.plan, params.userId);
    const intervalType = planConfig.period === 'year' ? 'YEAR' : 'MONTH';
    const response = await cashfreeRequest<CashfreeSubscriptionResponse>(
      '/subscriptions',
      {
        method: 'POST',
        body: JSON.stringify({
          subscription_id: merchantSubscriptionId,
          customer_details: {
            customer_name: 'BigO Candidate',
            customer_email: params.userEmail,
            customer_phone: customerPhone(params.userPhone),
          },
          plan_details: {
            plan_name: planConfig.name.replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 40),
            plan_type: 'PERIODIC',
            plan_currency: params.currency,
            plan_amount: params.amount,
            plan_max_amount: params.amount,
            plan_intervals: 1,
            plan_interval_type: intervalType,
            plan_note: `BigO ${params.plan}`.replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 100),
          },
          authorization_details: {
            authorization_amount: params.amount,
            authorization_amount_refund: false,
            payment_methods: params.currency === 'INR' ? ['upi', 'card', 'enach'] : ['card'],
          },
          subscription_meta: {
            return_url: `${params.successUrl}&subscription_id=${encodeURIComponent(merchantSubscriptionId)}`,
            notification_channel: ['EMAIL'],
          },
          subscription_expiry_time: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_tags: gatewayTags(params),
        }),
      },
      idempotencyKey()
    );

    return {
      url: '',
      provider: 'cashfree',
      sessionId: response.subscription_session_id,
      sessionType: 'subscription',
      orderId: response.subscription_id || merchantSubscriptionId,
    };
  }

  async cancelSubscription(params: CancelSubscriptionParams) {
    await cashfreeRequest(`/subscriptions/${encodeURIComponent(params.subscriptionId)}/manage`, {
      method: 'POST',
      body: JSON.stringify({
        subscription_id: params.subscriptionId,
        action: 'CANCEL',
      }),
    }, idempotencyKey());
  }

  async getOrder(orderId: string) {
    return cashfreeRequest<CashfreeOrderStatus>(`/orders/${encodeURIComponent(orderId)}`);
  }

  async getSubscription(subscriptionId: string) {
    return cashfreeRequest<CashfreeSubscriptionStatus>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
  }
}

export const cashfreeAdapter = new CashfreeAdapter();
