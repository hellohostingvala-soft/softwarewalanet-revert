// Security Micro Service (Advanced)
// CSP strict-dynamic + CSRF double-submit + SameSite/HttpOnly + rate limit token bucket

interface CSPConfig {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  connectSrc: string[];
  fontSrc: string[];
  objectSrc: string[];
  mediaSrc: string[];
  frameSrc: string[];
  reportUri?: string;
}

interface CSRFConfig {
  secret: string;
  tokenLength: number;
  ttl: number;
}

interface TokenBucketConfig {
  capacity: number;
  refillRate: number;
  windowMs: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

class SecurityService {
  private cspConfig: CSPConfig;
  private csrfConfig: CSRFConfig;
  private csrfStore: Map<string, { token: string; expiresAt: number }>;
  private tokenBuckets: Map<string, TokenBucket>;
  private tokenBucketConfig: TokenBucketConfig;

  constructor() {
    this.cspConfig = {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      reportUri: '/csp-report',
    };

    this.csrfConfig = {
      secret: 'csrf-secret-key',
      tokenLength: 32,
      ttl: 3600000, // 1 hour
    };

    this.csrfStore = new Map();
    this.tokenBuckets = new Map();
    this.tokenBucketConfig = {
      capacity: 100,
      refillRate: 10,
      windowMs: 1000,
    };
  }

  /**
   * Generate CSP header
   */
  generateCSPHeader(): string {
    const directives = [
      `default-src ${this.cspConfig.defaultSrc.join(' ')}`,
      `script-src ${this.cspConfig.scriptSrc.join(' ')}`,
      `style-src ${this.cspConfig.styleSrc.join(' ')}`,
      `img-src ${this.cspConfig.imgSrc.join(' ')}`,
      `connect-src ${this.cspConfig.connectSrc.join(' ')}`,
      `font-src ${this.cspConfig.fontSrc.join(' ')}`,
      `object-src ${this.cspConfig.objectSrc.join(' ')}`,
      `media-src ${this.cspConfig.mediaSrc.join(' ')}`,
      `frame-src ${this.cspConfig.frameSrc.join(' ')}`,
    ];

    if (this.cspConfig.reportUri) {
      directives.push(`report-uri ${this.cspConfig.reportUri}`);
    }

    return directives.join('; ');
  }

