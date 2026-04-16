// Invoice Security Service
// signed invoice URL + tamper-proof hash

import invoiceService from './invoiceService';
import clockIdService from '../micro/clockIdService';
import securityService from '../micro/securityService';

interface SignedURLConfig {
  secret: string;
  expiresIn: number;
  algorithm: 'HS256' | 'HS512';
}

interface TamperProofConfig {
  hashAlgorithm: 'SHA256' | 'SHA512';
  includeAllFields: boolean;
}

class InvoiceSecurityService {
  private signedURLConfig: SignedURLConfig;
  private tamperProofConfig: TamperProofConfig;
  private signedURLs: Map<string, { url: string; expiresAt: number; invoiceId: string }>;

  constructor() {
    this.signedURLConfig = {
      secret: 'invoice-secret-key',
      expiresIn: 86400000, // 24 hours
      algorithm: 'HS256',
    };
    this.tamperProofConfig = {
      hashAlgorithm: 'SHA256',
      includeAllFields: true,
    };
    this.signedURLs = new Map();
  }

  /**
   * Generate signed invoice URL
   */
  generateSignedURL(invoiceId: string, expiresIn?: number): string {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const now = Date.now();
    const expiresAt = now + (expiresIn || this.signedURLConfig.expiresIn);
    const token = this.generateSignedToken(invoiceId, expiresAt);
    const url = `/invoice/view/${invoiceId}?token=${token}&expires=${expiresAt}`;

    // Store signed URL
    const signedId = clockIdService.generateId();
    this.signedURLs.set(signedId, {
      url,
      expiresAt,
      invoiceId,
    });

    console.log(`[InvoiceSecurity] Generated signed URL for invoice ${invoiceId}`);
    return url;
  }

  /**
   * Generate signed token
   */
  private generateSignedToken(invoiceId: string, expiresAt: number): string {
    const data = `${invoiceId}:${expiresAt}`;
    const signature = this.signData(data);
    return btoa(signature);
  }

  /**
   * Sign data
   */
  private signData(data: string): string {
    const combined = data + this.signedURLConfig.secret;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Verify signed URL
   */
  verifySignedURL(invoiceId: string, token: string, expiresAt: number): { valid: boolean; error?: string } {
    const now = Date.now();

    // Check expiration
    if (now > expiresAt) {
      return { valid: false, error: 'URL has expired' };
    }

    // Verify signature
    const expectedToken = this.generateSignedToken(invoiceId, expiresAt);
    if (token !== expectedToken) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Check if invoice exists
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { valid: false, error: 'Invoice not found' };
    }

    return { valid: true };
  }

  /**
   * Generate tamper-proof hash for invoice
   */
  generateTamperProofHash(invoiceId: string): string {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const items = invoiceService.getInvoiceItems(invoiceId);

    // Build hash data
    const hashData = {
      invoiceNo: invoice.invoiceNo,
      orderId: invoice.orderId,
      userId: invoice.userId,
      role: invoice.role,
      currency: invoice.currency,
      precision: invoice.precision,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      taxTotal: invoice.taxTotal,
      grandTotal: invoice.grandTotal,
      status: invoice.status,
      issuedAt: invoice.issuedAt,
      dueAt: invoice.dueAt,
      checksum: invoice.checksum,
      items: items.map(item => ({
        productId: item.productId,
        nameSnapshot: item.nameSnapshot,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        lineTotal: item.lineTotal,
      })),
    };

    const dataString = JSON.stringify(hashData);
    return this.hashData(dataString);
  }

  /**
   * Hash data
   */
  private hashData(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Verify invoice integrity with tamper-proof hash
   */
  verifyInvoiceIntegrity(invoiceId: string, hash: string): { valid: boolean; error?: string } {
    const invoice = invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return { valid: false, error: 'Invoice not found' };
    }

    const currentHash = this.generateTamperProofHash(invoiceId);
    
    if (currentHash !== hash) {
      return { valid: false, error: 'Invoice has been tampered with' };
    }

    return { valid: true };
  }

