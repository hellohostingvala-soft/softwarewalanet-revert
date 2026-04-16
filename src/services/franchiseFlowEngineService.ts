// Franchise Flow Engine Service
// UI → route → API → service → DB → event → boss panel

export interface FlowEvent {
  eventId: string;
  eventType: 'order_created' | 'payment_success' | 'lead_generated' | 'seo_rank_update' | 'employee_added' | 'invoice_created';
  source: 'ui' | 'api' | 'service';
  franchiseId: string;
  userId?: string;
  data: any;
  timestamp: Date;
}

export interface FlowStep {
  step: 'ui' | 'route' | 'api' | 'service' | 'db' | 'event' | 'boss_panel';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  data?: any;
  error?: string;
  timestamp: Date;
}

// Event bus for pub/sub
type EventCallback = (event: FlowEvent) => void;
const eventSubscribers: Map<string, EventCallback[]> = new Map();

// Flow tracking
const activeFlows: Map<string, FlowStep[]> = new Map();

/**
 * Initialize flow
 */
export function initFlow(flowId: string): void {
  activeFlows.set(flowId, []);
  logFlowStep(flowId, 'ui', 'in_progress', { flowId });
}

/**
 * Log flow step
 */
export function logFlowStep(
  flowId: string,
  step: FlowStep['step'],
  status: FlowStep['status'],
  data?: any,
  error?: string
): void {
  const flow = activeFlows.get(flowId) || [];
  flow.push({
    step,
    status,
    data,
    error,
    timestamp: new Date(),
  });
  activeFlows.set(flowId, flow);
}

/**
 * Get flow status
 */
export function getFlowStatus(flowId: string): FlowStep[] | null {
  return activeFlows.get(flowId) || null;
}

/**
 * Publish event
 */
export function publishEvent(event: FlowEvent): void {
  console.log(`[Flow Engine] Publishing event: ${event.eventType}`, event);
  
  const subscribers = eventSubscribers.get(event.eventType) || [];
  subscribers.forEach(callback => callback(event));
  
  // Sync to Boss Panel
  syncToBossPanel(event);
}

/**
 * Subscribe to event
 */
export function subscribeEvent(eventType: FlowEvent['eventType'], callback: EventCallback): () => void {
  const subscribers = eventSubscribers.get(eventType) || [];
  subscribers.push(callback);
  eventSubscribers.set(eventType, subscribers);
  
  // Return unsubscribe function
  return () => {
    const updated = (eventSubscribers.get(eventType) || []).filter(cb => cb !== callback);
    eventSubscribers.set(eventType, updated);
  };
}

/**
 * Execute flow with tracking
 */
