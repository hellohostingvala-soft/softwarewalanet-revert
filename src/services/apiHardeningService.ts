// API Hardening Service
// Rate limit, JWT, idempotency

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface IdempotencyKey {
  key: string;
  response: any;
  timestamp: Date;
  expiresAt: Date;
}

// In-memory rate limit storage
const rateLimitStore: Map<string, { count: number; resetTime: Date }> = new Map();

// In-memory idempotency storage
const idempotencyStore: Map<string, IdempotencyKey> = new Map();

/**
 * Check rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }
): { allowed: boolean; remaining: number; resetTime: Date } {
  const now = new Date();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: new Date(now.getTime() + config.windowMs),
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: new Date(now.getTime() + config.windowMs),
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get rate limit stats
 */
export function getRateLimitStats(): {
  total: number;
  active: number;
} {
  const now = new Date();
  const active = Array.from(rateLimitStore.values()).filter(
    entry => now < entry.resetTime
  ).length;

  return {
    total: rateLimitStore.size,
    active,
  };
}

/**
 * Create JWT token (simplified)
 */
export function createJWT(payload: any, expiresIn: string = '1h'): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = new Date();
  const exp = new Date(now.getTime() + parseExpiration(expiresIn));

  const tokenPayload = {
    ...payload,
    iat: Math.floor(now.getTime() / 1000),
    exp: Math.floor(exp.getTime() / 1000),
  };

  // In production, use a real JWT library
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  const signature = `${encodedHeader}.${encodedPayload}.signature`;

  return signature;
}

/**
 * Verify JWT token (simplified)
 */
export function verifyJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Parse expiration string
 */
function parseExpiration(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 3600000; // Default 1 hour

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return value * (multipliers[unit as keyof typeof multipliers] || 3600000);
}

/**
 * Create idempotency key
 */
export function createIdempotencyKey(): string {
  return `idem_${crypto.randomUUID()}_${Date.now()}`;
}

/**
 * Store idempotent response
 */
export function storeIdempotentResponse(
  key: string,
  response: any,
  ttl: number = 3600000
): void {
  const now = new Date();
  idempotencyStore.set(key, {
    key,
    response,
    timestamp: now,
    expiresAt: new Date(now.getTime() + ttl),
  });
}

/**
 * Get idempotent response
 */
export function getIdempotentResponse(key: string): any | null {
  const entry = idempotencyStore.get(key);

  if (!entry) return null;

  const now = new Date();
  if (now > entry.expiresAt) {
    idempotencyStore.delete(key);
    return null;
  }

  return entry.response;
}

/**
 * Clear expired idempotency entries
 */
export function clearExpiredIdempotencyEntries(): void {
  const now = new Date();
  const keysToDelete: string[] = [];

  for (const [key, entry] of idempotencyStore.entries()) {
    if (now > entry.expiresAt) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => idempotencyStore.delete(key));
}

/**
 * Get idempotency stats
 */
export function getIdempotencyStats(): {
  total: number;
  expired: number;
} {
  const now = new Date();
  let expired = 0;

  for (const entry of idempotencyStore.values()) {
    if (now > entry.expiresAt) {
      expired++;
    }
  }

  return {
    total: idempotencyStore.size,
    expired,
  };
}

/**
 * Validate request with rate limit and idempotency
 */
export async function validateRequest(
  identifier: string,
  idempotencyKey?: string,
  rateLimitConfig?: RateLimitConfig
): Promise<{
  rateLimit: { allowed: boolean; remaining: number; resetTime: Date };
  idempotentResponse?: any;
}> {
  // Check rate limit
  const rateLimit = checkRateLimit(identifier, rateLimitConfig);

  // Check idempotency
  let idempotentResponse: any = null;
  if (idempotencyKey) {
    idempotentResponse = getIdempotentResponse(idempotencyKey);
  }

  return {
    rateLimit,
    idempotentResponse,
  };
}

/**
 * Store response for idempotency
 */
export function storeResponse(
  idempotencyKey: string,
  response: any,
  ttl?: number
): void {
  storeIdempotentResponse(idempotencyKey, response, ttl);
}

// Auto-cleanup expired entries every minute
setInterval(() => {
  clearExpiredIdempotencyEntries();
}, 60000);
