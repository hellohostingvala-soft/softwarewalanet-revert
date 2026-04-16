// Invoice Automation Service
// auto-generate on order success + email invoice + retry queue

import invoiceService from './invoiceService';
import invoicePDFService from './invoicePDFService';
import invoiceComplianceService from './invoiceComplianceService';
import clockIdService from '../micro/clockIdService';

interface AutomationConfig {
  autoGenerateOnOrderSuccess: boolean;
  autoEmailOnInvoiceCreation: boolean;
  emailRetryAttempts: number;
  emailRetryDelay: number;
  queueProcessingInterval: number;
}

interface EmailJob {
  id: string;
  invoiceId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  attempts: number;
  lastAttempt: number;
  status: 'pending' | 'sent' | 'failed';
  createdAt: number;
}

class InvoiceAutomationService {
  private automationConfig: AutomationConfig;
  private emailQueue: Map<string, EmailJob>;
  private orderInvoiceMap: Map<string, string>;

  constructor() {
    this.automationConfig = {
      autoGenerateOnOrderSuccess: true,
      autoEmailOnInvoiceCreation: true,
      emailRetryAttempts: 3,
      emailRetryDelay: 60000, // 1 minute
      queueProcessingInterval: 30000, // 30 seconds
    };
    this.emailQueue = new Map();
    this.orderInvoiceMap = new Map();
  }

  /**
   * Auto-generate invoice on order success
   */
  async autoGenerateInvoiceOnOrderSuccess(
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
    precision: number = 2
  ): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    if (!this.automationConfig.autoGenerateOnOrderSuccess) {
      return { success: false, error: 'Auto-generation disabled' };
    }

    // Check if invoice already exists for this order
    if (this.orderInvoiceMap.has(orderId)) {
      return { success: false, error: 'Invoice already exists for this order' };
    }

