// Locking Micro Service
// Row version etag + distributed lock + deadlock detector

interface LockEntry {
  key: string;
  holder: string;
  acquiredAt: number;
  expiresAt: number;
  fencingToken: string;
}

interface DeadlockInfo {
  transaction1: string;
  transaction2: string;
  resource: string;
  detectedAt: number;
}

class LockingService {
  private locks: Map<string, LockEntry>;
  private deadlocks: DeadlockInfo[];
  private waitGraph: Map<string, Set<string>>;

  constructor() {
    this.locks = new Map();
    this.deadlocks = [];
    this.waitGraph = new Map();
  }

  /**
   * Acquire distributed lock
   */
  acquireLock(
    key: string,
    holder: string,
    ttl: number = 30000
  ): { acquired: boolean; fencingToken?: string } {
    const now = Date.now();
    const existing = this.locks.get(key);

    // Check if lock is expired
    if (existing && now < existing.expiresAt) {
      // Lock is held by another holder
      if (existing.holder !== holder) {
        this.addToWaitGraph(holder, existing.holder);
        this.detectDeadlock();
        return { acquired: false };
      }
      // Same holder, extend lock
      existing.expiresAt = now + ttl;
      return { acquired: true, fencingToken: existing.fencingToken };
    }

    // Acquire new lock
    const fencingToken = this.generateFencingToken();
    const lock: LockEntry = {
      key,
      holder,
      acquiredAt: now,
      expiresAt: now + ttl,
      fencingToken,
    };

    this.locks.set(key, lock);
    this.removeFromWaitGraph(holder);

    return { acquired: true, fencingToken };
  }

  /**
   * Release lock
   */
  releaseLock(key: string, holder: string, fencingToken: string): boolean {
    const lock = this.locks.get(key);

    if (!lock) {
      return false;
    }

    // Verify holder and fencing token
    if (lock.holder !== holder || lock.fencingToken !== fencingToken) {
      console.warn(`[Lock] Invalid release attempt for key: ${key}`);
      return false;
    }

    this.locks.delete(key);
    this.removeFromWaitGraph(holder);

    return true;
  }

  /**
   * Try acquire lock (non-blocking)
   */
  tryLock(
    key: string,
    holder: string,
    ttl: number = 30000
  ): { acquired: boolean; fencingToken?: string } {
    return this.acquireLock(key, holder, ttl);
  }

