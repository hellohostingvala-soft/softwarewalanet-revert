// Invoice Wallet Sync Service
// paid via wallet → ledger entry + invoice marked paid + reverse on refund

import invoiceService from './invoiceService';
import invoicePaymentService from './invoicePaymentService';
import invoiceCreditService from './invoiceCreditService';
import walletService from '../micro/walletService';

interface WalletSyncConfig {
  autoMarkPaid: boolean;
  autoReverseOnRefund: boolean;
  syncRetryAttempts: number;
  syncRetryDelay: number;
}

class InvoiceWalletSyncService {
  private syncConfig: WalletSyncConfig;
  private syncQueue: Map<string, { attempts: number; lastAttempt: number }>;

  constructor() {
    this.syncConfig = {
      autoMarkPaid: true,
      autoReverseOnRefund: true,
      syncRetryAttempts: 3,
      syncRetryDelay: 5000,
    };
    this.syncQueue = new Map();
  }

  /**
   * Process wallet payment for invoice
   */
  async processWalletPayment(
    invoiceId: string,
    userId: string
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    if (invoice.userId !== userId) {
      return { success: false, error: 'Invoice does not belong to user' };
    }

    // Debit from wallet
    const debitResult = walletService.debit(
      userId,
      invoice.grandTotal,
      'invoice_payment',
      invoiceId,
      `invoice:${invoiceId}:payment`
    );

    if (!debitResult.success) {
      return { success: false, error: debitResult.error };
    }

    // Record payment
    const paymentId = crypto.randomUUID();
    invoicePaymentService.recordPayment(
      invoiceId,
      paymentId,
      invoice.grandTotal,
      'wallet',
      debitResult.entryId
    );

    // Complete payment
    invoicePaymentService.completePayment(paymentId);

    // Auto-mark invoice as paid if configured
    if (this.syncConfig.autoMarkPaid) {
      invoiceService.updateInvoiceStatus(invoiceId, 'paid');
    }

    console.log(`[InvoiceWalletSync] Processed wallet payment for invoice ${invoiceId}`);
    return { success: true, paymentId };
  }

  /**
   * Reverse wallet payment on refund
   */
  async reverseWalletPayment(
    invoiceId: string,
    refundAmount?: number
  ): Promise<{ success: boolean; error?: string }> {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    const payments = invoicePaymentService.getInvoicePayments(invoiceId);
    const walletPayment = payments.find(p => p.paymentMethod === 'wallet' && p.status === 'completed');

    if (!walletPayment) {
      return { success: false, error: 'No completed wallet payment found' };
    }

    const refundAmt = refundAmount || walletPayment.amount;

    // Credit back to wallet
    const creditResult = walletService.credit(
      invoice.userId,
      refundAmt,
      'invoice_refund',
      walletPayment.transactionId,
      `invoice:${invoiceId}:refund:${walletPayment.id}`
    );

    if (!creditResult.success) {
      return { success: false, error: creditResult.error };
    }

    // Refund the payment
    invoicePaymentService.refundPayment(walletPayment.paymentId, refundAmt);

    // Auto-reverse on refund if configured
    if (this.syncConfig.autoReverseOnRefund) {
      invoiceService.updateInvoiceStatus(invoiceId, 'refunded');
    }

    console.log(`[InvoiceWalletSync] Reversed wallet payment for invoice ${invoiceId}`);
    return { success: true };
  }

  /**
   * Sync invoice with wallet ledger
   */
  async syncInvoiceWithWallet(invoiceId: string): Promise<{ success: boolean; synced: boolean; error?: string }> {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { success: false, synced: false, error: 'Invoice not found' };
    }

    const payments = invoicePaymentService.getInvoicePayments(invoiceId);
    const walletPayments = payments.filter(p => p.paymentMethod === 'wallet');

    if (walletPayments.length === 0) {
      return { success: true, synced: false };
    }

    let synced = false;

    // Check if wallet ledger matches invoice payments
    for (const payment of walletPayments) {
      if (payment.status === 'completed') {
        const walletLedger = walletService.getLedger(invoice.userId);
        const ledgerEntry = walletLedger.find(
          entry => entry.referenceId === payment.transactionId && entry.source === 'invoice_payment'
        );

        if (!ledgerEntry) {
          // Ledger entry missing, sync it
          walletService.credit(
            invoice.userId,
            payment.amount,
            'invoice_payment_sync',
            payment.transactionId,
            `invoice:${invoiceId}:sync:${payment.id}`
          );
          synced = true;
        }
      }
    }

    if (synced) {
      console.log(`[InvoiceWalletSync] Synced invoice ${invoiceId} with wallet ledger`);
    }

