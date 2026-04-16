// Invoice Core Service
// invoice_id (prefix + sequence + checksum) + order link + user/role + currency precision

import clockIdService from '../micro/clockIdService';

interface Invoice {
  id: string;
  invoiceNo: string;
  orderId: string;
  userId: string;
  role: 'user' | 'reseller' | 'franchise';
  currency: string;
  precision: number;
  subtotal: number;
  discount: number;
  taxTotal: number;
  grandTotal: number;
  status: 'draft' | 'pending' | 'paid' | 'refunded' | 'cancelled';
  issuedAt: number;
  dueAt: number;
  paidAt?: number;
  checksum: string;
  buyerGst?: string;
  sellerGst?: string;
  terms?: string;
  signatureData?: string;
}

interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  nameSnapshot: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  hsnSac?: string;
}

interface InvoiceConfig {
  prefix: string;
  sequence: number;
  sequenceLength: number;
  checksumLength: number;
}

class InvoiceService {
  private invoices: Map<string, Invoice>;
  private invoiceItems: Map<string, InvoiceItem[]>;
  private invoiceConfig: InvoiceConfig;
  private orderInvoiceMap: Map<string, string>; // orderId -> invoiceId (1:1)

  constructor() {
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.orderInvoiceMap = new Map();
    this.invoiceConfig = {
      prefix: 'INV',
      sequence: 1,
      sequenceLength: 6,
      checksumLength: 4,
    };
  }

  /**
   * Generate invoice ID with prefix + sequence + checksum
   */
  generateInvoiceId(): string {
    const sequence = this.invoiceConfig.sequence.toString().padStart(this.invoiceConfig.sequenceLength, '0');
    const checksum = this.generateChecksum(sequence);
    const invoiceNo = `${this.invoiceConfig.prefix}-${sequence}-${checksum}`;
    
    this.invoiceConfig.sequence++;
    
    return invoiceNo;
  }

  /**
   * Generate checksum for invoice number
   */
  private generateChecksum(sequence: string): string {
    let hash = 0;
    for (let i = 0; i < sequence.length; i++) {
      const char = sequence.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(this.invoiceConfig.checksumLength, '0').substring(0, this.invoiceConfig.checksumLength);
  }

  /**
   * Validate invoice number checksum
   */
  validateInvoiceNumber(invoiceNo: string): boolean {
    const parts = invoiceNo.split('-');
    if (parts.length !== 3) return false;

    const [prefix, sequence, checksum] = parts;
    
    if (prefix !== this.invoiceConfig.prefix) return false;
    
    const expectedChecksum = this.generateChecksum(sequence);
    return checksum === expectedChecksum;
  }

  /**
   * Create invoice from order
   */
  createInvoice(
    orderId: string,
    userId: string,
    role: 'user' | 'reseller' | 'franchise',
    items: Array<{
      productId: string;
      name: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      hsnSac?: string;
    }>,
    currency: string = 'INR',
    precision: number = 2,
    discount: number = 0
  ): Invoice {
    // Check if invoice already exists for this order (1:1 rule)
    if (this.orderInvoiceMap.has(orderId)) {
      throw new Error('Invoice already exists for this order');
    }

    const invoiceNo = this.generateInvoiceId();
    const now = Date.now();
    const dueAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days

    // Calculate line totals
    const invoiceItems: InvoiceItem[] = items.map(item => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const taxAmount = lineSubtotal * (item.taxRate / 100);
      const lineTotal = lineSubtotal + taxAmount;

      return {
        id: clockIdService.generateId(),
        invoiceId: invoiceNo,
        productId: item.productId,
        nameSnapshot: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount,
        lineTotal,
        hsnSac: item.hsnSac,
      };
    });

    // Calculate totals (minor units safe)
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = invoiceItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subtotal - discount + taxTotal;

    // Round to precision
    const roundedSubtotal = this.roundToPrecision(subtotal, precision);
    const roundedTaxTotal = this.roundToPrecision(taxTotal, precision);
    const roundedGrandTotal = this.roundToPrecision(grandTotal, precision);

    const invoice: Invoice = {
      id: clockIdService.generateId(),
      invoiceNo,
      orderId,
      userId,
      role,
      currency,
      precision,
      subtotal: roundedSubtotal,
      discount,
      taxTotal: roundedTaxTotal,
      grandTotal: roundedGrandTotal,
      status: 'draft',
      issuedAt: now,
      dueAt,
      checksum: this.generateChecksum(invoiceNo.split('-')[1]),
      buyerGst: undefined,
      sellerGst: undefined,
      terms: undefined,
      signatureData: undefined,
    };

    this.invoices.set(invoice.id, invoice);
    this.invoiceItems.set(invoice.id, invoiceItems);
    this.orderInvoiceMap.set(orderId, invoice.id);

    console.log(`[Invoice] Created invoice ${invoiceNo} for order ${orderId}`);
    return invoice;
  }

