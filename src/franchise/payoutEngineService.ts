// Payout Engine Service
// min threshold, T+N settlement cycle, payout status tracking

type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
type PayoutMethod = 'bank_transfer' | 'upi' | 'wallet' | 'check';

interface PayoutRequest {
  id: string;
  franchiseId: string;
  amount: number;
  commissionAmount: number;
  status: PayoutStatus;
  method: PayoutMethod;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
  upiId?: string;
  settlementCycle: string; // T+N format
  requestedAt: number;
  processedAt?: number;
  completedAt?: number;
  failureReason?: string;
  transactionId?: string;
  referenceNumber?: string;
}

interface SettlementCycleConfig {
  cycle: string; // T+N format
  description: string;
  minThreshold: number;
  processingDays: number;
}

class PayoutEngineService {
  private payoutRequests: Map<string, PayoutRequest>;
  private settlementCycles: Map<string, SettlementCycleConfig>;

  constructor() {
    this.payoutRequests = new Map();
    this.settlementCycles = new Map();

    // Default settlement cycles
    this.settlementCycles.set('T+7', {
      cycle: 'T+7',
      description: '7-day settlement cycle',
      minThreshold: 1000,
      processingDays: 7,
    });
    this.settlementCycles.set('T+15', {
      cycle: 'T+15',
      description: '15-day settlement cycle',
      minThreshold: 5000,
      processingDays: 15,
    });
    this.settlementCycles.set('T+30', {
      cycle: 'T+30',
      description: '30-day settlement cycle',
      minThreshold: 10000,
      processingDays: 30,
    });
  }

