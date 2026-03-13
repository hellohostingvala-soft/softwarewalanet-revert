/**
 * Observability
 * Central metrics aggregation, region-specific dashboards,
 * predictive SLA breach alerts, and deployment impact analysis.
 */

import { globalRegionManager } from './region-manager';
import { healthMonitor, RegionSnapshot } from './health-monitor';
import { failoverEngine, FailoverEvent } from './failover-engine';
import { disasterRecovery } from './disaster-recovery';

// ============================================================================
// Types
// ============================================================================

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface ObservabilityAlert {
  id: string;
  type:
    | 'sla_breach'
    | 'sla_predicted_breach'
    | 'anomaly'
    | 'failover'
    | 'replication_lag'
    | 'deployment';
  severity: AlertSeverity;
  regionCode?: string;
  message: string;
  details: Record<string, unknown>;
  createdAt: string;
  acknowledgedAt?: string;
}

export interface RegionDashboard {
  regionCode: string;
  regionName: string;
  status: RegionSnapshot['status'];
  healthScore: number;
  latencyMs: number;
  errorRate: number;
  throughputRps: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  replicationLagSeconds: number;
  slaCompliance: number;      // 0-100 %
  activeAlerts: number;
  lastUpdated: string;
}

export interface GlobalSummary {
  timestamp: string;
  totalRegions: number;
  healthyRegions: number;
  degradedRegions: number;
  offlineRegions: number;
  avgHealthScore: number;
  avgLatencyMs: number;
  avgErrorRate: number;
  activeFailovers: number;
  activeAlerts: number;
  slaCompliant: boolean;
  rpoCompliant: boolean;
}

export interface SLAConfig {
  uptimeTarget: number;       // e.g. 99.99
  latencyTargetMs: number;
  errorRateTarget: number;    // fraction e.g. 0.001
  breachPredictionWindowMs: number;
}

export interface DeploymentImpact {
  deploymentId: string;
  regionCode: string;
  version: string;
  latencyDeltaMs: number;
  errorRateDelta: number;
  healthScoreDelta: number;
  assessment: 'positive' | 'neutral' | 'negative';
  recommendation: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SLA: SLAConfig = {
  uptimeTarget: 99.99,
  latencyTargetMs: 200,
  errorRateTarget: 0.001,
  breachPredictionWindowMs: 5 * 60 * 1000,  // 5 minutes look-ahead
};

// ============================================================================
// Observability class
// ============================================================================

export class Observability {
  private sla: SLAConfig;
  private alerts: Map<string, ObservabilityAlert> = new Map();
  private alertListeners: Set<(alert: ObservabilityAlert) => void> = new Set();
  private deploymentSnapshots: Map<string, RegionSnapshot> = new Map();

  constructor(sla: Partial<SLAConfig> = {}) {
    this.sla = { ...DEFAULT_SLA, ...sla };
    this.subscribeToHealthEvents();
    this.subscribeToFailoverEvents();
    this.subscribeToDRAlerts();
  }

  // -------------------------------------------------------------------------
  // Dashboards
  // -------------------------------------------------------------------------

  getRegionDashboard(regionCode: string): RegionDashboard | undefined {
    const region  = globalRegionManager.getRegion(regionCode);
    const health  = globalRegionManager.getHealthScore(regionCode);
    const snap    = healthMonitor.getLatestSnapshot(regionCode);
    const repState = disasterRecovery.getReplicationState(regionCode);

    if (!region || !health) return undefined;

    const slaCompliance = this.computeSLACompliance(snap);
    const activeAlerts = Array.from(this.alerts.values())
      .filter(a => a.regionCode === regionCode && !a.acknowledgedAt).length;

    return {
      regionCode,
      regionName: region.name,
      status: health.status,
      healthScore: health.score,
      latencyMs: health.latencyMs,
      errorRate: health.errorRate,
      throughputRps: health.throughputRps,
      cpuUsage:    snap?.system.cpuUsage     ?? 0,
      memoryUsage: snap?.system.memoryUsage  ?? 0,
      diskUsage:   snap?.system.diskUsage    ?? 0,
      activeConnections: snap?.app.activeConnections ?? 0,
      replicationLagSeconds: repState?.lag ?? 0,
      slaCompliance,
      activeAlerts,
      lastUpdated: health.lastChecked,
    };
  }

