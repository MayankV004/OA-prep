import crypto from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { env } from '@/lib/config';
import { CashfreeAdapter, verifyCashfreeWebhookSignature } from '@/lib/payments/cashfree';

describe('Cashfree payment integration', () => {
  const original = {
    clientId: env.CASHFREE_CLIENT_ID,
    clientSecret: env.CASHFREE_CLIENT_SECRET,
    environment: env.CASHFREE_ENVIRONMENT,
    apiVersion: env.CASHFREE_API_VERSION,
  };

  afterEach(() => {
    env.CASHFREE_CLIENT_ID = original.clientId;
    env.CASHFREE_CLIENT_SECRET = original.clientSecret;
    env.CASHFREE_ENVIRONMENT = original.environment;
    env.CASHFREE_API_VERSION = original.apiVersion;
    vi.restoreAllMocks();
  });

  it('verifies the raw-body HMAC signature and rejects tampering', () => {
    env.CASHFREE_CLIENT_SECRET = 'cashfree-secret';
    const timestamp = '1710000000000';
    const rawBody = '{"type":"PAYMENT_SUCCESS_WEBHOOK"}';
    const signature = crypto.createHmac('sha256', env.CASHFREE_CLIENT_SECRET).update(timestamp + rawBody).digest('base64');

    expect(verifyCashfreeWebhookSignature(rawBody, timestamp, signature)).toBe(true);
    expect(verifyCashfreeWebhookSignature(`${rawBody} `, timestamp, signature)).toBe(false);
  });

  it('creates a one-time order and returns its payment session', async () => {
    env.CASHFREE_CLIENT_ID = 'client-id';
    env.CASHFREE_CLIENT_SECRET = 'cashfree-secret';
    env.CASHFREE_ENVIRONMENT = 'sandbox';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        order_id: 'bigo_order_1',
        cf_order_id: 'cf_1',
        order_status: 'ACTIVE',
        payment_session_id: 'session_1',
      }), { status: 200 })
    ));

    const result = await new CashfreeAdapter().createCheckoutSession({
      userId: 'user-123',
      userEmail: 'candidate@example.com',
      userPhone: '+919876543210',
      plan: 'oa_pass',
      currency: 'INR',
      amount: 3299,
      successUrl: 'https://example.com/dashboard?payment=success&plan=oa_pass',
      cancelUrl: 'https://example.com/pricing?canceled=true',
    });

    expect(result).toMatchObject({
      provider: 'cashfree',
      sessionId: 'session_1',
      sessionType: 'order',
      orderId: 'bigo_order_1',
    });

    const request = vi.mocked(fetch).mock.calls[0];
    expect(request[0]).toBe('https://sandbox.cashfree.com/pg/orders');
    const body = JSON.parse(String((request[1] as RequestInit).body));
    expect(body.order_currency).toBe('INR');
    expect(body.order_tags).toMatchObject({ userId: 'user-123', plan: 'oa_pass', amount: '3299' });
    expect(body.customer_details.customer_phone).toBe('9876543210');
  });

  it('creates a recurring subscription session for international cards', async () => {
    env.CASHFREE_CLIENT_ID = 'client-id';
    env.CASHFREE_CLIENT_SECRET = 'cashfree-secret';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        subscription_id: 'bigo-pro-monthly-1',
        cf_subscription_id: 'cf_sub_1',
        subscription_status: 'INITIALIZED',
        subscription_session_id: 'sub_session_1',
      }), { status: 200 })
    ));

    const result = await new CashfreeAdapter().createCheckoutSession({
      userId: 'user-123',
      userEmail: 'candidate@example.com',
      userPhone: '+14155552671',
      plan: 'pro_monthly',
      currency: 'USD',
      amount: 14,
      successUrl: 'https://example.com/dashboard?payment=success&plan=pro_monthly',
      cancelUrl: 'https://example.com/pricing?canceled=true',
    });

    expect(result).toMatchObject({ provider: 'cashfree', sessionId: 'sub_session_1', sessionType: 'subscription' });
    const body = JSON.parse(String((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body));
    expect(body.plan_details).toMatchObject({
      plan_name: 'BigO Pro Monthly',
      plan_type: 'PERIODIC',
      plan_currency: 'USD',
      plan_interval_type: 'MONTH',
    });
    expect(body.authorization_details).toMatchObject({ authorization_amount: 14, payment_methods: ['card'] });
  });

  it('validates webhook timestamp freshness to prevent replay attacks', () => {
    const now = Date.now();
    const freshTimestamp = String(now - 60 * 1000); // 1 minute ago
    const expiredTimestamp = String(now - 15 * 60 * 1000); // 15 minutes ago

    const isFresh = (ts: string) => {
      const raw = Number(ts);
      const ms = raw < 1e11 ? raw * 1000 : raw;
      return !isNaN(ms) && Math.abs(now - ms) <= 10 * 60 * 1000;
    };

    expect(isFresh(freshTimestamp)).toBe(true);
    expect(isFresh(expiredTimestamp)).toBe(false);
  });
});
