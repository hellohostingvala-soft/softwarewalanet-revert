// Invoice Credit/Refund Service
// credit_note table + refund mapping (invoice_id) + adjustment entries

import invoiceService from './invoiceService';
import clockIdService from '../micro/clockIdService';

interface CreditNote {
  id: string;
  creditNoteNo: string;
  invoiceId: string;
  userId: string;
  role: 'user' | 'reseller' | 'franchise';
  reason: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'issued' | 'applied' | 'cancelled';
  issuedAt?: number;
  createdAt: number;
  updatedAt: number;
  checksum: string;
}

interface AdjustmentEntry {
  id: string;
  creditNoteId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceId?: string;
  createdAt: number;
}

interface CreditNoteConfig {
  prefix: string;
  sequence: number;
  sequenceLength: number;
  checksumLength: number;
}

class InvoiceCreditService {
  private creditNotes: Map<string, CreditNote>;
  private adjustmentEntries: Map<string, AdjustmentEntry[]>;
  private creditNoteConfig: CreditNoteConfig;

  constructor() {
    this.creditNotes = new Map();
    this.adjustmentEntries = new Map();
    this.creditNoteConfig = {
      prefix: 'CN',
      sequence: 1,
      sequenceLength: 6,
      checksumLength: 4,
    };
  }

  /**
   * Generate credit note ID with prefix + sequence + checksum
   */
  generateCreditNoteId(): string {
    const sequence = this.creditNoteConfig.sequence.toString().padStart(this.creditNoteConfig.sequenceLength, '0');
    const checksum = this.generateChecksum(sequence);
    const creditNoteNo = `${this.creditNoteConfig.prefix}-${sequence}-${checksum}`;
    
    this.creditNoteConfig.sequence++;
    
    return creditNoteNo;
  }

  /**
   * Generate checksum for credit note number
   */
  private generateChecksum(sequence: string): string {
    let hash = 0;
    for (let i = 0; i < sequence.length; i++) {
      const char = sequence.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(this.creditNoteConfig.checksumLength, '0').substring(0, this.creditNoteConfig.checksumLength);
  }

  /**
   * Create credit note for invoice
   */
  createCreditNote(
    invoiceId: string,
    reason: string,
    amount: number,
    taxAmount: number
  ): CreditNote {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'paid') {
      throw new Error('Credit note can only be created for paid invoices');
    }

    const creditNoteNo = this.generateCreditNoteId();
    const now = Date.now();
    const totalAmount = amount + taxAmount;

    const creditNote: CreditNote = {
      id: clockIdService.generateId(),
      creditNoteNo,
      invoiceId,
      userId: invoice.userId,
      role: invoice.role,
      reason,
      amount,
      taxAmount,
      totalAmount,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      checksum: this.generateChecksum(creditNoteNo.split('-')[1]),
    };

    this.creditNotes.set(creditNote.id, creditNote);
    this.adjustmentEntries.set(creditNote.id, []);

    console.log(`[InvoiceCredit] Created credit note ${creditNoteNo} for invoice ${invoiceId}`);
    return creditNote;
  }

  /**
   * Issue credit note
   */
  issueCreditNote(creditNoteId: string): { success: boolean; error?: string } {
    const creditNote = this.creditNotes.get(creditNoteId);
    if (!creditNote) {
      return { success: false, error: 'Credit note not found' };
    }

    if (creditNote.status !== 'draft') {
      return { success: false, error: 'Only draft credit notes can be issued' };
    }

    creditNote.status = 'issued';
    creditNote.issuedAt = Date.now();
    creditNote.updatedAt = Date.now();
    this.creditNotes.set(creditNoteId, creditNote);

    // Add adjustment entry
    this.addAdjustmentEntry(creditNoteId, {
      type: 'credit',
      amount: creditNote.totalAmount,
      description: `Credit note issued: ${creditNote.reason}`,
    });

    console.log(`[InvoiceCredit] Issued credit note ${creditNote.creditNoteNo}`);
    return { success: true };
  }

  /**
   * Apply credit note (credit to wallet or future invoice)
   */
  applyCreditNote(
    creditNoteId: string,
    applyTo: 'wallet' | 'future_invoice',
    referenceId?: string
  ): { success: boolean; error?: string } {
    const creditNote = this.creditNotes.get(creditNoteId);
    if (!creditNote) {
      return { success: false, error: 'Credit note not found' };
    }

    if (creditNote.status !== 'issued') {
      return { success: false, error: 'Only issued credit notes can be applied' };
    }

    creditNote.status = 'applied';
    creditNote.updatedAt = Date.now();
    this.creditNotes.set(creditNoteId, creditNote);

    // Add adjustment entry
    this.addAdjustmentEntry(creditNoteId, {
      type: 'credit',
      amount: creditNote.totalAmount,
      description: `Credit applied to ${applyTo}`,
      referenceId,
    });

    // If applying to wallet, credit the user's wallet
    if (applyTo === 'wallet') {
      const walletService = require('../micro/walletService').default;
      walletService.credit(
        creditNote.userId,
        creditNote.totalAmount,
        'credit_note',
        creditNoteId,
        `credit_note:${creditNoteId}`
      );
    }

    console.log(`[InvoiceCredit] Applied credit note ${creditNote.creditNoteNo} to ${applyTo}`);
    return { success: true };
  }

