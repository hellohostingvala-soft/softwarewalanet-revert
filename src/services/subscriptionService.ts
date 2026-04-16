// Subscription Service
// plan_id + cycle (monthly/yearly) + auto-renew + retry ladder + dunning states

import prorationService from './prorationService';

type SubscriptionCycle = 'monthly' | 'yearly';
type DunningState = 'active' | 'grace' | 'hold' | 'cancelled';

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  cycle: SubscriptionCycle;
  price: number;
  currency: string;
  status: 'active' | 'past_due' | 'cancelled' | 'expired';
  dunningState: DunningState;
  autoRenew: boolean;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  retryCount: number;
  nextRetryAt?: number;
  createdAt: number;
  updatedAt: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: string[];
  active: boolean;
}

interface RetryLadderConfig {
  attempt1: number; // hours
  attempt2: number;
  attempt3: number;
  attempt4: number;
  maxAttempts: number;
}

class SubscriptionService {
  private subscriptions: Map<string, Subscription>;
  private plans: Map<string, SubscriptionPlan>;
  private retryLadderConfig: RetryLadderConfig;

  constructor() {
    this.subscriptions = new Map();
    this.plans = new Map();
    this.retryLadderConfig = {
      attempt1: 24, // 1 day
      attempt2: 72, // 3 days
      attempt3: 168, // 7 days
      attempt4: 336, // 14 days
      maxAttempts: 4,
    };
  }

  /**
   * Create subscription
   */
  createSubscription(
    userId: string,
    planId: string,
    cycle: SubscriptionCycle = 'monthly',
    autoRenew: boolean = true
  ): Subscription {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const now = Date.now();
    const cycleDuration = cycle === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
    const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

    const subscription: Subscription = {
      id: crypto.randomUUID(),
      userId,
      planId,
      cycle,
      price,
      currency: plan.currency,
      status: 'active',
      dunningState: 'active',
      autoRenew,
      currentPeriodStart: now,
      currentPeriodEnd: now + cycleDuration,
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.subscriptions.set(subscription.id, subscription);

    console.log(`[Subscription] Created subscription ${subscription.id} for user ${userId}`);
    return subscription;
  }

  /**
   * Upgrade subscription (mid-cycle)
   */
  upgradeSubscription(
    subscriptionId: string,
    newPlanId: string
  ): { success: boolean; proration?: any; error?: string } {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    const oldPlan = this.plans.get(subscription.planId);
    const newPlan = this.plans.get(newPlanId);

    if (!oldPlan || !newPlan) {
      return { success: false, error: 'Plan not found' };
    }

    const oldPrice = subscription.cycle === 'monthly' ? oldPlan.monthlyPrice : oldPlan.yearlyPrice;
    const newPrice = subscription.cycle === 'monthly' ? newPlan.monthlyPrice : newPlan.yearlyPrice;

    // Calculate proration
    const proration = prorationService.calculateProration(
      subscriptionId,
      oldPrice,
      newPrice,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
      Date.now(),
      subscription.currency
    );

    // Update subscription
    subscription.planId = newPlanId;
    subscription.price = newPrice;
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscriptionId, subscription);

    console.log(`[Subscription] Upgraded subscription ${subscriptionId} to plan ${newPlanId}`);
    return { success: true, proration };
  }

  /**
   * Downgrade subscription (mid-cycle)
   */
  downgradeSubscription(
    subscriptionId: string,
    newPlanId: string
  ): { success: boolean; proration?: any; error?: string } {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    const oldPlan = this.plans.get(subscription.planId);
    const newPlan = this.plans.get(newPlanId);

    if (!oldPlan || !newPlan) {
      return { success: false, error: 'Plan not found' };
    }

    const oldPrice = subscription.cycle === 'monthly' ? oldPlan.monthlyPrice : oldPlan.yearlyPrice;
    const newPrice = subscription.cycle === 'monthly' ? newPlan.monthlyPrice : newPlan.yearlyPrice;

    // Calculate proration
    const proration = prorationService.calculateProration(
      subscriptionId,
      oldPrice,
      newPrice,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
      Date.now(),
      subscription.currency
    );

    // Update subscription (effective next cycle)
    subscription.planId = newPlanId;
    subscription.price = newPrice;
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscriptionId, subscription);