    try {
      const invoice = invoiceService.createInvoice(
        orderId,
        userId,
        role,
        items,
        currency,
        precision
      );

      // Set default GST details (can be overridden)
      invoiceComplianceService.setGSTDetails(
        invoice.id,
        '29ABCDE1234F1Z5', // Default seller GST
        '29ABCDE1234F1Z5' // Default buyer GST (same for demo)
      );

      // Set default terms
      invoiceComplianceService.setTerms(
        invoice.id,
        'Payment due within 30 days. Late payment may incur interest charges.'
      );

      // Update invoice status to pending
      invoiceService.updateInvoiceStatus(invoice.id, 'pending');

      this.orderInvoiceMap.set(orderId, invoice.id);

      // Auto-email if configured
      if (this.automationConfig.autoEmailOnInvoiceCreation) {
        await this.queueEmailForInvoice(invoice.id, userId);
      }

      console.log(`[InvoiceAutomation] Auto-generated invoice ${invoice.invoiceNo} for order ${orderId}`);
      return { success: true, invoiceId: invoice.id };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Queue email for invoice
   */
  async queueEmailForInvoice(
    invoiceId: string,
    userId: string,
    recipientEmail?: string
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    const jobId = clockIdService.generateId();
    const email = recipientEmail || `${userId}@example.com`;

    const job: EmailJob = {
      id: jobId,
      invoiceId,
      recipientEmail: email,
      subject: `Invoice ${invoice.invoiceNo} from Univercel Tech Forge`,
      body: `Dear User,\n\nPlease find attached invoice ${invoice.invoiceNo} for your recent order.\n\nAmount: ${invoice.currency} ${invoice.grandTotal.toFixed(2)}\nDue Date: ${new Date(invoice.dueAt).toLocaleDateString()}\n\nThank you for your business!\n\nBest regards,\nUnivercel Tech Forge`,
      attempts: 0,
      lastAttempt: 0,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.emailQueue.set(jobId, job);

    console.log(`[InvoiceAutomation] Queued email job ${jobId} for invoice ${invoiceId}`);
    return { success: true, jobId };
  }

  /**
   * Process email queue
   */
  async processEmailQueue(): Promise<void> {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [jobId, job] of this.emailQueue.entries()) {
      if (job.status === 'sent' || job.status === 'failed') {
        keysToDelete.push(jobId);
        continue;
      }

      if (job.attempts >= this.automationConfig.emailRetryAttempts) {
        job.status = 'failed';
        this.emailQueue.set(jobId, job);
        console.warn(`[InvoiceAutomation] Email job ${jobId} failed after ${job.attempts} attempts`);
        keysToDelete.push(jobId);
        continue;
      }

      if (now - job.lastAttempt < this.automationConfig.emailRetryDelay) {
        continue;
      }

      // Attempt to send email
      const result = await this.sendEmail(job);

      job.attempts++;
      job.lastAttempt = now;

      if (result.success) {
        job.status = 'sent';
        this.emailQueue.set(jobId, job);
        console.log(`[InvoiceAutomation] Email sent successfully for job ${jobId}`);
      } else {
        console.warn(`[InvoiceAutomation] Email send failed for job ${jobId}: ${result.error}`);
      }
    }

    keysToDelete.forEach(key => this.emailQueue.delete(key));
  }

  /**
   * Send email (simulated)
   */
  private async sendEmail(job: EmailJob): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      const invoice = invoiceService.getInvoice(job.invoiceId);
      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      // Generate PDF attachment
      const pdfData = await invoicePDFService.generateInvoiceHTML(job.invoiceId);

      console.log(`[InvoiceAutomation] Sending email to ${job.recipientEmail} for invoice ${invoice.invoiceNo}`);
      
      // Simulate email send
      await new Promise(resolve => setTimeout(resolve, 100));

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Retry failed email jobs
   */
  async retryFailedEmailJobs(): Promise<{ retried: number }> {
    let retried = 0;

    for (const [jobId, job] of this.emailQueue.entries()) {
      if (job.status === 'failed') {
        job.status = 'pending';
        job.attempts = 0;
        job.lastAttempt = 0;
        this.emailQueue.set(jobId, job);
        retried++;
      }
    }

    if (retried > 0) {
      console.log(`[InvoiceAutomation] Retried ${retried} failed email jobs`);
    }

    return { retried };
  }

  /**
   * Get email queue status
   */
  getEmailQueueStatus(): {
    total: number;
    pending: number;
    sent: number;
    failed: number;
  } {
    let pending = 0;
    let sent = 0;
    let failed = 0;

    for (const job of this.emailQueue.values()) {
      if (job.status === 'pending') pending++;
      else if (job.status === 'sent') sent++;
      else if (job.status === 'failed') failed++;
    }

    return {
      total: this.emailQueue.size,
      pending,
      sent,
      failed,
    };
  }

  /**
   * Get email jobs for invoice
   */
  getEmailJobsForInvoice(invoiceId: string): EmailJob[] {
    return Array.from(this.emailQueue.values()).filter(job => job.invoiceId === invoiceId);
  }

  /**
   * Cancel email job
   */
  cancelEmailJob(jobId: string): { success: boolean; error?: string } {
    const job = this.emailQueue.get(jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    if (job.status === 'sent') {
      return { success: false, error: 'Cannot cancel sent job' };
    }

    job.status = 'failed';
    this.emailQueue.set(jobId, job);

    console.log(`[InvoiceAutomation] Cancelled email job ${jobId}`);
    return { success: true };
  }

  /**
   * Set automation config
   */
  setAutomationConfig(config: Partial<AutomationConfig>): void {
    this.automationConfig = { ...this.automationConfig, ...config };
  }

  /**
   * Get automation config
   */
  getAutomationConfig(): AutomationConfig {
    return { ...this.automationConfig };
  }

  /**
   * Clear email queue
   */
  clearEmailQueue(): void {
    this.emailQueue.clear();
  }

  /**
   * Clear old completed jobs (older than 7 days)
   */
  cleanupOldJobs(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [jobId, job] of this.emailQueue.entries()) {
      if ((job.status === 'sent' || job.status === 'failed') && now - job.createdAt > 604800000) {
        keysToDelete.push(jobId);
      }
    }

    keysToDelete.forEach(key => this.emailQueue.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[InvoiceAutomation] Cleaned up ${keysToDelete.length} old email jobs`);
    }

    return keysToDelete.length;
  }
}

// Singleton instance
const invoiceAutomationService = new InvoiceAutomationService();

// Auto-process email queue every 30 seconds
setInterval(() => {
  invoiceAutomationService.processEmailQueue();
}, invoiceAutomationService.getAutomationConfig().queueProcessingInterval);

// Auto-cleanup old jobs every hour
setInterval(() => {
  invoiceAutomationService.cleanupOldJobs();
}, 3600000);

export default invoiceAutomationService;
export { InvoiceAutomationService };
export type { AutomationConfig, EmailJob };
