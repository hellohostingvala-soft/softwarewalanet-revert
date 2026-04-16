// Franchise Subscription Service
// plan assign, limits (products/leads/team)

type SubscriptionPlan = 'basic' | 'standard' | 'premium' | 'enterprise';
type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'expired';

interface SubscriptionLimits {
  maxProducts: number;
  maxLeads: number;
  maxTeamMembers: number;
  maxOrders: number;
  maxInvoices: number;
  apiCallsPerMonth: number;
}

interface SubscriptionPlanConfig {
  plan: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  limits: SubscriptionLimits;
  features: string[];
}

interface FranchiseSubscription {
  id: string;
  franchiseId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: number;
  endDate: number;
  autoRenew: boolean;
  limits: SubscriptionLimits;
  currentUsage: {
    products: number;
    leads: number;
    teamMembers: number;
    orders: number;
    invoices: number;
    apiCalls: number;
  };
  createdAt: number;
  updatedAt: number;
}

class FranchiseSubscriptionService {
  private subscriptions: Map<string, FranchiseSubscription>;
  private planConfigs: Map<SubscriptionPlan, SubscriptionPlanConfig>;

  constructor() {
    this.subscriptions = new Map();
    this.planConfigs = new Map();

    // Default plan configurations
    this.planConfigs.set('basic', {
      plan: 'basic',
      name: 'Basic',
      price: 999,
      currency: 'INR',
      billingCycle: 'monthly',
      limits: {
        maxProducts: 10,
        maxLeads: 50,
        maxTeamMembers: 3,
        maxOrders: 100,
        maxInvoices: 50,
        apiCallsPerMonth: 1000,
      },
      features: ['Basic dashboard', 'Order management', 'Lead tracking', 'Email support'],
    });

    this.planConfigs.set('standard', {
      plan: 'standard',
      name: 'Standard',
      price: 2499,
      currency: 'INR',
      billingCycle: 'monthly',
      limits: {
        maxProducts: 50,
        maxLeads: 200,
        maxTeamMembers: 10,
        maxOrders: 500,
        maxInvoices: 200,
        apiCallsPerMonth: 5000,
      },
      features: ['All Basic features', 'Advanced analytics', 'SEO tools', 'Priority support', 'API access'],
    });

    this.planConfigs.set('premium', {
      plan: 'premium',
      name: 'Premium',
      price: 4999,
      currency: 'INR',
      billingCycle: 'monthly',
      limits: {
        maxProducts: 200,
        maxLeads: 1000,
        maxTeamMembers: 25,
        maxOrders: 2000,
        maxInvoices: 1000,
        apiCallsPerMonth: 20000,
      },
      features: ['All Standard features', 'White-label', 'Custom integrations', 'Dedicated support', 'Advanced reports'],
    });

    this.planConfigs.set('enterprise', {
      plan: 'enterprise',
      name: 'Enterprise',
      price: 9999,
      currency: 'INR',
      billingCycle: 'monthly',
      limits: {
        maxProducts: -1, // unlimited
        maxLeads: -1,
        maxTeamMembers: -1,
        maxOrders: -1,
        maxInvoices: -1,
        apiCallsPerMonth: -1,
      },
      features: ['All Premium features', 'Unlimited everything', 'Custom SLA', 'Account manager', 'On-premise deployment'],
    });
  }