    console.log(`[Subscription] Downgraded subscription ${subscriptionId} to plan ${newPlanId}`);
    return { success: true, proration };
  }

  /**
   * Process payment failure (dunning)
   */
  processPaymentFailure(subscriptionId: string): { success: boolean; nextRetryAt?: number; error?: string } {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    subscription.retryCount++;
    subscription.status = 'past_due';

    // Determine next retry based on ladder
    const retryDelay = this.getRetryDelay(subscription.retryCount);
    if (retryDelay === null) {
      // Max retries reached, move to next dunning state
      this.advanceDunningState(subscription);
      return { success: false, error: 'Max retry attempts reached' };
    }

    subscription.nextRetryAt = Date.now() + retryDelay * 60 * 60 * 1000;
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscriptionId, subscription);

    console.log(`[Subscription] Payment failed for ${subscriptionId}, retry #${subscription.retryCount} in ${retryDelay} hours`);
    return { success: true, nextRetryAt: subscription.nextRetryAt };
  }

  /**
   * Get retry delay from ladder
   */
  private getRetryDelay(attempt: number): number | null {
    switch (attempt) {
      case 1:
        return this.retryLadderConfig.attempt1;
      case 2:
        return this.retryLadderConfig.attempt2;
      case 3:
        return this.retryLadderConfig.attempt3;
      case 4:
        return this.retryLadderConfig.attempt4;
      default:
        return null;
    }
  }

  /**
   * Advance dunning state
   */
  private advanceDunningState(subscription: Subscription): void {
    switch (subscription.dunningState) {
      case 'active':
        subscription.dunningState = 'grace';
        break;
      case 'grace':
        subscription.dunningState = 'hold';
        break;
      case 'hold':
        subscription.dunningState = 'cancelled';
        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        break;
      case 'cancelled':
        // Already cancelled
        break;
    }

    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscription.id, subscription);

    console.log(`[Subscription] Advanced dunning state to ${subscription.dunningState} for ${subscription.id}`);
  }

  /**
   * Process successful payment
   */
  processPaymentSuccess(subscriptionId: string): { success: boolean; error?: string } {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    subscription.status = 'active';
    subscription.dunningState = 'active';
    subscription.retryCount = 0;
    subscription.nextRetryAt = undefined;
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscriptionId, subscription);

    // Extend period if auto-renew
    if (subscription.autoRenew) {
      const cycleDuration = subscription.cycle === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
      subscription.currentPeriodStart = subscription.currentPeriodEnd;
      subscription.currentPeriodEnd = subscription.currentPeriodEnd + cycleDuration;
    }

    console.log(`[Subscription] Payment successful for ${subscriptionId}`);
    return { success: true };
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = false): { success: boolean; error?: string } {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    if (atPeriodEnd) {
      subscription.autoRenew = false;
      subscription.updatedAt = Date.now();
      console.log(`[Subscription] Set to cancel at period end for ${subscriptionId}`);
    } else {
      subscription.status = 'cancelled';
      subscription.dunningState = 'cancelled';
      subscription.autoRenew = false;
      subscription.updatedAt = Date.now();
      console.log(`[Subscription] Cancelled immediately ${subscriptionId}`);
    }

    this.subscriptions.set(subscriptionId, subscription);
    return { success: true };
  }

  /**
   * Renew subscription
   */
  renewSubscription(subscriptionId: string): { success: boolean; error?: string } {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    if (!subscription.autoRenew) {
      return { success: false, error: 'Auto-renew is disabled' };
    }

    const cycleDuration = subscription.cycle === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
    subscription.currentPeriodStart = subscription.currentPeriodEnd;
    subscription.currentPeriodEnd = subscription.currentPeriodEnd + cycleDuration;
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscriptionId, subscription);

    console.log(`[Subscription] Renewed subscription ${subscriptionId}`);
    return { success: true };
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): Subscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  /**
   * Get subscriptions by user
   */
  getSubscriptionsByUser(userId: string): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.userId === userId);
  }

  /**
   * Add subscription plan
   */
  addPlan(plan: SubscriptionPlan): void {
    this.plans.set(plan.id, plan);
  }

  /**
   * Get subscription plan
   */
  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.get(planId) || null;
  }

  /**
   * Get all plans
   */
  getAllPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values()).filter(plan => plan.active);
  }

  /**
   * Process expiring subscriptions
   */
  processExpiringSubscriptions(): { renewed: number; cancelled: number } {
    const now = Date.now();
    let renewed = 0;
    let cancelled = 0;

    for (const subscription of this.subscriptions.values()) {
      if (subscription.currentPeriodEnd <= now && subscription.status !== 'cancelled') {
        if (subscription.autoRenew) {
          this.renewSubscription(subscription.id);
          renewed++;
        } else {
          subscription.status = 'expired';
          subscription.dunningState = 'cancelled';
          this.subscriptions.set(subscription.id, subscription);
          cancelled++;
        }
      }
    }

    return { renewed, cancelled };
  }

  /**
   * Get subscription stats
   */
  getSubscriptionStats(): {
    total: number;
    active: number;
    pastDue: number;
    cancelled: number;
    expired: number;
    byDunningState: Record<DunningState, number>;
  } {
    const byDunningState: Record<DunningState, number> = {
      active: 0,
      grace: 0,
      hold: 0,
      cancelled: 0,
    };

    let active = 0;
    let pastDue = 0;
    let cancelled = 0;
    let expired = 0;

    for (const subscription of this.subscriptions.values()) {
      byDunningState[subscription.dunningState]++;

      switch (subscription.status) {
        case 'active':
          active++;
          break;
        case 'past_due':
          pastDue++;
          break;
        case 'cancelled':
          cancelled++;
          break;
        case 'expired':
          expired++;
          break;
      }
    }

    return {
      total: this.subscriptions.size,
      active,
      pastDue,
      cancelled,
      expired,
      byDunningState,
    };
  }

  /**
   * Set retry ladder config
   */
  setRetryLadderConfig(config: Partial<RetryLadderConfig>): void {
    this.retryLadderConfig = { ...this.retryLadderConfig, ...config };
  }

  /**
   * Get retry ladder config
   */
  getRetryLadderConfig(): RetryLadderConfig {
    return { ...this.retryLadderConfig };
  }
}

// Singleton instance
const subscriptionService = new SubscriptionService();

// Auto-process expiring subscriptions every hour
setInterval(() => {
  subscriptionService.processExpiringSubscriptions();
}, 3600000);

export default subscriptionService;
export { SubscriptionService };
export type { Subscription, SubscriptionPlan, RetryLadderConfig };
