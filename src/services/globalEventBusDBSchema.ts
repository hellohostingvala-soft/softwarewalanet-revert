// Global Event Bus DB Schema
// Event stream table

export const globalEventBusDBSchema = {
  tables: {
    event_stream: `
      CREATE TABLE event_stream (
        id VARCHAR(36) PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        source VARCHAR(100) NOT NULL,
        payload JSON NOT NULL,
        metadata JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_source (source),
        INDEX idx_timestamp (timestamp)
      )
    `,
  },
};
