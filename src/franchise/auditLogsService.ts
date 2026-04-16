// Audit Logs Service
// full activity logs, who/what/when

type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'approve' | 'reject' | 'export' | 'import';
type AuditEntityType = 'user' | 'order' | 'lead' | 'invoice' | 'payment' | 'product' | 'employee' | 'settings' | 'dispute' | 'payout' | 'subscription';

interface AuditLog {
  id: string;
  franchiseId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  timestamp: number;
}

class AuditLogsService {
  private logs: Map<string, AuditLog>;

  constructor() {
    this.logs = new Map();
  }

  /**
   * Create audit log
   */
  createLog(
    franchiseId: string,
    userId: string,
    userName: string,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    entityName: string,
    description: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any
  ): AuditLog {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      franchiseId,
      userId,
      userName,
      action,
      entityType,
      entityId,
      entityName,
      description,
      ipAddress,
      userAgent,
      metadata,
      timestamp: Date.now(),
    };

    this.logs.set(log.id, log);
    console.log(`[Audit] ${action} on ${entityType} ${entityName} by ${userName}`);
    return log;
  }

  /**
   * Get logs by franchise
   */
  getLogsByFranchise(franchiseId: string, limit: number = 100): AuditLog[] {
    return Array.from(this.logs.values())
      .filter(l => l.franchiseId === franchiseId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId: string, limit: number = 100): AuditLog[] {
    return Array.from(this.logs.values())
      .filter(l => l.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get logs by entity
   */
  getLogsByEntity(entityType: AuditEntityType, entityId: string, limit: number = 100): AuditLog[] {
    return Array.from(this.logs.values())
      .filter(l => l.entityType === entityType && l.entityId === entityId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get logs by action
   */
  getLogsByAction(action: AuditAction, limit: number = 100): AuditLog[] {
    return Array.from(this.logs.values())
      .filter(l => l.action === action)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get logs by time range
   */
  getLogsByTimeRange(startDate: number, endDate: number, franchiseId?: string): AuditLog[] {
    let logs = Array.from(this.logs.values()).filter(
      l => l.timestamp >= startDate && l.timestamp <= endDate
    );

    if (franchiseId) {
      logs = logs.filter(l => l.franchiseId === franchiseId);
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get log by ID
   */
  getLog(logId: string): AuditLog | null {
    return this.logs.get(logId) || null;
  }

  /**
   * Search logs
   */
  searchLogs(query: string, franchiseId?: string, limit: number = 100): AuditLog[] {
    const lowerQuery = query.toLowerCase();
    let logs = Array.from(this.logs.values());

    if (franchiseId) {
      logs = logs.filter(l => l.franchiseId === franchiseId);
    }

    logs = logs.filter(
      l =>
        l.userName.toLowerCase().includes(lowerQuery) ||
        l.entityName.toLowerCase().includes(lowerQuery) ||
        l.description.toLowerCase().includes(lowerQuery) ||
        l.action.toLowerCase().includes(lowerQuery) ||
        l.entityType.toLowerCase().includes(lowerQuery)
    );

    return logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Get audit stats
   */
  getAuditStats(franchiseId?: string, startDate?: number, endDate?: number): {
    total: number;
    byAction: Record<AuditAction, number>;
    byEntityType: Record<AuditEntityType, number>;
    byUser: Record<string, number>;
  } {
    let logs = Array.from(this.logs.values());

    if (franchiseId) {
      logs = logs.filter(l => l.franchiseId === franchiseId);
    }

    if (startDate) {
      logs = logs.filter(l => l.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter(l => l.timestamp <= endDate);
    }

    const stats = {
      total: logs.length,
      byAction: {
        create: 0,
        update: 0,
        delete: 0,
        view: 0,
        login: 0,
        logout: 0,
        approve: 0,
        reject: 0,
        export: 0,
        import: 0,
      },
      byEntityType: {
        user: 0,
        order: 0,
        lead: 0,
        invoice: 0,
        payment: 0,
        product: 0,
        employee: 0,
        settings: 0,
        dispute: 0,
        payout: 0,
        subscription: 0,
      },
      byUser: {} as Record<string, number>,
    };

    for (const log of logs) {
      stats.byAction[log.action]++;
      stats.byEntityType[log.entityType]++;
      stats.byUser[log.userName] = (stats.byUser[log.userName] || 0) + 1;
    }

    return stats;
  }

  /**
   * Get recent activity for franchise
   */
  getRecentActivity(franchiseId: string, limit: number = 10): AuditLog[] {
    return this.getLogsByFranchise(franchiseId, limit);
  }

  /**
   * Get user activity summary
   */
  getUserActivitySummary(userId: string, startDate?: number, endDate?: number): {
    totalActions: number;
    actionsByType: Record<AuditAction, number>;
    entitiesByType: Record<AuditEntityType, number>;
  } {
    let logs = this.getLogsByUser(userId, 1000);

    if (startDate) {
      logs = logs.filter(l => l.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter(l => l.timestamp <= endDate);
    }

    const summary = {
      totalActions: logs.length,
      actionsByType: {
        create: 0,
        update: 0,
        delete: 0,
        view: 0,
        login: 0,
        logout: 0,
        approve: 0,
        reject: 0,
        export: 0,
        import: 0,
      },
      entitiesByType: {
        user: 0,
        order: 0,
        lead: 0,
        invoice: 0,
        payment: 0,
        product: 0,
        employee: 0,
        settings: 0,
        dispute: 0,
        payout: 0,
        subscription: 0,
      },
    };

    for (const log of logs) {
      summary.actionsByType[log.action]++;
      summary.entitiesByType[log.entityType]++;
    }

    return summary;
  }

  /**
   * Export logs to CSV
   */
  exportLogsToCSV(franchiseId: string, startDate?: number, endDate?: number): string {
    let logs = this.getLogsByFranchise(franchiseId, 10000);

    if (startDate) {
      logs = logs.filter(l => l.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter(l => l.timestamp <= endDate);
    }

    const headers = ['ID', 'User', 'Action', 'Entity Type', 'Entity Name', 'Description', 'IP Address', 'Timestamp'];
    const rows = logs.map(log => [
      log.id,
      log.userName,
      log.action,
      log.entityType,
      log.entityName,
      log.description,
      log.ipAddress || '',
      new Date(log.timestamp).toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csv;
  }

  /**
   * Delete log
   */
  deleteLog(logId: string): boolean {
    const log = this.logs.get(logId);
    if (!log) return false;

    this.logs.delete(logId);
    console.log(`[Audit] Deleted log ${logId}`);
    return true;
  }

  /**
   * Cleanup old logs (older than 1 year)
   */
  cleanupOldLogs(): number {
    const now = Date.now();
    const cutoff = now - (365 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, log] of this.logs.entries()) {
      if (log.timestamp < cutoff) {
        this.logs.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Audit] Cleaned up ${deletedCount} old logs`);
    }

    return deletedCount;
  }
}

const auditLogsService = new AuditLogsService();

// Auto-cleanup old logs monthly
setInterval(() => {
  auditLogsService.cleanupOldLogs();
}, 30 * 24 * 60 * 60 * 1000);

export default auditLogsService;
export { AuditLogsService };
export type { AuditLog, AuditAction, AuditEntityType };
