// Cache Layer Service
// Redis keys + TTL + invalidation

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number; // Time to live in milliseconds
  createdAt: Date;
  expiresAt: Date;
  metadata?: any;
}

// In-memory cache (simulating Redis)
const cache: Map<string, CacheEntry> = new Map();

/**
 * Set cache value with TTL
 */
export function setCache(key: string, value: any, ttl: number = 3600000): void {
  const entry: CacheEntry = {
    key,
    value,
    ttl,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + ttl),
  };

  cache.set(key, entry);

  console.log(`[Cache] Set: ${key} (TTL: ${ttl}ms)`);
}

/**
 * Get cache value
 */
export function getCache<T = any>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expiresAt.getTime()) {
    cache.delete(key);
    console.log(`[Cache] Expired: ${key}`);
    return null;
  }

  console.log(`[Cache] Hit: ${key}`);
  return entry.value as T;
}

/**
 * Delete cache key
 */
export function deleteCache(key: string): void {
  cache.delete(key);
  console.log(`[Cache] Deleted: ${key}`);
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern: string): void {
  const keysToDelete: string[] = [];

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cache.delete(key));
  console.log(`[Cache] Invalidated pattern: ${pattern} (${keysToDelete.length} keys)`);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
  console.log('[Cache] Cleared all');
}

/**
 * Get cache stats
 */
export function getCacheStats(): {
  total: number;
  expired: number;
  size: number;
} {
  const now = Date.now();
  let expired = 0;
  let size = 0;

  for (const entry of cache.values()) {
    if (now > entry.expiresAt.getTime()) {
      expired++;
    }
    size += JSON.stringify(entry.value).length;
  }

  return {
    total: cache.size,
    expired,
    size,
  };
}

/**
 * Cache wrapper with SWR (Stale-While-Revalidate)
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600000,
  staleWhileRevalidate: number = 60000
): Promise<T> {
  // Try to get from cache
  const cached = getCache<T>(key);

  if (cached) {
    // Check if stale
    const entry = cache.get(key);
    if (entry && Date.now() > (entry.expiresAt.getTime() - staleWhileRevalidate)) {
      // Revalidate in background
      fetcher().then(fresh => {
        setCache(key, fresh, ttl);
      }).catch(error => {
        console.error(`[Cache] Revalidation failed for ${key}:`, error);
      });
    }

    return cached;
  }

  // Fetch fresh data
  const fresh = await fetcher();
  setCache(key, fresh, ttl);

  return fresh;
}

/**
 * Product cache helpers
 */
export const productCacheKeys = {
  list: 'product:list',
  detail: (id: string) => `product:detail:${id}`,
  search: (query: string) => `search:${query}`,
};

/**
 * Invalidate product cache
 */
export function invalidateProductCache(productId?: string): void {
  if (productId) {
    deleteCache(productCacheKeys.detail(productId));
  }
  invalidateCache(productCacheKeys.list);
}

/**
 * User cache helpers
 */
export const userCacheKeys = {
  detail: (id: string) => `user:detail:${id}`,
  permissions: (id: string) => `user:permissions:${id}`,
};

/**
 * Invalidate user cache
 */
export function invalidateUserCache(userId: string): void {
  deleteCache(userCacheKeys.detail(userId));
  deleteCache(userCacheKeys.permissions(userId));
}

/**
 * Cache cleanup (remove expired entries)
 */
export function cleanupCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt.getTime()) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cache.delete(key));

  if (keysToDelete.length > 0) {
    console.log(`[Cache] Cleanup: Removed ${keysToDelete.length} expired entries`);
  }
}

// Auto-cleanup every minute
setInterval(cleanupCache, 60000);
