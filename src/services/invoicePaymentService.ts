// Invoice Payment Link Service
// invoice ↔ payments (txn_id) + partial payment support + status sync (pending→paid)

import invoiceService from './invoiceService';
import paymentService from '../micro/paymentService';

interface InvoicePayment {
  id: string;
  invoiceId: string;
  paymentId: string;
  amount: number;
  paymentMethod: 'wallet' | 'card' | 'upi' | 'bank' | 'binance';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: number;
  createdAt: number;
  updatedAt: number;
}

interface PaymentLink {
  id: string;
  invoiceId: string;
  url: string;
  expiresAt: number;
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'paid';
  createdAt: number;
}

class InvoicePaymentService {
  private invoicePayments: Map<string, InvoicePayment[]>;
  private paymentLinks: Map<string, PaymentLink>;

  constructor() {
    this.invoicePayments = new Map();
    this.paymentLinks = new Map();
  }

  /**
   * Create payment link for invoice
   */
  createPaymentLink(invoiceId: string, expiresIn: number = 86400000): PaymentLink {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'pending') {
      throw new Error('Invoice must be in pending status to create payment link');
    }

    const linkId = crypto.randomUUID();
    const url = this.generatePaymentURL(linkId);
    const now = Date.now();

    const paymentLink: PaymentLink = {
      id: linkId,
      invoiceId,
      url,
      expiresAt: now + expiresIn,
      amount: invoice.grandTotal,
      currency: invoice.currency,
      status: 'active',
      createdAt: now,
    };

    this.paymentLinks.set(linkId, paymentLink);