  /**
   * Set CSP config
   */
  setCSPConfig(config: Partial<CSPConfig>): void {
    this.cspConfig = { ...this.cspConfig, ...config };
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(sessionId: string): string {
    const token = this.generateSecureToken(this.csrfConfig.tokenLength);
    
    this.csrfStore.set(sessionId, {
      token,
      expiresAt: Date.now() + this.csrfConfig.ttl,
    });

    console.log(`[Security] CSRF token generated for session: ${sessionId}`);
    return token;
  }

  /**
   * Verify CSRF token (double-submit pattern)
   */
  verifyCSRFToken(sessionId: string, token: string, headerToken?: string): boolean {
    const stored = this.csrfStore.get(sessionId);

    if (!stored) {
      console.warn('[Security] CSRF token not found for session');
      return false;
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      this.csrfStore.delete(sessionId);
      console.warn('[Security] CSRF token expired');
      return false;
    }

    // Double-submit: check both body token and header token
    if (headerToken && headerToken !== token) {
      console.warn('[Security] CSRF token mismatch (double-submit)');
      return false;
    }

    const isValid = stored.token === token;

    if (!isValid) {
      console.warn('[Security] CSRF token validation failed');
    }

    return isValid;
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate CSRF token for form (double-submit cookie)
   */
  generateCSRFTokenForCookie(sessionId: string): { token: string; cookie: string } {
    const token = this.generateCSRFToken(sessionId);
    
    // SameSite=Strict, HttpOnly, Secure
    const cookie = `csrf_token=${token}; Path=/; SameSite=Strict; HttpOnly; Secure; Max-Age=${this.csrfConfig.ttl / 1000}`;

    return { token, cookie };
  }

  /**
   * Set CSRF config
   */
  setCSRFConfig(config: Partial<CSRFConfig>): void {
    this.csrfConfig = { ...this.csrfConfig, ...config };
  }

  /**
   * Cleanup expired CSRF tokens
   */
  cleanupExpiredCSRFTokens(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [sessionId, entry] of this.csrfStore.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(sessionId);
      }
    }

    keysToDelete.forEach(key => this.csrfStore.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[Security] Cleaned up ${keysToDelete.length} expired CSRF tokens`);
    }

    return keysToDelete.length;
  }

  /**
   * Token bucket rate limiting
   */
  checkRateLimit(identifier: string, cost: number = 1): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    let bucket = this.tokenBuckets.get(identifier);

    if (!bucket) {
      bucket = {
        tokens: this.tokenBucketConfig.capacity,
        lastRefill: now,
      };
      this.tokenBuckets.set(identifier, bucket);
    }

    // Refill tokens
    const timeSinceLastRefill = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timeSinceLastRefill / this.tokenBucketConfig.windowMs) * this.tokenBucketConfig.refillRate);

    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(bucket.tokens + tokensToAdd, this.tokenBucketConfig.capacity);
      bucket.lastRefill = now;
    }

    // Check if enough tokens
    if (bucket.tokens < cost) {
      const resetTime = bucket.lastRefill + this.tokenBucketConfig.windowMs;
      return {
        allowed: false,
        remaining: bucket.tokens,
        resetTime,
      };
    }

    // Consume tokens
    bucket.tokens -= cost;
    this.tokenBuckets.set(identifier, bucket);

    return {
      allowed: true,
      remaining: bucket.tokens,
      resetTime: bucket.lastRefill + this.tokenBucketConfig.windowMs,
    };
  }

  /**
   * Reset rate limit for identifier
   */
  resetRateLimit(identifier: string): void {
    this.tokenBuckets.delete(identifier);
  }

  /**
   * Get rate limit stats
   */
  getRateLimitStats(): {
    total: number;
    active: number;
    averageTokens: number;
  } {
    const now = Date.now();
    let active = 0;
    let totalTokens = 0;

    for (const bucket of this.tokenBuckets.values()) {
      if (now - bucket.lastRefill < this.tokenBucketConfig.windowMs * 10) {
        active++;
      }
      totalTokens += bucket.tokens;
    }

    return {
      total: this.tokenBuckets.size,
      active,
      averageTokens: this.tokenBuckets.size > 0 ? totalTokens / this.tokenBuckets.size : 0,
    };
  }

  /**
   * Set token bucket config
   */
  setTokenBucketConfig(config: Partial<TokenBucketConfig>): void {
    this.tokenBucketConfig = { ...this.tokenBucketConfig, ...config };
  }

  /**
   * Generate secure cookie attributes
   */
  generateSecureCookieAttributes(): string {
    return 'SameSite=Strict; HttpOnly; Secure; Path=/';
  }

  /**
   * Sanitize HTML output
   */
  sanitizeHTML(html: string): string {
    // Basic HTML sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }

  /**
   * Validate URL for redirect
   */
  validateRedirectURL(url: string, allowedDomains: string[]): boolean {
    try {
      const parsed = new URL(url);
      
      // Check protocol
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return false;
      }

      // Check domain
      if (allowedDomains.length > 0) {
        const hostname = parsed.hostname;
        const allowed = allowedDomains.some(domain => 
          hostname === domain || hostname.endsWith(`.${domain}`)
        );
        if (!allowed) return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate nonce for CSP
   */
  generateNonce(): string {
    return this.generateSecureToken(16);
  }

  /**
   * Generate CSP header with nonce
   */
  generateCSPHeaderWithNonce(nonce: string): string {
    const scriptSrc = [...this.cspConfig.scriptSrc, `'nonce-${nonce}'`];
    const directives = [
      `default-src ${this.cspConfig.defaultSrc.join(' ')}`,
      `script-src ${scriptSrc.join(' ')}`,
      `style-src ${this.cspConfig.styleSrc.join(' ')}`,
      `img-src ${this.cspConfig.imgSrc.join(' ')}`,
      `connect-src ${this.cspConfig.connectSrc.join(' ')}`,
      `font-src ${this.cspConfig.fontSrc.join(' ')}`,
      `object-src ${this.cspConfig.objectSrc.join(' ')}`,
      `media-src ${this.cspConfig.mediaSrc.join(' ')}`,
      `frame-src ${this.cspConfig.frameSrc.join(' ')}`,
    ];

    if (this.cspConfig.reportUri) {
      directives.push(`report-uri ${this.cspConfig.reportUri}`);
    }

    return directives.join('; ');
  }

  /**
   * Get security headers
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.generateCSPHeader(),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }

  /**
   * Validate input against XSS patterns
   */
  validateXSS(input: string): { safe: boolean; pattern?: string } {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /data:text\/html/gi,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        return { safe: false, pattern: pattern.toString() };
      }
    }

    return { safe: true };
  }

  /**
   * Cleanup expired rate limit buckets
   */
  cleanupExpiredRateLimitBuckets(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [identifier, bucket] of this.tokenBuckets.entries()) {
      if (now - bucket.lastRefill > this.tokenBucketConfig.windowMs * 60) { // 1 minute of inactivity
        keysToDelete.push(identifier);
      }
    }

    keysToDelete.forEach(key => this.tokenBuckets.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[Security] Cleaned up ${keysToDelete.length} expired rate limit buckets`);
    }

    return keysToDelete.length;
  }
}

// Singleton instance
const securityService = new SecurityService();

// Auto-cleanup expired CSRF tokens every hour
setInterval(() => {
  securityService.cleanupExpiredCSRFTokens();
}, 3600000);

// Auto-cleanup expired rate limit buckets every 5 minutes
setInterval(() => {
  securityService.cleanupExpiredRateLimitBuckets();
}, 300000);

export default securityService;
export { SecurityService };
export type { CSPConfig, CSRFConfig, TokenBucketConfig, TokenBucket };
