// Edge Cases Service
// refund sync → wallet adjust, failed payment retry, duplicate order prevention

import apiSecurityService from './apiSecurityService';
import payoutEngineService from './payoutEngineService';
import notificationHooksService from './notificationHooksService';
import auditLogsService from './auditLogsService';

interface RefundRecord {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  walletAdjustment?: {
    franchiseId: string;
    amount: number;
    type: 'credit' | 'debit';
  };
  createdAt: number;
  completedAt?: number;
}

interface PaymentRetryRecord {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  attemptCount: number;
  maxAttempts: number;
  nextRetryAt?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'abandoned';
  lastError?: string;
  createdAt: number;
}

interface OrderDeduplicationEntry {
  orderId: string;
  franchiseId: string;
  customerId: string;
  productIds: string[];
  amount: number;
  timestamp: number;
  hash: string;
}

class EdgeCasesService {
  private refunds: Map<string, RefundRecord>;
  private paymentRetries: Map<string, PaymentRetryRecord>;
  private orderDeduplication: Map<string, OrderDeduplicationEntry>;
  private orderLocks: Set<string>;

  constructor() {
    this.refunds = new Map();
    this.paymentRetries = new Map();
    this.orderDeduplication = new Map();
    this.orderLocks = new Set();
  }

  /**
   * Generate hash for order deduplication
   */
  private generateOrderHash(franchiseId: string, customerId: string, productIds: string[], amount: number): string {
    const data = `${franchiseId}-${customerId}-${productIds.sort().join(',')}-${amount}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Check for duplicate order
   */
  checkDuplicateOrder(
    franchiseId: string,
    customerId: string,
    productIds: string[],
    amount: number,
    timeWindowMinutes: number = 5
  ): { isDuplicate: boolean; existingOrderId?: string } {
    const hash = this.generateOrderHash(franchiseId, customerId, productIds, amount);
    const now = Date.now();
    const window = timeWindowMinutes * 60 * 1000;

    const existing = Array.from(this.orderDeduplication.values()).find(
      entry =>
        entry.hash === hash &&
        entry.franchiseId === franchiseId &&
        now - entry.timestamp < window
    );

    if (existing) {
      return { isDuplicate: true, existingOrderId: existing.orderId };
    }

    return { isDuplicate: false };
  }

  /**
   * Register order for deduplication
   */
  registerOrder(
    orderId: string,
    franchiseId: string,
    customerId: string,
    productIds: string[],
    amount: number
  ): void {
    const hash = this.generateOrderHash(franchiseId, customerId, productIds, amount);
    const entry: OrderDeduplicationEntry = {
      orderId,
      franchiseId,
      customerId,
      productIds,
      amount,
      timestamp: Date.now(),
      hash,
    };

    this.orderDeduplication.set(orderId, entry);
    console.log(`[EdgeCases] Registered order ${orderId} for deduplication`);
  }

  /**
   * Lock order (prevent concurrent operations)
   */
  lockOrder(orderId: string): boolean {
    if (this.orderLocks.has(orderId)) {
      return false;
    }
    this.orderLocks.add(orderId);
    console.log(`[EdgeCases] Locked order ${orderId}`);
    return true;
  }

  /**
   * Unlock order
   */
  unlockOrder(orderId: string): void {
    this.orderLocks.delete(orderId);
    console.log(`[EdgeCases] Unlocked order ${orderId}`);
  }

  /**
   * Process refund with wallet adjustment
   */
  async processRefund(
    orderId: string,
    paymentId: string,
    amount: number,
    reason: string,
    franchiseId: string
  ): Promise<RefundRecord> {
    const refund: RefundRecord = {
      id: crypto.randomUUID(),
      orderId,
      paymentId,
      amount,
      reason,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.refunds.set(refund.id, refund);

    try {
      refund.status = 'processing';
      this.refunds.set(refund.id, refund);

      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Adjust wallet
      refund.walletAdjustment = {
        franchiseId,
        amount,
        type: 'credit',
      };

      // In production, this would call wallet service to credit the amount
      console.log(`[EdgeCases] Wallet adjustment: Credit ₹${amount} to franchise ${franchiseId}`);

      refund.status = 'completed';
      refund.completedAt = Date.now();
      this.refunds.set(refund.id, refund);

      // Log the refund
      auditLogsService.createLog(
        franchiseId,
        'system',
        'System',
        'create',
        'payment',
        paymentId,
        'Refund',
        `Refund of ₹${amount} processed for order ${orderId}: ${reason}`
      );

      // Notify franchise
      await notificationHooksService.triggerEvent(
        franchiseId,
        'payment_refund',
        'Refund Processed',
        `Refund of ₹${amount} has been processed for order ${orderId}`,
        { orderId, amount, reason }
      );

      console.log(`[EdgeCases] Refund ${refund.id} completed`);
    } catch (error) {
      refund.status = 'failed';
      this.refunds.set(refund.id, refund);
      throw error;
    }

    return refund;
  }

  /**
   * Retry failed payment
   */
  async retryPayment(
    paymentId: string,
    orderId: string,
    amount: number,
    maxAttempts: number = 3,
    retryIntervalMinutes: number = 5
  ): Promise<PaymentRetryRecord> {
    const existingRetry = this.paymentRetries.get(paymentId);
    
    if (existingRetry) {
      if (existingRetry.status === 'completed') {
        return existingRetry;
      }
      if (existingRetry.attemptCount >= maxAttempts) {
        existingRetry.status = 'abandoned';
        this.paymentRetries.set(paymentId, existingRetry);
        throw new Error('Max retry attempts reached, payment abandoned');
      }
    }

    const retry: PaymentRetryRecord = existingRetry || {
      id: crypto.randomUUID(),
      paymentId,
      orderId,
      amount,
      attemptCount: 0,
      maxAttempts,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.paymentRetries.set(paymentId, retry);

    try {
      retry.status = 'processing';
      retry.attemptCount++;
      this.paymentRetries.set(paymentId, retry);

      // Simulate payment retry
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In production, this would call payment gateway
      console.log(`[EdgeCases] Payment retry attempt ${retry.attemptCount}/${maxAttempts} for payment ${paymentId}`);

      // Simulate success (in production, this would check actual payment status)
      const success = Math.random() > 0.3; // 70% success rate for simulation

      if (success) {
        retry.status = 'completed';
        this.paymentRetries.set(paymentId, retry);

        // Log successful retry
        auditLogsService.createLog(
          'system',
          'system',
          'System',
          'update',
          'payment',
          paymentId,
          `Payment ${paymentId}`,
          `Payment retry successful after ${retry.attemptCount} attempts`
        );
      } else {
        retry.lastError = 'Payment gateway declined';
        retry.status = 'pending';
        retry.nextRetryAt = Date.now() + (retryIntervalMinutes * 60 * 1000);
        this.paymentRetries.set(paymentId, retry);

        if (retry.attemptCount >= maxAttempts) {
          retry.status = 'failed';
          this.paymentRetries.set(paymentId, retry);

          // Log failed payment
          auditLogsService.createLog(
            'system',
            'system',
            'System',
            'update',
            'payment',
            paymentId,
            `Payment ${paymentId}`,
            `Payment failed after ${retry.attemptCount} attempts: ${retry.lastError}`
          );
        }
      }
    } catch (error) {
      retry.status = 'failed';
      retry.lastError = String(error);
      this.paymentRetries.set(paymentId, retry);
      throw error;
    }

    return retry;
  }

  /**
   * Get refund by ID
   */
  getRefund(refundId: string): RefundRecord | null {
    return this.refunds.get(refundId) || null;
  }

  /**
   * Get refunds by order
   */
  getRefundsByOrder(orderId: string): RefundRecord[] {
    return Array.from(this.refunds.values()).filter(r => r.orderId === orderId);
  }

  /**
   * Get payment retry by ID
   */
  getPaymentRetry(paymentId: string): PaymentRetryRecord | null {
    return this.paymentRetries.get(paymentId) || null;
  }

  /**
   * Get pending payment retries
   */
  getPendingPaymentRetries(): PaymentRetryRecord[] {
    const now = Date.now();
    return Array.from(this.paymentRetries.values()).filter(
      r => r.status === 'pending' && (!r.nextRetryAt || r.nextRetryAt <= now)
    );
  }

  /**
   * Process pending payment retries
   */
  async processPendingPaymentRetries(): Promise<{ processed: number; failed: number }> {
    const pendingRetries = this.getPendingPaymentRetries();
    let processed = 0;
    let failed = 0;

    for (const retry of pendingRetries) {
      try {
        await this.retryPayment(
          retry.paymentId,
          retry.orderId,
          retry.amount,
          retry.maxAttempts
        );
        processed++;
      } catch (error) {
        failed++;
        console.error(`[EdgeCases] Failed to retry payment ${retry.paymentId}:`, error);
      }
    }

    if (processed > 0) {
      console.log(`[EdgeCases] Processed ${processed} pending payment retries`);
    }

    return { processed, failed };
  }

  /**
   * Get edge case stats
   */
  getEdgeCaseStats(): {
    totalRefunds: number;
    pendingRefunds: number;
    completedRefunds: number;
    totalPaymentRetries: number;
    pendingRetries: number;
    completedRetries: number;
    failedRetries: number;
    totalOrderLocks: number;
  } {
    const refunds = Array.from(this.refunds.values());
    const retries = Array.from(this.paymentRetries.values());

    return {
      totalRefunds: refunds.length,
      pendingRefunds: refunds.filter(r => r.status === 'pending').length,
      completedRefunds: refunds.filter(r => r.status === 'completed').length,
      totalPaymentRetries: retries.length,
      pendingRetries: retries.filter(r => r.status === 'pending').length,
      completedRetries: retries.filter(r => r.status === 'completed').length,
      failedRetries: retries.filter(r => r.status === 'failed' || r.status === 'abandoned').length,
      totalOrderLocks: this.orderLocks.size,
    };
  }

  /**
   * Cleanup old deduplication entries (older than 1 hour)
   */
  cleanupOldDeduplicationEntries(): number {
    const now = Date.now();
    const cutoff = now - (60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, entry] of this.orderDeduplication.entries()) {
      if (entry.timestamp < cutoff) {
        this.orderDeduplication.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[EdgeCases] Cleaned up ${deletedCount} old deduplication entries`);
    }

    return deletedCount;
  }

  /**
   * Cleanup completed refunds (older than 90 days)
   */
  cleanupOldRefunds(): number {
    const now = Date.now();
    const cutoff = now - (90 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, refund] of this.refunds.entries()) {
      if (refund.status === 'completed' && refund.completedAt && refund.completedAt < cutoff) {
        this.refunds.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[EdgeCases] Cleaned up ${deletedCount} old refunds`);
    }

    return deletedCount;
  }

  /**
   * Cleanup completed payment retries (older than 30 days)
   */
  cleanupOldPaymentRetries(): number {
    const now = Date.now();
    const cutoff = now - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, retry] of this.paymentRetries.entries()) {
      if ((retry.status === 'completed' || retry.status === 'failed' || retry.status === 'abandoned') && retry.createdAt < cutoff) {
        this.paymentRetries.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[EdgeCases] Cleaned up ${deletedCount} old payment retries`);
    }

    return deletedCount;
  }
}

const edgeCasesService = new EdgeCasesService();

// Process pending payment retries every 5 minutes
setInterval(() => {
  edgeCasesService.processPendingPaymentRetries();
}, 5 * 60 * 1000);

// Cleanup old entries hourly
setInterval(() => {
  edgeCasesService.cleanupOldDeduplicationEntries();
  edgeCasesService.cleanupOldRefunds();
  edgeCasesService.cleanupOldPaymentRetries();
}, 60 * 60 * 1000);

export default edgeCasesService;
export { EdgeCasesService };
export type { RefundRecord, PaymentRetryRecord, OrderDeduplicationEntry };