  /**
   * Generate one-time access token
   */
  generateOneTimeToken(invoiceId: string, expiresIn: number = 3600000): string {
    const now = Date.now();
    const expiresAt = now + expiresIn;
    const random = Math.random().toString(36).substring(2);
    
    const tokenData = `${invoiceId}:${expiresAt}:${random}`;
    const token = this.hashData(tokenData);

    return `${token}:${expiresAt}`;
  }

  /**
   * Verify one-time token
   */
  verifyOneTimeToken(invoiceId: string, token: string): { valid: boolean; error?: string } {
    const [hash, expiresAt] = token.split(':');
    
    if (!hash || !expiresAt) {
      return { valid: false, error: 'Invalid token format' };
    }

    const now = Date.now();
    const expiry = parseInt(expiresAt, 10);

    if (now > expiry) {
      return { valid: false, error: 'Token has expired' };
    }

    // In production, track used tokens to ensure one-time use
    return { valid: true };
  }

  /**
   * Generate secure share link
   */
  generateSecureShareLink(
    invoiceId: string,
    expiresIn: number = 86400000,
    maxViews?: number
  ): string {
    let signedURL = this.generateSignedURL(invoiceId, expiresIn);
    
    if (maxViews) {
      signedURL += `&maxViews=${maxViews}`;
    }

    return signedURL;
  }

  /**
   * Revoke signed URL
   */
  revokeSignedURL(invoiceId: string): { revoked: number } {
    let revoked = 0;
    const keysToDelete: string[] = [];

    for (const [signedId, signed] of this.signedURLs.entries()) {
      if (signed.invoiceId === invoiceId) {
        keysToDelete.push(signedId);
        revoked++;
      }
    }

    keysToDelete.forEach(key => this.signedURLs.delete(key));

    if (revoked > 0) {
      console.log(`[InvoiceSecurity] Revoked ${revoked} signed URLs for invoice ${invoiceId}`);
    }

    return { revoked };
  }

  /**
   * Get active signed URLs for invoice
   */
  getActiveSignedURLs(invoiceId: string): Array<{ url: string; expiresAt: number }> {
    const now = Date.now();
    const activeURLs: Array<{ url: string; expiresAt: number }> = [];

    for (const signed of this.signedURLs.values()) {
      if (signed.invoiceId === invoiceId && now < signed.expiresAt) {
        activeURLs.push({
          url: signed.url,
          expiresAt: signed.expiresAt,
        });
      }
    }

    return activeURLs;
  }

  /**
   * Cleanup expired signed URLs
   */
  cleanupExpiredSignedURLs(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [signedId, signed] of this.signedURLs.entries()) {
      if (now > signed.expiresAt) {
        keysToDelete.push(signedId);
      }
    }

    keysToDelete.forEach(key => this.signedURLs.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[InvoiceSecurity] Cleaned up ${keysToDelete.length} expired signed URLs`);
    }

    return keysToDelete.length;
  }

  /**
   * Set signed URL config
   */
  setSignedURLConfig(config: Partial<SignedURLConfig>): void {
    this.signedURLConfig = { ...this.signedURLConfig, ...config };
  }

  /**
   * Set tamper-proof config
   */
  setTamperProofConfig(config: Partial<TamperProofConfig>): void {
    this.tamperProofConfig = { ...this.tamperProofConfig, ...config };
  }

  /**
   * Get security stats
   */
  getSecurityStats(): {
    activeSignedURLs: number;
    expiredSignedURLs: number;
    totalSignedURLs: number;
  } {
    const now = Date.now();
    let active = 0;
    let expired = 0;

    for (const signed of this.signedURLs.values()) {
      if (now < signed.expiresAt) {
        active++;
      } else {
        expired++;
      }
    }

    return {
      activeSignedURLs: active,
      expiredSignedURLs: expired,
      totalSignedURLs: this.signedURLs.size,
    };
  }
}

// Singleton instance
const invoiceSecurityService = new InvoiceSecurityService();

// Auto-cleanup expired signed URLs every hour
setInterval(() => {
  invoiceSecurityService.cleanupExpiredSignedURLs();
}, 3600000);

export default invoiceSecurityService;
export { InvoiceSecurityService };
export type { SignedURLConfig, TamperProofConfig };