  /**
   * Create subscription
   */
  createSubscription(
    franchiseId: string,
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    autoRenew: boolean = true
  ): FranchiseSubscription {
    const planConfig = this.planConfigs.get(plan);
    if (!planConfig) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    const startDate = Date.now();
    const endDate = billingCycle === 'monthly'
      ? startDate + (30 * 24 * 60 * 60 * 1000)
      : startDate + (365 * 24 * 60 * 60 * 1000);

    const subscription: FranchiseSubscription = {
      id: crypto.randomUUID(),
      franchiseId,
      plan,
      status: 'active',
      startDate,
      endDate,
      autoRenew,
      limits: planConfig.limits,
      currentUsage: {
        products: 0,
        leads: 0,
        teamMembers: 0,
        orders: 0,
        invoices: 0,
        apiCalls: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.subscriptions.set(subscription.id, subscription);
    console.log(`[Subscription] Created ${plan} subscription for franchise ${franchiseId}`);
    return subscription;
  }

  /**
   * Get subscription by franchise
   */
  getSubscriptionByFranchise(franchiseId: string): FranchiseSubscription | null {
    return Array.from(this.subscriptions.values()).find(s => s.franchiseId === franchiseId) || null;
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): FranchiseSubscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  /**
   * Update subscription plan
   */
  updateSubscriptionPlan(
    subscriptionId: string,
    newPlan: SubscriptionPlan,
    updatedBy: string
  ): FranchiseSubscription {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const planConfig = this.planConfigs.get(newPlan);
    if (!planConfig) {
      throw new Error(`Invalid plan: ${newPlan}`);
    }

    subscription.plan = newPlan;
    subscription.limits = planConfig.limits;
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscriptionId, subscription);

    console.log(`[Subscription] Updated subscription ${subscriptionId} to ${newPlan}`);
    return subscription;
  }

  /**
   * Check if limit is exceeded
   */
  checkLimitExceeded(franchiseId: string, resource: keyof SubscriptionLimits): boolean {
    const subscription = this.getSubscriptionByFranchise(franchiseId);
    if (!subscription || subscription.status !== 'active') {
      return true;
    }

    const limit = subscription.limits[resource];
    const usage = subscription.currentUsage[resource as keyof typeof subscription.currentUsage];

    // -1 means unlimited
    if (limit === -1) return false;

    return usage >= limit;
  }

  /**
   * Update usage
   */
  updateUsage(
    franchiseId: string,
    resource: keyof SubscriptionLimits,
    increment: number = 1
  ): FranchiseSubscription | null {
    const subscription = this.getSubscriptionByFranchise(franchiseId);
    if (!subscription) return null;

    const usageKey = resource as keyof typeof subscription.currentUsage;
    subscription.currentUsage[usageKey] += increment;
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscription.id, subscription);

    return subscription;
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(franchiseId: string, resource: keyof SubscriptionLimits): number {
    const subscription = this.getSubscriptionByFranchise(franchiseId);
    if (!subscription) return 100;

    const limit = subscription.limits[resource];
    const usage = subscription.currentUsage[resource as keyof typeof subscription.currentUsage];

    if (limit === -1) return 0;
    if (limit === 0) return 100;

    return Math.min((usage / limit) * 100, 100);
  }

  /**
   * Get plan config
   */
  getPlanConfig(plan: SubscriptionPlan): SubscriptionPlanConfig | null {
    return this.planConfigs.get(plan) || null;
  }

  /**
   * Get all plan configs
   */
  getAllPlanConfigs(): SubscriptionPlanConfig[] {
    return Array.from(this.planConfigs.values());
  }

  /**
   * Suspend subscription
   */
  suspendSubscription(subscriptionId: string, reason: string): FranchiseSubscription {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'suspended';
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscriptionId, subscription);

    console.log(`[Subscription] Suspended subscription ${subscriptionId}: ${reason}`);
    return subscription;
  }

  /**
   * Activate subscription
   */
  activateSubscription(subscriptionId: string): FranchiseSubscription {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'active';
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscriptionId, subscription);

    console.log(`[Subscription] Activated subscription ${subscriptionId}`);
    return subscription;
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(subscriptionId: string): FranchiseSubscription {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    subscription.updatedAt = Date.now();
    this.subscriptions.set(subscriptionId, subscription);

    console.log(`[Subscription] Cancelled subscription ${subscriptionId}`);
    return subscription;
  }

  /**
   * Check and expire subscriptions
   */
  checkExpiredSubscriptions(): number {
    const now = Date.now();
    let expiredCount = 0;

    for (const [id, subscription] of this.subscriptions.entries()) {
      if (subscription.status === 'active' && subscription.endDate < now) {
        if (subscription.autoRenew) {
          // Auto-renew
          const billingCycle = (this.planConfigs.get(subscription.plan)?.billingCycle || 'monthly') === 'monthly' ? 30 : 365;
          subscription.endDate = now + (billingCycle * 24 * 60 * 60 * 1000);
          this.subscriptions.set(id, subscription);
          console.log(`[Subscription] Auto-renewed subscription ${id}`);
        } else {
          subscription.status = 'expired';
          this.subscriptions.set(id, subscription);
          console.log(`[Subscription] Expired subscription ${id}`);
          expiredCount++;
        }
      }
    }

    return expiredCount;
  }

  /**
   * Get subscription stats
   */
  getSubscriptionStats(): {
    total: number;
    active: number;
    suspended: number;
    cancelled: number;
    expired: number;
    byPlan: Record<SubscriptionPlan, number>;
  } {
    const stats = {
      total: this.subscriptions.size,
      active: 0,
      suspended: 0,
      cancelled: 0,
      expired: 0,
      byPlan: {
        basic: 0,
        standard: 0,
        premium: 0,
        enterprise: 0,
      },
    };

    for (const subscription of this.subscriptions.values()) {
      stats[subscription.status]++;
      stats.byPlan[subscription.plan]++;
    }

    return stats;
  }

  /**
   * Delete subscription
   */
  deleteSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    this.subscriptions.delete(subscriptionId);
    console.log(`[Subscription] Deleted subscription ${subscriptionId}`);
    return true;
  }
}

const franchiseSubscriptionService = new FranchiseSubscriptionService();

// Check expired subscriptions daily
setInterval(() => {
  franchiseSubscriptionService.checkExpiredSubscriptions();
}, 24 * 60 * 60 * 1000);

export default franchiseSubscriptionService;
export { FranchiseSubscriptionService };
export type { FranchiseSubscription, SubscriptionPlanConfig, SubscriptionLimits };
