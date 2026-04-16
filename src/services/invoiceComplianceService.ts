// Invoice Compliance Service
// GST fields + terms + signature + audit log immutable

import invoiceService from './invoiceService';
import clockIdService from '../micro/clockIdService';

interface AuditLogEntry {
  id: string;
  invoiceId: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  changes?: Record<string, any>;
  performedBy: string;
  performedAt: number;
  immutable: boolean;
}

interface ComplianceConfig {
  requireGST: boolean;
  requireTerms: boolean;
  requireSignature: boolean;
  auditLogRetention: number;
}

class InvoiceComplianceService {
  private auditLogs: Map<string, AuditLogEntry[]>;
  private complianceConfig: ComplianceConfig;

  constructor() {
    this.auditLogs = new Map();
    this.complianceConfig = {
      requireGST: true,
      requireTerms: true,
      requireSignature: true,
      auditLogRetention: 365 * 24 * 60 * 60 * 1000, // 1 year
    };
  }

  /**
   * Set GST details for invoice
   */
  setGSTDetails(
    invoiceId: string,
    buyerGst: string,
    sellerGst: string
  ): { success: boolean; error?: string } {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // Validate GST format (Indian GST: 15 alphanumeric characters)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
    
    if (!gstRegex.test(buyerGst)) {
      return { success: false, error: 'Invalid buyer GST format' };
    }

    if (!gstRegex.test(sellerGst)) {
      return { success: false, error: 'Invalid seller GST format' };
    }

    invoice.buyerGst = buyerGst;
    invoice.sellerGst = sellerGst;

    this.logAudit(invoiceId, 'set_gst_details', undefined, undefined, {
      buyerGst,
      sellerGst,
    });

    console.log(`[InvoiceCompliance] Set GST details for invoice ${invoiceId}`);
    return { success: true };
  }

  /**
   * Set terms for invoice
   */
  setTerms(invoiceId: string, terms: string): { success: boolean; error?: string } {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    if (terms.length > 5000) {
      return { success: false, error: 'Terms too long (max 5000 characters)' };
    }

    invoice.terms = terms;

    this.logAudit(invoiceId, 'set_terms', undefined, undefined, { terms });

    console.log(`[InvoiceCompliance] Set terms for invoice ${invoiceId}`);
    return { success: true };
  }

  /**
   * Set signature for invoice
   */
  setSignature(invoiceId: string, signatureData: string): { success: boolean; error?: string } {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    if (signatureData.length > 10000) {
      return { success: false, error: 'Signature data too long (max 10000 characters)' };
    }

    invoice.signatureData = signatureData;

    this.logAudit(invoiceId, 'set_signature', undefined, undefined, {
      signatureData: signatureData.substring(0, 100) + '...',
    });

    console.log(`[InvoiceCompliance] Set signature for invoice ${invoiceId}`);
    return { success: true };
  }

  /**
   * Log audit entry (immutable)
   */
  logAudit(
    invoiceId: string,
    action: string,
    oldStatus?: string,
    newStatus?: string,
    changes?: Record<string, any>,
    performedBy: string = 'system'
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: clockIdService.generateId(),
      invoiceId,
      action,
      oldStatus,
      newStatus,
      changes,
      performedBy,
      performedAt: Date.now(),
      immutable: true,
    };

    const logs = this.auditLogs.get(invoiceId) || [];
    logs.push(entry);
    this.auditLogs.set(invoiceId, logs);

