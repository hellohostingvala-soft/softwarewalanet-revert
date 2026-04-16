// Wallet Service
// Complete wallet system with tables, APIs, checkout integration

export interface Wallet {
  id: string;
  userId: string;
  role: 'user' | 'reseller' | 'franchise';
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  source: 'order' | 'commission' | 'refund' | 'topup' | 'withdrawal';
  sourceId?: string;
  status: 'pending' | 'completed' | 'failed';
  balanceAfter: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage
const wallets: Map<string, Wallet> = new Map();
const walletTransactions: Map<string, WalletTransaction[]> = new Map();

/**
 * Get wallet by user ID
 */
export function getWallet(userId: string): Wallet | null {
  return wallets.get(userId) || null;
}

/**
 * Create wallet for user
 */
export function createWallet(userId: string, role: 'user' | 'reseller' | 'franchise'): Wallet {
  const wallet: Wallet = {
    id: crypto.randomUUID(),
    userId,
    role,
    balance: 0,
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  wallets.set(userId, wallet);
  walletTransactions.set(wallet.id, []);
  
  // Sync to control panel
  syncToControlPanel('wallet_created', wallet);
  
  return wallet;
}

/**
 * Add funds to wallet (credit)
 */
export function creditWallet(
  walletId: string,
  amount: number,
  source: WalletTransaction['source'],
  sourceId?: string,
  metadata?: any
): WalletTransaction {
  const wallet = Array.from(wallets.values()).find(w => w.id === walletId);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  const balanceAfter = wallet.balance + amount;
  wallet.balance = balanceAfter;
  wallet.updatedAt = new Date();

  const transaction: WalletTransaction = {
    id: crypto.randomUUID(),
    walletId,
    type: 'credit',
    amount,
    source,
    sourceId,
    status: 'completed',
    balanceAfter,
    metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transactions = walletTransactions.get(walletId) || [];
  transactions.push(transaction);
  walletTransactions.set(walletId, transactions);

  // Sync to control panel
  syncToControlPanel('wallet_credited', { walletId, amount, balanceAfter });

  return transaction;
}

/**
 * Deduct funds from wallet (debit)
 */
export function debitWallet(
  walletId: string,
  amount: number,
  source: WalletTransaction['source'],
  sourceId?: string,
  metadata?: any
): WalletTransaction {
  const wallet = Array.from(wallets.values()).find(w => w.id === walletId);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  const balanceAfter = wallet.balance - amount;
  wallet.balance = balanceAfter;
  wallet.updatedAt = new Date();

  const transaction: WalletTransaction = {
    id: crypto.randomUUID(),
    walletId,
    type: 'debit',
    amount,
    source,
    sourceId,
    status: 'completed',
    balanceAfter,
    metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transactions = walletTransactions.get(walletId) || [];
  transactions.push(transaction);
  walletTransactions.set(walletId, transactions);

  // Sync to control panel
  syncToControlPanel('wallet_debited', { walletId, amount, balanceAfter });

  return transaction;
}

/**
 * Get wallet transactions
 */
export function getWalletTransactions(walletId: string): WalletTransaction[] {
  return walletTransactions.get(walletId) || [];
}

/**
 * Check wallet balance
 */
export function checkBalance(walletId: string, amount: number): boolean {
  const wallet = Array.from(wallets.values()).find(w => w.id === walletId);
  if (!wallet) return false;
  return wallet.balance >= amount;
}

/**
 * Idempotent transaction
 */
export function createIdempotentTransaction(
  idempotencyKey: string,
  walletId: string,
  type: 'credit' | 'debit',
  amount: number,
  source: WalletTransaction['source'],
  sourceId?: string
): WalletTransaction {
  // Check if transaction already exists with this key
  const allTransactions = Array.from(walletTransactions.values()).flat();
  const existing = allTransactions.find(t => t.metadata?.idempotencyKey === idempotencyKey);
  
  if (existing) {
    return existing;
  }

  // Create new transaction
  const metadata = { idempotencyKey };
  
  if (type === 'credit') {
    return creditWallet(walletId, amount, source, sourceId, metadata);
  } else {
    return debitWallet(walletId, amount, source, sourceId, metadata);
  }
}

/**
 * Sync to control panel
 */
function syncToControlPanel(event: string, data: any): void {
  console.log(`[Wallet Service] Syncing to Control Panel: ${event}`, data);
  // This will integrate with the event bus for real-time sync
}

/**
 * Wallet reconciliation (double-entry)
 */
export function reconcileWallet(walletId: string): {
  balance: number;
  transactionSum: number;
  matched: boolean;
} {
  const transactions = walletTransactions.get(walletId) || [];
  const wallet = Array.from(wallets.values()).find(w => w.id === walletId);
  
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const transactionSum = transactions.reduce((sum, t) => {
    return t.type === 'credit' ? sum + t.amount : sum - t.amount;
  }, 0);

  return {
    balance: wallet.balance,
    transactionSum,
    matched: Math.abs(wallet.balance - transactionSum) < 0.01,
  };
}
