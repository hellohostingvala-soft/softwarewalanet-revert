// Franchise Events Service
// order_created/payment_success/lead_generated/seo_rank_update → sync control-panel

type EventType = 'order_created' | 'payment_success' | 'lead_generated' | 'seo_rank_update' | 'employee_added' | 'invoice_created' | 'notification';

interface Event {
  id: string;
  eventType: EventType;
  franchiseId: string;
  data: Record<string, any>;
  timestamp: number;
  syncedToControlPanel: boolean;
  syncedAt?: number;
}

class FranchiseEventsService {
  private events: Map<string, Event>;
  private eventQueue: Event[];

  constructor() {
    this.events = new Map();
    this.eventQueue = [];
  }

  /**
   * Create event
   */
  createEvent(eventType: EventType, franchiseId: string, data: Record<string, any>): Event {
    const event: Event = {
      id: crypto.randomUUID(),
      eventType,
      franchiseId,
      data,
      timestamp: Date.now(),
      syncedToControlPanel: false,
    };

    this.events.set(event.id, event);
    this.eventQueue.push(event);

    console.log(`[Events] Created event ${eventType} for franchise ${franchiseId}`);
    return event;
  }

  /**
   * Order created event
   */
  orderCreated(franchiseId: string, orderData: {
    orderNo: string;
    totalAmount: number;
    customerName: string;
  }): Event {
    return this.createEvent('order_created', franchiseId, orderData);
  }

  /**
   * Payment success event
   */
  paymentSuccess(franchiseId: string, paymentData: {
    orderId: string;
    amount: number;
    paymentMethod: string;
  }): Event {
    return this.createEvent('payment_success', franchiseId, paymentData);
  }

  /**
   * Lead generated event
   */
  leadGenerated(franchiseId: string, leadData: {
    leadNo: string;
    customerName: string;
    customerPhone: string;
  }): Event {
    return this.createEvent('lead_generated', franchiseId, leadData);
  }

  /**
   * SEO rank update event
   */
  seoRankUpdate(franchiseId: string, seoData: {
    pageUrl: string;
    ranking: number;
    keywords: string[];
  }): Event {
    return this.createEvent('seo_rank_update', franchiseId, seoData);
  }

  /**
   * Employee added event
   */
  employeeAdded(franchiseId: string, employeeData: {
    employeeId: string;
    name: string;
    role: string;
  }): Event {
    return this.createEvent('employee_added', franchiseId, employeeData);
  }

  /**
   * Invoice created event
   */
  invoiceCreated(franchiseId: string, invoiceData: {
    invoiceId: string;
    orderId: string;
    amount: number;
  }): Event {
    return this.createEvent('invoice_created', franchiseId, invoiceData);
  }

  /**
   * Notification event
   */
  notification(franchiseId: string, notificationData: {
    title: string;
    message: string;
    type: string;
  }): Event {
    return this.createEvent('notification', franchiseId, notificationData);
  }

  /**
   * Sync event to control panel
   */
  async syncToControlPanel(eventId: string): Promise<{ success: boolean; error?: string }> {
    const event = this.events.get(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    try {
      // In production, this would call control panel API
      console.log(`[Events] Syncing event ${event.eventType} to control panel`);
      
      event.syncedToControlPanel = true;
      event.syncedAt = Date.now();
      this.events.set(eventId, event);

      return { success: true };
    } catch (error) {
      console.error(`[Events] Failed to sync event ${eventId}:`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Process event queue (sync to control panel)
   */
  async processEventQueue(): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      
      if (!event.syncedToControlPanel) {
        const result = await this.syncToControlPanel(event.id);
        if (result.success) {
          processed++;
        } else {
          failed++;
          // Re-queue failed events
          this.eventQueue.push(event);
        }
      }
    }

    if (processed > 0) {
      console.log(`[Events] Processed ${processed} events to control panel`);
    }

    return { processed, failed };
  }

  /**
   * Get event by ID
   */
  getEvent(eventId: string): Event | null {
    return this.events.get(eventId) || null;
  }

  /**
   * Get events by franchise
   */
  getEventsByFranchise(franchiseId: string): Event[] {
    return Array.from(this.events.values()).filter(e => e.franchiseId === franchiseId);
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: EventType): Event[] {
    return Array.from(this.events.values()).filter(e => e.eventType === eventType);
  }

  /**
   * Get events by time range
   */
  getEventsByTimeRange(startTime: number, endTime: number): Event[] {
    return Array.from(this.events.values()).filter(
      e => e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  /**
   * Get unsynced events
   */
  getUnsyncedEvents(): Event[] {
    return Array.from(this.events.values()).filter(e => !e.syncedToControlPanel);
  }

  /**
   * Get event stats
   */
  getEventStats(): {
    total: number;
    byType: Record<EventType, number>;
    synced: number;
    unsynced: number;
  } {
    const byType: Record<EventType, number> = {
      order_created: 0,
      payment_success: 0,
      lead_generated: 0,
      seo_rank_update: 0,
      employee_added: 0,
      invoice_created: 0,
      notification: 0,
    };

    let synced = 0;
    let unsynced = 0;

    for (const event of this.events.values()) {
      byType[event.eventType]++;
      
      if (event.syncedToControlPanel) {
        synced++;
      } else {
        unsynced++;
      }
    }

    return {
      total: this.events.size,
      byType,
      synced,
      unsynced,
    };
  }

  /**
   * Cleanup old events (older than 90 days)
   */
  cleanupOldEvents(): number {
    const now = Date.now();
    const cutoff = now - (90 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, event] of this.events.entries()) {
      if (event.timestamp < cutoff) {
        this.events.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Events] Cleaned up ${deletedCount} old events`);
    }

    return deletedCount;
  }
}

const franchiseEventsService = new FranchiseEventsService();

// Auto-process event queue every 30 seconds
setInterval(() => {
  franchiseEventsService.processEventQueue();
}, 30000);

// Auto-cleanup old events daily
setInterval(() => {
  franchiseEventsService.cleanupOldEvents();
}, 86400000);

export default franchiseEventsService;
export { FranchiseEventsService };
export type { Event, EventType };
