// Payout Hardening Service
// antifraud scoring (txn + behavior)
// payout batching + smart routing
// failure retry ladder + fallback rails

type FraudRiskLevel = 'low' | 'medium' | 'high' | 'critical';
type PayoutRail = 'bank_transfer' | 'upi' | 'wallet' | 'check' | 'crypto';
type PayoutBatchStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

interface FraudScore {
  payoutId: string;
  score: number; // 0-100
  riskLevel: FraudRiskLevel;
  factors: {
    factor: string;
    weight: number;
    value: number;
  }[];
  timestamp: number;
}

interface PayoutBatch {
  batchId: string;
  payouts: string[];
  totalAmount: number;
  currency: string;
  rail: PayoutRail;
  status: PayoutBatchStatus;
  createdAt: number;
  processedAt?: number;
  completedAt?: number;
}

interface RetryLadder {
  payoutId: string;
  attempt: number;
  maxAttempts: number;
  currentRail: PayoutRail;
  fallbackRails: PayoutRail[];
  nextRetryAt?: number;
  lastError?: string;
  status: 'pending' | 'retrying' | 'exhausted' | 'success';
}

class PayoutHardeningService {
  private fraudScores: Map<string, FraudScore>;
  private payoutBatches: Map<string, PayoutBatch>;
  private retryLadders: Map<string, RetryLadder>;
  private fraudThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };

  constructor() {
    this.fraudScores = new Map();
    this.payoutBatches = new Map();
    this.retryLadders = new Map();
    this.fraudThresholds = {
      low: 30,
      medium: 50,
      high: 70,
      critical: 90,
    };
  }

  /**
   * Calculate fraud score for payout
   */
  calculateFraudScore(
    payoutId: string,
    payoutData: {
      amount: number;
      recipientId: string;
      recipientAccountAge: number;
      transactionHistory: number;
      recentActivity: number;
      unusualPattern: boolean;
      locationMismatch: boolean;
      deviceFingerprint: string;
    }
  ): FraudScore {
    const factors = [];
    let score = 0;

    // Factor 1: Amount threshold
    if (payoutData.amount > 100000) {
      score += 30;
      factors.push({ factor: 'high_amount', weight: 30, value: payoutData.amount });
    } else if (payoutData.amount > 50000) {
      score += 15;
      factors.push({ factor: 'medium_amount', weight: 15, value: payoutData.amount });
    }

    // Factor 2: Account age
    if (payoutData.recipientAccountAge < 7) {
      score += 25;
      factors.push({ factor: 'new_account', weight: 25, value: payoutData.recipientAccountAge });
    } else if (payoutData.recipientAccountAge < 30) {
      score += 10;
      factors.push({ factor: 'young_account', weight: 10, value: payoutData.recipientAccountAge });
    }

    // Factor 3: Transaction history
    if (payoutData.transactionHistory < 5) {
      score += 20;
      factors.push({ factor: 'low_history', weight: 20, value: payoutData.transactionHistory });
    }

    // Factor 4: Recent activity
    if (payoutData.recentActivity > 10) {
      score += 15;
      factors.push({ factor: 'high_activity', weight: 15, value: payoutData.recentActivity });
    }

    // Factor 5: Unusual pattern
    if (payoutData.unusualPattern) {
      score += 35;
      factors.push({ factor: 'unusual_pattern', weight: 35, value: 1 });
    }

    // Factor 6: Location mismatch
    if (payoutData.locationMismatch) {
      score += 20;
      factors.push({ factor: 'location_mismatch', weight: 20, value: 1 });
    }

    // Cap score at 100
    score = Math.min(100, score);

    // Determine risk level
    let riskLevel: FraudRiskLevel;
    if (score >= this.fraudThresholds.critical) {
      riskLevel = 'critical';
    } else if (score >= this.fraudThresholds.high) {
      riskLevel = 'high';
    } else if (score >= this.fraudThresholds.medium) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    const fraudScore: FraudScore = {
      payoutId,
      score,
      riskLevel,
      factors,
      timestamp: Date.now(),
    };

    this.fraudScores.set(payoutId, fraudScore);

    console.log(`[PayoutHardening] Calculated fraud score for ${payoutId}: ${score} (${riskLevel})`);
    return fraudScore;
  }

  /**
   * Check if payout should be blocked
   */
  shouldBlockPayout(payoutId: string): { block: boolean; reason?: string } {
    const fraudScore = this.fraudScores.get(payoutId);
    if (!fraudScore) {
      return { block: false };
    }

    if (fraudScore.riskLevel === 'critical') {
      return { block: true, reason: 'Critical fraud risk detected' };
    }

    if (fraudScore.riskLevel === 'high') {
      return { block: true, reason: 'High fraud risk - manual review required' };
    }

    return { block: false };
  }

  /**
   * Create payout batch
   */
  createPayoutBatch(
    payoutIds: string[],
    rail: PayoutRail = 'bank_transfer',
    batchSize: number = 100
  ): PayoutBatch[] {
    const batches: PayoutBatch[] = [];

    for (let i = 0; i < payoutIds.length; i += batchSize) {
      const batchPayouts = payoutIds.slice(i, i + batchSize);
      const batchId = crypto.randomUUID();

      const batch: PayoutBatch = {
        batchId,
        payouts: batchPayouts,
        totalAmount: 0, // Will be calculated from actual payouts
        currency: 'INR',
        rail,
        status: 'pending',
        createdAt: Date.now(),
      };

      this.payoutBatches.set(batchId, batch);
      batches.push(batch);
    }

    console.log(`[PayoutHardening] Created ${batches.length} payout batches`);
    return batches;
  }

  /**
   * Process payout batch
   */
  async processPayoutBatch(batchId: string): Promise<PayoutBatch> {
    const batch = this.payoutBatches.get(batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    batch.status = 'processing';
    batch.processedAt = Date.now();
    this.payoutBatches.set(batchId, batch);

    // Simulate batch processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check fraud scores for all payouts in batch
    let blockedCount = 0;
    for (const payoutId of batch.payouts) {
      const blockCheck = this.shouldBlockPayout(payoutId);
      if (blockCheck.block) {
        blockedCount++;
      }
    }

    if (blockedCount > batch.payouts.length / 2) {
      batch.status = 'failed';
      console.log(`[PayoutHardening] Batch ${batchId} failed: too many blocked payouts`);
    } else {
      batch.status = 'completed';
      batch.completedAt = Date.now();
      console.log(`[PayoutHardening] Batch ${batchId} completed`);
    }

    this.payoutBatches.set(batchId, batch);
    return batch;
  }

  /**
   * Smart routing - select best rail based on payout characteristics
   */
  selectSmartRail(payoutData: {
    amount: number;
    urgency: 'low' | 'medium' | 'high';
    recipientPreference?: PayoutRail;
  }): PayoutRail {
    // Small amounts, high urgency -> UPI
    if (payoutData.amount < 50000 && payoutData.urgency === 'high') {
      return 'upi';
    }

    // Recipient preference
    if (payoutData.recipientPreference) {
      return payoutData.recipientPreference;
    }

    // Large amounts -> Bank transfer
    if (payoutData.amount >= 50000) {
      return 'bank_transfer';
    }

    // Default
    return 'bank_transfer';
  }

  /**
   * Setup retry ladder with fallback rails
   */
  setupRetryLadder(
    payoutId: string,
    initialRail: PayoutRail,
    maxAttempts: number = 3
  ): RetryLadder {
    const fallbackRails: PayoutRail[] = [];

    // Define fallback order
    const railPriority: PayoutRail[] = ['upi', 'bank_transfer', 'wallet', 'check'];
    const currentIndex = railPriority.indexOf(initialRail);

    for (let i = currentIndex + 1; i < railPriority.length; i++) {
      fallbackRails.push(railPriority[i]);
    }

    const retryLadder: RetryLadder = {
      payoutId,
      attempt: 1,
      maxAttempts,
      currentRail: initialRail,
      fallbackRails,
      status: 'pending',
    };

    this.retryLadders.set(payoutId, retryLadder);

    console.log(`[PayoutHardening] Setup retry ladder for ${payoutId}: ${initialRail} -> ${fallbackRails.join(' -> ')}`);
    return retryLadder;
  }

  /**
   * Retry failed payout
   */
  async retryPayout(payoutId: string): Promise<RetryLadder> {
    const ladder = this.retryLadders.get(payoutId);
    if (!ladder) {
      throw new Error('Retry ladder not found');
    }

    if (ladder.status === 'exhausted') {
      throw new Error('Retry attempts exhausted');
    }

    ladder.status = 'retrying';

    // Simulate retry
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = Math.random() > 0.3; // 70% success rate

    if (success) {
      ladder.status = 'success';
      console.log(`[PayoutHardening] Payout ${payoutId} succeeded on attempt ${ladder.attempt}`);
    } else {
      ladder.attempt++;
      ladder.lastError = 'Payment gateway declined';

      if (ladder.attempt >= ladder.maxAttempts) {
        ladder.status = 'exhausted';
        console.log(`[PayoutHardening] Payout ${payoutId} retry attempts exhausted`);
      } else if (ladder.fallbackRails.length > 0) {
        // Switch to fallback rail
        ladder.currentRail = ladder.fallbackRails.shift()!;
        ladder.nextRetryAt = Date.now() + (5 * 60 * 1000); // Retry in 5 minutes
        console.log(`[PayoutHardening] Switching to fallback rail ${ladder.currentRail} for ${payoutId}`);
      }
    }

    this.retryLadders.set(payoutId, ladder);
    return ladder;
  }

  /**
   * Process pending retries
   */
  async processPendingRetries(): Promise<{ processed: number; failed: number; exhausted: number }> {
    const now = Date.now();
    const pending = Array.from(this.retryLadders.values()).filter(
      l => l.status === 'retrying' && (!l.nextRetryAt || l.nextRetryAt <= now)
    );

    let processed = 0;
    let failed = 0;
    let exhausted = 0;

    for (const ladder of pending) {
      try {
        const result = await this.retryPayout(ladder.payoutId);
        if (result.status === 'success') {
          processed++;
        } else if (result.status === 'exhausted') {
          exhausted++;
        }
      } catch (error) {
        failed++;
      }
    }

    if (processed > 0) {
      console.log(`[PayoutHardening] Processed ${processed} pending retries`);
    }

    return { processed, failed, exhausted };
  }

  /**
   * Get fraud score
   */
  getFraudScore(payoutId: string): FraudScore | null {
    return this.fraudScores.get(payoutId) || null;
  }

  /**
   * Get payout batch
   */
  getPayoutBatch(batchId: string): PayoutBatch | null {
    return this.payoutBatches.get(batchId) || null;
  }

  /**
   * Get retry ladder
   */
  getRetryLadder(payoutId: string): RetryLadder | null {
    return this.retryLadders.get(payoutId) || null;
  }

  /**
   * Get fraud statistics
   */
  getFraudStatistics(): {
    totalScores: number;
    byRiskLevel: Record<FraudRiskLevel, number>;
    averageScore: number;
    blockedPayouts: number;
  } {
    const scores = Array.from(this.fraudScores.values());

    const byRiskLevel: Record<FraudRiskLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const score of scores) {
      byRiskLevel[score.riskLevel]++;
    }

    const averageScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : 0;

    const blockedPayouts = scores.filter(s => s.riskLevel === 'critical' || s.riskLevel === 'high').length;

    return {
      totalScores: scores.length,
      byRiskLevel,
      averageScore,
      blockedPayouts,
    };
  }

  /**
   * Get batch statistics
   */
  getBatchStatistics(): {
    totalBatches: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    const batches = Array.from(this.payoutBatches.values());

    return {
      totalBatches: batches.length,
      pending: batches.filter(b => b.status === 'pending').length,
      processing: batches.filter(b => b.status === 'processing').length,
      completed: batches.filter(b => b.status === 'completed').length,
      failed: batches.filter(b => b.status === 'failed').length,
    };
  }

  /**
   * Cleanup old data (older than 90 days)
   */
  cleanupOldData(): number {
    const now = Date.now();
    const cutoff = now - (90 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    // Cleanup old fraud scores
    for (const [id, score] of this.fraudScores.entries()) {
      if (score.timestamp < cutoff) {
        this.fraudScores.delete(id);
        deletedCount++;
      }
    }

    // Cleanup old batches
    for (const [id, batch] of this.payoutBatches.entries()) {
      if (batch.createdAt < cutoff && (batch.status === 'completed' || batch.status === 'failed')) {
        this.payoutBatches.delete(id);
        deletedCount++;
      }
    }

    // Cleanup old retry ladders
    for (const [id, ladder] of this.retryLadders.entries()) {
      if (ladder.status === 'success' || ladder.status === 'exhausted') {
        this.retryLadders.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[PayoutHardening] Cleaned up ${deletedCount} old data records`);
    }

    return deletedCount;
  }
}

const payoutHardeningService = new PayoutHardeningService();

// Process pending retries every 5 minutes
setInterval(async () => {
  await payoutHardeningService.processPendingRetries();
}, 5 * 60 * 1000);

// Cleanup old data weekly
setInterval(() => {
  payoutHardeningService.cleanupOldData();
}, 7 * 24 * 60 * 60 * 1000);

export default payoutHardeningService;
export { PayoutHardeningService };
export type { FraudScore, PayoutBatch, RetryLadder };
