// Global Search DB Schema
// Search index table

export const globalSearchDBSchema = {
  tables: {
    search_index: `
      CREATE TABLE search_index (
        id VARCHAR(36) PRIMARY KEY,
        entity_id VARCHAR(50) NOT NULL,
        type ENUM('product', 'doc', 'page', 'user', 'order') NOT NULL,
        keywords JSON NOT NULL,
        weight DECIMAL(5, 2) DEFAULT 1.0,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        url VARCHAR(500) NOT NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_entity_id (entity_id),
        INDEX idx_type (type),
        INDEX idx_weight (weight),
        FULLTEXT idx_keywords (title, description)
      )
    `,

    search_analytics: `
      CREATE TABLE search_analytics (
        id VARCHAR(36) PRIMARY KEY,
        query VARCHAR(255) NOT NULL,
        results_count INT DEFAULT 0,
        user_id VARCHAR(50),
        ip_address VARCHAR(45),
        user_agent VARCHAR(500),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_query (query),
        INDEX idx_timestamp (timestamp),
        INDEX idx_user_id (user_id)
      )
    `,
  },
};
