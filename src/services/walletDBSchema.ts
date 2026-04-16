// Wallet DB Schema
// Tables for wallet system

export const walletDBSchema = {
  tables: {
    wallets: `
      CREATE TABLE wallets (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        role ENUM('user', 'reseller', 'franchise') NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_role (role),
        INDEX idx_balance (balance)
      )
    `,

    wallet_transactions: `
      CREATE TABLE wallet_transactions (
        id VARCHAR(36) PRIMARY KEY,
        wallet_id VARCHAR(36) NOT NULL,
        type ENUM('credit', 'debit') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        source ENUM('order', 'commission', 'refund', 'topup', 'withdrawal') NOT NULL,
        source_id VARCHAR(50),
        status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        balance_after DECIMAL(15, 2) NOT NULL,
        metadata JSON,
        idempotency_key VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
        INDEX idx_wallet_id (wallet_id),
        INDEX idx_type (type),
        INDEX idx_source (source),
        INDEX idx_status (status),
        INDEX idx_idempotency_key (idempotency_key),
        INDEX idx_created_at (created_at)
      )
    `,
  },
};
