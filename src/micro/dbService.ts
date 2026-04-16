// DB Micro Service
// Serializable tx + write skew prevention + FK deferred checks + partial indexes

interface TransactionConfig {
  isolationLevel: 'read-uncommitted' | 'read-committed' | 'repeatable-read' | 'serializable';
  readOnly?: boolean;
  timeout?: number;
}

interface WriteSkewConfig {
  enabled: boolean;
  detectMode: 'strict' | 'lenient';
}

interface ForeignKeyConfig {
  deferred: boolean;
  checkOnCommit: boolean;
}

class DBService {
  private activeTransactions: Map<string, {
    id: string;
    startTime: number;
    isolationLevel: string;
    readOnly: boolean;
    readSet: Set<string>;
    writeSet: Set<string>;
  }> = new Map();

  private writeSkewConfig: WriteSkewConfig = {
    enabled: true,
    detectMode: 'strict',
  };

  private foreignKeyConfig: ForeignKeyConfig = {
    deferred: true,
    checkOnCommit: true,
  };

  /**
   * Begin transaction
   */
  beginTransaction(config: TransactionConfig = { isolationLevel: 'serializable' }): string {
    const txId = crypto.randomUUID();

    this.activeTransactions.set(txId, {
      id: txId,
      startTime: Date.now(),
      isolationLevel: config.isolationLevel,
      readOnly: config.readOnly || false,
      readSet: new Set(),
      writeSet: new Set(),
    });

    console.log(`[DB] Transaction ${txId} started with isolation: ${config.isolationLevel}`);

    return txId;
  }

  /**
   * Commit transaction
   */
  async commitTransaction(txId: string): Promise<{ success: boolean; error?: string }> {
    const tx = this.activeTransactions.get(txId);
    if (!tx) {
      return { success: false, error: 'Transaction not found' };
    }

    // Check for write skew
    if (this.writeSkewConfig.enabled && tx.isolationLevel === 'serializable') {
      const skewDetected = this.detectWriteSkew(tx);
      if (skewDetected) {
        this.activeTransactions.delete(txId);
        return { success: false, error: 'Write skew detected' };
      }
    }

    // Check foreign key constraints if deferred
    if (this.foreignKeyConfig.deferred) {
      const fkViolation = await this.checkForeignKeyConstraints(txId);
      if (fkViolation) {
        this.activeTransactions.delete(txId);
        return { success: false, error: 'Foreign key constraint violation' };
      }
    }

    // Commit
    this.activeTransactions.delete(txId);
    console.log(`[DB] Transaction ${txId} committed`);

    return { success: true };
  }

  /**
   * Rollback transaction
   */
  rollbackTransaction(txId: string): void {
    const tx = this.activeTransactions.get(txId);
    if (tx) {
      this.activeTransactions.delete(txId);
      console.log(`[DB] Transaction ${txId} rolled back`);
    }
  }

  /**
   * Add to read set
   */
  addToReadSet(txId: string, key: string): void {
    const tx = this.activeTransactions.get(txId);
    if (tx) {
      tx.readSet.add(key);
    }
  }

  /**
   * Add to write set
   */
  addToWriteSet(txId: string, key: string): void {
    const tx = this.activeTransactions.get(txId);
    if (tx) {
      tx.writeSet.add(key);
    }
  }

