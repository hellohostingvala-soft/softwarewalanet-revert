// Self-Heal Detection Service
// anomaly scan + broken route/button detector + alerts

interface Anomaly {
  id: string;
  type: 'route' | 'button' | 'api' | 'database' | 'seo' | 'payment' | 'performance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  detectedAt: number;
  metadata?: Record<string, any>;
}

interface Alert {
  id: string;
  anomalyId: string;
  status: 'new' | 'acknowledged' | 'resolved';
  sentAt: number;
  resolvedAt?: number;
}

class SelfHealDetectionService {
  private anomalies: Map<string, Anomaly>;
  private alerts: Map<string, Alert>;
  private routeRegistry: Set<string>;
  private buttonRegistry: Set<string>;

  constructor() {
    this.anomalies = new Map();
    this.alerts = new Map();
    this.routeRegistry = new Set();
    this.buttonRegistry = new Set();
  }

  /**
   * Register route
   */
  registerRoute(path: string): void {
    this.routeRegistry.add(path);
  }

  /**
   * Register button
   */
  registerButton(buttonId: string): void {
    this.buttonRegistry.add(buttonId);
  }

  /**
   * Scan for broken routes
   */
  scanBrokenRoutes(): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    // Check if routes in registry actually exist (simulated check)
    for (const route of this.routeRegistry) {
      // In production, this would check if the route handler exists
      const isBroken = this.checkRouteHealth(route);
      
      if (isBroken) {
        const anomaly: Anomaly = {
          id: crypto.randomUUID(),
          type: 'route',
          severity: 'high',
          description: `Broken route detected: ${route}`,
          location: route,
          detectedAt: Date.now(),
        };
        
        this.anomalies.set(anomaly.id, anomaly);
        anomalies.push(anomaly);
        this.createAlert(anomaly.id);
      }
    }

    if (anomalies.length > 0) {
      console.log(`[SelfHeal Detection] Found ${anomalies.length} broken routes`);
    }