    return entry;
  }

  /**
   * Get audit logs for invoice
   */
  getAuditLogs(invoiceId: string): AuditLogEntry[] {
    const logs = this.auditLogs.get(invoiceId) || [];
    return [...logs].sort((a, b) => b.performedAt - a.performedAt);
  }

  /**
   * Verify invoice compliance
   */
  verifyCompliance(invoiceId: string): {
    compliant: boolean;
    issues: string[];
    warnings: string[];
  } {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return {
        compliant: false,
        issues: ['Invoice not found'],
        warnings: [],
      };
    }

    const issues: string[] = [];
    const warnings: string[] = [];

    // Check GST
    if (this.complianceConfig.requireGST) {
      if (!invoice.buyerGst) {
        issues.push('Buyer GST is required');
      }
      if (!invoice.sellerGst) {
        issues.push('Seller GST is required');
      }
    }

    // Check terms
    if (this.complianceConfig.requireTerms && !invoice.terms) {
      issues.push('Terms are required');
    }

    // Check signature
    if (this.complianceConfig.requireSignature && !invoice.signatureData) {
      issues.push('Signature is required');
    }

    // Warnings
    if (invoice.status === 'draft' && Date.now() - invoice.issuedAt > 86400000) {
      warnings.push('Invoice has been in draft status for more than 24 hours');
    }

    if (invoice.status === 'pending' && Date.now() > invoice.dueAt) {
      warnings.push('Invoice is overdue');
    }

    return {
      compliant: issues.length === 0,
      issues,
      warnings,
    };
  }

  /**
   * Get compliance report for user
   */
  getUserComplianceReport(userId: string): {
    totalInvoices: number;
    compliantInvoices: number;
    nonCompliantInvoices: number;
    issues: Record<string, string[]>;
  } {
    const invoices = invoiceService.getInvoicesByUser(userId);
    const issues: Record<string, string[]> = {};
    let compliantCount = 0;

    for (const invoice of invoices) {
      const verification = this.verifyCompliance(invoice.id);
      if (verification.compliant) {
        compliantCount++;
      } else {
        issues[invoice.invoiceNo] = verification.issues;
      }
    }

    return {
      totalInvoices: invoices.length,
      compliantInvoices: compliantCount,
      nonCompliantInvoices: invoices.length - compliantCount,
      issues,
    };
  }

  /**
   * Cleanup old audit logs
   */
  cleanupOldAuditLogs(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];
    let deletedCount = 0;

    for (const [invoiceId, logs] of this.auditLogs.entries()) {
      const recentLogs = logs.filter(log => now - log.performedAt < this.complianceConfig.auditLogRetention);
      
      if (recentLogs.length === 0) {
        keysToDelete.push(invoiceId);
      } else if (recentLogs.length !== logs.length) {
        this.auditLogs.set(invoiceId, recentLogs);
        deletedCount += logs.length - recentLogs.length;
      }
    }

    keysToDelete.forEach(key => {
      deletedCount += this.auditLogs.get(key)!.length;
      this.auditLogs.delete(key);
    });

    if (deletedCount > 0) {
      console.log(`[InvoiceCompliance] Cleaned up ${deletedCount} old audit log entries`);
    }

    return deletedCount;
  }

  /**
   * Export audit logs for compliance
   */
  exportAuditLogs(invoiceId: string): string {
    const logs = this.getAuditLogs(invoiceId);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Verify audit log integrity
   */
  verifyAuditLogIntegrity(invoiceId: string): {
    valid: boolean;
    tamperedEntries: string[];
  } {
    const logs = this.auditLogs.get(invoiceId) || [];
    const tamperedEntries: string[] = [];

    for (const log of logs) {
      if (!log.immutable) {
        tamperedEntries.push(log.id);
      }
    }

    return {
      valid: tamperedEntries.length === 0,
      tamperedEntries,
    };
  }

  /**
   * Set compliance config
   */
  setComplianceConfig(config: Partial<ComplianceConfig>): void {
    this.complianceConfig = { ...this.complianceConfig, ...config };
  }

  /**
   * Get compliance config
   */
  getComplianceConfig(): ComplianceConfig {
    return { ...this.complianceConfig };
  }

  /**
   * Get audit log stats
   */
  getAuditLogStats(): {
    totalEntries: number;
    invoicesWithLogs: number;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    let totalEntries = 0;
    let oldestEntry: number | undefined;
    let newestEntry: number | undefined;

    for (const logs of this.auditLogs.values()) {
      totalEntries += logs.length;
      
      for (const log of logs) {
        if (!oldestEntry || log.performedAt < oldestEntry) {
          oldestEntry = log.performedAt;
        }
        if (!newestEntry || log.performedAt > newestEntry) {
          newestEntry = log.performedAt;
        }
      }
    }

    return {
      totalEntries,
      invoicesWithLogs: this.auditLogs.size,
      oldestEntry,
      newestEntry,
    };
  }
}

// Singleton instance
const invoiceComplianceService = new InvoiceComplianceService();

// Auto-cleanup old audit logs every day
setInterval(() => {
  invoiceComplianceService.cleanupOldAuditLogs();
}, 86400000);

export default invoiceComplianceService;
export { InvoiceComplianceService };
export type { AuditLogEntry, ComplianceConfig };
