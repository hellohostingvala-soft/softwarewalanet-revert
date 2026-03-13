// src/lib/security/rate-limiter.ts
// Minimal, syntactically-correct TypeScript rate limiter compatible with Vite builds.
// Exports a factory: createRateLimiter(options) -> { consume, getUsage, expressMiddleware, nextApiHandler, edgeCheck }

type RedisLikeClient = {
  incr: (key: string) => Promise<number>;
  pttl?: (key: string) => Promise<number>; // returns milliseconds or -1
  expire?: (key: string, seconds: number) => Promise<number>;
};

export interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  prefix?: string;
  redisClient?: RedisLikeClient | null;
  cleanupIntervalMs?: number;
}

type InMemoryEntry = {
  count: number;
  expiresAt: number;
};

export function createRateLimiter(options?: RateLimiterOptions) {
  const {
    windowMs = 60_000,
    max = 60,
    prefix = 'rl:',
    redisClient = null,
    cleanupIntervalMs = 60_000
  } = options || {};

  const store = new Map<string, InMemoryEntry>();

  if (cleanupIntervalMs > 0) {
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [k, v] of store.entries()) {
        if (v.expiresAt <= now) store.delete(k);
      }
    }, cleanupIntervalMs);
    if (typeof (timer as any).unref === 'function') (timer as any).unref();
  }

  async function consume(key: string) {
    const k = `${prefix}${key}`;

    if (redisClient) {
      try {
        const current = await redisClient.incr(k);
        let pttlMs = -1;

        if (typeof redisClient.pttl === 'function') {
          const maybe = await redisClient.pttl(k);
          if (typeof maybe === 'number') pttlMs = maybe;
        }

        if ((current === 1 || pttlMs <= 0) && typeof redisClient.expire === 'function') {
          await redisClient.expire(k, Math.ceil(windowMs / 1000));
          pttlMs = windowMs;
        }

        const reset = Date.now() + (pttlMs >= 0 ? pttlMs : windowMs);
        const allowed = current <= max;
        const remaining = Math.max(0, max - current);

        return { allowed, remaining, reset };
      } catch (err) {
        // Fallback to in-memory on Redis error
      }
    }

    const now = Date.now();
    const entry = store.get(k);
    if (!entry || entry.expiresAt <= now) {
      store.set(k, { count: 1, expiresAt: now + windowMs });
      return { allowed: 1 <= max, remaining: Math.max(0, max - 1), reset: now + windowMs };
    }

    entry.count += 1;
    store.set(k, entry);
    return { allowed: entry.count <= max, remaining: Math.max(0, max - entry.count), reset: entry.expiresAt };
  }

  function getUsage(key: string) {
    const k = `${prefix}${key}`;
    if (redisClient) return null;
    const e = store.get(k);
    if (!e) return { count: 0, reset: Date.now() };
    return { count: e.count, reset: e.expiresAt };
  }

  function expressMiddleware(opts?: { identifierHeader?: string }) {
    const identifierHeader = opts?.identifierHeader ?? 'x-forwarded-for';
    return async function (req: any, res: any, next: any) {
      try {
        const ipHeader =
          req.headers?.[identifierHeader] ||
          req.headers?.['x-real-ip'] ||
          req.ip ||
          req.connection?.remoteAddress ||
          'unknown';
        const ip = Array.isArray(ipHeader) ? String(ipHeader[0]) : String(ipHeader);
        const result = await consume(ip);

        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(result.remaining));
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.reset / 1000)));

        if (!result.allowed) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
          return;
        }
        return next();
      } catch (err) {
        return next();
      }
    };
  }

  function nextApiHandler(
    handler: (req: any, res: any) => any | Promise<any>,
    opts?: { identifierHeader?: string }
  ) {
    const identifierHeader = opts?.identifierHeader ?? 'x-forwarded-for';
    return async function (req: any, res: any) {
      try {
        const ipHeader =
          req.headers?.[identifierHeader] ||
          req.headers?.['x-real-ip'] ||
          req.socket?.remoteAddress ||
          req.ip ||
          'unknown';
        const ip = Array.isArray(ipHeader) ? String(ipHeader[0]) : String(ipHeader);
        const result = await consume(ip);

        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(result.remaining));
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.reset / 1000)));

        if (!result.allowed) {
          if (typeof res.status === 'function' && typeof res.json === 'function') {
            res.status(429).json({ error: 'Rate limit exceeded' });
          } else {
            res.statusCode = 429;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
          }
          return;
        }
        return handler(req, res);
      } catch (err) {
        return handler(req, res);
      }
    };
  }

  async function edgeCheck(request: any, identifierHeader = 'x-forwarded-for') {
    const ipHeader =
      (request && request.headers && (request.headers.get?.(identifierHeader) ?? request.headers[identifierHeader])) ||
      (request && request.headers && (request.headers.get?.('x-real-ip') ?? request.headers['x-real-ip'])) ||
      'unknown';
    const key = String(ipHeader);
    const result = await consume(key);

    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(max));
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(Math.ceil(result.reset / 1000)));

    return { allowed: result.allowed, headers, remaining: result.remaining, reset: result.reset };
  }

  return {
    consume,
    getUsage,
    expressMiddleware,
    nextApiHandler,
    edgeCheck
  };
}

export default createRateLimiter;
