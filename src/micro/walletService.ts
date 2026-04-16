// Wallet Micro Service
// Atomic ledger append + balance = sum ledger + idempotent debit/credit

interface LedgerEntry {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  source: string;
  referenceId?: string;
  timestamp: number;
  version: number;
}

interface Wallet {
  id: string;
  userId: string;
  role: 'user' | 'reseller' | 'franchise';
  ledger: LedgerEntry[];
  createdAt: number;
  updatedAt: number;
}

class WalletService {
  private wallets: Map<string, Wallet>;
  private idempotencyStore: Map<string, { entryId: string; timestamp: number }>;

  constructor() {
    this.wallets = new Map();
    this.idempotencyStore = new Map();
  }

  /**
   * Get or create wallet
   */
  getOrCreateWallet(userId: string, role: 'user' | 'reseller' | 'franchise'): Wallet {
    let wallet = this.wallets.get(userId);

    if (!wallet) {
      wallet = {
        id: crypto.randomUUID(),
        userId,
        role,
        ledger: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.wallets.set(userId, wallet);
      console.log(`[Wallet] Created wallet for ${userId} (${role})`);
    }

    return wallet;
  }

  /**
   * Get wallet
   */
  getWallet(userId: string): Wallet | null {
    return this.wallets.get(userId) || null;
  }

  /**
   * Get balance (sum of ledger)
   */
  getBalance(userId: string): number {
    const wallet = this.wallets.get(userId);
    if (!wallet) return 0;

    // Balance = sum of all ledger entries
    return wallet.ledger.reduce((balance, entry) => {
      return balance + (entry.type === 'credit' ? entry.amount : -entry.amount);
    }, 0);
  }

  /**
   * Credit wallet (atomic append to ledger)
   */
  credit(
    userId: string,
    amount: number,
    source: string,
    referenceId?: string,
    idempotencyKey?: string
  ): { success: boolean; entryId?: string; error?: string } {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    // Check idempotency
    if (idempotencyKey) {
      const existing = this.idempotencyStore.get(idempotencyKey);
      if (existing) {
        console.log(`[Wallet] Idempotent credit skipped for key: ${idempotencyKey}`);
        return { success: true, entryId: existing.entryId };
      }
    }

    const wallet = this.getOrCreateWallet(userId, 'user');
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      walletId: wallet.id,
      type: 'credit',
      amount,
      source,
      referenceId,
      timestamp: Date.now(),
      version: wallet.ledger.length + 1,
    };

    // Atomic append to ledger
    wallet.ledger.push(entry);
    wallet.updatedAt = Date.now();
    this.wallets.set(userId, wallet);

    // Store idempotency key
    if (idempotencyKey) {
      this.idempotencyStore.set(idempotencyKey, {
        entryId: entry.id,
        timestamp: Date.now(),
      });
    }

    console.log(`[Wallet] Credited ${amount} to ${userId} (source: ${source})`);
    return { success: true, entryId: entry.id };
  }

  /**
   * Debit wallet (atomic append to ledger with balance check)
   */
  debit(
    userId: string,
    amount: number,
    source: string,
    referenceId?: string,
    idempotencyKey?: string
  ): { success: boolean; entryId?: string; error?: string } {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    // Check idempotency
    if (idempotencyKey) {
      const existing = this.idempotencyStore.get(idempotencyKey);
      if (existing) {
        console.log(`[Wallet] Idempotent debit skipped for key: ${idempotencyKey}`);
        return { success: true, entryId: existing.entryId };
      }
    }

    const wallet = this.wallets.get(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    // Check sufficient balance
    const currentBalance = this.getBalance(userId);
    if (currentBalance < amount) {
      return { success: false, error: `Insufficient balance: ${currentBalance} < ${amount}` };
    }

    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      walletId: wallet.id,
      type: 'debit',
      amount,
      source,
      referenceId,
      timestamp: Date.now(),
      version: wallet.ledger.length + 1,
    };

    // Atomic append to ledger
    wallet.ledger.push(entry);
    wallet.updatedAt = Date.now();
    this.wallets.set(userId, wallet);

    // Store idempotency key
    if (idempotencyKey) {
      this.idempotencyStore.set(idempotencyKey, {
        entryId: entry.id,
        timestamp: Date.now(),
      });
    }

    console.log(`[Wallet] Debited ${amount} from ${userId} (source: ${source})`);
    return { success: true, entryId: entry.id };
  }

