// API Security Service
// API key per partner, rate limit + abuse guard

interface APIKey {
  id: string;
  franchiseId: string;
  key: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  createdAt: number;
  lastUsedAt?: number;
  expiresAt?: number;
}

interface RateLimitEntry {
  apiKey: string;
  requests: number[];
  windowStart: number;
}

interface AbuseAlert {
  id: string;
  franchiseId: string;
  apiKey: string;
  type: 'rate_limit_exceeded' | 'suspicious_activity' | 'abuse_detected';
  description: string;
  ipAddress?: string;
  timestamp: number;
  resolved: boolean;
}

class APISecurityService {
  private apiKeys: Map<string, APIKey>;
  private rateLimitEntries: Map<string, RateLimitEntry>;
  private abuseAlerts: Map<string, AbuseAlert>;

  constructor() {
    this.apiKeys = new Map();
    this.rateLimitEntries = new Map();
    this.abuseAlerts = new Map();
  }

  /**
   * Generate API key
   */
  generateAPIKey(): string {
    const prefix = 'fk_';
    const random = crypto.randomUUID().replace(/-/g, '').substring(0, 32);
    return prefix + random;
  }

  /**
   * Create API key
   */
  createAPIKey(
    franchiseId: string,
    name: string,
    permissions: string[],
    rateLimitPerMinute: number = 60,
    rateLimitPerHour: number = 1000,
    expiresInDays?: number
  ): APIKey {
    const key = this.generateAPIKey();
    const now = Date.now();
    const expiresAt = expiresInDays ? now + (expiresInDays * 24 * 60 * 60 * 1000) : undefined;

    const apiKey: APIKey = {
      id: crypto.randomUUID(),
      franchiseId,
      key,
      name,
      permissions,
      isActive: true,
      rateLimitPerMinute,
      rateLimitPerHour,
      createdAt: now,
      expiresAt,
    };

    this.apiKeys.set(apiKey.id, apiKey);
    console.log(`[APISecurity] Created API key ${name} for franchise ${franchiseId}`);
    return apiKey;
  }

  /**
   * Validate API key
   */
  validateAPIKey(key: string): { valid: boolean; apiKey?: APIKey; error?: string } {
    const apiKey = Array.from(this.apiKeys.values()).find(k => k.key === key);

    if (!apiKey) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (!apiKey.isActive) {
      return { valid: false, error: 'API key is inactive' };
    }

    if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
      return { valid: false, error: 'API key has expired' };
    }

