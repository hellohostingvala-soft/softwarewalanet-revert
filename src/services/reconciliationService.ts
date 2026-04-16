// Reconciliation Service
// gateway vs ledger diff job + unmatched txn queue

import ledgerService from './ledgerService';
import clockIdService from '../micro/clockIdService';

interface GatewayTransaction {
  id: string;
  gateway: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: number;
  referenceId?: string;
  metadata?: Record<string, any>;
}

interface LedgerTransaction {
  id: string;
  journalEntryId: string;
  amount: number;
  currency: string;
  timestamp: number;
  referenceId?: string;
}

interface ReconciliationResult {
  gatewayTxnId: string;
  ledgerTxnId?: string;
  match: boolean;
  diffAmount?: number;
  status: 'matched' | 'unmatched' | 'partial' | 'missing';
}

interface UnmatchedTransaction {
  id: string;
  gatewayTxnId: string;
  amount: number;
  currency: string;
  timestamp: number;
  reason: string;
  retryCount: number;
  lastRetryAt?: number;
  createdAt: number;
}

class ReconciliationService {
  private gatewayTransactions: Map<string, GatewayTransaction>;
  private unmatchedQueue: Map<string, UnmatchedTransaction>;
  private reconciliationResults: Map<string, ReconciliationResult>;

  constructor() {
    this.gatewayTransactions = new Map();
    this.unmatchedQueue = new Map();
    this.reconciliationResults = new Map();
  }

  /**
   * Record gateway transaction
   */
  recordGatewayTransaction(txn: GatewayTransaction): void {
    this.gatewayTransactions.set(txn.id, txn);
    console.log(`[Reconciliation] Recorded gateway transaction ${txn.id}`);
  }

  /**
   * Run reconciliation job
   */
  runReconciliation(): {
    total: number;
    matched: number;
    unmatched: number;
    partial: number;
    missing: number;
    results: ReconciliationResult[];
  } {
    const results: ReconciliationResult[] = [];
    let matched = 0;
    let unmatched = 0;
    let partial = 0;
    let missing = 0;

    // Get all journal entries from ledger
    const trialBalance = ledgerService.getTrialBalance();

    for (const gatewayTxn of this.gatewayTransactions.values()) {
      if (gatewayTxn.status !== 'success') continue;

      // Find matching ledger entry
      const journalEntries = ledgerService.getJournalEntriesByReference(
        gatewayTxn.transactionId,
        gatewayTxn.gateway
      );

      if (journalEntries.length === 0) {
        // No matching ledger entry
        const result: ReconciliationResult = {
          gatewayTxnId: gatewayTxn.id,
          match: false,
          status: 'missing',
        };
        results.push(result);
        this.reconciliationResults.set(`${gatewayTxn.id}_${Date.now()}`, result);
        
        // Add to unmatched queue
        this.addToUnmatchedQueue(gatewayTxn, 'No matching ledger entry found');
        missing++;
        continue;
      }

      // Calculate total amount from journal entries
      const ledgerTotal = journalEntries.reduce((sum, entry) => sum + entry.totalDebit, 0);

      if (Math.abs(ledgerTotal - gatewayTxn.amount) < 0.01) {
        // Perfect match
        const result: ReconciliationResult = {
          gatewayTxnId: gatewayTxn.id,
          ledgerTxnId: journalEntries[0].id,
          match: true,
          status: 'matched',
        };
        results.push(result);
        this.reconciliationResults.set(`${gatewayTxn.id}_${Date.now()}`, result);
        matched++;
      } else if (ledgerTotal > 0) {
        // Partial match
        const result: ReconciliationResult = {
          gatewayTxnId: gatewayTxn.id,
          ledgerTxnId: journalEntries[0].id,
          match: false,
          diffAmount: gatewayTxn.amount - ledgerTotal,
          status: 'partial',
        };
        results.push(result);
        this.reconciliationResults.set(`${gatewayTxn.id}_${Date.now()}`, result);
        
        this.addToUnmatchedQueue(gatewayTxn, `Partial match: diff ${gatewayTxn.amount - ledgerTotal}`);
        partial++;
      } else {
        // Unmatched
        const result: ReconciliationResult = {
          gatewayTxnId: gatewayTxn.id,
          match: false,
          status: 'unmatched',
        };
        results.push(result);
        this.reconciliationResults.set(`${gatewayTxn.id}_${Date.now()}`, result);
        
        this.addToUnmatchedQueue(gatewayTxn, 'Amount mismatch');
        unmatched++;
      }
    }

    console.log(`[Reconciliation] Completed: ${matched} matched, ${unmatched} unmatched, ${partial} partial, ${missing} missing`);
    
    return {
      total: results.length,
      matched,
      unmatched,
      partial,
      missing,
      results,
    };
  }

  /**
   * Add transaction to unmatched queue
   */
  private addToUnmatchedQueue(gatewayTxn: GatewayTransaction, reason: string): void {
    const unmatched: UnmatchedTransaction = {
      id: clockIdService.generateId(),
      gatewayTxnId: gatewayTxn.id,
      amount: gatewayTxn.amount,
      currency: gatewayTxn.currency,
      timestamp: gatewayTxn.timestamp,
      reason,
      retryCount: 0,
      createdAt: Date.now(),
    };

    this.unmatchedQueue.set(unmatched.id, unmatched);
  }