    return { success: true, synced };
  }

  /**
   * Handle credit note wallet application
   */
  async handleCreditNoteWalletApplication(
    creditNoteId: string
  ): Promise<{ success: boolean; error?: string }> {
    const creditNote = invoiceCreditService.getCreditNote(creditNoteId);
    if (!creditNote) {
      return { success: false, error: 'Credit note not found' };
    }

    // Credit to wallet
    const creditResult = walletService.credit(
      creditNote.userId,
      creditNote.totalAmount,
      'credit_note',
      creditNoteId,
      `credit_note:${creditNoteId}`
    );

    if (!creditResult.success) {
      return { success: false, error: creditResult.error };
    }

    console.log(`[InvoiceWalletSync] Applied credit note ${creditNoteId} to wallet`);
    return { success: true };
  }

  /**
   * Reconcile invoice wallet payments
   */
  async reconcileInvoiceWalletPayments(invoiceId: string): Promise<{
    reconciled: boolean;
    discrepancies: string[];
  }> {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { reconciled: false, discrepancies: ['Invoice not found'] };
    }

    const payments = invoicePaymentService.getInvoicePayments(invoiceId);
    const walletPayments = payments.filter(p => p.paymentMethod === 'wallet');
    const discrepancies: string[] = [];

    // Check wallet ledger
    const walletLedger = walletService.getLedger(invoice.userId);
    const invoiceLedgerEntries = walletLedger.filter(
      entry => entry.source === 'invoice_payment' && entry.referenceId === invoiceId
    );

    // Check if totals match
    const walletTotal = invoiceLedgerEntries
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);
    const paymentTotal = walletPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    if (Math.abs(walletTotal - paymentTotal) > 0.01) {
      discrepancies.push(
        `Wallet ledger total (${walletTotal}) does not match payment total (${paymentTotal})`
      );
    }

    // Check if invoice status matches payment status
    if (paymentTotal >= invoice.grandTotal - 0.01 && invoice.status !== 'paid') {
      discrepancies.push('Invoice status should be paid based on payments');
    }

    return {
      reconciled: discrepancies.length === 0,
      discrepancies,
    };
  }

  /**
   * Batch sync multiple invoices with wallet
   */
  async batchSyncInvoicesWithWallet(invoiceIds: string[]): Promise<{
    total: number;
    synced: number;
    failed: number;
    errors: Array<{ invoiceId: string; error: string }>;
  }> {
    let synced = 0;
    let failed = 0;
    const errors: Array<{ invoiceId: string; error: string }> = [];

    for (const invoiceId of invoiceIds) {
      const result = await this.syncInvoiceWithWallet(invoiceId);
      if (result.success) {
        if (result.synced) synced++;
      } else {
        failed++;
        errors.push({ invoiceId, error: result.error || 'Unknown error' });
      }
    }

    return {
      total: invoiceIds.length,
      synced,
      failed,
      errors,
    };
  }

  /**
   * Add to sync queue for retry
   */
  addToSyncQueue(invoiceId: string): void {
    this.syncQueue.set(invoiceId, {
      attempts: 0,
      lastAttempt: 0,
    });
  }

  /**
   * Process sync queue
   */
  async processSyncQueue(): Promise<void> {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [invoiceId, syncItem] of this.syncQueue.entries()) {
      if (syncItem.attempts >= this.syncConfig.syncRetryAttempts) {
        console.warn(`[InvoiceWalletSync] Sync failed for invoice ${invoiceId} after ${syncItem.attempts} attempts`);
        keysToDelete.push(invoiceId);
        continue;
      }

      if (now - syncItem.lastAttempt < this.syncConfig.syncRetryDelay) {
        continue;
      }

      const result = await this.syncInvoiceWithWallet(invoiceId);
      syncItem.attempts++;
      syncItem.lastAttempt = now;

      if (result.success) {
        keysToDelete.push(invoiceId);
      }
    }

    keysToDelete.forEach(key => this.syncQueue.delete(key));
  }

  /**
   * Set wallet sync config
   */
  setWalletSyncConfig(config: Partial<WalletSyncConfig>): void {
    this.syncConfig = { ...this.syncConfig, ...config };
  }

  /**
   * Get wallet sync config
   */
  getWalletSyncConfig(): WalletSyncConfig {
    return { ...this.syncConfig };
  }

  /**
   * Get sync queue status
   */
  getSyncQueueStatus(): {
    queueSize: number;
    processing: number;
    failed: number;
  } {
    let processing = 0;
    let failed = 0;

    for (const syncItem of this.syncQueue.values()) {
      if (syncItem.attempts >= this.syncConfig.syncRetryAttempts) {
        failed++;
      } else {
        processing++;
      }
    }

    return {
      queueSize: this.syncQueue.size,
      processing,
      failed,
    };
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue(): void {
    this.syncQueue.clear();
  }
}

// Singleton instance
const invoiceWalletSyncService = new InvoiceWalletSyncService();

// Auto-process sync queue every 30 seconds
setInterval(() => {
  invoiceWalletSyncService.processSyncQueue();
}, 30000);

export default invoiceWalletSyncService;
export { InvoiceWalletSyncService };
export type { WalletSyncConfig };
