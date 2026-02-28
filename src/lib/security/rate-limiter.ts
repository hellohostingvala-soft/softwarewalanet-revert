// ==============================================
// Client-Side Rate Limiter
// ==============================================
// Provides in-memory, per-endpoint request throttling
// to complement server-side DDoS protection.

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetAt: number;
  retryAfterMs?: number;
}

interface WindowRecord {
  count: number;
  resetAt: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60_000, // 1 minute
};

// Per-role default limits
export const ROLE_RATE_LIMITS: Record<string, RateLimitConfig> = {
  boss_owner:    { maxRequests: 1000, windowMs: 60_000 },
  master:        { maxRequests: 1000, windowMs: 60_000 },
  super_admin:   { maxRequests: 500,  windowMs: 60_000 },
  ceo:           { maxRequests: 500,  windowMs: 60_000 },
  developer:     { maxRequests: 300,  windowMs: 60_000 },
  franchise:     { maxRequests: 200,  windowMs: 60_000 },
  reseller:      { maxRequests: 200,  windowMs: 60_000 },
  prime:         { maxRequests: 150,  windowMs: 60_000 },
  influencer:    { maxRequests: 100,  windowMs: 60_000 },
  guest:         { maxRequests: 30,   windowMs: 60_000 },
};

// Per-action (endpoint) default limits
export const ACTION_RATE_LIMITS: Record<string, RateLimitConfig> = {
  login:            { maxRequests: 5,   windowMs: 300_000 }, // 5 attempts / 5 min
  otp_verify:       { maxRequests: 5,   windowMs: 300_000 },
  otp_send:         { maxRequests: 3,   windowMs: 300_000 },
  password_reset:   { maxRequests: 3,   windowMs: 300_000 },
  api_read:         { maxRequests: 200, windowMs: 60_000 },
  api_write:        { maxRequests: 50,  windowMs: 60_000 },
  file_upload:      { maxRequests: 10,  windowMs: 60_000 },
};

export class RateLimiter {
  private store = new Map<string, WindowRecord>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  check(key: string, config?: RateLimitConfig): RateLimitResult {
    const { maxRequests, windowMs } = config ?? this.config;
    const now = Date.now();

    let record = this.store.get(key);

    if (!record || now >= record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
      this.store.set(key, record);
    }

    record.count++;

    const allowed = record.count <= maxRequests;
    const remainingRequests = Math.max(0, maxRequests - record.count);

    return {
      allowed,
      remainingRequests,
      resetAt: record.resetAt,
      retryAfterMs: allowed ? undefined : record.resetAt - now,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  // Periodically clean up expired windows to prevent memory leaks
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton instance for global use
const globalLimiter = new RateLimiter();

// Start periodic cleanup (every 5 minutes) – guard against HMR re-execution
const CLEANUP_INTERVAL_KEY = '__sv_rl_cleanup__';
if (typeof window !== 'undefined' && !(window as Record<string, unknown>)[CLEANUP_INTERVAL_KEY]) {
  const id = setInterval(() => globalLimiter.cleanup(), 300_000);
  (window as Record<string, unknown>)[CLEANUP_INTERVAL_KEY] = id;
}

// Check rate limit for an action, keyed by userId + action
export function checkRateLimit(
  userId: string,
  action: string,
  role?: string,
): RateLimitResult {
  const actionConfig = ACTION_RATE_LIMITS[action];
  const roleConfig = role ? ROLE_RATE_LIMITS[role] : undefined;

  // Use the most restrictive applicable limit
  const config = actionConfig ?? roleConfig ?? DEFAULT_CONFIG;
  const key = `${userId}:${action}`;

  return globalLimiter.check(key, config);
}

// Build standard rate-limit response headers
export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remainingRequests.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toUTCString(),
    ...(result.retryAfterMs != null
      ? { 'Retry-After': Math.ceil(result.retryAfterMs / 1000).toString() }
      : {}),
  };
}