  /**
   * Create payout request
   */
  createPayoutRequest(
    franchiseId: string,
    amount: number,
    commissionAmount: number,
    method: PayoutMethod,
    settlementCycle: string,
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      accountHolder: string;
    },
    upiId?: string
  ): PayoutRequest {
    // Check min threshold
    const cycleConfig = this.settlementCycles.get(settlementCycle);
    if (!cycleConfig) {
      throw new Error(`Invalid settlement cycle: ${settlementCycle}`);
    }

    if (amount < cycleConfig.minThreshold) {
      throw new Error(`Amount below minimum threshold for ${settlementCycle}: ₹${cycleConfig.minThreshold}`);
    }

    const request: PayoutRequest = {
      id: crypto.randomUUID(),
      franchiseId,
      amount,
      commissionAmount,
      status: 'pending',
      method,
      bankDetails,
      upiId,
      settlementCycle,
      requestedAt: Date.now(),
    };

    this.payoutRequests.set(request.id, request);
    console.log(`[Payout] Created payout request ₹${amount} for franchise ${franchiseId}`);
    return request;
  }

  /**
   * Process payout request
   */
  async processPayout(requestId: string): Promise<PayoutRequest> {
    const request = this.payoutRequests.get(requestId);
    if (!request) {
      throw new Error('Payout request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Payout request is ${request.status}, cannot process`);
    }

    request.status = 'processing';
    request.processedAt = Date.now();
    this.payoutRequests.set(requestId, request);

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate transaction ID
      request.transactionId = `TXN${Date.now()}`;
      request.referenceNumber = `REF${Date.now()}`;
      request.status = 'completed';
      request.completedAt = Date.now();

      this.payoutRequests.set(requestId, request);
      console.log(`[Payout] Completed payout ${requestId} with transaction ID ${request.transactionId}`);
    } catch (error) {
      request.status = 'failed';
      request.failureReason = String(error);
      this.payoutRequests.set(requestId, request);
      throw error;
    }

    return request;
  }

  /**
   * Get payout request by ID
   */
  getPayoutRequest(requestId: string): PayoutRequest | null {
    return this.payoutRequests.get(requestId) || null;
  }

  /**
   * Get payout requests by franchise
   */
  getPayoutRequestsByFranchise(franchiseId: string): PayoutRequest[] {
    return Array.from(this.payoutRequests.values()).filter(p => p.franchiseId === franchiseId);
  }

  /**
   * Get payout requests by status
   */
  getPayoutRequestsByStatus(status: PayoutStatus): PayoutRequest[] {
    return Array.from(this.payoutRequests.values()).filter(p => p.status === status);
  }

  /**
   * Get pending payouts ready for processing
   */
  getPendingPayouts(): PayoutRequest[] {
    const now = Date.now();
    const pending = this.payoutRequests.values();
    const ready: PayoutRequest[] = [];

    for (const request of pending) {
      if (request.status !== 'pending') continue;

      const cycleConfig = this.settlementCycles.get(request.settlementCycle);
      if (!cycleConfig) continue;

      const processingTime = cycleConfig.processingDays * 24 * 60 * 60 * 1000;
      if (now - request.requestedAt >= processingTime) {
        ready.push(request);
      }
    }

    return ready;
  }

  /**
   * Cancel payout request
   */
  cancelPayoutRequest(requestId: string, reason: string): PayoutRequest {
    const request = this.payoutRequests.get(requestId);
    if (!request) {
      throw new Error('Payout request not found');
    }

    if (request.status === 'completed') {
      throw new Error('Cannot cancel completed payout');
    }

    request.status = 'cancelled';
    request.failureReason = reason;
    this.payoutRequests.set(requestId, request);

    console.log(`[Payout] Cancelled payout request ${requestId}: ${reason}`);
    return request;
  }

  /**
   * Retry failed payout
   */
  async retryPayout(requestId: string): Promise<PayoutRequest> {
    const request = this.payoutRequests.get(requestId);
    if (!request) {
      throw new Error('Payout request not found');
    }

    if (request.status !== 'failed') {
      throw new Error(`Payout request is ${request.status}, cannot retry`);
    }

    request.status = 'pending';
    request.failureReason = undefined;
    this.payoutRequests.set(requestId, request);

    return this.processPayout(requestId);
  }

  /**
   * Get settlement cycle config
   */
  getSettlementCycleConfig(cycle: string): SettlementCycleConfig | null {
    return this.settlementCycles.get(cycle) || null;
  }

  /**
   * Get all settlement cycles
   */
  getAllSettlementCycles(): SettlementCycleConfig[] {
    return Array.from(this.settlementCycles.values());
  }

  /**
   * Set settlement cycle config
   */
  setSettlementCycleConfig(config: SettlementCycleConfig): SettlementCycleConfig {
    this.settlementCycles.set(config.cycle, config);
    console.log(`[Payout] Set settlement cycle ${config.cycle}`);
    return config;
  }

  /**
   * Get payout stats
   */
  getPayoutStats(franchiseId?: string): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    totalAmount: number;
    totalCommission: number;
  } {
    const requests = franchiseId
      ? Array.from(this.payoutRequests.values()).filter(p => p.franchiseId === franchiseId)
      : Array.from(this.payoutRequests.values());

    const stats = {
      total: requests.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      totalAmount: 0,
      totalCommission: 0,
    };

    for (const request of requests) {
      stats[request.status]++;
      stats.totalAmount += request.amount;
      stats.totalCommission += request.commissionAmount;
    }

    return stats;
  }

  /**
   * Get franchise payout summary
   */
  getFranchisePayoutSummary(franchiseId: string, startDate?: number, endDate?: number): {
    totalPayouts: number;
    totalAmount: number;
    totalCommission: number;
    averagePayoutAmount: number;
    completedPayouts: number;
    pendingPayouts: number;
  } {
    let requests = this.getPayoutRequestsByFranchise(franchiseId);

    if (startDate) {
      requests = requests.filter(r => r.requestedAt >= startDate);
    }

    if (endDate) {
      requests = requests.filter(r => r.requestedAt <= endDate);
    }

    const totalPayouts = requests.length;
    const totalAmount = requests.reduce((sum, r) => sum + r.amount, 0);
    const totalCommission = requests.reduce((sum, r) => sum + r.commissionAmount, 0);
    const averagePayoutAmount = totalPayouts > 0 ? totalAmount / totalPayouts : 0;
    const completedPayouts = requests.filter(r => r.status === 'completed').length;
    const pendingPayouts = requests.filter(r => r.status === 'pending').length;

    return {
      totalPayouts,
      totalAmount,
      totalCommission,
      averagePayoutAmount,
      completedPayouts,
      pendingPayouts,
    };
  }

  /**
   * Auto-process pending payouts
   */
  async autoProcessPendingPayouts(): Promise<{ processed: number; failed: number }> {
    const pendingPayouts = this.getPendingPayouts();
    let processed = 0;
    let failed = 0;

    for (const payout of pendingPayouts) {
      try {
        await this.processPayout(payout.id);
        processed++;
      } catch (error) {
        failed++;
        console.error(`[Payout] Failed to process payout ${payout.id}:`, error);
      }
    }

    if (processed > 0) {
      console.log(`[Payout] Auto-processed ${processed} pending payouts`);
    }

    return { processed, failed };
  }

  /**
   * Cleanup old payout requests (older than 1 year)
   */
  cleanupOldPayoutRequests(): number {
    const now = Date.now();
    const cutoff = now - (365 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, request] of this.payoutRequests.entries()) {
      if (request.requestedAt < cutoff && request.status === 'completed') {
        this.payoutRequests.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Payout] Cleaned up ${deletedCount} old payout requests`);
    }

    return deletedCount;
  }
}

const payoutEngineService = new PayoutEngineService();

// Auto-process pending payouts every hour
setInterval(() => {
  payoutEngineService.autoProcessPendingPayouts();
}, 3600000);

// Auto-cleanup old payout requests monthly
setInterval(() => {
  payoutEngineService.cleanupOldPayoutRequests();
}, 30 * 24 * 60 * 60 * 1000);

export default payoutEngineService;
export { PayoutEngineService };
export type { PayoutRequest, PayoutStatus, PayoutMethod, SettlementCycleConfig };