    console.log(`[InvoicePayment] Created payment link for invoice ${invoiceId}`);
    return paymentLink;
  }

  /**
   * Generate payment URL
   */
  private generatePaymentURL(linkId: string): string {
    return `/pay/${linkId}`;
  }

  /**
   * Get payment link by ID
   */
  getPaymentLink(linkId: string): PaymentLink | null {
    const link = this.paymentLinks.get(linkId);
    if (!link) return null;

    // Check if expired
    if (Date.now() > link.expiresAt) {
      link.status = 'expired';
      this.paymentLinks.set(linkId, link);
    }

    return link;
  }

  /**
   * Record payment for invoice
   */
  recordPayment(
    invoiceId: string,
    paymentId: string,
    amount: number,
    paymentMethod: InvoicePayment['paymentMethod'],
    transactionId?: string
  ): InvoicePayment {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const now = Date.now();
    const payment: InvoicePayment = {
      id: crypto.randomUUID(),
      invoiceId,
      paymentId,
      amount,
      paymentMethod,
      status: 'pending',
      transactionId,
      createdAt: now,
      updatedAt: now,
    };

    const payments = this.invoicePayments.get(invoiceId) || [];
    payments.push(payment);
    this.invoicePayments.set(invoiceId, payments);

    console.log(`[InvoicePayment] Recorded payment ${paymentId} for invoice ${invoiceId}`);
    return payment;
  }

  /**
   * Complete payment
   */
  completePayment(paymentId: string): { success: boolean; error?: string } {
    for (const [invoiceId, payments] of this.invoicePayments.entries()) {
      const payment = payments.find(p => p.paymentId === paymentId);
      if (payment) {
        payment.status = 'completed';
        payment.paidAt = Date.now();
        payment.updatedAt = Date.now();
        this.invoicePayments.set(invoiceId, payments);

        // Check if invoice is fully paid
        this.checkInvoicePaymentStatus(invoiceId);

        return { success: true };
      }
    }

    return { success: false, error: 'Payment not found' };
  }

  /**
   * Fail payment
   */
  failPayment(paymentId: string, reason?: string): { success: boolean; error?: string } {
    for (const [invoiceId, payments] of this.invoicePayments.entries()) {
      const payment = payments.find(p => p.paymentId === paymentId);
      if (payment) {
        payment.status = 'failed';
        payment.updatedAt = Date.now();
        this.invoicePayments.set(invoiceId, payments);

        console.warn(`[InvoicePayment] Payment ${paymentId} failed: ${reason}`);
        return { success: true };
      }
    }

    return { success: false, error: 'Payment not found' };
  }

  /**
   * Check if invoice is fully paid and update status
   */
  private checkInvoicePaymentStatus(invoiceId: string): void {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) return;

    const payments = this.invoicePayments.get(invoiceId) || [];
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    // Check if fully paid (allow small rounding differences)
    if (totalPaid >= invoice.grandTotal - 0.01) {
      invoiceService.updateInvoiceStatus(invoiceId, 'paid');
      console.log(`[InvoicePayment] Invoice ${invoiceId} marked as paid`);
    }
  }

  /**
   * Get payments for invoice
   */
  getInvoicePayments(invoiceId: string): InvoicePayment[] {
    return this.invoicePayments.get(invoiceId) || [];
  }

  /**
   * Get payment status for invoice
   */
  getInvoicePaymentStatus(invoiceId: string): {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentCount: number;
    status: 'unpaid' | 'partial' | 'paid';
  } {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const payments = this.invoicePayments.get(invoiceId) || [];
    const completedPayments = payments.filter(p => p.status === 'completed');
    const paidAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = invoice.grandTotal - paidAmount;

    let status: 'unpaid' | 'partial' | 'paid' = 'unpaid';
    if (paidAmount >= invoice.grandTotal - 0.01) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    }

    return {
      totalAmount: invoice.grandTotal,
      paidAmount,
      remainingAmount: Math.max(0, remainingAmount),
      paymentCount: completedPayments.length,
      status,
    };
  }

  /**
   * Process wallet payment
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

    // Debit from wallet using walletService
    const walletService = (await import('../micro/walletService')).default;
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
    this.recordPayment(
      invoiceId,
      paymentId,
      invoice.grandTotal,
      'wallet',
      debitResult.entryId
    );

    // Complete payment
    this.completePayment(paymentId);

    return { success: true, paymentId };
  }

  /**
   * Refund payment
   */
  refundPayment(paymentId: string, amount?: number): { success: boolean; error?: string } {
    for (const [invoiceId, payments] of this.invoicePayments.entries()) {
      const payment = payments.find(p => p.paymentId === paymentId);
      if (payment) {
        if (payment.status !== 'completed') {
          return { success: false, error: 'Payment must be completed to refund' };
        }

        const refundAmount = amount || payment.amount;
        
        // If wallet payment, credit back to wallet
        if (payment.paymentMethod === 'wallet') {
          const walletService = require('../micro/walletService').default;
          const invoice = invoiceService.getInvoice(invoiceId);
          if (invoice) {
            walletService.credit(
              invoice.userId,
              refundAmount,
              'invoice_refund',
              payment.transactionId,
              `invoice:${invoiceId}:refund:${paymentId}`
            );
          }
        }

        payment.status = 'refunded';
        payment.updatedAt = Date.now();
        this.invoicePayments.set(invoiceId, payments);

        // Update invoice status if all payments are refunded
        this.checkInvoiceRefundStatus(invoiceId);

        console.log(`[InvoicePayment] Refunded payment ${paymentId} amount: ${refundAmount}`);
        return { success: true };
      }
    }

    return { success: false, error: 'Payment not found' };
  }

  /**
   * Check if invoice is fully refunded and update status
   */
  private checkInvoiceRefundStatus(invoiceId: string): void {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) return;

    const payments = this.invoicePayments.get(invoiceId) || [];
    const refundedPayments = payments.filter(p => p.status === 'refunded');
    const totalRefunded = refundedPayments.reduce((sum, p) => sum + p.amount, 0);

    if (totalRefunded >= invoice.grandTotal - 0.01) {
      invoiceService.updateInvoiceStatus(invoiceId, 'refunded');
      console.log(`[InvoicePayment] Invoice ${invoiceId} marked as refunded`);
    }
  }

  /**
   * Sync payment status from external payment gateway
   */
  syncPaymentStatus(
    paymentId: string,
    externalStatus: 'success' | 'failed' | 'pending',
    transactionId?: string
  ): { success: boolean; error?: string } {
    for (const [invoiceId, payments] of this.invoicePayments.entries()) {
      const payment = payments.find(p => p.paymentId === paymentId);
      if (payment) {
        if (externalStatus === 'success') {
          return this.completePayment(paymentId);
        } else if (externalStatus === 'failed') {
          return this.failPayment(paymentId);
        } else {
          payment.transactionId = transactionId;
          payment.updatedAt = Date.now();
          this.invoicePayments.set(invoiceId, payments);
          return { success: true };
        }
      }
    }

    return { success: false, error: 'Payment not found' };
  }

  /**
   * Get payment stats
   */
  getPaymentStats(): {
    totalPayments: number;
    completedPayments: number;
    failedPayments: number;
    pendingPayments: number;
    totalAmount: number;
    collectedAmount: number;
  } {
    let totalPayments = 0;
    let completedPayments = 0;
    let failedPayments = 0;
    let pendingPayments = 0;
    let totalAmount = 0;
    let collectedAmount = 0;

    for (const payments of this.invoicePayments.values()) {
      for (const payment of payments) {
        totalPayments++;
        totalAmount += payment.amount;

        if (payment.status === 'completed') {
          completedPayments++;
          collectedAmount += payment.amount;
        } else if (payment.status === 'failed') {
          failedPayments++;
        } else if (payment.status === 'pending') {
          pendingPayments++;
        }
      }
    }

    return {
      totalPayments,
      completedPayments,
      failedPayments,
      pendingPayments,
      totalAmount,
      collectedAmount,
    };
  }

  /**
   * Cleanup expired payment links
   */
  cleanupExpiredLinks(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [linkId, link] of this.paymentLinks.entries()) {
      if (now > link.expiresAt && link.status === 'active') {
        link.status = 'expired';
        this.paymentLinks.set(linkId, link);
      }
      
      // Delete links older than 7 days
      if (now - link.createdAt > 604800000) {
        keysToDelete.push(linkId);
      }
    }

    keysToDelete.forEach(key => this.paymentLinks.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[InvoicePayment] Cleaned up ${keysToDelete.length} expired payment links`);
    }

    return keysToDelete.length;
  }
}

// Singleton instance
const invoicePaymentService = new InvoicePaymentService();

// Auto-cleanup expired payment links every hour
setInterval(() => {
  invoicePaymentService.cleanupExpiredLinks();
}, 3600000);

export default invoicePaymentService;
export { InvoicePaymentService };
export type { InvoicePayment, PaymentLink };