  getAllDashboards(): RegionDashboard[] {
    return globalRegionManager.getActiveRegions()
      .map(r => this.getRegionDashboard(r.regionCode))
      .filter((d): d is RegionDashboard => !!d);
  }

  // -------------------------------------------------------------------------
  // Global summary
  // -------------------------------------------------------------------------

  getGlobalSummary(): GlobalSummary {
    const dashboards = this.getAllDashboards();
    const healthScores  = dashboards.map(d => d.healthScore);
    const latencies     = dashboards.map(d => d.latencyMs);
    const errorRates    = dashboards.map(d => d.errorRate);

    const avg = (arr: number[]): number =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const sla = disasterRecovery.getSLASummary();
    const activeAlerts = Array.from(this.alerts.values())
      .filter(a => !a.acknowledgedAt).length;

    return {
      timestamp: new Date().toISOString(),
      totalRegions:    dashboards.length,
      healthyRegions:  dashboards.filter(d => d.status === 'healthy').length,
      degradedRegions: dashboards.filter(d => d.status === 'degraded').length,
      offlineRegions:  dashboards.filter(d => d.status === 'offline').length,
      avgHealthScore:  Math.round(avg(healthScores)),
      avgLatencyMs:    Math.round(avg(latencies)),
      avgErrorRate:    avg(errorRates),
      activeFailovers: failoverEngine.getActiveFailovers().length,
      activeAlerts,
      slaCompliant:    dashboards.every(d => d.slaCompliance >= 95),
      rpoCompliant:    sla.rpoCompliant,
    };
  }

  // -------------------------------------------------------------------------
  // SLA compliance
  // -------------------------------------------------------------------------

