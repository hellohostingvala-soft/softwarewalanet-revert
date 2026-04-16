// Financial Engine++
// real-time ledger (event-sourced)
// double-entry + reconciliation daemon
// split settlement (reseller/franchise/system)
// tax engine (GST split + reverse charge)
// escrow mode (hold → release)

type LedgerEntryType = 'debit' | 'credit';
type LedgerEntryStatus = 'pending' | 'posted' | 'reconciled';
type SettlementParty = 'reseller' | 'franchise' | 'system';
type TaxType = 'gst' | 'sgst' | 'cgst' | 'igst' | 'reverse_charge';
type EscrowStatus = 'held' | 'released' | 'refunded';

interface LedgerEntry {
  id: string;
  transactionId: string;
  tenantId: string;
  type: LedgerEntryType;
  account: string; // Chart of accounts identifier
  counterAccount: string;
  amount: number;
  currency: string;
  status: LedgerEntryStatus;
  metadata?: any;
  timestamp: number;
  eventId: string;
}

interface SettlementSplit {
  transactionId: string;
  totalAmount: number;
  currency: string;
  splits: {
    party: SettlementParty;
    partyId: string;
    amount: number;
    percentage: number;
  }[];
  status: 'pending' | 'settled' | 'failed';
  settledAt?: number;
}

interface TaxCalculation {
  transactionId: string;
  baseAmount: number;
  currency: string;
  taxType: TaxType;
  taxRate: number;
  taxAmount: number;
  gstSplit?: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  reverseCharge: boolean;
}

interface EscrowHold {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  heldBy: string;
  reason: string;
  status: EscrowStatus;
  heldAt: number;
  releasedAt?: number;
  releasedTo?: string;
  refundAmount?: number;
}

interface ReconciliationReport {
  id: string;
  tenantId: string;
  startDate: number;
  endDate: number;
  totalTransactions: number;
  reconciledTransactions: number;
  unreconciledTransactions: number;
  totalDiscrepancy: number;
  status: 'pending' | 'completed' | 'failed';
  generatedAt: number;
}

class FinancialEngineService {
  private ledger: Map<string, LedgerEntry>;
  private settlements: Map<string, SettlementSplit>;
  private taxCalculations: Map<string, TaxCalculation>;
  private escrowHolds: Map<string, EscrowHold>;
  private reconciliationReports: Map<string, ReconciliationReport>;
  private eventSequence: number;

  constructor() {
    this.ledger = new Map();
    this.settlements = new Map();
    this.taxCalculations = new Map();
    this.escrowHolds = new Map();
    this.reconciliationReports = new Map();
    this.eventSequence = 0;
  }

  /**
   * Generate unique event ID for event sourcing
   */
  private generateEventId(): string {
    this.eventSequence++;
    return `evt_${Date.now()}_${this.eventSequence}`;
  }

  /**
   * Create double-entry ledger entry
   */
  createLedgerEntry(
    transactionId: string,
    tenantId: string,
    account: string,
    counterAccount: string,
    amount: number,
    currency: string = 'INR',
    metadata?: any
  ): { debit: LedgerEntry; credit: LedgerEntry } {
    const eventId = this.generateEventId();

    // Debit entry
    const debit: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionId,
      tenantId,
      type: 'debit',
      account,
      counterAccount,
      amount,
      currency,
      status: 'pending',
      metadata,
      timestamp: Date.now(),
      eventId,
    };