    return anomalies;
  }

  /**
   * Check route health (simulated)
   */
  private checkRouteHealth(route: string): boolean {
    // In production, this would actually test the route
    // For now, simulate occasional failures
    return false;
  }

  /**
   * Scan for broken buttons
   */
  scanBrokenButtons(): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    for (const button of this.buttonRegistry) {
      const isBroken = this.checkButtonHealth(button);
      
      if (isBroken) {
        const anomaly: Anomaly = {
          id: crypto.randomUUID(),
          type: 'button',
          severity: 'medium',
          description: `Broken button detected: ${button}`,
          location: button,
          detectedAt: Date.now(),
        };
        
        this.anomalies.set(anomaly.id, anomaly);
        anomalies.push(anomaly);
        this.createAlert(anomaly.id);
      }
    }

    if (anomalies.length > 0) {
      console.log(`[SelfHeal Detection] Found ${anomalies.length} broken buttons`);
    }

    return anomalies;
  }

  /**
   * Check button health (simulated)
   */
  private checkButtonHealth(buttonId: string): boolean {
    // In production, this would check if the button handler exists
    return false;
  }

  /**
   * Scan for API anomalies
   */
  scanAPIAnomalies(apiMetrics: Array<{ endpoint: string; errorRate: number; latency: number }>): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    for (const metric of apiMetrics) {
      if (metric.errorRate > 0.05) { // 5% error rate threshold
        const anomaly: Anomaly = {
          id: crypto.randomUUID(),
          type: 'api',
          severity: metric.errorRate > 0.2 ? 'critical' : 'high',
          description: `High error rate on ${metric.endpoint}: ${(metric.errorRate * 100).toFixed(1)}%`,
          location: metric.endpoint,
          detectedAt: Date.now(),
          metadata: { errorRate: metric.errorRate, latency: metric.latency },
        };
        
        this.anomalies.set(anomaly.id, anomaly);
        anomalies.push(anomaly);
        this.createAlert(anomaly.id);
      }

      if (metric.latency > 5000) { // 5 second latency threshold
        const anomaly: Anomaly = {
          id: crypto.randomUUID(),
          type: 'performance',
          severity: metric.latency > 10000 ? 'high' : 'medium',
          description: `High latency on ${metric.endpoint}: ${metric.latency}ms`,
          location: metric.endpoint,
          detectedAt: Date.now(),
          metadata: { latency: metric.latency, errorRate: metric.errorRate },
        };
        
        this.anomalies.set(anomaly.id, anomaly);
        anomalies.push(anomaly);
        this.createAlert(anomaly.id);
      }
    }

    if (anomalies.length > 0) {
      console.log(`[SelfHeal Detection] Found ${anomalies.length} API anomalies`);
    }

    return anomalies;
  }

  /**
   * Scan for database anomalies
   */
  scanDatabaseAnomalies(dbMetrics: { connectionErrors: number; slowQueries: number; deadlocks: number }): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    if (dbMetrics.connectionErrors > 10) {
      const anomaly: Anomaly = {
        id: crypto.randomUUID(),
        type: 'database',
        severity: 'critical',
        description: `High connection errors: ${dbMetrics.connectionErrors}`,
        location: 'database',
        detectedAt: Date.now(),
        metadata: dbMetrics,
      };
      
      this.anomalies.set(anomaly.id, anomaly);
      anomalies.push(anomaly);
      this.createAlert(anomaly.id);
    }

    if (dbMetrics.slowQueries > 5) {
      const anomaly: Anomaly = {
        id: crypto.randomUUID(),
        type: 'performance',
        severity: 'medium',
        description: `Slow queries detected: ${dbMetrics.slowQueries}`,
        location: 'database',
        detectedAt: Date.now(),
        metadata: dbMetrics,
      };
      
      this.anomalies.set(anomaly.id, anomaly);
      anomalies.push(anomaly);
      this.createAlert(anomaly.id);
    }

    if (dbMetrics.deadlocks > 0) {
      const anomaly: Anomaly = {
        id: crypto.randomUUID(),
        type: 'database',
        severity: 'high',
        description: `Database deadlocks: ${dbMetrics.deadlocks}`,
        location: 'database',
        detectedAt: Date.now(),
        metadata: dbMetrics,
      };
      
      this.anomalies.set(anomaly.id, anomaly);
      anomalies.push(anomaly);
      this.createAlert(anomaly.id);
    }

    if (anomalies.length > 0) {
      console.log(`[SelfHeal Detection] Found ${anomalies.length} database anomalies`);
    }

    return anomalies;
  }

  /**
   * Scan for SEO anomalies
   */
  scanSEOAnomalies(seoMetrics: Array<{ page: string; missingMeta: boolean; lowRanking: boolean; brokenLinks: number }>): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    for (const metric of seoMetrics) {
      if (metric.missingMeta) {
        const anomaly: Anomaly = {
          id: crypto.randomUUID(),
          type: 'seo',
          severity: 'high',
          description: `Missing meta tags on ${metric.page}`,
          location: metric.page,
          detectedAt: Date.now(),
          metadata: metric,
        };
        
        this.anomalies.set(anomaly.id, anomaly);
        anomalies.push(anomaly);
        this.createAlert(anomaly.id);
      }

      if (metric.lowRanking) {
        const anomaly: Anomaly = {
          id: crypto.randomUUID(),
          type: 'seo',
          severity: 'medium',
          description: `Low ranking on ${metric.page}`,
          location: metric.page,
          detectedAt: Date.now(),
          metadata: metric,
        };
        
        this.anomalies.set(anomaly.id, anomaly);
        anomalies.push(anomaly);
        this.createAlert(anomaly.id);
      }

      if (metric.brokenLinks > 0) {
        const anomaly: Anomaly = {
          id: crypto.randomUUID(),
          type: 'seo',
          severity: 'medium',
          description: `Broken links on ${metric.page}: ${metric.brokenLinks}`,
          location: metric.page,
          detectedAt: Date.now(),
          metadata: metric,
        };
        
        this.anomalies.set(anomaly.id, anomaly);
        anomalies.push(anomaly);
        this.createAlert(anomaly.id);
      }
    }

    if (anomalies.length > 0) {
      console.log(`[SelfHeal Detection] Found ${anomalies.length} SEO anomalies`);
    }

    return anomalies;
  }

  /**
   * Scan for payment anomalies
   */
  scanPaymentAnomalies(paymentMetrics: { failedPayments: number; mismatchedAmounts: number; stuckTransactions: number }): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    if (paymentMetrics.failedPayments > 5) {
      const anomaly: Anomaly = {
        id: crypto.randomUUID(),
        type: 'payment',
        severity: 'critical',
        description: `High failed payment rate: ${paymentMetrics.failedPayments}`,
        location: 'payment',
        detectedAt: Date.now(),
        metadata: paymentMetrics,
      };
      
      this.anomalies.set(anomaly.id, anomaly);
      anomalies.push(anomaly);
      this.createAlert(anomaly.id);
    }

    if (paymentMetrics.mismatchedAmounts > 0) {
      const anomaly: Anomaly = {
        id: crypto.randomUUID(),
        type: 'payment',
        severity: 'high',
        description: `Mismatched payment amounts: ${paymentMetrics.mismatchedAmounts}`,
        location: 'payment',
        detectedAt: Date.now(),
        metadata: paymentMetrics,
      };
      
      this.anomalies.set(anomaly.id, anomaly);
      anomalies.push(anomaly);
      this.createAlert(anomaly.id);
    }

    if (paymentMetrics.stuckTransactions > 0) {
      const anomaly: Anomaly = {
        id: crypto.randomUUID(),
        type: 'payment',
        severity: 'medium',
        description: `Stuck transactions: ${paymentMetrics.stuckTransactions}`,
        location: 'payment',
        detectedAt: Date.now(),
        metadata: paymentMetrics,
      };
      
      this.anomalies.set(anomaly.id, anomaly);
      anomalies.push(anomaly);
      this.createAlert(anomaly.id);
    }

    if (anomalies.length > 0) {
      console.log(`[SelfHeal Detection] Found ${anomalies.length} payment anomalies`);
    }

    return anomalies;
  }

  /**
   * Run comprehensive anomaly scan
   */
  runComprehensiveScan(metrics: {
    api?: Array<{ endpoint: string; errorRate: number; latency: number }>;
    database?: { connectionErrors: number; slowQueries: number; deadlocks: number };
    seo?: Array<{ page: string; missingMeta: boolean; lowRanking: boolean; brokenLinks: number }>;
    payment?: { failedPayments: number; mismatchedAmounts: number; stuckTransactions: number };
  }): {
    totalAnomalies: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  } {
    const allAnomalies: Anomaly[] = [];
    
    allAnomalies.push(...this.scanBrokenRoutes());
    allAnomalies.push(...this.scanBrokenButtons());
    
    if (metrics.api) {
      allAnomalies.push(...this.scanAPIAnomalies(metrics.api));
    }
    
    if (metrics.database) {
      allAnomalies.push(...this.scanDatabaseAnomalies(metrics.database));
    }
    
    if (metrics.seo) {
      allAnomalies.push(...this.scanSEOAnomalies(metrics.seo));
    }
    
    if (metrics.payment) {
      allAnomalies.push(...this.scanPaymentAnomalies(metrics.payment));
    }

    const bySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const byType: Record<string, number> = {};

    for (const anomaly of allAnomalies) {
      bySeverity[anomaly.severity]++;
      byType[anomaly.type] = (byType[anomaly.type] || 0) + 1;
    }

    console.log(`[SelfHeal Detection] Comprehensive scan complete: ${allAnomalies.length} anomalies`);
    
    return {
      totalAnomalies: allAnomalies.length,
      bySeverity,
      byType,
    };
  }

  /**
   * Create alert for anomaly
   */
  private createAlert(anomalyId: string): void {
    const alert: Alert = {
      id: crypto.randomUUID(),
      anomalyId,
      status: 'new',
      sentAt: Date.now(),
    };

    this.alerts.set(alert.id, alert);

    // In production, send notification
    console.log(`[SelfHeal Detection] Alert created for anomaly ${anomalyId}`);
  }

  /**
   * Get anomaly by ID
   */
  getAnomaly(anomalyId: string): Anomaly | null {
    return this.anomalies.get(anomalyId) || null;
  }

  /**
   * Get all anomalies
   */
  getAllAnomalies(): Anomaly[] {
    return Array.from(this.anomalies.values());
  }

  /**
   * Get anomalies by type
   */
  getAnomaliesByType(type: Anomaly['type']): Anomaly[] {
    return Array.from(this.anomalies.values()).filter(a => a.type === type);
  }

  /**
   * Get anomalies by severity
   */
  getAnomaliesBySeverity(severity: Anomaly['severity']): Anomaly[] {
    return Array.from(this.anomalies.values()).filter(a => a.severity === severity);
  }

  /**
   * Resolve anomaly
   */
  resolveAnomaly(anomalyId: string): { success: boolean; error?: string } {
    const anomaly = this.anomalies.get(anomalyId);
    if (!anomaly) {
      return { success: false, error: 'Anomaly not found' };
    }

    // Mark associated alerts as resolved
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.anomalyId === anomalyId) {
        alert.status = 'resolved';
        alert.resolvedAt = Date.now();
        this.alerts.set(alertId, alert);
      }
    }

    // Remove anomaly
    this.anomalies.delete(anomalyId);

    console.log(`[SelfHeal Detection] Resolved anomaly ${anomalyId}`);
    return { success: true };
  }

  /**
   * Get alerts
   */
  getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get detection stats
   */
  getDetectionStats(): {
    totalAnomalies: number;
    totalAlerts: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  } {
    const bySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const byType: Record<string, number> = {};

    for (const anomaly of this.anomalies.values()) {
      bySeverity[anomaly.severity]++;
      byType[anomaly.type] = (byType[anomaly.type] || 0) + 1;
    }

    return {
      totalAnomalies: this.anomalies.size,
      totalAlerts: this.alerts.size,
      bySeverity,
      byType,
    };
  }

  /**
   * Cleanup old anomalies (older than 7 days)
   */
  cleanupOldAnomalies(): number {
    const now = Date.now();
    const cutoff = now - (7 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, anomaly] of this.anomalies.entries()) {
      if (anomaly.detectedAt < cutoff) {
        this.anomalies.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[SelfHeal Detection] Cleaned up ${deletedCount} old anomalies`);
    }

    return deletedCount;
  }
}

const selfHealDetectionService = new SelfHealDetectionService();

// Auto-run comprehensive scan hourly
setInterval(() => {
  selfHealDetectionService.runComprehensiveScan({});
}, 3600000);

// Auto-cleanup old anomalies daily
setInterval(() => {
  selfHealDetectionService.cleanupOldAnomalies();
}, 86400000);

export default selfHealDetectionService;
export { SelfHealDetectionService };
export type { Anomaly, Alert };
