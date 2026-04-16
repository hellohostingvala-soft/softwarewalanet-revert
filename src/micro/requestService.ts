// Request Micro Service
// Canonical hash + nonce + replay window + idempotency key

import clockIdService from './clockIdService';

interface CanonicalRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: any;
}

interface ReplayProtectionConfig {
  windowMs: number;
  maxNoncesPerWindow: number;
}

interface IdempotencyConfig {
  ttl: number;
  scope: string;
}

class RequestService {
  private nonceStore: Map<string, { timestamp: number; count: number }> = new Map();
  private idempotencyStore: Map<string, { response: any; timestamp: number }> = new Map();
  
  private replayConfig: ReplayProtectionConfig = {
    windowMs: 60000, // 1 minute
    maxNoncesPerWindow: 100,
  };

  /**
   * Generate canonical request hash
   */
  generateCanonicalHash(request: CanonicalRequest): string {
    const canonical = this.buildCanonicalString(request);
    return this.hashString(canonical);
  }

  /**
   * Build canonical string for signing
   */
  private buildCanonicalString(request: CanonicalRequest): string {
    const parts = [
      request.method.toUpperCase(),
      this.normalizePath(request.path),
      this.normalizeQuery(request.query),
      this.normalizeHeaders(request.headers),
      request.body ? this.normalizeBody(request.body) : '',
    ];

    return parts.join('\n');
  }

  /**
   * Normalize path (remove trailing slash, lowercase)
   */
  private normalizePath(path: string): string {
    return path.replace(/\/$/, '').toLowerCase();
  }

  /**
   * Normalize query parameters (sorted, encoded)
   */
  private normalizeQuery(query: Record<string, string>): string {
    const sorted = Object.keys(query)
      .sort()
      .map(key => `${key}=${encodeURIComponent(query[key])}`)
      .join('&');
    return sorted;
  }

  /**
   * Normalize headers (sorted, lowercase)
   */
  private normalizeHeaders(headers: Record<string, string>): string {
    const sorted = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join('\n');
    return sorted;
  }

  /**
   * Normalize body (stringify, sort keys if object)
   */
  private normalizeBody(body: any): string {
    if (typeof body === 'string') return body;
    if (typeof body === 'object') {
      return JSON.stringify(this.sortObjectKeys(body));
    }
    return String(body);
  }

  /**
   * Sort object keys recursively
   */
  private sortObjectKeys(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const sorted: any = {};
      Object.keys(obj)
        .sort()
        .forEach(key => {
          sorted[key] = this.sortObjectKeys(obj[key]);
        });
      return sorted;
    }
    return obj;
  }

  /**
   * Hash string (SHA-256 simulation)
   */
  private hashString(str: string): string {
    // In production, use crypto.subtle.digest('SHA-256', ...)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Generate nonce
   */
  generateNonce(): string {
    return clockIdService.generateId();
  }

  /**
   * Validate nonce (replay protection)
   */
  validateNonce(nonce: string, clientId: string): { valid: boolean; error?: string } {
    const key = `${clientId}:${nonce}`;
    const now = Date.now();
    const entry = this.nonceStore.get(key);

    if (entry) {
      // Check if within replay window
      if (now - entry.timestamp < this.replayConfig.windowMs) {
        return { valid: false, error: 'Nonce already used within replay window' };
      }
    }

    // Check nonce count per window
    this.cleanupNonces(now);
    const clientNonces = Array.from(this.nonceStore.entries())
      .filter(([k]) => k.startsWith(`${clientId}:`));
    
    if (clientNonces.length >= this.replayConfig.maxNoncesPerWindow) {
      return { valid: false, error: 'Too many nonces within replay window' };
    }

    // Store nonce
    this.nonceStore.set(key, { timestamp: now, count: (entry?.count || 0) + 1 });

    return { valid: true };
  }

  /**
   * Cleanup expired nonces
   */
  private cleanupNonces(now: number): void {
    const cutoff = now - this.replayConfig.windowMs;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.nonceStore.entries()) {
      if (entry.timestamp < cutoff) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.nonceStore.delete(key));
  }

  /**
   * Generate idempotency key
   */
  generateIdempotencyKey(scope: string = 'default'): string {
    const id = clockIdService.generateId();
    return `${scope}:${id}`;
  }

  /**
   * Check idempotency key
   */
  checkIdempotencyKey(key: string): { exists: boolean; response?: any } {
    const entry = this.idempotencyStore.get(key);

    if (!entry) {
      return { exists: false };
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > 3600000) { // 1 hour TTL
      this.idempotencyStore.delete(key);
      return { exists: false };
    }

    return { exists: true, response: entry.response };
  }

  /**
   * Store idempotency response
   */
  storeIdempotencyResponse(key: string, response: any, ttl: number = 3600000): void {
    this.idempotencyStore.set(key, {
      response,
      timestamp: Date.now(),
    });

    // Auto-cleanup after TTL
    setTimeout(() => {
      this.idempotencyStore.delete(key);
    }, ttl);
  }

  /**
   * Validate request signature
   */
  validateSignature(
    request: CanonicalRequest,
    signature: string,
    secret: string
  ): boolean {
    const canonical = this.buildCanonicalString(request);
    const expectedSignature = this.hashString(canonical + secret);
    return signature === expectedSignature;
  }

  /**
   * Generate signature
   */
  generateSignature(request: CanonicalRequest, secret: string): string {
    const canonical = this.buildCanonicalString(request);
    return this.hashString(canonical + secret);
  }

  /**
   * Get nonce stats
   */
  getNonceStats(): { total: number; active: number } {
    const now = Date.now();
    const cutoff = now - this.replayConfig.windowMs;
    const active = Array.from(this.nonceStore.values())
      .filter(entry => entry.timestamp >= cutoff).length;

    return {
      total: this.nonceStore.size,
      active,
    };
  }

  /**
   * Get idempotency stats
   */
  getIdempotencyStats(): { total: number; expired: number } {
    const now = Date.now();
    let expired = 0;

    for (const entry of this.idempotencyStore.values()) {
      if (now - entry.timestamp > 3600000) {
        expired++;
      }
    }

    return {
      total: this.idempotencyStore.size,
      expired,
    };
  }

  /**
   * Clear all nonces and idempotency entries
   */
  clearAll(): void {
    this.nonceStore.clear();
    this.idempotencyStore.clear();
  }
}

// Singleton instance
const requestService = new RequestService();

export default requestService;
export { RequestService };
export type { CanonicalRequest, ReplayProtectionConfig, IdempotencyConfig };