  /**
   * Round to precision (minor units safe)
   */
  private roundToPrecision(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Get invoice by ID
   */
  getInvoice(invoiceId: string): Invoice | null {
    return this.invoices.get(invoiceId) || null;
  }

  /**
   * Get invoice by order ID (1:1 mapping)
   */
  getInvoiceByOrder(orderId: string): Invoice | null {
    const invoiceId = this.orderInvoiceMap.get(orderId);
    if (!invoiceId) return null;
    return this.invoices.get(invoiceId) || null;
  }

  /**
   * Get invoice items
   */
  getInvoiceItems(invoiceId: string): InvoiceItem[] {
    return this.invoiceItems.get(invoiceId) || [];
  }

  /**
   * Update invoice status
   */
  updateInvoiceStatus(invoiceId: string, status: Invoice['status']): { success: boolean; error?: string } {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // Validate status transition
    const validTransitions: Record<Invoice['status'], Invoice['status'][]> = {
      draft: ['pending', 'cancelled'],
      pending: ['paid', 'cancelled'],
      paid: ['refunded'],
      refunded: [],
      cancelled: [],
    };

    const allowed = validTransitions[invoice.status] || [];
    if (!allowed.includes(status)) {
      return { success: false, error: `Invalid status transition: ${invoice.status} -> ${status}` };
    }

    invoice.status = status;
    if (status === 'paid') {
      invoice.paidAt = Date.now();
    }

    this.invoices.set(invoiceId, invoice);
    console.log(`[Invoice] Invoice ${invoice.invoiceNo} status updated to ${status}`);

    return { success: true };
  }

  /**
   * Verify totals (strict rule: totals = sum(lines) verified)
   */
  verifyInvoiceTotals(invoiceId: string): { valid: boolean; discrepancies?: string[] } {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return { valid: false, discrepancies: ['Invoice not found'] };
    }

    const items = this.invoiceItems.get(invoiceId) || [];
    const discrepancies: string[] = [];

    // Verify subtotal
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const roundedCalculatedSubtotal = this.roundToPrecision(calculatedSubtotal, invoice.precision);
    if (roundedCalculatedSubtotal !== invoice.subtotal) {
      discrepancies.push(`Subtotal mismatch: calculated ${roundedCalculatedSubtotal} != stored ${invoice.subtotal}`);
    }

    // Verify tax total
    const calculatedTaxTotal = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const roundedCalculatedTaxTotal = this.roundToPrecision(calculatedTaxTotal, invoice.precision);
    if (roundedCalculatedTaxTotal !== invoice.taxTotal) {
      discrepancies.push(`Tax total mismatch: calculated ${roundedCalculatedTaxTotal} != stored ${invoice.taxTotal}`);
    }

    // Verify grand total
    const calculatedGrandTotal = roundedCalculatedSubtotal - invoice.discount + roundedCalculatedTaxTotal;
    if (calculatedGrandTotal !== invoice.grandTotal) {
      discrepancies.push(`Grand total mismatch: calculated ${calculatedGrandTotal} != stored ${invoice.grandTotal}`);
    }

    return {
      valid: discrepancies.length === 0,
      discrepancies: discrepancies.length > 0 ? discrepancies : undefined,
    };
  }

  /**
   * Get invoices by user
   */
  getInvoicesByUser(userId: string, role?: string): Invoice[] {
    return Array.from(this.invoices.values()).filter(invoice => {
      if (invoice.userId !== userId) return false;
      if (role && invoice.role !== role) return false;
      return true;
    });
  }

  /**
   * Get invoice stats
   */
  getInvoiceStats(): {
    total: number;
    byStatus: Record<Invoice['status'], number>;
    totalRevenue: number;
    pendingRevenue: number;
  } {
    const byStatus: Record<Invoice['status'], number> = {
      draft: 0,
      pending: 0,
      paid: 0,
      refunded: 0,
      cancelled: 0,
    };

    let totalRevenue = 0;
    let pendingRevenue = 0;

    for (const invoice of this.invoices.values()) {
      byStatus[invoice.status]++;
      if (invoice.status === 'paid') {
        totalRevenue += invoice.grandTotal;
      } else if (invoice.status === 'pending') {
        pendingRevenue += invoice.grandTotal;
      }
    }

    return {
      total: this.invoices.size,
      byStatus,
      totalRevenue,
      pendingRevenue,
    };
  }

  /**
   * Set invoice config
   */
  setInvoiceConfig(config: Partial<InvoiceConfig>): void {
    this.invoiceConfig = { ...this.invoiceConfig, ...config };
  }

  /**
   * Get invoice config
   */
  getInvoiceConfig(): InvoiceConfig {
    return { ...this.invoiceConfig };
  }
}

// Singleton instance
const invoiceService = new InvoiceService();

export default invoiceService;
export { InvoiceService };
export type { Invoice, InvoiceItem, InvoiceConfig };
