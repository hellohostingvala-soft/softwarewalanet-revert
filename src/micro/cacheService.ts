// Cache Micro Service
// Consistent hash ring + SWR + jitter + stampede mutex + negative cache

interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
  staleAt: number;
  isNegative: boolean;
}

interface HashRingNode {
  key: string;
  hash: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private hashRing: HashRingNode[];
  private virtualNodes: number;
  private stampedeMutex: Map<string, Promise<any>>;
  private negativeCacheTTL: number;
  private defaultTTL: number;
  private staleWhileRevalidateTTL: number;

  constructor() {
    this.cache = new Map();
    this.hashRing = [];
    this.virtualNodes = 150;
    this.stampedeMutex = new Map();
    this.negativeCacheTTL = 60000; // 1 minute
    this.defaultTTL = 300000; // 5 minutes
    this.staleWhileRevalidateTTL = 3600000; // 1 hour
  }

  /**
   * Generate hash for consistent hashing
   */
  private hash(key: string, virtualIndex: number = 0): number {
    const combined = `${key}:${virtualIndex}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Initialize consistent hash ring with nodes
   */
  initializeHashRing(nodes: string[]): void {
    this.hashRing = [];

    for (const node of nodes) {
      for (let i = 0; i < this.virtualNodes; i++) {
        this.hashRing.push({
          key: node,
          hash: this.hash(node, i),
        });
      }
    }

    // Sort by hash
    this.hashRing.sort((a, b) => a.hash - b.hash);

    console.log(`[Cache] Hash ring initialized with ${nodes.length} nodes, ${this.hashRing.length} virtual nodes`);
  }

  /**
   * Get node for key using consistent hashing
   */
  getNodeForKey(key: string): string | null {
    if (this.hashRing.length === 0) return null;

    const hash = this.hash(key);

    // Find first node with hash >= key hash
    for (const node of this.hashRing) {
      if (node.hash >= hash) {
        return node.key;
      }
    }

    // Wrap around to first node
    return this.hashRing[0].key;
  }

  /**
   * Set cache value
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTTL, swr: boolean = true): void {
    const now = Date.now();
    const expiresAt = now + ttl;
    const staleAt = swr ? now + this.staleWhileRevalidateTTL : expiresAt;

    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt,
      staleAt,
      isNegative: value === null,
    };

    this.cache.set(key, entry);
  }

  /**
   * Get cache value with SWR
   */
  async get<T>(
    key: string,
    fetcher?: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T | null> {
    const entry = this.cache.get(key);
    const now = Date.now();

    // Cache hit and not expired
    if (entry && now < entry.expiresAt) {
      // Check if stale but within SWR window
      if (now >= entry.staleAt && fetcher) {
        // Background revalidation
        this.backgroundRevalidate(key, fetcher, ttl);
      }
      return entry.value;
    }

    // Negative cache (cached null)
    if (entry && entry.isNegative && now < entry.expiresAt) {
      return null;
    }

    // Cache miss or expired
    if (fetcher) {
      return await this.fetchWithStampedeProtection(key, fetcher, ttl);
    }

    return null;
  }

  /**
   * Fetch with stampede protection
   */
  private async fetchWithStampedeProtection<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    // Check if there's an ongoing request for this key
    const ongoing = this.stampedeMutex.get(key);
    if (ongoing) {
      return ongoing;
    }

    // Create new promise and store it
    const promise = (async () => {
      try {
        const value = await fetcher();
        
        // Add jitter to TTL (±10%)
        const jitteredTTL = ttl * (0.9 + Math.random() * 0.2);
        
        this.set(key, value, jitteredTTL);
        return value;
      } catch (error) {
        // Cache negative result
        this.set(key, null, this.negativeCacheTTL, false);
        throw error;
      } finally {
        // Remove from mutex after completion
        setTimeout(() => {
          this.stampedeMutex.delete(key);
        }, 100);
      }
    })();

    this.stampedeMutex.set(key, promise);
    return promise;
  }

  /**
   * Background revalidation (SWR)
   */
  private async backgroundRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const value = await fetcher();
      this.set(key, value, ttl);
    } catch (error) {
      console.error(`[Cache] Background revalidation failed for key: ${key}`, error);
    }
  }

  /**
   * Delete cache key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate cache by pattern
   */
  invalidate(pattern: string): number {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    console.log(`[Cache] Invalidated ${keysToDelete.length} keys matching pattern: ${pattern}`);
    return keysToDelete.length;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache] Cache cleared');
  }

  /**
   * Get cache stats
   */
  getStats(): {
    total: number;
    expired: number;
    stale: number;
    negative: number;
    hitRate: number;
  } {
    const now = Date.now();
    let expired = 0;
    let stale = 0;
    let negative = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else if (now >= entry.staleAt) {
        stale++;
      }
      if (entry.isNegative) {
        negative++;
      }
    }

    return {
      total: this.cache.size,
      expired,
      stale,
      negative,
      hitRate: 0, // Would need to track hits/misses
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanupExpired(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[Cache] Cleaned up ${keysToDelete.length} expired entries`);
    }

    return keysToDelete.length;
  }

  /**
   * Get or set with fetcher
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    return await this.fetchWithStampedeProtection(key, fetcher, ttl);
  }

  /**
   * Get multiple keys
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      result.set(key, value);
    }

    return result;
  }

  /**
   * Set multiple keys
   */
  setMany<T>(entries: Map<string, T>, ttl: number = this.defaultTTL): void {
    for (const [key, value] of entries.entries()) {
      this.set(key, value, ttl);
    }
  }

  /**
   * Get hash ring info
   */
  getHashRingInfo(): {
    nodes: number;
    virtualNodes: number;
    distribution: Map<string, number>;
  } {
    const distribution = new Map<string, number>();

    for (const node of this.hashRing) {
      distribution.set(node.key, (distribution.get(node.key) || 0) + 1);
    }

    return {
      nodes: new Set(this.hashRing.map(n => n.key)).size,
      virtualNodes: this.hashRing.length,
      distribution,
    };
  }

  /**
   * Warm up cache with initial data
   */
  async warmUp<T>(entries: Map<string, Promise<T>>, ttl: number = this.defaultTTL): Promise<void> {
    for (const [key, promise] of entries.entries()) {
      try {
        const value = await promise;
        this.set(key, value, ttl);
      } catch (error) {
        console.error(`[Cache] Failed to warm up key: ${key}`, error);
      }
    }
  }

  /**
   * Set default TTL
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  /**
   * Set SWR TTL
   */
  setSWRTTL(ttl: number): void {
    this.staleWhileRevalidateTTL = ttl;
  }

  /**
   * Set negative cache TTL
   */
  setNegativeCacheTTL(ttl: number): void {
    this.negativeCacheTTL = ttl;
  }
}

// Singleton instance
const cacheService = new CacheService();

// Initialize with default nodes (simulated cache servers)
cacheService.initializeHashRing(['cache-1', 'cache-2', 'cache-3']);

// Auto-cleanup expired entries every minute
setInterval(() => {
  cacheService.cleanupExpired();
}, 60000);

export default cacheService;
export { CacheService };
export type { CacheEntry, HashRingNode };