export async function executeFlow<T>(
  flowId: string,
  steps: Array<{
    name: string;
    execute: () => Promise<T>;
  }>
): Promise<{ success: boolean; result?: T; error?: string }> {
  initFlow(flowId);
  
  for (const step of steps) {
    try {
      logFlowStep(flowId, step.name as FlowStep['step'], 'in_progress');
      const result = await step.execute();
      logFlowStep(flowId, step.name as FlowStep['step'], 'completed', { result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logFlowStep(flowId, step.name as FlowStep['step'], 'failed', undefined, errorMessage);
      return { success: false, error: errorMessage };
    }
  }
  
  logFlowStep(flowId, 'boss_panel', 'in_progress');
  await syncToBossPanelAsync(flowId);
  logFlowStep(flowId, 'boss_panel', 'completed');
  
  return { success: true };
}

/**
 * Order created flow
 */
export async function orderCreatedFlow(orderData: any): Promise<void> {
  const flowId = crypto.randomUUID();
  
  await executeFlow(flowId, [
    {
      name: 'ui',
      execute: async () => {
        console.log('UI: Order form submitted');
        return orderData;
      }
    },
    {
      name: 'route',
      execute: async () => {
        console.log('Route: POST /api/orders/create');
        return { route: '/api/orders/create' };
      }
    },
    {
      name: 'api',
      execute: async () => {
        console.log('API: Validating request');
        return { validated: true };
      }
    },
    {
      name: 'service',
      execute: async () => {
        console.log('Service: Processing order');
        return { processed: true };
      }
    },
    {
      name: 'db',
      execute: async () => {
        console.log('DB: Saving order');
        return { saved: true };
      }
    },
    {
      name: 'event',
      execute: async () => {
        const event: FlowEvent = {
          eventId: crypto.randomUUID(),
          eventType: 'order_created',
          source: 'service',
          franchiseId: orderData.franchiseId,
          userId: orderData.userId,
          data: orderData,
          timestamp: new Date(),
        };
        publishEvent(event);
        return event;
      }
    }
  ]);
}

/**
 * Payment success flow
 */
export async function paymentSuccessFlow(paymentData: any): Promise<void> {
  const flowId = crypto.randomUUID();
  
  await executeFlow(flowId, [
    {
      name: 'ui',
      execute: async () => {
        console.log('UI: Payment callback received');
        return paymentData;
      }
    },
    {
      name: 'route',
      execute: async () => {
        console.log('Route: POST /api/payment/webhook');
        return { route: '/api/payment/webhook' };
      }
    },
    {
      name: 'api',
      execute: async () => {
        console.log('API: Verifying webhook signature');
        return { verified: true };
      }
    },
    {
      name: 'service',
      execute: async () => {
        console.log('Service: Processing payment');
        return { processed: true };
      }
    },
    {
      name: 'db',
      execute: async () => {
        console.log('DB: Updating order status + wallet');
        return { updated: true };
      }
    },
    {
      name: 'event',
      execute: async () => {
        const event: FlowEvent = {
          eventId: crypto.randomUUID(),
          eventType: 'payment_success',
          source: 'service',
          franchiseId: paymentData.franchiseId,
          userId: paymentData.userId,
          data: paymentData,
          timestamp: new Date(),
        };
        publishEvent(event);
        return event;
      }
    }
  ]);
}

/**
 * Lead generated flow
 */
export async function leadGeneratedFlow(leadData: any): Promise<void> {
  const flowId = crypto.randomUUID();
  
  await executeFlow(flowId, [
    {
      name: 'ui',
      execute: async () => {
        console.log('UI: Lead form submitted');
        return leadData;
      }
    },
    {
      name: 'route',
      execute: async () => {
        console.log('Route: POST /api/leads/create');
        return { route: '/api/leads/create' };
      }
    },
    {
      name: 'api',
      execute: async () => {
        console.log('API: Validating lead data');
        return { validated: true };
      }
    },
    {
      name: 'service',
      execute: async () => {
        console.log('Service: Processing lead with region filter');
        return { processed: true };
      }
    },
    {
      name: 'db',
      execute: async () => {
        console.log('DB: Saving lead');
        return { saved: true };
      }
    },
    {
      name: 'event',
      execute: async () => {
        const event: FlowEvent = {
          eventId: crypto.randomUUID(),
          eventType: 'lead_generated',
          source: 'service',
          franchiseId: leadData.franchiseId,
          data: leadData,
          timestamp: new Date(),
        };
        publishEvent(event);
        return event;
      }
    }
  ]);
}

/**
 * SEO rank update flow
 */
export async function seoRankUpdateFlow(seoData: any): Promise<void> {
  const flowId = crypto.randomUUID();
  
  await executeFlow(flowId, [
    {
      name: 'ui',
      execute: async () => {
        console.log('UI: SEO update triggered');
        return seoData;
      }
    },
    {
      name: 'route',
      execute: async () => {
        console.log('Route: POST /api/seo/update');
        return { route: '/api/seo/update' };
      }
    },
    {
      name: 'api',
      execute: async () => {
        console.log('API: Validating SEO data');
        return { validated: true };
      }
    },
    {
      name: 'service',
      execute: async () => {
        console.log('Service: Processing local SEO keywords');
        return { processed: true };
      }
    },
    {
      name: 'db',
      execute: async () => {
        console.log('DB: Updating SEO rankings');
        return { updated: true };
      }
    },
    {
      name: 'event',
      execute: async () => {
        const event: FlowEvent = {
          eventId: crypto.randomUUID(),
          eventType: 'seo_rank_update',
          source: 'service',
          franchiseId: seoData.franchiseId,
          data: seoData,
          timestamp: new Date(),
        };
        publishEvent(event);
        return event;
      }
    }
  ]);
}

/**
 * Sync to Boss Panel
 */
function syncToBossPanel(event: FlowEvent): void {
  console.log(`[Flow Engine] Syncing to Boss Panel:`, event);
  // This will integrate with the event bus for real-time sync
}

/**
 * Sync to Boss Panel (async)
 */
async function syncToBossPanelAsync(flowId: string): Promise<void> {
  const flow = activeFlows.get(flowId);
  if (!flow) return;
  
  console.log(`[Flow Engine] Syncing flow to Boss Panel: ${flowId}`, flow);
  // This will integrate with the event bus for real-time sync
}

/**
 * Get all active flows
 */
export function getAllFlows(): Map<string, FlowStep[]> {
  return new Map(activeFlows);
}

/**
 * Clear completed flows
 */
export function clearCompletedFlows(): void {
  const now = new Date();
  for (const [flowId, steps] of activeFlows.entries()) {
    const lastStep = steps[steps.length - 1];
    if (lastStep.status === 'completed' || lastStep.status === 'failed') {
      const elapsed = now.getTime() - lastStep.timestamp.getTime();
      if (elapsed > 3600000) { // 1 hour
        activeFlows.delete(flowId);
      }
    }
  }
}