    // Credit entry
    const credit: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionId,
      tenantId,
      type: 'credit',
      account: counterAccount,
      counterAccount: account,
      amount,
      currency,
      status: 'pending',
      metadata,
      timestamp: Date.now(),
      eventId,
    };

    this.ledger.set(debit.id, debit);
    this.ledger.set(credit.id, credit);

    console.log(`[FinancialEngine] Created double-entry for transaction ${transactionId}: ${account} <-> ${counterAccount}`);
    return { debit, credit };
  }

  /**
   * Post ledger entry
   */
  postLedgerEntry(entryId: string): LedgerEntry {
    const entry = this.ledger.get(entryId);
    if (!entry) {
      throw new Error('Ledger entry not found');
    }

    if (entry.status === 'posted') {
      return entry;
    }

    entry.status = 'posted';
    this.ledger.set(entryId, entry);

    console.log(`[FinancialEngine] Posted ledger entry ${entryId}`);
    return entry;
  }

  /**
   * Calculate settlement split
   */
  calculateSettlementSplit(
    transactionId: string,
    totalAmount: number,
    resellerId: string,
    franchiseId: string,
    systemConfig?: { resellerPercentage: number; franchisePercentage: number; systemPercentage: number }
  ): SettlementSplit {
    const config = systemConfig || {
      resellerPercentage: 70,
      franchisePercentage: 25,
      systemPercentage: 5,
    };

    const split: SettlementSplit = {
      transactionId,
      totalAmount,
      currency: 'INR',
      splits: [
        {
          party: 'reseller',
          partyId: resellerId,
          amount: (totalAmount * config.resellerPercentage) / 100,
          percentage: config.resellerPercentage,
        },
        {
          party: 'franchise',
          partyId: franchiseId,
          amount: (totalAmount * config.franchisePercentage) / 100,
          percentage: config.franchisePercentage,
        },
        {
          party: 'system',
          partyId: 'system',
          amount: (totalAmount * config.systemPercentage) / 100,
          percentage: config.systemPercentage,
        },
      ],
      status: 'pending',
    };

    this.settlements.set(transactionId, split);

    console.log(`[FinancialEngine] Calculated settlement split for ${transactionId}`);
    return split;
  }

  /**
   * Settle transaction
   */
  settleTransaction(transactionId: string): SettlementSplit {
    const settlement = this.settlements.get(transactionId);
    if (!settlement) {
      throw new Error('Settlement not found');
    }

    settlement.status = 'settled';
    settlement.settledAt = Date.now();
    this.settlements.set(transactionId, settlement);

    // Create ledger entries for each split
    for (const split of settlement.splits) {
      const accountMap: Record<SettlementParty, string> = {
        reseller: 'accounts_receivable_reseller',
        franchise: 'accounts_receivable_franchise',
        system: 'revenue_system',
      };

      this.createLedgerEntry(
        transactionId,
        split.partyId,
        accountMap[split.party],
        'cash',
        split.amount,
        settlement.currency,
        { settlementSplit: true, party: split.party }
      );
    }

    console.log(`[FinancialEngine] Settled transaction ${transactionId}`);
    return settlement;
  }

  /**
   * Calculate tax
   */
  calculateTax(
    transactionId: string,
    baseAmount: number,
    taxType: TaxType,
    taxRate: number,
    isInterState: boolean = false,
    reverseCharge: boolean = false
  ): TaxCalculation {
    const taxAmount = (baseAmount * taxRate) / 100;

    const calculation: TaxCalculation = {
      transactionId,
      baseAmount,
      currency: 'INR',
      taxType,
      taxRate,
      taxAmount,
      gstSplit: isInterState
        ? { cgst: 0, sgst: 0, igst: taxAmount }
        : { cgst: taxAmount / 2, sgst: taxAmount / 2, igst: 0 },
      reverseCharge,
    };

    this.taxCalculations.set(transactionId, calculation);

    // Create tax ledger entries
    if (reverseCharge) {
      this.createLedgerEntry(
        transactionId,
        'system',
        'input_tax_receivable',
        'accounts_payable',
        taxAmount,
        'INR',
        { taxType, reverseCharge: true }
      );
    } else {
      this.createLedgerEntry(
        transactionId,
        'system',
        'output_tax_payable',
        'accounts_receivable',
        taxAmount,
        'INR',
        { taxType, reverseCharge: false }
      );
    }

    console.log(`[FinancialEngine] Calculated tax for ${transactionId}: ${taxAmount}`);
    return calculation;
  }

  /**
   * Hold funds in escrow
   */
  holdInEscrow(
    transactionId: string,
    amount: number,
    heldBy: string,
    reason: string,
    currency: string = 'INR'
  ): EscrowHold {
    const hold: EscrowHold = {
      id: crypto.randomUUID(),
      transactionId,
      amount,
      currency,
      heldBy,
      reason,
      status: 'held',
      heldAt: Date.now(),
    };

    this.escrowHolds.set(hold.id, hold);

    // Create escrow ledger entry
    this.createLedgerEntry(
      transactionId,
      heldBy,
      'escrow_held',
      'cash',
      amount,
      currency,
      { escrowHoldId: hold.id, reason }
    );

    console.log(`[FinancialEngine] Held ${amount} in escrow for transaction ${transactionId}`);
    return hold;
  }

  /**
   * Release escrow hold
   */
  releaseEscrow(holdId: string, releasedTo: string): EscrowHold {
    const hold = this.escrowHolds.get(holdId);
    if (!hold) {
      throw new Error('Escrow hold not found');
    }

    if (hold.status !== 'held') {
      throw new Error(`Escrow hold is ${hold.status}, cannot release`);
    }

    hold.status = 'released';
    hold.releasedAt = Date.now();
    hold.releasedTo = releasedTo;
    this.escrowHolds.set(holdId, hold);

    // Create release ledger entry
    this.createLedgerEntry(
      hold.transactionId,
      releasedTo,
      'cash',
      'escrow_held',
      hold.amount,
      hold.currency,
      { escrowHoldId: hold.id, releasedTo }
    );

    console.log(`[FinancialEngine] Released escrow hold ${holdId} to ${releasedTo}`);
    return hold;
  }

  /**
   * Refund escrow hold
   */
  refundEscrow(holdId: string, refundAmount?: number): EscrowHold {
    const hold = this.escrowHolds.get(holdId);
    if (!hold) {
      throw new Error('Escrow hold not found');
    }

    if (hold.status !== 'held') {
      throw new Error(`Escrow hold is ${hold.status}, cannot refund`);
    }

    const amountToRefund = refundAmount || hold.amount;
    hold.status = 'refunded';
    hold.refundAmount = amountToRefund;
    this.escrowHolds.set(holdId, hold);

    // Create refund ledger entry
    this.createLedgerEntry(
      hold.transactionId,
      hold.heldBy,
      'accounts_payable',
      'escrow_held',
      amountToRefund,
      hold.currency,
      { escrowHoldId: hold.id, refund: true }
    );

    console.log(`[FinancialEngine] Refunded escrow hold ${holdId}: ${amountToRefund}`);
    return hold;
  }

  /**
   * Get ledger entries by transaction
   */
  getLedgerEntriesByTransaction(transactionId: string): LedgerEntry[] {
    return Array.from(this.ledger.values()).filter(e => e.transactionId === transactionId);
  }

  /**
   * Get ledger entries by tenant
   */
  getLedgerEntriesByTenant(tenantId: string, startDate?: number, endDate?: number): LedgerEntry[] {
    let entries = Array.from(this.ledger.values()).filter(e => e.tenantId === tenantId);

    if (startDate) {
      entries = entries.filter(e => e.timestamp >= startDate);
    }

    if (endDate) {
      entries = entries.filter(e => e.timestamp <= endDate);
    }

    return entries;
  }

  /**
   * Get trial balance
   */
  getTrialBalance(tenantId: string): { account: string; debitTotal: number; creditTotal: number; balance: number }[] {
    const entries = this.getLedgerEntriesByTenant(tenantId);
    const accountBalances: Map<string, { debitTotal: number; creditTotal: number }> = new Map();

    for (const entry of entries) {
      if (entry.status !== 'posted') continue;

      const existing = accountBalances.get(entry.account) || { debitTotal: 0, creditTotal: 0 };

      if (entry.type === 'debit') {
        existing.debitTotal += entry.amount;
      } else {
        existing.creditTotal += entry.amount;
      }

      accountBalances.set(entry.account, existing);
    }

    return Array.from(accountBalances.entries()).map(([account, balances]) => ({
      account,
      debitTotal: balances.debitTotal,
      creditTotal: balances.creditTotal,
      balance: balances.debitTotal - balances.creditTotal,
    }));
  }

  /**
   * Run reconciliation daemon
   */
  async runReconciliationDaemon(tenantId: string, startDate: number, endDate: number): Promise<ReconciliationReport> {
    const reportId = crypto.randomUUID();
    const entries = this.getLedgerEntriesByTenant(tenantId, startDate, endDate);
    const postedEntries = entries.filter(e => e.status === 'posted');
    const unreconciledEntries = entries.filter(e => e.status === 'pending');

    let totalDiscrepancy = 0;

    // Check for discrepancies (simplified)
    for (const entry of postedEntries) {
      const counterpart = postedEntries.find(
        e => e.transactionId === entry.transactionId && e.id !== entry.id
      );

      if (!counterpart) {
        totalDiscrepancy += entry.amount;
      } else if (counterpart.amount !== entry.amount) {
        totalDiscrepancy += Math.abs(entry.amount - counterpart.amount);
      }
    }

    const report: ReconciliationReport = {
      id: reportId,
      tenantId,
      startDate,
      endDate,
      totalTransactions: entries.length,
      reconciledTransactions: postedEntries.length,
      unreconciledTransactions: unreconciledEntries.length,
      totalDiscrepancy,
      status: totalDiscrepancy === 0 && unreconciledEntries.length === 0 ? 'completed' : 'failed',
      generatedAt: Date.now(),
    };

    this.reconciliationReports.set(reportId, report);

    console.log(`[FinancialEngine] Reconciliation report ${reportId} generated for tenant ${tenantId}`);
    return report;
  }

  /**
   * Get reconciliation report
   */
  getReconciliationReport(reportId: string): ReconciliationReport | null {
    return this.reconciliationReports.get(reportId) || null;
  }

  /**
   * Get financial stats
   */
  getFinancialStats(tenantId?: string): {
    totalLedgerEntries: number;
    postedEntries: number;
    pendingEntries: number;
    totalSettlements: number;
    settledSettlements: number;
    totalEscrowHolds: number;
    activeEscrowHolds: number;
  } {
    const entries = tenantId
      ? Array.from(this.ledger.values()).filter(e => e.tenantId === tenantId)
      : Array.from(this.ledger.values());

    const settlements = Array.from(this.settlements.values());
    const holds = Array.from(this.escrowHolds.values());

    return {
      totalLedgerEntries: entries.length,
      postedEntries: entries.filter(e => e.status === 'posted').length,
      pendingEntries: entries.filter(e => e.status === 'pending').length,
      totalSettlements: settlements.length,
      settledSettlements: settlements.filter(s => s.status === 'settled').length,
      totalEscrowHolds: holds.length,
      activeEscrowHolds: holds.filter(h => h.status === 'held').length,
    };
  }

  /**
   * Cleanup old ledger entries (older than 7 years for compliance)
   */
  cleanupOldLedgerEntries(): number {
    const now = Date.now();
    const cutoff = now - (7 * 365 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, entry] of this.ledger.entries()) {
      if (entry.timestamp < cutoff && entry.status === 'reconciled') {
        this.ledger.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[FinancialEngine] Cleaned up ${deletedCount} old ledger entries`);
    }

    return deletedCount;
  }
}

const financialEngineService = new FinancialEngineService();

// Auto-run reconciliation daemon daily
setInterval(async () => {
  // In production, run for all tenants
  const now = Date.now();
  const startDate = now - (24 * 60 * 60 * 1000);
  await financialEngineService.runReconciliationDaemon('default-tenant', startDate, now);
}, 24 * 60 * 60 * 1000);

// Cleanup old ledger entries monthly
setInterval(() => {
  financialEngineService.cleanupOldLedgerEntries();
}, 30 * 24 * 60 * 60 * 1000);

export default financialEngineService;
export { FinancialEngineService };
export type { LedgerEntry, SettlementSplit, TaxCalculation, EscrowHold, ReconciliationReport };
