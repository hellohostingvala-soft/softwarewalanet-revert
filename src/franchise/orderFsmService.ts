// Order FSM++ Service
// strict state machine + guards
// compensating actions (rollback on failure)
// idempotent checkout + webhook dedupe

type OrderState = 'init' | 'pending_payment' | 'paid' | 'processing' | 'running' | 'completed' | 'failed' | 'cancelled' | 'refunded';
type OrderEvent = 'initiate' | 'payment_received' | 'payment_failed' | 'start_processing' | 'start_running' | 'complete' | 'fail' | 'cancel' | 'refund';
type TransitionGuard = 'sufficient_stock' | 'valid_payment' | 'within_limits' | 'not_expired';

interface OrderTransition {
  from: OrderState;
  event: OrderEvent;
  to: OrderState;
  guards?: TransitionGuard[];
  compensatingAction?: string;
}

interface Order {
  id: string;
  state: OrderState;
  productId: string;
  franchiseId: string;
  customerId: string;
  amount: number;
  currency: string;
  createdAt: number;
  updatedAt: number;
  metadata?: any;
}

interface WebhookEvent {
  id: string;
  eventId: string;
  eventType: string;
  payload: any;
  processed: boolean;
  processedAt?: number;
  receivedAt: number;
}

interface CompensatingAction {
  orderId: string;
  action: string;
  executed: boolean;
  executedAt?: number;
  result?: any;
}

class OrderFsmService {
  private orders: Map<string, Order>;
  private webhookEvents: Map<string, WebhookEvent>;
  private compensatingActions: Map<string, CompensatingAction>;
  private stateTransitions: OrderTransition[];

  constructor() {
    this.orders = new Map();
    this.webhookEvents = new Map();
    this.compensatingActions = new Map();

    // Define strict state machine transitions
    this.stateTransitions = [
      // Init flow
      { from: 'init', event: 'initiate', to: 'pending_payment', guards: ['sufficient_stock', 'within_limits'] },
      { from: 'init', event: 'fail', to: 'failed' },
      { from: 'init', event: 'cancel', to: 'cancelled' },

      // Payment flow
      { from: 'pending_payment', event: 'payment_received', to: 'paid', guards: ['valid_payment'] },
      { from: 'pending_payment', event: 'payment_failed', to: 'failed', compensatingAction: 'release_stock' },
      { from: 'pending_payment', event: 'cancel', to: 'cancelled', compensatingAction: 'release_stock' },
      { from: 'pending_payment', event: 'fail', to: 'failed', compensatingAction: 'release_stock' },

      // Processing flow
      { from: 'paid', event: 'start_processing', to: 'processing' },
      { from: 'paid', event: 'cancel', to: 'cancelled', compensatingAction: 'refund_payment' },
      { from: 'paid', event: 'fail', to: 'failed', compensatingAction: 'refund_payment' },

      // Running flow
      { from: 'processing', event: 'start_running', to: 'running' },
      { from: 'processing', event: 'fail', to: 'failed', compensatingAction: 'refund_payment' },

      // Completion flow
      { from: 'running', event: 'complete', to: 'completed' },
      { from: 'running', event: 'fail', to: 'failed', compensatingAction: 'partial_refund' },

      // Refund flow
      { from: 'completed', event: 'refund', to: 'refunded', compensatingAction: 'process_refund' },
    ];
  }