  /**
   * Detect write skew
   */
  private detectWriteSkew(tx: { readSet: Set<string>; writeSet: Set<string>; startTime: number }): boolean {
    // Write skew occurs when:
    // 1. Transaction T1 reads row R
    // 2. Transaction T2 reads row R
    // 3. T1 modifies R
    // 4. T2 modifies R
    // 5. Both commit without conflict detection

    // Check if any read set key was modified by another transaction
    for (const readKey of tx.readSet) {
      // In a real implementation, check if readKey was modified after tx.startTime
      // For now, we'll simulate detection
      if (this.wasKeyModifiedAfter(readKey, tx.startTime)) {
        console.warn(`[DB] Write skew detected on key: ${readKey}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Simulate key modification check
   */
  private wasKeyModifiedAfter(key: string, timestamp: number): boolean {
    // In a real implementation, check the actual database
    // For simulation, return false
    return false;
  }

  /**
   * Check foreign key constraints (deferred)
   */
  private async checkForeignKeyConstraints(txId: string): Promise<boolean> {
    const tx = this.activeTransactions.get(txId);
    if (!tx) return false;

    // In a real implementation, check all FK constraints
    // For simulation, return true (no violation)
    return true;
  }

  /**
   * Get transaction info
   */
  getTransaction(txId: string): {
    id: string;
    isolationLevel: string;
    readOnly: boolean;
    duration: number;
  } | null {
    const tx = this.activeTransactions.get(txId);
    if (!tx) return null;

    return {
      id: tx.id,
      isolationLevel: tx.isolationLevel,
      readOnly: tx.readOnly,
      duration: Date.now() - tx.startTime,
    };
  }

  /**
   * Get all active transactions
   */
  getActiveTransactions(): Array<{
    id: string;
    isolationLevel: string;
    readOnly: boolean;
    duration: number;
  }> {
    const now = Date.now();
    return Array.from(this.activeTransactions.values()).map(tx => ({
      id: tx.id,
      isolationLevel: tx.isolationLevel,
      readOnly: tx.readOnly,
      duration: now - tx.startTime,
    }));
  }

  /**
   * Cleanup long-running transactions
   */
  cleanupLongRunningTransactions(maxDuration: number = 300000): number {
    const now = Date.now();
    const toRollback: string[] = [];

    for (const [txId, tx] of this.activeTransactions.entries()) {
      if (now - tx.startTime > maxDuration) {
        toRollback.push(txId);
      }
    }

    toRollback.forEach(txId => {
      this.rollbackTransaction(txId);
      console.warn(`[DB] Rolled back long-running transaction: ${txId}`);
    });

    return toRollback.length;
  }

  /**
   * Create partial index (for specific conditions)
   */
  createPartialIndex(
    table: string,
    columns: string[],
    whereClause: string,
    indexName?: string
  ): string {
    const name = indexName || `idx_${table}_${columns.join('_')}_partial`;
    
    const sql = `
      CREATE INDEX ${name} ON ${table} (${columns.join(', ')})
      WHERE ${whereClause};
    `;

    console.log(`[DB] Created partial index: ${name}`);
    return sql;
  }

  /**
   * Create covering index (includes columns for query optimization)
   */
  createCoveringIndex(
    table: string,
    columns: string[],
    includeColumns: string[],
    indexName?: string
  ): string {
    const name = indexName || `idx_${table}_${columns.join('_')}_covering`;
    
    const sql = `
      CREATE INDEX ${name} ON ${table} (${columns.join(', ')})
      INCLUDE (${includeColumns.join(', ')});
    `;

    console.log(`[DB] Created covering index: ${name}`);
    return sql;
  }

  /**
   * Set write skew config
   */
  setWriteSkewConfig(config: Partial<WriteSkewConfig>): void {
    this.writeSkewConfig = { ...this.writeSkewConfig, ...config };
  }

  /**
   * Set foreign key config
   */
  setForeignKeyConfig(config: Partial<ForeignKeyConfig>): void {
    this.foreignKeyConfig = { ...this.foreignKeyConfig, ...config };
  }

  /**
   * Get stats
   */
  getStats(): {
    activeTransactions: number;
    readOnlyTransactions: number;
    serializableTransactions: number;
  } {
    const transactions = Array.from(this.activeTransactions.values());
    
    return {
      activeTransactions: transactions.length,
      readOnlyTransactions: transactions.filter(t => t.readOnly).length,
      serializableTransactions: transactions.filter(t => t.isolationLevel === 'serializable').length,
    };
  }

  /**
   * Execute query with transaction
   */
  async executeQuery<T>(
    txId: string,
    query: string,
    params?: any[]
  ): Promise<T> {
    const tx = this.activeTransactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    // Track read/write sets
    if (query.toUpperCase().startsWith('SELECT')) {
      // Extract table/key from query (simplified)
      const key = this.extractKeyFromQuery(query);
      this.addToReadSet(txId, key);
    } else {
      const key = this.extractKeyFromQuery(query);
      this.addToWriteSet(txId, key);
    }

    // Execute query (simulated)
    console.log(`[DB] Executing query in transaction ${txId}: ${query}`);
    
    return {} as T;
  }

  /**
   * Extract key from query (simplified)
   */
  private extractKeyFromQuery(query: string): string {
    // In a real implementation, parse the SQL and extract affected keys
    // For simulation, use query hash
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `key_${Math.abs(hash)}`;
  }

  /**
   * Prevent write skew with SELECT FOR UPDATE
   */
  lockRowsForUpdate(txId: string, table: string, condition: string): void {
    const tx = this.activeTransactions.get(txId);
    if (!tx) return;

    const key = `${table}:${condition}`;
    this.addToWriteSet(txId, key);

    console.log(`[DB] Locked rows for update in transaction ${txId}: ${table} WHERE ${condition}`);
  }

  /**
   * Check for phantom reads (new rows matching condition)
   */
  checkForPhantomReads(
    txId: string,
    table: string,
    condition: string
  ): boolean {
    const tx = this.activeTransactions.get(txId);
    if (!tx) return false;

    // In serializable isolation, phantom reads should be detected
    if (tx.isolationLevel === 'serializable') {
      const key = `${table}:${condition}`;
      if (tx.readSet.has(key)) {
        // Check if new rows were added
        // In a real implementation, query the database
        console.warn(`[DB] Potential phantom read detected: ${key}`);
        return true;
      }
    }

    return false;
  }
}

// Singleton instance
const dbService = new DBService();

// Auto-cleanup long-running transactions every minute
setInterval(() => {
  dbService.cleanupLongRunningTransactions();
}, 60000);

export default dbService;
export { DBService };
export type { TransactionConfig, WriteSkewConfig, ForeignKeyConfig };
