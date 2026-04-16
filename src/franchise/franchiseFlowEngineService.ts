// Franchise Flow Engine
// UI → route → API → service → DB → event → boss panel

type FlowStep = 'ui' | 'route' | 'api' | 'service' | 'db' | 'event' | 'boss_panel';
type FlowStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface FlowStepLog {
  step: FlowStep;
  status: FlowStatus;
  timestamp: number;
  data?: any;
  error?: string;
}

interface FlowExecution {
  id: string;
  flowType: 'order_created' | 'payment_success' | 'lead_generated' | 'seo_rank_update' | 'employee_added' | 'invoice_created';
  status: FlowStatus;
  steps: FlowStepLog[];
  metadata: any;
  startedAt: number;
  completedAt?: number;
}

interface EventPayload {
  eventType: string;
  franchiseId: string;
  data: any;
  timestamp: number;
}

class FranchiseFlowEngineService {
  private flowExecutions: Map<string, FlowExecution>;
  private eventSubscribers: Map<string, Array<(payload: EventPayload) => void>>;
  private bossPanelSyncQueue: EventPayload[];

  constructor() {
    this.flowExecutions = new Map();
    this.eventSubscribers = new Map();
    this.bossPanelSyncQueue = [];
  }

  /**
   * Execute flow with tracking
   */
  async executeFlow(
    flowType: FlowExecution['flowType'],
    data: any,
    steps: Array<FlowStep>
  ): Promise<FlowExecution> {
    const flowId = crypto.randomUUID();
    const flowExecution: FlowExecution = {
      id: flowId,
      flowType,
      status: 'pending',
      steps: [],
      metadata: data,
      startedAt: Date.now(),
    };

    this.flowExecutions.set(flowId, flowExecution);

    try {
      for (const step of steps) {
        await this.executeStep(flowId, step, data);
      }

      flowExecution.status = 'completed';
      flowExecution.completedAt = Date.now();
      this.flowExecutions.set(flowId, flowExecution);

      console.log(`[FlowEngine] Flow ${flowType} completed successfully`);
      return flowExecution;
    } catch (error) {
      flowExecution.status = 'failed';
      flowExecution.completedAt = Date.now();
      this.flowExecutions.set(flowId, flowExecution);

      console.error(`[FlowEngine] Flow ${flowType} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute individual step
   */
  private async executeStep(flowId: string, step: FlowStep, data: any): Promise<void> {
    const flowExecution = this.flowExecutions.get(flowId);
    if (!flowExecution) throw new Error('Flow execution not found');

    const stepLog: FlowStepLog = {
      step,
      status: 'in_progress',
      timestamp: Date.now(),
      data,
    };

    flowExecution.steps.push(stepLog);
    this.flowExecutions.set(flowId, flowExecution);

    try {
      // Simulate step execution
      await this.processStep(step, data);

      stepLog.status = 'completed';
      this.flowExecutions.set(flowId, flowExecution);
    } catch (error) {
      stepLog.status = 'failed';
      stepLog.error = String(error);
      this.flowExecutions.set(flowId, flowExecution);
      throw error;
    }
  }

  /**
   * Process step (simulated)
   */
  private async processStep(step: FlowStep, data: any): Promise<void> {
    // In production, this would execute actual logic for each step
    switch (step) {
      case 'ui':
        // UI action already completed
        break;
      case 'route':
        // Route navigation already completed
        break;
      case 'api':
        // API call to backend
        await new Promise(resolve => setTimeout(resolve, 100));
        break;
      case 'service':
        // Service layer processing
        await new Promise(resolve => setTimeout(resolve, 200));
        break;
      case 'db':
        // Database operation
        await new Promise(resolve => setTimeout(resolve, 150));
        break;
      case 'event':
        // Event publishing
        this.publishEvent(data.eventType, data);
        break;
      case 'boss_panel':
        // Boss panel sync
        this.syncToBossPanel(data);
        break;
    }
  }

  /**
   * Order created flow
   */
  async orderCreatedFlow(orderData: {
    franchiseId: string;
    orderNo: string;
    totalAmount: number;
    customerName: string;
  }): Promise<FlowExecution> {
    const data = {
      ...orderData,
      eventType: 'order_created',
    };

    return this.executeFlow('order_created', data, [
      'ui',
      'route',
      'api',
      'service',
      'db',
      'event',
      'boss_panel',
    ]);
  }

  /**
   * Payment success flow
   */
  async paymentSuccessFlow(paymentData: {
    franchiseId: string;
    orderId: string;
    amount: number;
    paymentMethod: string;
  }): Promise<FlowExecution> {
    const data = {
      ...paymentData,
      eventType: 'payment_success',
    };

    return this.executeFlow('payment_success', data, [
      'ui',
      'route',
      'api',
      'service',
      'db',
      'event',
      'boss_panel',
    ]);
  }

  /**
   * Lead generated flow
   */
  async leadGeneratedFlow(leadData: {
    franchiseId: string;
    leadNo: string;
    customerName: string;
    customerPhone: string;
  }): Promise<FlowExecution> {
    const data = {
      ...leadData,
      eventType: 'lead_generated',
    };

    return this.executeFlow('lead_generated', data, [
      'ui',
      'route',
      'api',
      'service',
      'db',
      'event',
      'boss_panel',
    ]);
  }

  /**
   * SEO rank update flow
   */
  async seoRankUpdateFlow(seoData: {
    franchiseId: string;
    pageUrl: string;
    ranking: number;
    keywords: string[];
  }): Promise<FlowExecution> {
    const data = {
      ...seoData,
      eventType: 'seo_rank_update',
    };

    return this.executeFlow('seo_rank_update', data, [
      'ui',
      'route',
      'api',
      'service',
      'db',
      'event',
      'boss_panel',
    ]);
  }

  /**
   * Employee added flow
   */
  async employeeAddedFlow(employeeData: {
    franchiseId: string;
    employeeId: string;
    name: string;
    role: string;
  }): Promise<FlowExecution> {
    const data = {
      ...employeeData,
      eventType: 'employee_added',
    };

    return this.executeFlow('employee_added', data, [
      'ui',
      'route',
      'api',
      'service',
      'db',
      'event',
      'boss_panel',
    ]);
  }

  /**
   * Invoice created flow
   */
  async invoiceCreatedFlow(invoiceData: {
    franchiseId: string;
    invoiceId: string;
    orderId: string;
    amount: number;
  }): Promise<FlowExecution> {
    const data = {
      ...invoiceData,
      eventType: 'invoice_created',
    };

    return this.executeFlow('invoice_created', data, [
      'ui',
      'route',
      'api',
      'service',
      'db',
      'event',
      'boss_panel',
    ]);
  }

  /**
   * Publish event
   */
  publishEvent(eventType: string, data: any): void {
    const payload: EventPayload = {
      eventType,
      franchiseId: data.franchiseId,
      data,
      timestamp: Date.now(),
    };

    // Notify subscribers
    const subscribers = this.eventSubscribers.get(eventType) || [];
    subscribers.forEach(callback => callback(payload));

    // Queue for boss panel sync
    this.bossPanelSyncQueue.push(payload);

    console.log(`[FlowEngine] Published event: ${eventType}`);
  }

  /**
   * Subscribe to events
   */
  subscribeEvent(eventType: string, callback: (payload: EventPayload) => void): () => void {
    if (!this.eventSubscribers.has(eventType)) {
      this.eventSubscribers.set(eventType, []);
    }

    this.eventSubscribers.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.eventSubscribers.get(eventType) || [];
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Sync to boss panel
   */
  syncToBossPanel(data: any): void {
    // In production, this would call boss panel API
    console.log(`[FlowEngine] Syncing to boss panel: ${data.eventType}`);
  }

  /**
   * Process boss panel sync queue
   */
  processBossPanelSyncQueue(): number {
    let processed = 0;

    while (this.bossPanelSyncQueue.length > 0) {
      const payload = this.bossPanelSyncQueue.shift()!;
      this.syncToBossPanel(payload);
      processed++;
    }

    if (processed > 0) {
      console.log(`[FlowEngine] Processed ${processed} boss panel syncs`);
    }

    return processed;
  }

  /**
   * Get flow execution by ID
   */
  getFlowExecution(flowId: string): FlowExecution | null {
    return this.flowExecutions.get(flowId) || null;
  }

  /**
   * Get flow executions by type
   */
  getFlowExecutionsByType(flowType: FlowExecution['flowType']): FlowExecution[] {
    return Array.from(this.flowExecutions.values()).filter(f => f.flowType === flowType);
  }

  /**
   * Get flow executions by franchise
   */
  getFlowExecutionsByFranchise(franchiseId: string): FlowExecution[] {
    return Array.from(this.flowExecutions.values()).filter(f => f.metadata.franchiseId === franchiseId);
  }

  /**
   * Get flow stats
   */
  getFlowStats(): {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<FlowStatus, number>;
  } {
    const byType: Record<string, number> = {};
    const byStatus: Record<FlowStatus, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      failed: 0,
    };

    for (const flow of this.flowExecutions.values()) {
      byType[flow.flowType] = (byType[flow.flowType] || 0) + 1;
      byStatus[flow.status]++;
    }

    return {
      total: this.flowExecutions.size,
      byType,
      byStatus,
    };
  }

  /**
   * Cleanup old flow executions (older than 30 days)
   */
  cleanupOldFlowExecutions(): number {
    const now = Date.now();
    const cutoff = now - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, flow] of this.flowExecutions.entries()) {
      if (flow.startedAt < cutoff) {
        this.flowExecutions.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[FlowEngine] Cleaned up ${deletedCount} old flow executions`);
    }

    return deletedCount;
  }
}

const franchiseFlowEngineService = new FranchiseFlowEngineService();

// Auto-process boss panel sync queue every 30 seconds
setInterval(() => {
  franchiseFlowEngineService.processBossPanelSyncQueue();
}, 30000);

// Auto-cleanup old flow executions daily
setInterval(() => {
  franchiseFlowEngineService.cleanupOldFlowExecutions();
}, 86400000);

export default franchiseFlowEngineService;
export { FranchiseFlowEngineService };
export type { FlowExecution, EventPayload, FlowStep, FlowStatus };
