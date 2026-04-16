// Invoice PDF/Export Service
// PDF generator + QR code + download/share/email

import invoiceService from './invoiceService';

interface InvoicePDFConfig {
  template: 'standard' | 'thermal' | 'custom';
  includeQR: boolean;
  includeTerms: boolean;
  includeSignature: boolean;
  fontSize: number;
  paperSize: 'A4' | 'Letter' | 'Thermal';
}

interface QRCodeConfig {
  size: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  verifyURL: string;
}

interface ExportOptions {
  format: 'pdf' | 'html' | 'json';
  includeItems: boolean;
  includePayments: boolean;
  includeAudit: boolean;
}

class InvoicePDFService {
  private pdfConfigs: Map<string, InvoicePDFConfig>;
  private qrCodeConfigs: Map<string, QRCodeConfig>;

  constructor() {
    this.pdfConfigs = new Map();
    this.qrCodeConfigs = new Map();
    this.initializeDefaultConfigs();
  }

  /**
   * Initialize default configurations
   */
  private initializeDefaultConfigs(): void {
    this.pdfConfigs.set('default', {
      template: 'standard',
      includeQR: true,
      includeTerms: true,
      includeSignature: true,
      fontSize: 12,
      paperSize: 'A4',
    });

    this.qrCodeConfigs.set('default', {
      size: 150,
      errorCorrection: 'M',
      verifyURL: 'https://verify.example.com/invoice/',
    });
  }

