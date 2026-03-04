/**
 * Marketplace Service
 * Handles order confirmation, payment verification, fulfillment, and
 * integration with ServerManager and ProductManager workflows.
 */

import { supabase } from '@/integrations/supabase/client';
import { queueEmail } from './emailQueueService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderDetails {
  user_id: string;
  product_id: string;
  amount: number;
  payment_id: string;
  buyer_name: string;
  buyer_email: string;
  license_type?: string;
}

export interface OrderResult {
  success: boolean;
  order_id?: string;
  order_number?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  payment_status?: string;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

// ─── Service Class ────────────────────────────────────────────────────────────

export class MarketplaceService {
  /**
   * Verify that a payment record exists and is in a valid state.
   */
  async verifyPayment(paymentId: string, expectedAmount: number): Promise<PaymentVerificationResult> {
    const { data, error } = await supabase
      .from('payments')
      .select('id, status, amount, verified_at')
      .eq('id', paymentId)
      .single();

    if (error || !data) {
      console.warn('[MarketplaceService] Payment lookup failed:', error?.message);
      return { verified: false, error: error?.message ?? 'Payment not found' };
    }

    const isVerified =
      (data.status === 'completed' || data.status === 'verified') &&
      Number(data.amount) >= expectedAmount;

    return {
      verified: isVerified,
      payment_status: data.status,
      error: isVerified ? undefined : 'Payment not verified or amount mismatch',
    };
  }

  /**
   * Confirm an order: create order record, trigger fulfillment, and notify buyer.
   */
  async placeOrder(orderDetails: OrderDetails): Promise<OrderResult> {
    const { user_id, product_id, amount, payment_id, buyer_name, buyer_email, license_type } =
      orderDetails;

    // 1. Verify payment before confirming order
    const paymentCheck = await this.verifyPayment(payment_id, amount);
    if (!paymentCheck.verified) {
      console.error('[MarketplaceService] Payment verification failed:', paymentCheck.error);
      return { success: false, error: paymentCheck.error };
    }

    const orderNumber = generateOrderNumber();

    // 2. Create order record via edge function (preserves existing server-side logic)
    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      'create-order-on-payment',
      {
        body: {
          user_id,
          product_id,
          amount,
          payment_id,
          buyer_name,
          buyer_email,
          license_type: license_type ?? 'standard',
        },
      },
    );

    if (fnError) {
      console.error('[MarketplaceService] Order creation failed:', fnError.message);
      return { success: false, error: fnError.message };
    }

    const orderId: string = fnData?.order_id ?? fnData?.id;

    // 3. Trigger fulfillment (server provisioning via ServerManager)
    await this.triggerFulfillment({ orderId, product_id, user_id, buyer_email });

    // 4. Notify buyer
    this.notifyUsers({ orderId, orderNumber, buyer_name, buyer_email, amount });

    return { success: true, order_id: orderId, order_number: orderNumber };
  }

  /**
   * Trigger product fulfillment: update inventory and schedule server provisioning.
   */
  private async triggerFulfillment(params: {
    orderId: string;
    product_id: string;
    user_id: string;
    buyer_email: string;
  }): Promise<void> {
    const { orderId, product_id, user_id } = params;

    // Update product inventory count
    const { error: invError } = await supabase.rpc('decrement_product_stock', {
      p_product_id: product_id,
    });
    if (invError) {
      console.warn('[MarketplaceService] Inventory update skipped:', invError.message);
    }

    // Log fulfillment event for ServerManager to pick up
    const { error: logError } = await supabase.from('system_events').insert({
      event_type: 'order_fulfillment',
      source_user_id: user_id,
      payload: { product_id, order_id: orderId, triggered_at: new Date().toISOString() },
    });
    if (logError) {
      console.warn('[MarketplaceService] Fulfillment event log skipped:', logError.message);
    }
  }

  /**
   * Notify the buyer about their order via email queue.
   */
  notifyUsers(params: {
    orderId: string;
    orderNumber: string;
    buyer_name: string;
    buyer_email: string;
    amount: number;
  }): void {
    const { orderId, orderNumber, buyer_name, buyer_email, amount } = params;

    // Escape user-supplied values before HTML interpolation to prevent XSS
    const safeName = buyer_name.replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c),
    );
    const safeOrderNumber = orderNumber.replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c),
    );

    queueEmail({
      to: buyer_email,
      subject: `Order Confirmed: ${orderNumber}`,
      bodyHtml: `<p>Hi ${safeName}, your order <strong>${safeOrderNumber}</strong> has been confirmed. Amount: ₹${amount}.</p>`,
      emailType: 'notification',
      priority: 'high',
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        message: `Your order ${orderNumber} has been confirmed.`,
      },
    }).catch((err: unknown) => {
      console.warn('[MarketplaceService] Order confirmation email queuing failed:', err);
    });
  }
}

export const marketplaceService = new MarketplaceService();
export default marketplaceService;
