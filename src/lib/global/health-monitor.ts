/**
 * HealthMonitor
 * Real-time health checking, anomaly detection, and predictive failure
 * detection for the multi-region failover & auto-healing system.
 *
 * Key capabilities:
 * - Polls every 10 seconds (configurable)
 * - Multi-layered scoring: CPU, memory, disk, network, application
 * - Baseline comparison for anomaly detection
 * - Trend analysis for predictive failure detection
 */

import { globalRegionManager, RegionHealthScore } from './region-manager';

// ============================================================================
// Types
// ============================================================================

export interface SystemMetrics {
  cpuUsage: number;         // 0-100 %
  memoryUsage: number;      // 0-100 %
  diskUsage: number;        // 0-100 %
  networkInMbps: number;
  networkOutMbps: number;
}

export interface AppMetrics {
  latencyMs: number;
  errorRate: number;        // 0-1 fraction
  throughputRps: number;
  activeConnections: number;
}

export interface RegionSnapshot {
  regionCode: string;
  timestamp: string;
  system: SystemMetrics;
  app: AppMetrics;
  healthScore: number;      // 0-100
  status: RegionHealthScore['status'];
  anomalyDetected: boolean;
  anomalyReason?: string;
  predictedFailure: boolean;
  predictedFailureEta?: number; // seconds until predicted failure
}

export interface HealthCheckConfig {
  intervalMs: number;
  historySize: number;          // snapshots retained per region
  anomalyZScore: number;        // z-score threshold for anomaly
  predictionWindowSize: number; // number of recent points for trend
  degradedThreshold: number;    // health score below this = degraded
  offlineThreshold: number;     // health score below this = offline
}

export type HealthEventType =
  | 'status_changed'
  | 'anomaly_detected'
  | 'predicted_failure'
  | 'recovered';

