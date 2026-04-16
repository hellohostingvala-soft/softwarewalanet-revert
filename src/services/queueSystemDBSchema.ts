// Queue System DB Schema
// Job queue table

export const queueSystemDBSchema = {
  tables: {
    job_queue: `
      CREATE TABLE job_queue (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        payload JSON NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed', 'dead') DEFAULT 'pending',
        retry_count INT DEFAULT 0,
        max_retries INT DEFAULT 5,
        next_retry_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        failed_at TIMESTAMP NULL,
        error TEXT,
        metadata JSON,
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_next_retry_at (next_retry_at),
        INDEX idx_created_at (created_at)
      )
    `,
  },
};
