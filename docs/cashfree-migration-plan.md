# Cashfree Payments Migration Plan

> **Status:** Implemented in the application on 2026-10-27. Complete sandbox configuration and end-to-end merchant verification before production activation.

## Decision

Replace the Stripe payment adapter and Stripe webhook flow with Cashfree’s Payment Gateway APIs, using Cashfree-hosted checkout so BigO never handles card data.

- **One-time OA Season Pass:** Cashfree PG order → `payment_session_id` → Cashfree Web Checkout.
- **Monthly/annual Pro:** Cashfree Subscriptions mandate → `subscription_session_id` → Cashfree Subscription Checkout. This preserves recurring billing and supports cards, UPI AutoPay/eNACH where enabled. Cashfree documents Indian and international cards for subscriptions.
- **Payment confirmation:** Cashfree webhooks are authoritative after raw-body HMAC verification. The browser return is only a fast confirmation path and calls Cashfree server APIs before activating access.
- **International payments:** The checkout request carries an explicit `INR` or `USD` currency and an amount configured for that currency. Cashfree supports 140+ international currencies, but this implementation exposes INR and USD until additional localized prices are configured. Cashfree account approval/activation for the required international currencies remains a merchant-dashboard prerequisite.
- **API client:** Use native server-side `fetch` and Node `crypto` rather than adding an SDK whose API version could drift. Cashfree API version is configured and defaults to `2026-01-01`.

## Current implementation findings

1. `lib/payments/stripe.ts` owns Checkout Sessions, Customer Portal, session retrieval, and webhook signature construction.
2. `app/api/checkout/route.ts` validates the user and promo code, then calls the provider adapter.
3. `app/api/checkout/verify-session/route.ts` retrieves a Stripe session and writes `Subscription`.
4. `app/api/webhooks/stripe/route.ts` activates and mutates subscriptions from Stripe events, but has no durable event deduplication.
5. `Subscription` and `PricingPlan` contain Stripe provider/price fields.
6. The pricing UI and dashboard expect Stripe’s `session_id` redirect parameter and a Stripe billing portal.
7. Plans currently have USD prices only; Cashfree’s multi-currency order API requires an explicit amount/currency pair.

## Implementation steps

1. Add Cashfree configuration (`CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, environment, API version) and remove Stripe configuration.
2. Extend plan pricing with INR prices and checkout currency types; update admin pricing editing and promo validation to use the selected currency.
3. Replace the Stripe adapter with a Cashfree adapter:
   - create PG orders for one-time plans;
   - create periodic Cashfree subscriptions for recurring plans;
   - use Cashfree idempotency keys;
   - expose order/subscription retrieval and cancellation.
4. Update the browser checkout flow to load Cashfree’s hosted Web Checkout SDK and call `cashfree.checkout()` or `cashfree.subscriptionsCheckout()` with the server-issued session ID.
5. Replace Stripe session verification with Cashfree order/subscription verification and bind the gateway object back to the authenticated user using server-created tags/IDs.
6. Replace `/api/webhooks/stripe` with `/api/webhooks/cashfree`, verify `x-webhook-signature` against `x-webhook-timestamp + rawBody`, process payment/subscription lifecycle events, and add durable idempotency.
7. Replace the Stripe billing portal action with an authenticated Cashfree subscription cancellation action; Cashfree does not provide a Stripe-style customer portal URL.
8. Update subscription/provider models, UI copy, docs, setup instructions, and package dependencies. Preserve `mock` only as a local development adapter.
9. Add unit tests for Cashfree request construction, HMAC verification, webhook event mapping, currency pricing, and checkout verification ownership.
10. Run tests, TypeScript, diff checks, and a production build; then configure Cashfree sandbox webhooks and run an end-to-end sandbox payment before production keys are enabled.

## Cashfree API references

- [Create Order](https://www.cashfree.com/docs/api-reference/payments/latest/orders/create-order)
- [Hosted Web Checkout](https://www.cashfree.com/docs/payments/online/web/redirect)
- [Create Subscription](https://www.cashfree.com/docs/api-reference/payments/latest/subscription/create-subscription)
- [Hosted Subscription Checkout](https://www.cashfree.com/docs/payments/subscription/hosted-checkout)
- [Get Order](https://www.cashfree.com/docs/api-reference/payments/latest/orders/get-order)
- [Manage Subscription](https://www.cashfree.com/docs/api-reference/payments/latest/subscription/manage-subscription)
- [Webhook Signature Verification](https://www.cashfree.com/docs/api-reference/payments/latest/webhooks/signature-verification)
- [Subscription Webhooks](https://www.cashfree.com/docs/payments/subscription/webhooks)
- [Supported International Currencies](https://www.cashfree.com/docs/payments/international-payments/ipg/currencies-supported)

## Operational prerequisites

- Create sandbox and production Cashfree PG credentials.
- Enable the required payment methods and international currencies in the Cashfree merchant account.
- Register both PG webhook events and Subscription webhook events at the Cashfree dashboard, targeting `/api/webhooks/cashfree`.
- For local testing, run `npm run dev:tunnel`; it prints a temporary HTTPS webhook URL and injects it into the local app process.
- Configure the same Cashfree webhook API version in sandbox and production.
- Set a real customer phone number in the user profile flow before production activation; Cashfree requires customer email and phone for order/subscription creation.
- Validate RBI, tax, refund, international settlement, and recurring-payment requirements with the merchant account before going live.
