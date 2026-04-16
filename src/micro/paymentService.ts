// Payment Micro Service
// Webhook sig + timestamp drift + double-entry ledger + order FSM + reconcile job

type OrderState = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';

interface Order {
  id: string;
  state: OrderState;
  amount: number;
  currency: string;
  paymentMethod: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

interface LedgerEntry {
  id: string;
  orderId: string;
  type: 'credit' | 'debit';
  amount: number;
  account: string;
  counterAccount: string;
  timestamp: number;
  version: number;
}

interface WebhookConfig {
  secret: string;
  timestampTolerance: number;
}

class PaymentService {
  private orders: Map<string, Order>;
  private ledger: Map<string, LedgerEntry[]>;
  private webhookConfig: WebhookConfig;
  private stateTransitions: Map<OrderState, OrderState[]>;

  constructor() {
    this.orders = new Map();
    this.ledger = new Map();
    this.webhookConfig = {
      secret: 'webhook-secret',
      timestampTolerance: 300000, // 5 minutes
    };

    this.initializeStateTransitions();
  }

  /**
   * Initialize valid state transitions
   */
  private initializeStateTransitions(): void {
    this.stateTransitions = new Map([
      ['pending', ['processing', 'cancelled']],
      ['processing', ['paid', 'failed', 'cancelled']],
      ['paid', ['refunded']],
      ['failed', ['pending', 'cancelled']],
      ['refunded', []],
      ['cancelled', []],
    ]);
  }

  /**
   * Create order
   */
  createOrder(amount: number, currency: string, paymentMethod: string): Order {
    const order: Order = {
      id: crypto.randomUUID(),
      state: 'pending',
      amount,
      currency,
      paymentMethod,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    this.orders.set(order.id, order);
    this.ledger.set(order.id, []);

    console.log(`[Payment] Order created: ${order.id}`);
    return order;
  }

  /**
   * Transition order state (FSM guard)
   */
  transitionOrderState(orderId: string, newState: OrderState): { success: boolean; error?: string } {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Check if transition is valid
    const validTransitions = this.stateTransitions.get(order.state) || [];
    if (!validTransitions.includes(newState)) {
      return {
        success: false,
        error: `Invalid state transition: ${order.state} -> ${newState}`,
      };
    }

    // Update state with version increment
    order.state = newState;
    order.updatedAt = Date.now();
    order.version++;

    this.orders.set(orderId, order);

    console.log(`[Payment] Order ${orderId} transitioned to ${newState} (v${order.version})`);
    return { success: true };
  }

  /**
   * Process payment with double-entry ledger
   */
  async processPayment(orderId: string): Promise<{ success: boolean; error?: string }> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Transition to processing
    const transition = this.transitionOrderState(orderId, 'processing');
    if (!transition.success) {
      return transition;
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Double-entry ledger: debit customer account, credit platform account
      this.addLedgerEntry(orderId, {
        id: crypto.randomUUID(),
        orderId,
        type: 'debit',
        amount: order.amount,
        account: `customer:${orderId}`,
        counterAccount: 'platform:payments',
        timestamp: Date.now(),
        version: 1,
      });

      this.addLedgerEntry(orderId, {
        id: crypto.randomUUID(),
        orderId,
        type: 'credit',
        amount: order.amount,
        account: 'platform:payments',
        counterAccount: `customer:${orderId}`,
        timestamp: Date.now(),
        version: 1,
      });

      // Transition to paid
      this.transitionOrderState(orderId, 'paid');

      return { success: true };
    } catch (error) {
      this.transitionOrderState(orderId, 'failed');
      return { success: false, error: 'Payment processing failed' };
    }
  }

  /**
   * Add ledger entry
   */
  private addLedgerEntry(orderId: string, entry: LedgerEntry): void {
    const entries = this.ledger.get(orderId) || [];
    entries.push(entry);
    this.ledger.set(orderId, entries);

    console.log(`[Payment] Ledger entry added: ${entry.type} ${entry.amount} (${entry.account} <-> ${entry.counterAccount})`);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: number
  ): boolean {
    const now = Date.now();

    // Check timestamp drift
    if (Math.abs(now - timestamp) > this.webhookConfig.timestampTolerance) {
      console.warn('[Payment] Webhook timestamp drift detected');
      return false;
    }

    // Verify signature
    const expectedSignature = this.generateSignature(payload, timestamp);
    return signature === expectedSignature;
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: string, timestamp: number): string {
    const data = `${timestamp}.${payload}`;
    // In production, use HMAC-SHA256
    const signature = btoa(data + this.webhookConfig.secret);
    return signature;
  }

