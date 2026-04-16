// Notification Hooks Service
// email/SMS/push, critical alerts (payment/lead/order)

type NotificationChannel = 'email' | 'sms' | 'push' | 'whatsapp';
type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

interface NotificationHook {
  id: string;
  franchiseId: string;
  channel: NotificationChannel;
  eventType: string;
  enabled: boolean;
  config: {
    email?: string;
    phone?: string;
    deviceToken?: string;
    webhookUrl?: string;
  };
  createdAt: number;
  updatedAt: number;
}

interface Notification {
  id: string;
  franchiseId: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  eventType: string;
  title: string;
  message: string;
  data?: any;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: number;
  failedAt?: number;
  failureReason?: string;
  retryCount: number;
  createdAt: number;
}

class NotificationHooksService {
  private hooks: Map<string, NotificationHook>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.hooks = new Map();
    this.notifications = new Map();
  }

  /**
   * Create notification hook
   */
  createHook(
    franchiseId: string,
    channel: NotificationChannel,
    eventType: string,
    config: {
      email?: string;
      phone?: string;
      deviceToken?: string;
      webhookUrl?: string;
    }
  ): NotificationHook {
    const hook: NotificationHook = {
      id: crypto.randomUUID(),
      franchiseId,
      channel,
      eventType,
      enabled: true,
      config,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.hooks.set(hook.id, hook);
    console.log(`[NotificationHooks] Created ${channel} hook for ${eventType}`);
    return hook;
  }

  /**
   * Get hooks by franchise
   */
  getHooksByFranchise(franchiseId: string): NotificationHook[] {
    return Array.from(this.hooks.values()).filter(h => h.franchiseId === franchiseId && h.enabled);
  }

  /**
   * Get hooks by event type
   */
  getHooksByEventType(eventType: string): NotificationHook[] {
    return Array.from(this.hooks.values()).filter(h => h.eventType === eventType && h.enabled);
  }

  /**
   * Enable/disable hook
   */
  toggleHook(hookId: string, enabled: boolean): NotificationHook {
    const hook = this.hooks.get(hookId);
    if (!hook) {
      throw new Error('Hook not found');
    }

    hook.enabled = enabled;
    hook.updatedAt = Date.now();
    this.hooks.set(hookId, hook);

    console.log(`[NotificationHooks] ${enabled ? 'Enabled' : 'Disabled'} hook ${hookId}`);
    return hook;
  }

  /**
   * Update hook config
   */
  updateHookConfig(hookId: string, config: Partial<NotificationHook['config']>): NotificationHook {
    const hook = this.hooks.get(hookId);
    if (!hook) {
      throw new Error('Hook not found');
    }

    hook.config = { ...hook.config, ...config };
    hook.updatedAt = Date.now();
    this.hooks.set(hookId, hook);

    console.log(`[NotificationHooks] Updated config for hook ${hookId}`);
    return hook;
  }

  /**
   * Send notification
   */
  async sendNotification(
    franchiseId: string,
    channel: NotificationChannel,
    priority: NotificationPriority,
    eventType: string,
    title: string,
    message: string,
    data?: any
  ): Promise<Notification> {
    const notification: Notification = {
      id: crypto.randomUUID(),
      franchiseId,
      channel,
      priority,
      eventType,
      title,
      message,
      data,
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    };

    this.notifications.set(notification.id, notification);

    try {
      await this.deliverNotification(notification);
      notification.status = 'sent';
      notification.sentAt = Date.now();
      this.notifications.set(notification.id, notification);
    } catch (error) {
      notification.status = 'failed';
      notification.failedAt = Date.now();
      notification.failureReason = String(error);
      this.notifications.set(notification.id, notification);
      throw error;
    }

    return notification;
  }

  /**
   * Deliver notification based on channel
   */
  private async deliverNotification(notification: Notification): Promise<void> {
    switch (notification.channel) {
      case 'email':
        await this.sendEmail(notification);
        break;
      case 'sms':
        await this.sendSMS(notification);
        break;
      case 'push':
        await this.sendPush(notification);
        break;
      case 'whatsapp':
        await this.sendWhatsApp(notification);
        break;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<void> {
    // Get email config from hooks
    const hooks = this.getHooksByFranchise(notification.franchiseId).filter(
      h => h.channel === 'email' && h.eventType === notification.eventType
    );

    if (hooks.length === 0) {
      throw new Error('No email hooks configured');
    }

    const email = hooks[0].config.email;
    if (!email) {
      throw new Error('No email configured');
    }

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[NotificationHooks] Sent email to ${email}: ${notification.title}`);
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(notification: Notification): Promise<void> {
    const hooks = this.getHooksByFranchise(notification.franchiseId).filter(
      h => h.channel === 'sms' && h.eventType === notification.eventType
    );

    if (hooks.length === 0) {
      throw new Error('No SMS hooks configured');
    }

    const phone = hooks[0].config.phone;
    if (!phone) {
      throw new Error('No phone configured');
    }

    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[NotificationHooks] Sent SMS to ${phone}: ${notification.title}`);
  }

  /**
   * Send push notification
   */
  private async sendPush(notification: Notification): Promise<void> {
    const hooks = this.getHooksByFranchise(notification.franchiseId).filter(
      h => h.channel === 'push' && h.eventType === notification.eventType
    );

    if (hooks.length === 0) {
      throw new Error('No push hooks configured');
    }

    const deviceToken = hooks[0].config.deviceToken;
    if (!deviceToken) {
      throw new Error('No device token configured');
    }

    // Simulate push sending
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`[NotificationHooks] Sent push notification: ${notification.title}`);
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsApp(notification: Notification): Promise<void> {
    const hooks = this.getHooksByFranchise(notification.franchiseId).filter(
      h => h.channel === 'whatsapp' && h.eventType === notification.eventType
    );

    if (hooks.length === 0) {
      throw new Error('No WhatsApp hooks configured');
    }

    const phone = hooks[0].config.phone;
    if (!phone) {
      throw new Error('No phone configured');
    }

    // Simulate WhatsApp sending
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[NotificationHooks] Sent WhatsApp to ${phone}: ${notification.title}`);
  }

  /**
   * Trigger notification by event type
   */
  async triggerEvent(
    franchiseId: string,
    eventType: string,
    title: string,
    message: string,
    data?: any
  ): Promise<Notification[]> {
    const hooks = this.getHooksByEventType(eventType).filter(h => h.franchiseId === franchiseId);
    const notifications: Notification[] = [];

    const priority = this.getPriorityForEvent(eventType);

    for (const hook of hooks) {
      try {
        const notification = await this.sendNotification(
          franchiseId,
          hook.channel,
          priority,
          eventType,
          title,
          message,
          data
        );
        notifications.push(notification);
      } catch (error) {
        console.error(`[NotificationHooks] Failed to send ${hook.channel} notification:`, error);
      }
    }

    return notifications;
  }

  /**
   * Get priority for event type
   */
  private getPriorityForEvent(eventType: string): NotificationPriority {
    const criticalEvents = ['payment_failed', 'order_cancelled', 'dispute_created', 'security_alert'];
    const highEvents = ['payment_success', 'new_lead', 'order_created', 'commission_paid'];
    const normalEvents = ['invoice_created', 'payout_processed', 'subscription_renewed'];

    if (criticalEvents.includes(eventType)) return 'critical';
    if (highEvents.includes(eventType)) return 'high';
    if (normalEvents.includes(eventType)) return 'normal';
    return 'low';
  }

  /**
   * Critical alerts shortcuts
   */
  async alertPaymentSuccess(franchiseId: string, amount: number, orderId: string): Promise<Notification[]> {
    return this.triggerEvent(
      franchiseId,
      'payment_success',
      'Payment Received',
      `Payment of ₹${amount} received for order ${orderId}`,
      { amount, orderId }
    );
  }

  async alertPaymentFailed(franchiseId: string, amount: number, orderId: string, reason: string): Promise<Notification[]> {
    return this.triggerEvent(
      franchiseId,
      'payment_failed',
      'Payment Failed',
      `Payment of ₹${amount} failed for order ${orderId}: ${reason}`,
      { amount, orderId, reason }
    );
  }

  async alertNewLead(franchiseId: string, leadName: string, leadPhone: string): Promise<Notification[]> {
    return this.triggerEvent(
      franchiseId,
      'new_lead',
      'New Lead',
      `New lead received: ${leadName} (${leadPhone})`,
      { leadName, leadPhone }
    );
  }

  async alertOrderCreated(franchiseId: string, orderId: string, amount: number): Promise<Notification[]> {
    return this.triggerEvent(
      franchiseId,
      'order_created',
      'Order Created',
      `New order ${orderId} created for ₹${amount}`,
      { orderId, amount }
    );
  }

  /**
   * Get notification by ID
   */
  getNotification(notificationId: string): Notification | null {
    return this.notifications.get(notificationId) || null;
  }

  /**
   * Get notifications by franchise
   */
  getNotificationsByFranchise(franchiseId: string): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.franchiseId === franchiseId);
  }

  /**
   * Get failed notifications
   */
  getFailedNotifications(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.status === 'failed');
  }

  /**
   * Retry failed notification
   */
  async retryNotification(notificationId: string): Promise<Notification> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.status !== 'failed') {
      throw new Error('Notification is not in failed state');
    }

    if (notification.retryCount >= 3) {
      throw new Error('Max retry attempts reached');
    }

    notification.status = 'pending';
    notification.retryCount++;
    notification.failureReason = undefined;
    this.notifications.set(notificationId, notification);

    try {
      await this.deliverNotification(notification);
      notification.status = 'sent';
      notification.sentAt = Date.now();
      this.notifications.set(notificationId, notification);
    } catch (error) {
      notification.status = 'failed';
      notification.failedAt = Date.now();
      notification.failureReason = String(error);
      this.notifications.set(notificationId, notification);
      throw error;
    }

    return notification;
  }

  /**
   * Get notification stats
   */
  getNotificationStats(franchiseId?: string): {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    byChannel: Record<NotificationChannel, number>;
  } {
    const notifications = franchiseId
      ? Array.from(this.notifications.values()).filter(n => n.franchiseId === franchiseId)
      : Array.from(this.notifications.values());

    const stats = {
      total: notifications.length,
      pending: 0,
      sent: 0,
      failed: 0,
      byChannel: {
        email: 0,
        sms: 0,
        push: 0,
        whatsapp: 0,
      },
    };

    for (const notification of notifications) {
      stats[notification.status]++;
      stats.byChannel[notification.channel]++;
    }

    return stats;
  }

  /**
   * Delete hook
   */
  deleteHook(hookId: string): boolean {
    const hook = this.hooks.get(hookId);
    if (!hook) return false;

    this.hooks.delete(hookId);
    console.log(`[NotificationHooks] Deleted hook ${hookId}`);
    return true;
  }

  /**
   * Cleanup old notifications (older than 30 days)
   */
  cleanupOldNotifications(): number {
    const now = Date.now();
    const cutoff = now - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.createdAt < cutoff && notification.status === 'sent') {
        this.notifications.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[NotificationHooks] Cleaned up ${deletedCount} old notifications`);
    }

    return deletedCount;
  }
}

const notificationHooksService = new NotificationHooksService();

// Auto-cleanup old notifications daily
setInterval(() => {
  notificationHooksService.cleanupOldNotifications();
}, 24 * 60 * 60 * 1000);

export default notificationHooksService;
export { NotificationHooksService };
export type { NotificationHook, Notification };