  private computeSLACompliance(snap?: RegionSnapshot): number {
    if (!snap) return 100;
    let score = 100;

    // Latency contribution
    if (snap.app.latencyMs > this.sla.latencyTargetMs) {
      score -= Math.min(30, ((snap.app.latencyMs - this.sla.latencyTargetMs) / this.sla.latencyTargetMs) * 30);
    }
    // Error rate contribution
    if (snap.app.errorRate > this.sla.errorRateTarget) {
      score -= Math.min(50, ((snap.app.errorRate - this.sla.errorRateTarget) / this.sla.errorRateTarget) * 50);
    }
    // Health score contribution
    if (snap.healthScore < 80) {
      score -= (80 - snap.healthScore) * 0.5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  checkSLABreaches(): ObservabilityAlert[] {
    const breaches: ObservabilityAlert[] = [];
    const snapshots = healthMonitor.getAllLatestSnapshots();

    for (const snap of snapshots) {
      const compliance = this.computeSLACompliance(snap);
      if (compliance < 95) {
        const alert = this.createAlert({
          type: 'sla_breach',
          severity: compliance < 70 ? 'critical' : 'warning',
          regionCode: snap.regionCode,
          message: `SLA compliance ${compliance}% in ${snap.regionCode}`,
          details: {
            compliance,
            latencyMs: snap.app.latencyMs,
            errorRate: snap.app.errorRate,
            healthScore: snap.healthScore,
          },
        });
        breaches.push(alert);
      }

      // Predictive SLA breach
      if (snap.predictedFailure && snap.predictedFailureEta !== undefined) {
        const alert = this.createAlert({
          type: 'sla_predicted_breach',
          severity: snap.predictedFailureEta < 60 ? 'critical' : 'warning',
          regionCode: snap.regionCode,
          message: `Predicted failure in ${snap.regionCode} within ${snap.predictedFailureEta}s`,
          details: { eta: snap.predictedFailureEta, healthScore: snap.healthScore },
        });
        breaches.push(alert);
      }
    }

    return breaches;
  }

  // -------------------------------------------------------------------------
  // Deployment impact analysis
  // -------------------------------------------------------------------------

  recordPreDeploymentSnapshot(deploymentId: string, regionCode: string): void {
    const snap = healthMonitor.getLatestSnapshot(regionCode);
    if (snap) {
      this.deploymentSnapshots.set(`${deploymentId}:${regionCode}`, snap);
    }
  }

  analyzeDeploymentImpact(
    deploymentId: string,
    regionCode: string,
    version: string,
  ): DeploymentImpact | undefined {
    const pre  = this.deploymentSnapshots.get(`${deploymentId}:${regionCode}`);
    const post = healthMonitor.getLatestSnapshot(regionCode);
    if (!pre || !post) return undefined;

    const latencyDelta    = post.app.latencyMs    - pre.app.latencyMs;
    const errorRateDelta  = post.app.errorRate     - pre.app.errorRate;
    const healthDelta     = post.healthScore        - pre.healthScore;

    let assessment: DeploymentImpact['assessment'] = 'neutral';
    if (healthDelta >= 5 || latencyDelta < -20) assessment = 'positive';
    if (healthDelta <= -10 || latencyDelta > 50 || errorRateDelta > 0.01) assessment = 'negative';

    const recommendation =
      assessment === 'positive' ? 'Deployment successful – continue rollout' :
      assessment === 'negative' ? 'Consider rollback – performance degraded' :
      'No significant impact detected';

    const impact: DeploymentImpact = {
      deploymentId,
      regionCode,
      version,
      latencyDeltaMs: Math.round(latencyDelta),
      errorRateDelta,
      healthScoreDelta: Math.round(healthDelta),
      assessment,
      recommendation,
    };

    if (assessment === 'negative') {
      this.createAlert({
        type: 'deployment',
        severity: 'warning',
        regionCode,
        message: `Deployment ${deploymentId} degraded performance in ${regionCode}`,
        details: impact as unknown as Record<string, unknown>,
      });
    }

    return impact;
  }

  // -------------------------------------------------------------------------
  // Alert management
  // -------------------------------------------------------------------------

  createAlert(params: {
    type: ObservabilityAlert['type'];
    severity: AlertSeverity;
    regionCode?: string;
    message: string;
    details: Record<string, unknown>;
  }): ObservabilityAlert {
    const alert: ObservabilityAlert = {
      id: crypto.randomUUID(),
      ...params,
      createdAt: new Date().toISOString(),
    };
    this.alerts.set(alert.id, alert);
    this.alertListeners.forEach(cb => cb(alert));
    return alert;
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledgedAt = new Date().toISOString();
      this.alerts.set(alertId, alert);
    }
  }

  getActiveAlerts(): ObservabilityAlert[] {
    return Array.from(this.alerts.values()).filter(a => !a.acknowledgedAt);
  }

  getAllAlerts(): ObservabilityAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  onAlert(callback: (alert: ObservabilityAlert) => void): () => void {
    this.alertListeners.add(callback);
    return () => this.alertListeners.delete(callback);
  }

  // -------------------------------------------------------------------------
  // Internal subscriptions
  // -------------------------------------------------------------------------

  private subscribeToHealthEvents(): void {
    healthMonitor.onHealthEvent(event => {
      if (event.type === 'anomaly_detected') {
        this.createAlert({
          type: 'anomaly',
          severity: 'warning',
          regionCode: event.regionCode,
          message: `Anomaly detected in ${event.regionCode}: ${event.snapshot.anomalyReason}`,
          details: {
            healthScore: event.snapshot.healthScore,
            reason: event.snapshot.anomalyReason,
          },
        });
      }
    });
  }

  private subscribeToFailoverEvents(): void {
    failoverEngine.onFailoverEvent((event: FailoverEvent) => {
      this.createAlert({
        type: 'failover',
        severity: event.status === 'failed' ? 'critical' : 'warning',
        regionCode: event.sourceRegion,
        message: `Failover ${event.status}: ${event.sourceRegion} → ${event.targetRegion ?? 'none'}`,
        details: {
          eventType: event.eventType,
          status: event.status,
          rtoSeconds: event.rtoAchievedSeconds,
          rpoSeconds: event.rpoAchievedSeconds,
        },
      });
    });
  }

  private subscribeToDRAlerts(): void {
    disasterRecovery.onAlert((type, detail) => {
      this.createAlert({
        type: type.includes('replication') ? 'replication_lag' : 'sla_breach',
        severity: 'critical',
        message: detail,
        details: { drAlertType: type },
      });
    });
  }
}

export const observability = new Observability();
export default Observability;