  /**
   * Cancel credit note
   */
  cancelCreditNote(creditNoteId: string, reason: string): { success: boolean; error?: string } {
    const creditNote = this.creditNotes.get(creditNoteId);
    if (!creditNote) {
      return { success: false, error: 'Credit note not found' };
    }

    if (creditNote.status === 'applied') {
      return { success: false, error: 'Applied credit notes cannot be cancelled' };
    }

    creditNote.status = 'cancelled';
    creditNote.updatedAt = Date.now();
    this.creditNotes.set(creditNoteId, creditNote);

    // Add adjustment entry
    this.addAdjustmentEntry(creditNoteId, {
      type: 'debit',
      amount: creditNote.totalAmount,
      description: `Credit note cancelled: ${reason}`,
    });

    console.log(`[InvoiceCredit] Cancelled credit note ${creditNote.creditNoteNo}`);
    return { success: true };
  }

  /**
   * Add adjustment entry
   */
  private addAdjustmentEntry(creditNoteId: string, entry: Omit<AdjustmentEntry, 'id' | 'creditNoteId' | 'createdAt'>): void {
    const adjustment: AdjustmentEntry = {
      id: clockIdService.generateId(),
      creditNoteId,
      ...entry,
      createdAt: Date.now(),
    };

    const entries = this.adjustmentEntries.get(creditNoteId) || [];
    entries.push(adjustment);
    this.adjustmentEntries.set(creditNoteId, entries);
  }

  /**
   * Get credit note by ID
   */
  getCreditNote(creditNoteId: string): CreditNote | null {
    return this.creditNotes.get(creditNoteId) || null;
  }

  /**
   * Get credit notes by invoice
   */
  getCreditNotesByInvoice(invoiceId: string): CreditNote[] {
    return Array.from(this.creditNotes.values()).filter(cn => cn.invoiceId === invoiceId);
  }

  /**
   * Get credit notes by user
   */
  getCreditNotesByUser(userId: string, role?: string): CreditNote[] {
    return Array.from(this.creditNotes.values()).filter(cn => {
      if (cn.userId !== userId) return false;
      if (role && cn.role !== role) return false;
      return true;
    });
  }

  /**
   * Get adjustment entries for credit note
   */
  getAdjustmentEntries(creditNoteId: string): AdjustmentEntry[] {
    return this.adjustmentEntries.get(creditNoteId) || [];
  }

  /**
   * Get credit note balance (total issued - total applied)
   */
  getCreditNoteBalance(userId: string): {
    totalIssued: number;
    totalApplied: number;
    availableBalance: number;
  } {
    const creditNotes = this.getCreditNotesByUser(userId);
    const totalIssued = creditNotes
      .filter(cn => cn.status === 'issued' || cn.status === 'applied')
      .reduce((sum, cn) => sum + cn.totalAmount, 0);
    const totalApplied = creditNotes
      .filter(cn => cn.status === 'applied')
      .reduce((sum, cn) => sum + cn.totalAmount, 0);
    const availableBalance = totalIssued - totalApplied;

    return {
      totalIssued,
      totalApplied,
      availableBalance,
    };
  }

  /**
   * Refund invoice and create credit note
   */
  refundInvoice(
    invoiceId: string,
    reason: string,
    refundAmount?: number
  ): { success: boolean; creditNoteId?: string; error?: string } {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    if (invoice.status !== 'paid') {
      return { success: false, error: 'Only paid invoices can be refunded' };
    }

    const items = invoiceService.getInvoiceItems(invoiceId);
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const refundAmt = refundAmount || invoice.grandTotal;
    const refundTax = refundAmount ? (taxAmount * (refundAmount / invoice.grandTotal)) : taxAmount;

    // Create credit note
    const creditNote = this.createCreditNote(invoiceId, reason, refundAmt, refundTax);

    // Issue credit note
    this.issueCreditNote(creditNote.id);

    // Apply to wallet
    this.applyCreditNote(creditNote.id, 'wallet');

    // Update invoice status to refunded
    invoiceService.updateInvoiceStatus(invoiceId, 'refunded');

    return { success: true, creditNoteId: creditNote.id };
  }

  /**
   * Get credit note stats
   */
  getCreditNoteStats(): {
    total: number;
    byStatus: Record<CreditNote['status'], number>;
    totalAmount: number;
    availableBalance: number;
  } {
    const byStatus: Record<CreditNote['status'], number> = {
      draft: 0,
      issued: 0,
      applied: 0,
      cancelled: 0,
    };

    let totalAmount = 0;
    let availableBalance = 0;

    for (const creditNote of this.creditNotes.values()) {
      byStatus[creditNote.status]++;
      if (creditNote.status === 'issued' || creditNote.status === 'applied') {
        totalAmount += creditNote.totalAmount;
      }
      if (creditNote.status === 'issued') {
        availableBalance += creditNote.totalAmount;
      }
    }

    return {
      total: this.creditNotes.size,
      byStatus,
      totalAmount,
      availableBalance,
    };
  }

  /**
   * Set credit note config
   */
  setCreditNoteConfig(config: Partial<CreditNoteConfig>): void {
    this.creditNoteConfig = { ...this.creditNoteConfig, ...config };
  }

  /**
   * Get credit note config
   */
  getCreditNoteConfig(): CreditNoteConfig {
    return { ...this.creditNoteConfig };
  }
}

// Singleton instance
const invoiceCreditService = new InvoiceCreditService();

export default invoiceCreditService;
export { InvoiceCreditService };
export type { CreditNote, AdjustmentEntry, CreditNoteConfig };