  /**
   * Handle webhook
   */
  async handleWebhook(
    payload: any,
    signature: string,
    timestamp: number
  ): Promise<{ success: boolean; error?: string }> {
    const payloadString = JSON.stringify(payload);

    // Verify signature
    if (!this.verifyWebhookSignature(payloadString, signature, timestamp)) {
      return { success: false, error: 'Invalid webhook signature' };
    }

    // Process webhook event
    const eventType = payload.type;
    const orderId = payload.data.order_id;

    switch (eventType) {
      case 'payment.success':
        return this.transitionOrderState(orderId, 'paid');
      case 'payment.failed':
        return this.transitionOrderState(orderId, 'failed');
      case 'payment.refunded':
        return this.transitionOrderState(orderId, 'refunded');
      default:
        return { success: false, error: 'Unknown event type' };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(orderId: string): Promise<{ success: boolean; error?: string }> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.state !== 'paid') {
      return { success: false, error: 'Order must be in paid state to refund' };
    }

    // Double-entry ledger: credit customer account, debit platform account
    this.addLedgerEntry(orderId, {
      id: crypto.randomUUID(),
      orderId,
      type: 'credit',
      amount: order.amount,
      account: `customer:${orderId}`,
      counterAccount: 'platform:payments',
      timestamp: Date.now(),
      version: 1,
    });

    this.addLedgerEntry(orderId, {
      id: crypto.randomUUID(),
      orderId,
      type: 'debit',
      amount: order.amount,
      account: 'platform:payments',
      counterAccount: `customer:${orderId}`,
      timestamp: Date.now(),
      version: 1,
    });

    // Transition to refunded
    return this.transitionOrderState(orderId, 'refunded');
  }

  /**
   * Reconciliation job
   */
  async reconcileOrders(): Promise<{
    reconciled: number;
    discrepancies: Array<{ orderId: string; issue: string }>;
  }> {
    const discrepancies: Array<{ orderId: string; issue: string }> = [];
    let reconciled = 0;

    for (const [orderId, order] of this.orders.entries()) {
      const entries = this.ledger.get(orderId) || [];

      // Check ledger balance
      const credits = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
      const debits = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);

      if (credits !== debits) {
        discrepancies.push({
          orderId,
          issue: `Ledger imbalance: credits (${credits}) != debits (${debits})`,
        });
        continue;
      }

      // Check if order state matches ledger
      if (order.state === 'paid' && entries.length === 0) {
        discrepancies.push({
          orderId,
          issue: 'Order marked as paid but has no ledger entries',
        });
        continue;
      }

      reconciled++;
    }

    console.log(`[Payment] Reconciliation complete: ${reconciled} reconciled, ${discrepancies.length} discrepancies`);

    return { reconciled, discrepancies };
  }

  /**
   * Get order
   */
  getOrder(orderId: string): Order | null {
    return this.orders.get(orderId) || null;
  }

  /**
   * Get ledger entries for order
   */
  getLedgerEntries(orderId: string): LedgerEntry[] {
    return this.ledger.get(orderId) || [];
  }

  /**
   * Get order stats
   */
  getOrderStats(): {
    total: number;
    byState: Record<OrderState, number>;
    totalVolume: number;
  } {
    const byState: Record<OrderState, number> = {
      pending: 0,
      processing: 0,
      paid: 0,
      failed: 0,
      refunded: 0,
      cancelled: 0,
    };

    let totalVolume = 0;

    for (const order of this.orders.values()) {
      byState[order.state]++;
      if (order.state === 'paid') {
        totalVolume += order.amount;
      }
    }

    return {
      total: this.orders.size,
      byState,
      totalVolume,
    };
  }

  /**
   * Set webhook config
   */
  setWebhookConfig(config: Partial<WebhookConfig>): void {
    this.webhookConfig = { ...this.webhookConfig, ...config };
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string): { success: boolean; error?: string } {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.state === 'paid') {
      return { success: false, error: 'Cannot cancel paid order' };
    }

    return this.transitionOrderState(orderId, 'cancelled');
  }

  /**
   * Get ledger balance for account
   */
  getAccountBalance(account: string): number {
    let balance = 0;

    for (const entries of this.ledger.values()) {
      for (const entry of entries) {
        if (entry.account === account) {
          balance += entry.type === 'credit' ? entry.amount : -entry.amount;
        }
      }
    }

    return balance;
  }
}

// Singleton instance
const paymentService = new PaymentService();

// Auto-reconciliation every 15 minutes
setInterval(() => {
  paymentService.reconcileOrders();
}, 900000);

export default paymentService;
export { PaymentService };
export type { Order, LedgerEntry, WebhookConfig };
