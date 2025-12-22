/**
 * Global Monitoring System
 * Multi-region uptime, latency heatmaps, fraud per region, SLA tracking
 * Alerts to 👑 BOSS on critical issues
 */

import { Region, regionManager, RegionHealth } from './region-manager';
import { trafficManager } from './traffic-manager';
import { disasterRecoveryManager } from './disaster-recovery';

export interface RegionMetrics {
  region: Region;
  uptime: number;
  latency: number;
  errorRate: number;
  slaCompliance: number;
  fraudScore: number;
  activeUsers: number;
  chatMessages: number;
  buzzerAlerts: number;
  walletTransactions: number;
  demoViews: number;
  lastUpdated: string;
}

export interface LatencyHeatmap {
  sourceRegion: Region;
  targetRegion: Region;
  latency: number;
  status: 'good' | 'degraded' | 'poor';
}

export interface SLAConfig {
  uptimeTarget: number;
  latencyTarget: number;
  errorRateTarget: number;
  escalationThreshold: number;
}

export interface GlobalAlert {
  id: string;
  type: 'uptime' | 'latency' | 'fraud' | 'sla' | 'security';
  severity: 'info' | 'warning' | 'critical';
  region?: Region;
  message: string;
  details: Record<string, any>;
  createdAt: string;
  acknowledgedAt?: string;
  escalatedToBoss: boolean;
}

const DEFAULT_SLA: SLAConfig = {
  uptimeTarget: 99.9,
  latencyTarget: 200,
  errorRateTarget: 0.1,
  escalationThreshold: 3
};

export class GlobalMonitor {
  private slaConfig: SLAConfig;
  private regionMetrics: Map<Region, RegionMetrics> = new Map();
  private latencyMatrix: Map<string, LatencyHeatmap> = new Map();
  private alerts: Map<string, GlobalAlert> = new Map();
  private alertCallbacks: Set<(alert: GlobalAlert) => void> = new Set();
  private slaBreaches: Map<Region, number> = new Map();