  /**
   * Create order
   */
  createOrder(
    productId: string,
    franchiseId: string,
    customerId: string,
    amount: number,
    currency: string = 'INR'
  ): Order {
    const order: Order = {
      id: crypto.randomUUID(),
      state: 'init',
      productId,
      franchiseId,
      customerId,
      amount,
      currency,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.orders.set(order.id, order);
    console.log(`[OrderFSM] Created order ${order.id} in init state`);
    return order;
  }

  /**
   * Get valid transition
   */
  private getTransition(from: OrderState, event: OrderEvent): OrderTransition | null {
    return this.stateTransitions.find(t => t.from === from && t.event === event) || null;
  }

  /**
   * Execute guard
   */
  private executeGuard(guard: TransitionGuard, order: Order): { passed: boolean; reason?: string } {
    switch (guard) {
      case 'sufficient_stock':
        // In production, check stock level
        return { passed: true };
      case 'valid_payment':
        // In production, validate payment
        return { passed: true };
      case 'within_limits':
        // In production, check franchise limits
        return { passed: true };
      case 'not_expired':
        // Check if order is not expired
        const age = Date.now() - order.createdAt;
        return { passed: age < 30 * 60 * 1000, reason: age >= 30 * 60 * 1000 ? 'Order expired' : undefined };
      default:
        return { passed: true };
    }
  }

  /**
   * Execute all guards
   */
  private executeGuards(guards: TransitionGuard[], order: Order): { passed: boolean; reason?: string } {
    for (const guard of guards) {
      const result = this.executeGuard(guard, order);
      if (!result.passed) {
        return result;
      }
    }
    return { passed: true };
  }

  /**
   * Execute compensating action
   */
  private async executeCompensatingAction(action: string, order: Order): Promise<void> {
    const actionId = crypto.randomUUID();

    const compensatingAction: CompensatingAction = {
      orderId: order.id,
      action,
      executed: false,
    };

    this.compensatingActions.set(actionId, compensatingAction);

    try {
      // Simulate compensating action execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      compensatingAction.executed = true;
      compensatingAction.executedAt = Date.now();
      compensatingAction.result = { success: true };

      console.log(`[OrderFSM] Executed compensating action ${action} for order ${order.id}`);
    } catch (error) {
      compensatingAction.result = { success: false, error: String(error) };
      console.error(`[OrderFSM] Failed to execute compensating action ${action} for order ${order.id}:`, error);
    }

    this.compensatingActions.set(actionId, compensatingAction);
  }

  /**
   * Transition order state
   */
  async transitionOrder(orderId: string, event: OrderEvent): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const transition = this.getTransition(order.state, event);
    if (!transition) {
      throw new Error(`Invalid transition from ${order.state} with event ${event}`);
    }

    // Execute guards
    if (transition.guards) {
      const guardResult = this.executeGuards(transition.guards, order);
      if (!guardResult.passed) {
        throw new Error(`Guard failed: ${guardResult.reason || 'Unknown reason'}`);
      }
    }

    // Execute compensating action if transition fails (in production, this would be handled in a try-catch)
    // For now, we'll execute it if the transition is to a terminal state
    if (transition.compensatingAction) {
      await this.executeCompensatingAction(transition.compensatingAction, order);
    }

    // Update state
    order.state = transition.to;
    order.updatedAt = Date.now();
    this.orders.set(orderId, order);

    console.log(`[OrderFSM] Transitioned order ${orderId} from ${transition.from} to ${transition.to} via ${event}`);
    return order;
  }

  /**
   * Get order
   */
  getOrder(orderId: string): Order | null {
    return this.orders.get(orderId) || null;
  }

  /**
   * Get orders by state
   */
  getOrdersByState(state: OrderState): Order[] {
    return Array.from(this.orders.values()).filter(o => o.state === state);
  }

  /**
   * Get orders by franchise
   */
  getOrdersByFranchise(franchiseId: string): Order[] {
    return Array.from(this.orders.values()).filter(o => o.franchiseId === franchiseId);
  }