  /**
   * Process unmatched queue
   */
  processUnmatchedQueue(): {
    processed: number;
    resolved: number;
    failed: number;
  } {
    let processed = 0;
    let resolved = 0;
    let failed = 0;

    const keysToDelete: string[] = [];

    for (const [id, unmatched] of this.unmatchedQueue.entries()) {
      if (unmatched.retryCount >= 3) {
        failed++;
        keysToDelete.push(id);
        continue;
      }

      // Retry reconciliation
      const gatewayTxn = this.gatewayTransactions.get(unmatched.gatewayTxnId);
      if (!gatewayTxn) {
        keysToDelete.push(id);
        continue;
      }

      const journalEntries = ledgerService.getJournalEntriesByReference(
        gatewayTxn.transactionId,
        gatewayTxn.gateway
      );

      if (journalEntries.length > 0) {
        const ledgerTotal = journalEntries.reduce((sum, entry) => sum + entry.totalDebit, 0);
        
        if (Math.abs(ledgerTotal - gatewayTxn.amount) < 0.01) {
          resolved++;
          keysToDelete.push(id);
          
          // Create reconciliation result
          const result: ReconciliationResult = {
            gatewayTxnId: gatewayTxn.id,
            ledgerTxnId: journalEntries[0].id,
            match: true,
            status: 'matched',
          };
          this.reconciliationResults.set(`${gatewayTxn.id}_${Date.now()}`, result);
        }
      }

      unmatched.retryCount++;
      unmatched.lastRetryAt = Date.now();
      this.unmatchedQueue.set(id, unmatched);
      processed++;
    }

    keysToDelete.forEach(key => this.unmatchedQueue.delete(key));

    if (processed > 0) {
      console.log(`[Reconciliation] Processed unmatched queue: ${processed} processed, ${resolved} resolved, ${failed} failed`);
    }

    return { processed, resolved, failed };
  }

  /**
   * Manual reconciliation - link gateway to ledger
   */
  manualReconcile(gatewayTxnId: string, journalEntryId: string): { success: boolean; error?: string } {
    const gatewayTxn = this.gatewayTransactions.get(gatewayTxnId);
    if (!gatewayTxn) {
      return { success: false, error: 'Gateway transaction not found' };
    }

    const journalEntry = ledgerService.getJournalEntry(journalEntryId);
    if (!journalEntry) {
      return { success: false, error: 'Journal entry not found' };
    }

    // Update journal entry reference
    if (!journalEntry.referenceId) {
      journalEntry.referenceId = gatewayTxn.transactionId;
      journalEntry.referenceType = gatewayTxn.gateway;
    }

    // Create reconciliation result
    const result: ReconciliationResult = {
      gatewayTxnId,
      ledgerTxnId: journalEntryId,
      match: true,
      status: 'matched',
    };
    this.reconciliationResults.set(`${gatewayTxnId}_${Date.now()}`, result);

    console.log(`[Reconciliation] Manually reconciled ${gatewayTxnId} with ${journalEntryId}`);
    return { success: true };
  }

  /**
   * Get unmatched queue
   */
  getUnmatchedQueue(): UnmatchedTransaction[] {
    return Array.from(this.unmatchedQueue.values());
  }

  /**
   * Get reconciliation results
   */
  getReconciliationResults(limit?: number): ReconciliationResult[] {
    const results = Array.from(this.reconciliationResults.values());
    return limit ? results.slice(-limit) : results;
  }

  /**
   * Get reconciliation stats
   */
  getReconciliationStats(): {
    totalGatewayTxns: number;
    totalUnmatched: number;
    totalResults: number;
    recentMatchRate: number;
  } {
    const totalGatewayTxns = this.gatewayTransactions.size;
    const totalUnmatched = this.unmatchedQueue.size;
    const totalResults = this.reconciliationResults.size;

    // Calculate recent match rate (last 100 results)
    const recentResults = this.getReconciliationResults(100);
    const matched = recentResults.filter(r => r.status === 'matched').length;
    const recentMatchRate = recentResults.length > 0 ? (matched / recentResults.length) * 100 : 0;

    return {
      totalGatewayTxns,
      totalUnmatched,
      totalResults,
      recentMatchRate,
    };
  }

  /**
   * Cleanup old gateway transactions (older than 90 days)
   */
  cleanupOldTransactions(): number {
    const now = Date.now();
    const cutoff = now - (90 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, txn] of this.gatewayTransactions.entries()) {
      if (txn.timestamp < cutoff) {
        this.gatewayTransactions.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Reconciliation] Cleaned up ${deletedCount} old gateway transactions`);
    }

    return deletedCount;
  }
}

const reconciliationService = new ReconciliationService();

// Auto-run reconciliation every 15 minutes
setInterval(() => {
  reconciliationService.runReconciliation();
}, 900000);

// Auto-process unmatched queue every hour
setInterval(() => {
  reconciliationService.processUnmatchedQueue();
}, 3600000);

// Auto-cleanup old transactions daily
setInterval(() => {
  reconciliationService.cleanupOldTransactions();
}, 86400000);

export default reconciliationService;
export { ReconciliationService };
export type { GatewayTransaction, LedgerTransaction, ReconciliationResult, UnmatchedTransaction };