    return { valid: true, apiKey };
  }

  /**
   * Check rate limit
   */
  checkRateLimit(apiKeyId: string, ipAddress?: string): { allowed: boolean; remaining: number; resetAt: number } {
    const apiKey = this.apiKeys.get(apiKeyId);
    if (!apiKey) {
      return { allowed: false, remaining: 0, resetAt: 0 };
    }

    const now = Date.now();
    const minuteWindow = 60 * 1000;
    const hourWindow = 60 * 60 * 1000;

    // Get or create rate limit entry
    let entry = this.rateLimitEntries.get(apiKeyId);
    if (!entry || now - entry.windowStart > hourWindow) {
      entry = {
        apiKey: apiKeyId,
        requests: [],
        windowStart: now,
      };
      this.rateLimitEntries.set(apiKeyId, entry);
    }

    // Clean old requests
    entry.requests = entry.requests.filter(t => now - t < hourWindow);

    // Check minute limit
    const minuteRequests = entry.requests.filter(t => now - t < minuteWindow);
    if (minuteRequests.length >= apiKey.rateLimitPerMinute) {
      this.createAbuseAlert(apiKey.franchiseId, apiKey.key, 'rate_limit_exceeded', `Rate limit exceeded: ${minuteRequests.length}/${apiKey.rateLimitPerMinute} per minute`, ipAddress);
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.windowStart + minuteWindow,
      };
    }

    // Check hour limit
    if (entry.requests.length >= apiKey.rateLimitPerHour) {
      this.createAbuseAlert(apiKey.franchiseId, apiKey.key, 'rate_limit_exceeded', `Rate limit exceeded: ${entry.requests.length}/${apiKey.rateLimitPerHour} per hour`, ipAddress);
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.windowStart + hourWindow,
      };
    }

    // Add request
    entry.requests.push(now);
    this.rateLimitEntries.set(apiKeyId, entry);

    // Update last used
    apiKey.lastUsedAt = now;
    this.apiKeys.set(apiKeyId, apiKey);

    const remaining = Math.min(
      apiKey.rateLimitPerMinute - minuteRequests.length - 1,
      apiKey.rateLimitPerHour - entry.requests.length
    );

    return {
      allowed: true,
      remaining,
      resetAt: entry.windowStart + hourWindow,
    };
  }

  /**
   * Record API request
   */
  recordRequest(apiKeyId: string, ipAddress?: string): void {
    const apiKey = this.apiKeys.get(apiKeyId);
    if (!apiKey) return;

    apiKey.lastUsedAt = Date.now();
    this.apiKeys.set(apiKeyId, apiKey);
  }

  /**
   * Create abuse alert
   */
  createAbuseAlert(
    franchiseId: string,
    apiKey: string,
    type: AbuseAlert['type'],
    description: string,
    ipAddress?: string
  ): AbuseAlert {
    const alert: AbuseAlert = {
      id: crypto.randomUUID(),
      franchiseId,
      apiKey,
      type,
      description,
      ipAddress,
      timestamp: Date.now(),
      resolved: false,
    };

    this.abuseAlerts.set(alert.id, alert);
    console.log(`[APISecurity] Abuse alert created: ${type} for franchise ${franchiseId}`);
    return alert;
  }

  /**
   * Get API key by franchise
   */
  getAPIKeysByFranchise(franchiseId: string): APIKey[] {
    return Array.from(this.apiKeys.values()).filter(k => k.franchiseId === franchiseId);
  }

  /**
   * Get API key by ID
   */
  getAPIKey(apiKeyId: string): APIKey | null {
    return this.apiKeys.get(apiKeyId) || null;
  }

  /**
   * Deactivate API key
   */
  deactivateAPIKey(apiKeyId: string): APIKey | null {
    const apiKey = this.apiKeys.get(apiKeyId);
    if (!apiKey) return null;

    apiKey.isActive = false;
    this.apiKeys.set(apiKeyId, apiKey);

    console.log(`[APISecurity] Deactivated API key ${apiKey.name}`);
    return apiKey;
  }

  /**
   * Activate API key
   */
  activateAPIKey(apiKeyId: string): APIKey | null {
    const apiKey = this.apiKeys.get(apiKeyId);
    if (!apiKey) return null;

    apiKey.isActive = true;
    this.apiKeys.set(apiKeyId, apiKey);

    console.log(`[APISecurity] Activated API key ${apiKey.name}`);
    return apiKey;
  }

  /**
   * Regenerate API key
   */
  regenerateAPIKey(apiKeyId: string): APIKey | null {
    const apiKey = this.apiKeys.get(apiKeyId);
    if (!apiKey) return null;

    apiKey.key = this.generateAPIKey();
    this.apiKeys.set(apiKeyId, apiKey);

    console.log(`[APISecurity] Regenerated API key ${apiKey.name}`);
    return apiKey;
  }

  /**
   * Update API key permissions
   */
  updateAPIKeyPermissions(apiKeyId: string, permissions: string[]): APIKey | null {
    const apiKey = this.apiKeys.get(apiKeyId);
    if (!apiKey) return null;

    apiKey.permissions = permissions;
    this.apiKeys.set(apiKeyId, apiKey);

    console.log(`[APISecurity] Updated permissions for API key ${apiKey.name}`);
    return apiKey;
  }

  /**
   * Update rate limits
   */
  updateRateLimits(apiKeyId: string, rateLimitPerMinute: number, rateLimitPerHour: number): APIKey | null {
    const apiKey = this.apiKeys.get(apiKeyId);
    if (!apiKey) return null;

    apiKey.rateLimitPerMinute = rateLimitPerMinute;
    apiKey.rateLimitPerHour = rateLimitPerHour;
    this.apiKeys.set(apiKeyId, apiKey);

    console.log(`[APISecurity] Updated rate limits for API key ${apiKey.name}`);
    return apiKey;
  }

  /**
   * Delete API key
   */
  deleteAPIKey(apiKeyId: string): boolean {
    const apiKey = this.apiKeys.get(apiKeyId);
    if (!apiKey) return false;

    this.apiKeys.delete(apiKeyId);
    this.rateLimitEntries.delete(apiKeyId);

    console.log(`[APISecurity] Deleted API key ${apiKey.name}`);
    return true;
  }

  /**
   * Get abuse alerts
   */
  getAbuseAlerts(franchiseId?: string, resolved?: boolean): AbuseAlert[] {
    let alerts = Array.from(this.abuseAlerts.values());

    if (franchiseId) {
      alerts = alerts.filter(a => a.franchiseId === franchiseId);
    }

    if (resolved !== undefined) {
      alerts = alerts.filter(a => a.resolved === resolved);
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Resolve abuse alert
   */
  resolveAbuseAlert(alertId: string): AbuseAlert | null {
    const alert = this.abuseAlerts.get(alertId);
    if (!alert) return null;

    alert.resolved = true;
    this.abuseAlerts.set(alertId, alert);

    console.log(`[APISecurity] Resolved abuse alert ${alertId}`);
    return alert;
  }

  /**
   * Get API key stats
   */
  getAPIKeyStats(franchiseId?: string): {
    total: number;
    active: number;
    inactive: number;
    expired: number;
    totalRequests: number;
  } {
    const keys = franchiseId
      ? Array.from(this.apiKeys.values()).filter(k => k.franchiseId === franchiseId)
      : Array.from(this.apiKeys.values());

    const now = Date.now();
    const stats = {
      total: keys.length,
      active: 0,
      inactive: 0,
      expired: 0,
      totalRequests: 0,
    };

    for (const key of keys) {
      if (!key.isActive) {
        stats.inactive++;
      } else if (key.expiresAt && key.expiresAt < now) {
        stats.expired++;
      } else {
        stats.active++;
      }

      const entry = this.rateLimitEntries.get(key.id);
      if (entry) {
        stats.totalRequests += entry.requests.length;
      }
    }

    return stats;
  }

  /**
   * Cleanup old rate limit entries (older than 1 hour)
   */
  cleanupOldRateLimitEntries(): number {
    const now = Date.now();
    const cutoff = now - (60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, entry] of this.rateLimitEntries.entries()) {
      if (entry.windowStart < cutoff) {
        this.rateLimitEntries.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[APISecurity] Cleaned up ${deletedCount} old rate limit entries`);
    }

    return deletedCount;
  }

  /**
   * Cleanup resolved abuse alerts (older than 30 days)
   */
  cleanupResolvedAlerts(): number {
    const now = Date.now();
    const cutoff = now - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, alert] of this.abuseAlerts.entries()) {
      if (alert.resolved && alert.timestamp < cutoff) {
        this.abuseAlerts.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[APISecurity] Cleaned up ${deletedCount} resolved abuse alerts`);
    }

    return deletedCount;
  }
}

const apiSecurityService = new APISecurityService();

// Auto-cleanup old rate limit entries every 30 minutes
setInterval(() => {
  apiSecurityService.cleanupOldRateLimitEntries();
}, 30 * 60 * 1000);

// Auto-cleanup resolved alerts daily
setInterval(() => {
  apiSecurityService.cleanupResolvedAlerts();
}, 24 * 60 * 60 * 1000);

export default apiSecurityService;
export { APISecurityService };
export type { APIKey, AbuseAlert };
