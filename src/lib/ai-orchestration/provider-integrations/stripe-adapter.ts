export type StripePayload =
  | { operation: 'create_payment_intent'; amount: number; currency: string; metadata?: Record<string, string> }
  | { operation: 'retrieve_payment_intent'; payment_intent_id: string }
  | { operation: 'create_customer'; email: string; name?: string; metadata?: Record<string, string> }
  | { operation: 'create_subscription'; customer_id: string; price_id: string; metadata?: Record<string, string> }
  | { operation: 'cancel_subscription'; subscription_id: string }
  | { operation: 'retrieve_balance' }
  | { operation: 'create_refund'; charge_id: string; amount?: number; reason?: string };

export interface StripeResponse {
  id?: string;
  object: string;
  status?: string;
  [key: string]: any;
}

const STRIPE_BASE_URL = 'https://api.stripe.com/v1';

/** Nominal cost per Stripe API call in USD. */
const COST_PER_CALL = 0.0001;

export class StripeAdapter {
  async executeCall(payload: StripePayload, apiKey: string): Promise<StripeResponse> {
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    let url: string;
    let method = 'GET';
    let body: string | undefined;

    const toFormData = (data: Record<string, any>): string =>
      Object.entries(data)
        .flatMap(([k, v]) => {
          if (typeof v === 'object' && v !== null) {
            return Object.entries(v).map(([sk, sv]) => `${encodeURIComponent(`${k}[${sk}]`)}=${encodeURIComponent(String(sv))}`);
          }
          return [`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`];
        })
        .join('&');

    switch (payload.operation) {
      case 'create_payment_intent':
        url = `${STRIPE_BASE_URL}/payment_intents`;
        method = 'POST';
        body = toFormData({
          amount: payload.amount,
          currency: payload.currency,
          ...(payload.metadata ? { metadata: payload.metadata } : {}),
        });
        break;

      case 'retrieve_payment_intent':
        url = `${STRIPE_BASE_URL}/payment_intents/${payload.payment_intent_id}`;
        break;

      case 'create_customer':
        url = `${STRIPE_BASE_URL}/customers`;
        method = 'POST';
        body = toFormData({
          email: payload.email,
          ...(payload.name ? { name: payload.name } : {}),
          ...(payload.metadata ? { metadata: payload.metadata } : {}),
        });
        break;

      case 'create_subscription':
        url = `${STRIPE_BASE_URL}/subscriptions`;
        method = 'POST';
        body = toFormData({
          customer: payload.customer_id,
          'items[0][price]': payload.price_id,
          ...(payload.metadata ? { metadata: payload.metadata } : {}),
        });
        break;

      case 'cancel_subscription':
        url = `${STRIPE_BASE_URL}/subscriptions/${payload.subscription_id}`;
        method = 'DELETE';
        break;

      case 'retrieve_balance':
        url = `${STRIPE_BASE_URL}/balance`;
        break;

      case 'create_refund':
        url = `${STRIPE_BASE_URL}/refunds`;
        method = 'POST';
        body = toFormData({
          charge: payload.charge_id,
          ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
          ...(payload.reason ? { reason: payload.reason } : {}),
        });
        break;

      default:
        throw new Error(`Unsupported Stripe operation: ${(payload as any).operation}`);
    }

    const response = await fetch(url, { method, headers, body });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Stripe API error ${response.status}: ${errBody}`);
    }

    return response.json();
  }

  estimateCost(_payload: StripePayload): number {
    return COST_PER_CALL;
  }
}