  /**
   * Generate HTML for invoice
   */
  generateInvoiceHTML(invoiceId: string, config?: InvoicePDFConfig): string {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const items = invoiceService.getInvoiceItems(invoiceId);
    const pdfConfig = config || this.pdfConfigs.get('default')!;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNo}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: ${pdfConfig.fontSize}px; margin: 0; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .company-info { max-width: 50%; }
    .invoice-info { text-align: right; }
    .invoice-title { font-size: 24px; font-weight: bold; color: #333; }
    .invoice-number { font-size: 18px; color: #666; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .totals { text-align: right; margin-top: 20px; }
    .total-row { display: flex; justify-content: flex-end; margin-bottom: 5px; }
    .total-label { width: 150px; }
    .total-value { width: 100px; text-align: right; }
    .grand-total { font-weight: bold; font-size: 16px; }
    .qr-section { text-align: center; margin-top: 30px; }
    .terms { margin-top: 30px; font-size: 10px; color: #666; }
    .signature { margin-top: 30px; text-align: right; }
    .signature-line { border-top: 1px solid #333; width: 200px; margin-left: auto; padding-top: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h2>Univercel Tech Forge</h2>
      <p>123 Tech Street<br>Bangalore, KA 560001<br>India</p>
      <p>GSTIN: 29ABCDE1234F1Z5</p>
    </div>
    <div class="invoice-info">
      <div class="invoice-title">TAX INVOICE</div>
      <div class="invoice-number">${invoice.invoiceNo}</div>
      <p>Date: ${new Date(invoice.issuedAt).toLocaleDateString()}</p>
      <p>Due: ${new Date(invoice.dueAt).toLocaleDateString()}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Bill To</div>
    <p><strong>User ID:</strong> ${invoice.userId}</p>
    <p><strong>Role:</strong> ${invoice.role}</p>
    ${invoice.buyerGst ? `<p><strong>GSTIN:</strong> ${invoice.buyerGst}</p>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Invoice Items</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>HSN/SAC</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Tax Rate</th>
          <th>Tax Amount</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.nameSnapshot}</td>
            <td>${item.hsnSac || '-'}</td>
            <td>${item.quantity}</td>
            <td>${item.unitPrice.toFixed(2)}</td>
            <td>${item.taxRate}%</td>
            <td>${item.taxAmount.toFixed(2)}</td>
            <td>${item.lineTotal.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="total-row">
      <span class="total-label">Subtotal:</span>
      <span class="total-value">${invoice.subtotal.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span class="total-label">Discount:</span>
      <span class="total-value">-${invoice.discount.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span class="total-label">Tax Total:</span>
      <span class="total-value">${invoice.taxTotal.toFixed(2)}</span>
    </div>
    <div class="total-row grand-total">
      <span class="total-label">Grand Total:</span>
      <span class="total-value">${invoice.grandTotal.toFixed(2)}</span>
    </div>
  </div>

  ${pdfConfig.includeQR ? `
  <div class="qr-section">
    <p>Scan to verify invoice authenticity</p>
    <div id="qrcode"></div>
  </div>
  ` : ''}

  ${pdfConfig.includeTerms && invoice.terms ? `
  <div class="terms">
    <div class="section-title">Terms & Conditions</div>
    <p>${invoice.terms}</p>
  </div>
  ` : ''}

  ${pdfConfig.includeSignature ? `
  <div class="signature">
    <div class="signature-line">Authorized Signature</div>
  </div>
  ` : ''}
</body>
</html>
    `;

    return html;
  }

  /**
   * Generate QR code for invoice verification
   */
  generateQRCodeData(invoiceId: string): string {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const qrConfig = this.qrCodeConfigs.get('default')!;
    
    const verifyData = {
      invoiceNo: invoice.invoiceNo,
      amount: invoice.grandTotal,
      currency: invoice.currency,
      issuedAt: invoice.issuedAt,
      checksum: invoice.checksum,
    };

    return JSON.stringify(verifyData);
  }

  /**
   * Generate QR code URL (for external QR code generator)
   */
  generateQRCodeURL(invoiceId: string): string {
    const qrConfig = this.qrCodeConfigs.get('default')!;
    const data = this.generateQRCodeData(invoiceId);
    const encoded = encodeURIComponent(data);
    return `${qrConfig.verifyURL}${invoiceId}?data=${encoded}`;
  }

  /**
   * Export invoice in specified format
   */
  async exportInvoice(invoiceId: string, options: ExportOptions): Promise<{
    data: string;
    filename: string;
    mimeType: string;
  }> {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    let data: string;
    let filename: string;
    let mimeType: string;

    switch (options.format) {
      case 'html':
        data = this.generateInvoiceHTML(invoiceId);
        filename = `invoice-${invoice.invoiceNo}.html`;
        mimeType = 'text/html';
        break;

      case 'json':
        const exportData = {
          invoice,
          items: options.includeItems ? invoiceService.getInvoiceItems(invoiceId) : undefined,
          payments: options.includePayments ? (await import('./invoicePaymentService')).default.getInvoicePayments(invoiceId) : undefined,
        };
        data = JSON.stringify(exportData, null, 2);
        filename = `invoice-${invoice.invoiceNo}.json`;
        mimeType = 'application/json';
        break;

      case 'pdf':
        // In production, use a PDF library like jsPDF or puppeteer
        data = this.generateInvoiceHTML(invoiceId);
        filename = `invoice-${invoice.invoiceNo}.pdf`;
        mimeType = 'application/pdf';
        break;

      default:
        throw new Error('Unsupported export format');
    }

    return { data, filename, mimeType };
  }

  /**
   * Download invoice
   */
  async downloadInvoice(invoiceId: string, format: 'pdf' | 'html' | 'json' = 'pdf'): Promise<Blob> {
    const { data, mimeType } = await this.exportInvoice(invoiceId, {
      format,
      includeItems: true,
      includePayments: false,
      includeAudit: false,
    });

    return new Blob([data], { type: mimeType });
  }

  /**
   * Share invoice via email
   */
  async shareInvoiceViaEmail(
    invoiceId: string,
    recipientEmail: string,
    subject?: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // In production, integrate with email service
    const emailSubject = subject || `Invoice ${invoice.invoiceNo} from Univercel Tech Forge`;
    const emailMessage = message || `Please find attached invoice ${invoice.invoiceNo} for your records.`;

    console.log(`[InvoicePDF] Email prepared for ${recipientEmail}: ${emailSubject}`);
    
    // Simulate email send
    return { success: true };
  }

  /**
   * Generate invoice share link
   */
  generateShareLink(invoiceId: string, expiresIn: number = 86400000): string {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + expiresIn;
    
    // In production, store token with expiration
    return `/invoice/share/${invoiceId}?token=${token}&expires=${expiresAt}`;
  }

  /**
   * Set PDF config
   */
  setPDFConfig(key: string, config: InvoicePDFConfig): void {
    this.pdfConfigs.set(key, config);
  }

  /**
   * Set QR code config
   */
  setQRCodeConfig(key: string, config: QRCodeConfig): void {
    this.qrCodeConfigs.set(key, config);
  }

  /**
   * Get PDF config
   */
  getPDFConfig(key: string): InvoicePDFConfig | undefined {
    return this.pdfConfigs.get(key);
  }

  /**
   * Get QR code config
   */
  getQRCodeConfig(key: string): QRCodeConfig | undefined {
    return this.qrCodeConfigs.get(key);
  }
}

// Singleton instance
const invoicePDFService = new InvoicePDFService();

export default invoicePDFService;
export { InvoicePDFService };
export type { InvoicePDFConfig, QRCodeConfig, ExportOptions };