  constructor(slaConfig: Partial<SLAConfig> = {}) {
    this.slaConfig = { ...DEFAULT_SLA, ...slaConfig };
    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring
   */
  private initializeMonitoring(): void {
    regionManager.getActiveRegions().forEach(region => {
      this.regionMetrics.set(region.id, {
        region: region.id,
        uptime: 100,
        latency: 0,
        errorRate: 0,
        slaCompliance: 100,
        fraudScore: 0,
        activeUsers: 0,
        chatMessages: 0,
        buzzerAlerts: 0,
        walletTransactions: 0,
        demoViews: 0,
        lastUpdated: new Date().toISOString()
      });
      this.slaBreaches.set(region.id, 0);
    });

    // Build latency matrix
    this.buildLatencyMatrix();

    // Start periodic monitoring
    setInterval(() => this.collectMetrics(), 30000);
    setInterval(() => this.checkSLACompliance(), 60000);
  }

  /**
   * Build latency heatmap matrix
   */
  private buildLatencyMatrix(): void {
    const regions = regionManager.getActiveRegions();
    
    regions.forEach(source => {
      regions.forEach(target => {
        if (source.id !== target.id) {
          const key = `${source.id}:${target.id}`;
          const latency = this.estimateLatency(source.id, target.id);
          
          this.latencyMatrix.set(key, {
            sourceRegion: source.id,
            targetRegion: target.id,
            latency,
            status: latency < 100 ? 'good' : latency < 200 ? 'degraded' : 'poor'
          });
        }
      });
    });
  }

  /**
   * Estimate latency between regions
   */
  private estimateLatency(source: Region, target: Region): number {
    // Simplified latency estimation based on region distance
    const latencyMap: Record<string, number> = {
      'us-east:us-west': 70,
      'us-east:eu-west': 90,
      'us-east:asia-pacific': 180,
      'eu-west:eu-central': 30,
      'eu-west:asia-pacific': 150,
      'asia-pacific:asia-south': 50
    };

    const key = `${source}:${target}`;
    const reverseKey = `${target}:${source}`;
    
    return latencyMap[key] || latencyMap[reverseKey] || 100 + Math.random() * 100;
  }

  /**
   * Collect metrics from all regions
   */
  private async collectMetrics(): Promise<void> {
    const health = regionManager.getAllHealth();
    const traffic = trafficManager.getAllStats();

    health.forEach(h => {
      const metrics = this.regionMetrics.get(h.region);
      const trafficStats = traffic.find(t => t.region === h.region);
      
      if (metrics) {
        metrics.latency = h.latency;
        metrics.uptime = h.status === 'healthy' ? 100 : h.status === 'degraded' ? 95 : 0;
        metrics.errorRate = h.errorRate;
        metrics.activeUsers = h.activeConnections;
        
        if (trafficStats) {
          metrics.walletTransactions = trafficStats.requestsPerSecond;
        }
        
        metrics.lastUpdated = new Date().toISOString();
        this.regionMetrics.set(h.region, metrics);
      }
    });
  }

  /**
   * Check SLA compliance for all regions
   */
  private async checkSLACompliance(): Promise<void> {
    for (const [region, metrics] of this.regionMetrics.entries()) {
      const compliance = this.calculateSLACompliance(metrics);
      metrics.slaCompliance = compliance;
      
      if (compliance < 100) {
        const breaches = (this.slaBreaches.get(region) || 0) + 1;
        this.slaBreaches.set(region, breaches);

        if (breaches >= this.slaConfig.escalationThreshold) {
          await this.createAlert({
            type: 'sla',
            severity: 'critical',
            region,
            message: `SLA breach in ${region}: ${compliance}% compliance`,
            details: { metrics, breachCount: breaches },
            escalateToBoss: true
          });
        }
      } else {
        this.slaBreaches.set(region, 0);
      }
    }
  }

  /**
   * Calculate SLA compliance percentage
   */
  private calculateSLACompliance(metrics: RegionMetrics): number {
    let score = 100;
    
    if (metrics.uptime < this.slaConfig.uptimeTarget) {
      score -= (this.slaConfig.uptimeTarget - metrics.uptime) * 2;
    }
    if (metrics.latency > this.slaConfig.latencyTarget) {
      score -= (metrics.latency - this.slaConfig.latencyTarget) / 10;
    }
    if (metrics.errorRate > this.slaConfig.errorRateTarget) {
      score -= (metrics.errorRate - this.slaConfig.errorRateTarget) * 100;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Update fraud score for region
   */
  updateFraudScore(region: Region, score: number): void {
    const metrics = this.regionMetrics.get(region);
    if (metrics) {
      metrics.fraudScore = score;
      this.regionMetrics.set(region, metrics);

      if (score > 70) {
        this.createAlert({
          type: 'fraud',
          severity: score > 90 ? 'critical' : 'warning',
          region,
          message: `High fraud score detected in ${region}: ${score}`,
          details: { fraudScore: score },
          escalateToBoss: score > 90
        });
      }
    }
  }

  /**
   * Create global alert
   */
  async createAlert(params: {
    type: GlobalAlert['type'];
    severity: GlobalAlert['severity'];
    region?: Region;
    message: string;
    details: Record<string, any>;
    escalateToBoss?: boolean;
  }): Promise<GlobalAlert> {
    const alert: GlobalAlert = {
      id: crypto.randomUUID(),
      type: params.type,
      severity: params.severity,
      region: params.region,
      message: params.message,
      details: params.details,
      createdAt: new Date().toISOString(),
      escalatedToBoss: params.escalateToBoss || false
    };

    this.alerts.set(alert.id, alert);
    this.notifyAlertListeners(alert);

    if (params.escalateToBoss) {
      console.warn(`🚨 ALERT ESCALATED TO 👑 BOSS: ${params.message}`);
    }

    return alert;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledgedAt = new Date().toISOString();
      this.alerts.set(alertId, alert);
    }
  }

  /**
   * Get region metrics
   */
  getRegionMetrics(region: Region): RegionMetrics | undefined {
    return this.regionMetrics.get(region);
  }

  /**
   * Get all region metrics
   */
  getAllMetrics(): RegionMetrics[] {
    return Array.from(this.regionMetrics.values());
  }

  /**
   * Get latency heatmap
   */
  getLatencyHeatmap(): LatencyHeatmap[] {
    return Array.from(this.latencyMatrix.values());
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): GlobalAlert[] {
    return Array.from(this.alerts.values())
      .filter(a => !a.acknowledgedAt);
  }

  /**
   * Subscribe to alerts
   */
  onAlert(callback: (alert: GlobalAlert) => void): () => void {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  private notifyAlertListeners(alert: GlobalAlert): void {
    this.alertCallbacks.forEach(cb => cb(alert));
  }

  /**
   * Get global summary
   */
  getSummary(): {
    totalRegions: number;
    healthyRegions: number;
    avgUptime: number;
    avgLatency: number;
    avgSLA: number;
    activeAlerts: number;
    bossEscalations: number;
  } {
    const metrics = Array.from(this.regionMetrics.values());
    const health = regionManager.getAllHealth();
    
    return {
      totalRegions: metrics.length,
      healthyRegions: health.filter(h => h.status === 'healthy').length,
      avgUptime: metrics.reduce((sum, m) => sum + m.uptime, 0) / metrics.length,
      avgLatency: metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length,
      avgSLA: metrics.reduce((sum, m) => sum + m.slaCompliance, 0) / metrics.length,
      activeAlerts: this.getActiveAlerts().length,
      bossEscalations: Array.from(this.alerts.values()).filter(a => a.escalatedToBoss).length
    };
  }
}

export const globalMonitor = new GlobalMonitor();
export default GlobalMonitor;