export interface HealthEvent {
  type: HealthEventType;
  regionCode: string;
  snapshot: RegionSnapshot;
  timestamp: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: HealthCheckConfig = {
  intervalMs: 10_000,
  historySize: 360,           // 1 hour of 10-second snapshots
  anomalyZScore: 2.5,
  predictionWindowSize: 12,   // last 2 minutes
  degradedThreshold: 60,
  offlineThreshold: 20,
};

// ============================================================================
// HealthMonitor class
// ============================================================================

export class HealthMonitor {
  private config: HealthCheckConfig;
  private history: Map<string, RegionSnapshot[]> = new Map();
  private baselines: Map<string, { mean: number; stddev: number }> = new Map();
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(event: HealthEvent) => void> = new Set();

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    globalRegionManager.getActiveRegions().forEach(r => {
      this.history.set(r.regionCode, []);
    });
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  start(): void {
    if (this.intervalHandle) return;
    this.intervalHandle = setInterval(() => this.runChecks(), this.config.intervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  // -------------------------------------------------------------------------
  // Core check
  // -------------------------------------------------------------------------

  /**
   * Process a raw metric snapshot for a region.
   * Computes health score, detects anomalies, predicts failures, and emits events.
   */
  recordSnapshot(regionCode: string, system: SystemMetrics, app: AppMetrics): RegionSnapshot {
    const healthScore = this.computeHealthScore(system, app);
    const status = this.scoreToStatus(healthScore);

    const baseline = this.baselines.get(regionCode);
    const anomalyDetected = baseline
      ? this.detectAnomaly(healthScore, baseline.mean, baseline.stddev)
      : false;

    const history = this.history.get(regionCode) ?? [];
    const { predictedFailure, predictedFailureEta } = this.predictFailure(history, healthScore);

    const snapshot: RegionSnapshot = {
      regionCode,
      timestamp: new Date().toISOString(),
      system,
      app,
      healthScore,
      status,
      anomalyDetected,
      anomalyReason: anomalyDetected ? this.describeAnomaly(system, app) : undefined,
      predictedFailure,
      predictedFailureEta,
    };

    // Persist to history
    history.push(snapshot);
    if (history.length > this.config.historySize) {
      history.splice(0, history.length - this.config.historySize);
    }
    this.history.set(regionCode, history);

    // Recompute baseline incrementally
    this.updateBaseline(regionCode, healthScore);

    // Update region manager
    const prev = globalRegionManager.getHealthScore(regionCode);
    globalRegionManager.updateHealthScore(regionCode, {
      score: healthScore,
      status,
      latencyMs: app.latencyMs,
      errorRate: app.errorRate,
      throughputRps: app.throughputRps,
    });

    // Emit events
    if (prev && prev.status !== status) {
      this.emit({ type: 'status_changed', regionCode, snapshot, timestamp: snapshot.timestamp });
      if (status === 'healthy' && prev.status !== 'healthy') {
        this.emit({ type: 'recovered', regionCode, snapshot, timestamp: snapshot.timestamp });
      }
    }
    if (anomalyDetected) {
      this.emit({ type: 'anomaly_detected', regionCode, snapshot, timestamp: snapshot.timestamp });
    }
    if (predictedFailure) {
      this.emit({ type: 'predicted_failure', regionCode, snapshot, timestamp: snapshot.timestamp });
    }

    return snapshot;
  }

  // -------------------------------------------------------------------------
  // Scoring
  // -------------------------------------------------------------------------

  /**
   * Multi-layered health score: CPU, memory, disk, network, latency, error rate.
   */
  computeHealthScore(system: SystemMetrics, app: AppMetrics): number {
    const cpuScore     = Math.max(0, 100 - system.cpuUsage);
    const memScore     = Math.max(0, 100 - system.memoryUsage);
    const diskScore    = Math.max(0, 100 - system.diskUsage);
    const netScore     = Math.max(0, 100 - Math.min(system.networkInMbps + system.networkOutMbps, 100));
    const latencyScore = Math.max(0, 100 - (app.latencyMs / 10));
    const errorScore   = Math.max(0, 100 - app.errorRate * 1000);

    return Math.round(
      cpuScore    * 0.20 +
      memScore    * 0.20 +
      diskScore   * 0.10 +
      netScore    * 0.10 +
      latencyScore * 0.20 +
      errorScore  * 0.20
    );
  }

  scoreToStatus(score: number): RegionHealthScore['status'] {
    if (score >= this.config.degradedThreshold) return 'healthy';
    if (score >= this.config.offlineThreshold)  return 'degraded';
    return 'offline';
  }

  // -------------------------------------------------------------------------
  // Anomaly detection
  // -------------------------------------------------------------------------

  private detectAnomaly(score: number, mean: number, stddev: number): boolean {
    if (stddev === 0) return false;
    return Math.abs(score - mean) / stddev > this.config.anomalyZScore;
  }

  private describeAnomaly(system: SystemMetrics, app: AppMetrics): string {
    const issues: string[] = [];
    if (system.cpuUsage > 90)    issues.push(`High CPU (${system.cpuUsage.toFixed(0)}%)`);
    if (system.memoryUsage > 90) issues.push(`High memory (${system.memoryUsage.toFixed(0)}%)`);
    if (system.diskUsage > 85)   issues.push(`High disk (${system.diskUsage.toFixed(0)}%)`);
    if (app.latencyMs > 500)     issues.push(`High latency (${app.latencyMs}ms)`);
    if (app.errorRate > 0.05)    issues.push(`High error rate (${(app.errorRate * 100).toFixed(1)}%)`);
    return issues.join('; ') || 'Anomalous health score';
  }

  // -------------------------------------------------------------------------
  // Predictive failure detection (linear trend analysis)
  // -------------------------------------------------------------------------

  private predictFailure(
    history: RegionSnapshot[],
    currentScore: number,
  ): { predictedFailure: boolean; predictedFailureEta?: number } {
    const window = this.config.predictionWindowSize;
    if (history.length < window) {
      return { predictedFailure: false };
    }

    const recent = history.slice(-window).map(s => s.healthScore);
    const slope = this.linearSlope(recent);

    // If declining fast enough to hit the offline threshold
    if (slope < 0) {
      const stepsToOffline = (currentScore - this.config.offlineThreshold) / Math.abs(slope);
      const secondsToOffline = Math.round(stepsToOffline * (this.config.intervalMs / 1000));
      if (secondsToOffline < 300) {
        // Predicted to fail within 5 minutes
        return { predictedFailure: true, predictedFailureEta: secondsToOffline };
      }
    }

    return { predictedFailure: false };
  }

  private linearSlope(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    const sumX  = (n * (n - 1)) / 2;
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    const sumY  = values.reduce((s, v) => s + v, 0);
    const sumXY = values.reduce((s, v, i) => s + i * v, 0);
    const denom = n * sumX2 - sumX * sumX;
    return denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  }

  // -------------------------------------------------------------------------
  // Baseline (Welford online algorithm)
  // -------------------------------------------------------------------------

  private updateBaseline(regionCode: string, score: number): void {
    const history = this.history.get(regionCode) ?? [];
    if (history.length < 10) return; // need enough data

    const scores = history.map(s => s.healthScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
    this.baselines.set(regionCode, { mean, stddev: Math.sqrt(variance) });
  }

  // -------------------------------------------------------------------------
  // Query API
  // -------------------------------------------------------------------------

  getHistory(regionCode: string, limit = 60): RegionSnapshot[] {
    const h = this.history.get(regionCode) ?? [];
    return h.slice(-limit);
  }

  getLatestSnapshot(regionCode: string): RegionSnapshot | undefined {
    const h = this.history.get(regionCode) ?? [];
    return h[h.length - 1];
  }

  getAllLatestSnapshots(): RegionSnapshot[] {
    return Array.from(this.history.keys())
      .map(code => this.getLatestSnapshot(code))
      .filter((s): s is RegionSnapshot => !!s);
  }

  // -------------------------------------------------------------------------
  // Periodic checks (simulated – override in production to fetch real data)
  // -------------------------------------------------------------------------

  private async runChecks(): Promise<void> {
    const regions = globalRegionManager.getActiveRegions();
    for (const region of regions) {
      const system = await this.fetchSystemMetrics(region.regionCode);
      const app    = await this.fetchAppMetrics(region.regionCode);
      this.recordSnapshot(region.regionCode, system, app);
    }
  }

  /** Override in production to pull real system metrics */
  protected async fetchSystemMetrics(_regionCode: string): Promise<SystemMetrics> {
    return {
      cpuUsage:     Math.random() * 60 + 10,
      memoryUsage:  Math.random() * 50 + 20,
      diskUsage:    Math.random() * 40 + 10,
      networkInMbps:  Math.random() * 50,
      networkOutMbps: Math.random() * 30,
    };
  }

  /** Override in production to pull real app metrics */
  protected async fetchAppMetrics(_regionCode: string): Promise<AppMetrics> {
    return {
      latencyMs:         Math.random() * 100 + 20,
      errorRate:         Math.random() * 0.02,
      throughputRps:     Math.random() * 500 + 100,
      activeConnections: Math.floor(Math.random() * 1000),
    };
  }

  // -------------------------------------------------------------------------
  // Event emitter
  // -------------------------------------------------------------------------

  onHealthEvent(callback: (event: HealthEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emit(event: HealthEvent): void {
    this.listeners.forEach(cb => cb(event));
  }
}

export const healthMonitor = new HealthMonitor();
export default HealthMonitor;