  /**
   * Acquire lock with timeout (blocking)
   */
  async acquireLockWithTimeout(
    key: string,
    holder: string,
    timeout: number = 5000,
    ttl: number = 30000
  ): Promise<{ acquired: boolean; fencingToken?: string }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = this.tryLock(key, holder, ttl);
      if (result.acquired) {
        return result;
      }

      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { acquired: false };
  }

  /**
   * Generate fencing token
   */
  private generateFencingToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Get lock holder
   */
  getLockHolder(key: string): string | null {
    const lock = this.locks.get(key);
    if (!lock) return null;

    const now = Date.now();
    if (now > lock.expiresAt) {
      this.locks.delete(key);
      return null;
    }

    return lock.holder;
  }

  /**
   * Check if lock is held
   */
  isLocked(key: string): boolean {
    const lock = this.locks.get(key);
    if (!lock) return false;

    const now = Date.now();
    if (now > lock.expiresAt) {
      this.locks.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Add to wait graph (for deadlock detection)
   */
  private addToWaitGraph(waiter: string, holder: string): void {
    if (!this.waitGraph.has(waiter)) {
      this.waitGraph.set(waiter, new Set());
    }
    this.waitGraph.get(waiter)!.add(holder);
  }

  /**
   * Remove from wait graph
   */
  private removeFromWaitGraph(holder: string): void {
    this.waitGraph.delete(holder);
    
    // Remove holder from other nodes' wait lists
    for (const [node, waitSet] of this.waitGraph.entries()) {
      waitSet.delete(holder);
    }
  }

  /**
   * Detect deadlock using wait-for graph
   */
  private detectDeadlock(): boolean {
    // Detect cycles in wait graph
    for (const [node, waitSet] of this.waitGraph.entries()) {
      if (this.hasCycle(node, new Set())) {
        console.warn(`[Lock] Deadlock detected involving: ${node}`);
        this.resolveDeadlock(node);
        return true;
      }
    }

    return false;
  }

  /**
   * Check for cycle in wait graph (DFS)
   */
  private hasCycle(node: string, visited: Set<string>): boolean {
    if (visited.has(node)) {
      return true; // Cycle found
    }

    visited.add(node);

    const waitSet = this.waitGraph.get(node);
    if (waitSet) {
      for (const neighbor of waitSet) {
        if (this.hasCycle(neighbor, visited)) {
          return true;
        }
      }
    }

    visited.delete(node);
    return false;
  }

  /**
   * Resolve deadlock (victim selection)
   */
  private resolveDeadlock(victim: string): void {
    // Release all locks held by victim
    const keysToRelease: string[] = [];

    for (const [key, lock] of this.locks.entries()) {
      if (lock.holder === victim) {
        keysToRelease.push(key);
      }
    }

    keysToRelease.forEach(key => {
      this.locks.delete(key);
    });

    this.removeFromWaitGraph(victim);

    // Log deadlock
    this.deadlocks.push({
      transaction1: victim,
      transaction2: 'unknown',
      resource: keysToRelease.join(','),
      detectedAt: Date.now(),
    });

    console.log(`[Lock] Deadlock resolved, victim: ${victim}, released locks: ${keysToRelease.join(', ')}`);
  }

  /**
   * Get deadlock history
   */
  getDeadlockHistory(): DeadlockInfo[] {
    return [...this.deadlocks];
  }

  /**
   * Get row version (etag)
   */
  getRowVersion(table: string, id: string): string {
    // In a real implementation, query the database for the row version
    // For simulation, generate a version based on table and id
    const version = this.hashString(`${table}:${id}:${Date.now()}`);
    return version;
  }

  /**
   * Check if row version matches
   */
  checkRowVersion(table: string, id: string, etag: string): boolean {
    const currentVersion = this.getRowVersion(table, id);
    return currentVersion === etag;
  }

  /**
   * Update row version
   */
  updateRowVersion(table: string, id: string): string {
    return this.getRowVersion(table, id);
  }

  /**
   * Optimistic lock check
   */
  optimisticLock<T>(
    table: string,
    id: string,
    expectedVersion: string,
    updateFn: () => T
  ): { success: boolean; result?: T; newVersion?: string } {
    if (!this.checkRowVersion(table, id, expectedVersion)) {
      return { success: false };
    }

    const result = updateFn();
    const newVersion = this.updateRowVersion(table, id);

    return { success: true, result, newVersion };
  }

  /**
   * Hash string for version generation
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Cleanup expired locks
   */
  cleanupExpiredLocks(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, lock] of this.locks.entries()) {
      if (now > lock.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      const lock = this.locks.get(key);
      if (lock) {
        this.removeFromWaitGraph(lock.holder);
      }
      this.locks.delete(key);
    });

    if (keysToDelete.length > 0) {
      console.log(`[Lock] Cleaned up ${keysToDelete.length} expired locks`);
    }

    return keysToDelete.length;
  }

  /**
   * Get lock stats
   */
  getLockStats(): {
    totalLocks: number;
    activeLocks: number;
    expiredLocks: number;
    deadlocksDetected: number;
  } {
    const now = Date.now();
    let expired = 0;

    for (const lock of this.locks.values()) {
      if (now > lock.expiresAt) {
        expired++;
      }
    }

    return {
      totalLocks: this.locks.size,
      activeLocks: this.locks.size - expired,
      expiredLocks: expired,
      deadlocksDetected: this.deadlocks.length,
    };
  }

  /**
   * Clear all locks (for testing)
   */
  clearAllLocks(): void {
    this.locks.clear();
    this.waitGraph.clear();
    this.deadlocks = [];
  }
}

// Singleton instance
const lockingService = new LockingService();

// Auto-cleanup expired locks every 10 seconds
setInterval(() => {
  lockingService.cleanupExpiredLocks();
}, 10000);

export default lockingService;
export { LockingService };
export type { LockEntry, DeadlockInfo };