  /**
   * Get ledger entries
   */
  getLedger(userId: string, limit?: number): LedgerEntry[] {
    const wallet = this.wallets.get(userId);
    if (!wallet) return [];

    const entries = [...wallet.ledger].reverse(); // Most recent first
    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Reconcile wallet balance
   */
  reconcileWallet(userId: string): {
    reconciled: boolean;
    calculatedBalance: number;
    ledgerCount: number;
    discrepancies?: string[];
  } {
    const wallet = this.wallets.get(userId);
    if (!wallet) {
      return {
        reconciled: false,
        calculatedBalance: 0,
        ledgerCount: 0,
      };
    }

    const calculatedBalance = this.getBalance(userId);
    const ledgerCount = wallet.ledger.length;
    const discrepancies: string[] = [];

    // Check for duplicate entries
    const entryIds = new Set<string>();
    for (const entry of wallet.ledger) {
      if (entryIds.has(entry.id)) {
        discrepancies.push(`Duplicate entry: ${entry.id}`);
      }
      entryIds.add(entry.id);
    }

    // Check version continuity
    for (let i = 0; i < wallet.ledger.length; i++) {
      if (wallet.ledger[i].version !== i + 1) {
        discrepancies.push(`Version mismatch at index ${i}: expected ${i + 1}, got ${wallet.ledger[i].version}`);
      }
    }

    return {
      reconciled: discrepancies.length === 0,
      calculatedBalance,
      ledgerCount,
      discrepancies: discrepancies.length > 0 ? discrepancies : undefined,
    };
  }

  /**
   * Transfer between wallets
   */
  transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    source: string,
    idempotencyKey?: string
  ): { success: boolean; error?: string } {
    const debitResult = this.debit(fromUserId, amount, source, undefined, idempotencyKey ? `${idempotencyKey}:debit` : undefined);
    if (!debitResult.success) {
      return { success: false, error: debitResult.error };
    }

    const creditResult = this.credit(toUserId, amount, source, undefined, idempotencyKey ? `${idempotencyKey}:credit` : undefined);
    if (!creditResult.success) {
      // Rollback debit
      this.credit(fromUserId, amount, `${source}:rollback`, debitResult.entryId);
      return { success: false, error: creditResult.error };
    }

    console.log(`[Wallet] Transferred ${amount} from ${fromUserId} to ${toUserId}`);
    return { success: true };
  }

  /**
   * Get wallet stats
   */
  getWalletStats(): {
    totalWallets: number;
    totalBalance: number;
    totalTransactions: number;
    byRole: Record<string, { count: number; balance: number }>;
  } {
    const byRole: Record<string, { count: number; balance: number }> = {};
    let totalBalance = 0;
    let totalTransactions = 0;

    for (const wallet of this.wallets.values()) {
      const balance = this.getBalance(wallet.userId);
      totalBalance += balance;
      totalTransactions += wallet.ledger.length;

      if (!byRole[wallet.role]) {
        byRole[wallet.role] = { count: 0, balance: 0 };
      }
      byRole[wallet.role].count++;
      byRole[wallet.role].balance += balance;
    }

    return {
      totalWallets: this.wallets.size,
      totalBalance,
      totalTransactions,
      byRole,
    };
  }

  /**
   * Cleanup expired idempotency keys
   */
  cleanupExpiredIdempotencyKeys(maxAge: number = 86400000): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.idempotencyStore.entries()) {
      if (now - entry.timestamp > maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.idempotencyStore.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[Wallet] Cleaned up ${keysToDelete.length} expired idempotency keys`);
    }

    return keysToDelete.length;
  }

  /**
   * Check balance before operation
   */
  checkBalance(userId: string, amount: number): { sufficient: boolean; currentBalance: number } {
    const currentBalance = this.getBalance(userId);
    return {
      sufficient: currentBalance >= amount,
      currentBalance,
    };
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(userId: string, limit: number = 50): Array<{
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    source: string;
    referenceId?: string;
    timestamp: number;
  }> {
    const ledger = this.getLedger(userId, limit);
    return ledger.map(entry => ({
      id: entry.id,
      type: entry.type,
      amount: entry.amount,
      source: entry.source,
      referenceId: entry.referenceId,
      timestamp: entry.timestamp,
    }));
  }

  /**
   * Reverse transaction (credit/debit reversal)
   */
  reverseTransaction(userId: string, entryId: string, reason: string): { success: boolean; error?: string } {
    const wallet = this.wallets.get(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    const entry = wallet.ledger.find(e => e.id === entryId);
    if (!entry) {
      return { success: false, error: 'Transaction not found' };
    }

    // Reverse the transaction
    if (entry.type === 'credit') {
      return this.debit(userId, entry.amount, `reversal:${reason}`, entryId);
    } else {
      return this.credit(userId, entry.amount, `reversal:${reason}`, entryId);
    }
  }
}

// Singleton instance
const walletService = new WalletService();

// Auto-cleanup expired idempotency keys every day
setInterval(() => {
  walletService.cleanupExpiredIdempotencyKeys();
}, 86400000);

export default walletService;
export { WalletService };
export type { LedgerEntry, Wallet };