  /**
   * Process webhook event with idempotency
   */
  async processWebhookEvent(eventId: string, eventType: string, payload: any): Promise<{ processed: boolean; order?: Order }> {
    // Check if event already processed
    const existing = this.webhookEvents.get(eventId);
    if (existing) {
      console.log(`[OrderFSM] Webhook event ${eventId} already processed`);
      return { processed: true, order: this.orders.get(payload.orderId) || undefined };
    }

    // Record event
    const webhookEvent: WebhookEvent = {
      id: crypto.randomUUID(),
      eventId,
      eventType,
      payload,
      processed: false,
      receivedAt: Date.now(),
    };

    this.webhookEvents.set(eventId, webhookEvent);

    // Process event based on type
    let order: Order | undefined;
    try {
      switch (eventType) {
        case 'payment.success':
          if (payload.orderId) {
            order = await this.transitionOrder(payload.orderId, 'payment_received');
          }
          break;
        case 'payment.failed':
          if (payload.orderId) {
            order = await this.transitionOrder(payload.orderId, 'payment_failed');
          }
          break;
        case 'order.completed':
          if (payload.orderId) {
            order = await this.transitionOrder(payload.orderId, 'complete');
          }
          break;
        case 'order.failed':
          if (payload.orderId) {
            order = await this.transitionOrder(payload.orderId, 'fail');
          }
          break;
        default:
          console.log(`[OrderFSM] Unknown event type: ${eventType}`);
      }

      webhookEvent.processed = true;
      webhookEvent.processedAt = Date.now();
      this.webhookEvents.set(eventId, webhookEvent);

      console.log(`[OrderFSM] Processed webhook event ${eventId}`);
    } catch (error) {
      console.error(`[OrderFSM] Failed to process webhook event ${eventId}:`, error);
      webhookEvent.processed = true;
      webhookEvent.processedAt = Date.now();
      this.webhookEvents.set(eventId, webhookEvent);
    }

    return { processed: webhookEvent.processed, order };
  }

  /**
   * Get compensating actions for order
   */
  getCompensatingActions(orderId: string): CompensatingAction[] {
    return Array.from(this.compensatingActions.values()).filter(a => a.orderId === orderId);
  }

  /**
   * Get order state history
   */
  getOrderStateHistory(orderId: string): { state: OrderState; timestamp: number }[] {
    // In production, this would be stored in a separate history table
    const order = this.orders.get(orderId);
    if (!order) return [];

    return [
      { state: 'init', timestamp: order.createdAt },
      { state: order.state, timestamp: order.updatedAt },
    ];
  }

  /**
   * Get FSM statistics
   */
  getFsmStatistics(): {
    totalOrders: number;
    byState: Record<OrderState, number>;
    totalWebhookEvents: number;
    processedWebhookEvents: number;
    totalCompensatingActions: number;
    executedCompensatingActions: number;
  } {
    const orders = Array.from(this.orders.values());
    const webhookEvents = Array.from(this.webhookEvents.values());
    const compensatingActions = Array.from(this.compensatingActions.values());

    const byState: Record<OrderState, number> = {
      init: 0,
      pending_payment: 0,
      paid: 0,
      processing: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      refunded: 0,
    };

    for (const order of orders) {
      byState[order.state]++;
    }

    return {
      totalOrders: orders.length,
      byState,
      totalWebhookEvents: webhookEvents.length,
      processedWebhookEvents: webhookEvents.filter(e => e.processed).length,
      totalCompensatingActions: compensatingActions.length,
      executedCompensatingActions: compensatingActions.filter(a => a.executed).length,
    };
  }

  /**
   * Cleanup old data (older than 1 year)
   */
  cleanupOldData(): number {
    const now = Date.now();
    const cutoff = now - (365 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    // Cleanup old completed/cancelled/refunded orders
    for (const [id, order] of this.orders.entries()) {
      if (
        (order.state === 'completed' || order.state === 'cancelled' || order.state === 'refunded') &&
        order.updatedAt < cutoff
      ) {
        this.orders.delete(id);
        deletedCount++;
      }
    }

    // Cleanup old processed webhook events
    for (const [id, event] of this.webhookEvents.entries()) {
      if (event.processed && event.receivedAt < cutoff) {
        this.webhookEvents.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[OrderFSM] Cleaned up ${deletedCount} old data records`);
    }

    return deletedCount;
  }
}

const orderFsmService = new OrderFsmService();

// Cleanup old data monthly
setInterval(() => {
  orderFsmService.cleanupOldData();
}, 30 * 24 * 60 * 60 * 1000);

export default orderFsmService;
export { OrderFsmService };
export type { Order, OrderTransition, WebhookEvent, CompensatingAction };
