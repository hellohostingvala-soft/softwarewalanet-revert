/**
 * Stripe Adapter
 * Routes all Stripe calls through AI_GATEWAY – no direct fetch allowed.
 */

import AI_GATEWAY from '../ai-gateway';

export interface CreatePaymentIntentOptions {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  userId?: string;
  tenantId?: string;
}

export interface CreateCustomerOptions {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
  userId?: string;
  tenantId?: string;
}

/**
 * Create a Stripe PaymentIntent via AI_GATEWAY.
 */
export async function createPaymentIntent(opts: CreatePaymentIntentOptions) {
  const params = new URLSearchParams({
    amount: String(opts.amount),
    currency: opts.currency ?? 'usd',
    ...(opts.customerId ? { customer: opts.customerId } : {}),
  });

  if (opts.metadata) {
    for (const [k, v] of Object.entries(opts.metadata)) {
      params.append(`metadata[${k}]`, v);
    }
  }

  return AI_GATEWAY({
    provider: 'stripe',
    endpoint: '/payment_intents',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Object.fromEntries(params.entries()),
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}

/**
 * Retrieve a Stripe customer by ID.
 */
export async function getCustomer(
  customerId: string,
  opts?: { userId?: string; tenantId?: string }
) {
  return AI_GATEWAY({
    provider: 'stripe',
    endpoint: `/customers/${customerId}`,
    method: 'GET',
    userId: opts?.userId,
    tenantId: opts?.tenantId,
  });
}

/**
 * Create a new Stripe customer.
 */
export async function createCustomer(opts: CreateCustomerOptions) {
  const params = new URLSearchParams({ email: opts.email });
  if (opts.name) params.set('name', opts.name);
  if (opts.metadata) {
    for (const [k, v] of Object.entries(opts.metadata)) {
      params.append(`metadata[${k}]`, v);
    }
  }

  return AI_GATEWAY({
    provider: 'stripe',
    endpoint: '/customers',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Object.fromEntries(params.entries()),
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}
