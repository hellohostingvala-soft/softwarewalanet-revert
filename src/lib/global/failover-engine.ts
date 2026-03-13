/**
 * FailoverEngine
 * Automatic failover logic for the multi-region auto-healing system.
 *
 * Features:
 * - Active-active region setup
 * - Automatic traffic rerouting on region failure (< 30s detection, < 5s reroute)
 * - DNS failover coordination
 * - State synchronization across regions
 * - Instant rollback on recovery
 * - Circuit breaker pattern for cascading failure prevention
 */

import { globalRegionManager } from './region-manager';
import { healthMonitor, HealthEvent } from './health-monitor';

// ============================================================================
// Types
// ============================================================================

export type FailoverEventType =
  | 'failover_initiated'
  | 'failover_completed'
  | 'failover_failed'
  | 'recovery_initiated'
  | 'recovery_completed'
  | 'manual_override';

export type FailoverEventStatus =
  | 'initiated'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export interface FailoverEvent {
  id: string;
  eventType: FailoverEventType;
  sourceRegion: string;
  targetRegion?: string;
  triggerReason: string;
  status: FailoverEventStatus;
  affectedTenants: string[];
  trafficShiftedPercent: number;
  rtoAchievedSeconds?: number;
  rpoAchievedSeconds?: number;
  recoveryActions: string[];
  errorDetails?: string;
  initiatedAt: string;
  completedAt?: string;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreaker {
  regionCode: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastStateChange: string;
  nextAttemptAt?: string;
}

export interface FailoverEngineConfig {
  failureThreshold: number;     // consecutive offline checks before failover
  recoveryThreshold: number;    // consecutive healthy checks before rollback
  halfOpenProbeIntervalMs: number;
  maxConcurrentFailovers: number;
  syncTimeoutMs: number;        // max time for state sync before proceeding
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: FailoverEngineConfig = {
  failureThreshold: 3,
  recoveryThreshold: 3,
  halfOpenProbeIntervalMs: 30_000,
  maxConcurrentFailovers: 3,
  syncTimeoutMs: 30_000,
};

// ============================================================================
// FailoverEngine class
// ============================================================================

export class FailoverEngine {
  private config: FailoverEngineConfig;
  private events: Map<string, FailoverEvent> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private failureCounters: Map<string, number> = new Map();
  private recoveryCounters: Map<string, number> = new Map();
  private activeFailovers: Set<string> = new Set();
  private eventListeners: Set<(event: FailoverEvent) => void> = new Set();
  private stateListeners: Set<(regionCode: string, newRegion: string) => void> = new Set();

  constructor(config: Partial<FailoverEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeCircuitBreakers();
    this.subscribeToHealthEvents();
  }

  // -------------------------------------------------------------------------
  // Circuit breaker
  // -------------------------------------------------------------------------

  getCircuitBreaker(regionCode: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(regionCode);
  }

  isCircuitOpen(regionCode: string): boolean {
    const cb = this.circuitBreakers.get(regionCode);
    if (!cb) return false;
    if (cb.state === 'open') {
      // Check if ready to probe (half-open)
      if (cb.nextAttemptAt && Date.now() >= new Date(cb.nextAttemptAt).getTime()) {
        cb.state = 'half-open';
        cb.lastStateChange = new Date().toISOString();
        this.circuitBreakers.set(regionCode, cb);
        return false;
      }
      return true;
    }
    return false;
  }

  private openCircuit(regionCode: string): void {
    const cb = this.circuitBreakers.get(regionCode);
    if (!cb) return;
    cb.state = 'open';
    cb.lastStateChange = new Date().toISOString();
    cb.nextAttemptAt = new Date(Date.now() + this.config.halfOpenProbeIntervalMs).toISOString();
    this.circuitBreakers.set(regionCode, cb);
  }

  private closeCircuit(regionCode: string): void {
    const cb = this.circuitBreakers.get(regionCode);
    if (!cb) return;
    cb.state = 'closed';
    cb.failureCount = 0;
    cb.successCount = 0;
    cb.lastStateChange = new Date().toISOString();
    cb.nextAttemptAt = undefined;
    this.circuitBreakers.set(regionCode, cb);
  }

  // -------------------------------------------------------------------------
  // Automatic failover
  // -------------------------------------------------------------------------

  /**
   * Trigger a failover from the given region.
   * Returns the failover event (audit record).
   */
  async triggerFailover(
    sourceRegion: string,
    reason: string,
    affectedTenants: string[] = [],
  ): Promise<FailoverEvent> {
    // Guard: max concurrent failovers
    if (this.activeFailovers.size >= this.config.maxConcurrentFailovers) {
      throw new Error(`Max concurrent failovers (${this.config.maxConcurrentFailovers}) reached`);
    }
    // Guard: already failing over
    if (this.activeFailovers.has(sourceRegion)) {
      const existing = Array.from(this.events.values())
        .find(e => e.sourceRegion === sourceRegion && e.status === 'in_progress');
      if (existing) return existing;
    }
    // Guard: circuit breaker
    if (this.isCircuitOpen(sourceRegion)) {
      throw new Error(`Circuit breaker open for region ${sourceRegion}`);
    }

    const targetRegion = globalRegionManager.getFailoverRegion(sourceRegion);

    const event: FailoverEvent = {
      id: crypto.randomUUID(),
      eventType: 'failover_initiated',
      sourceRegion,
      targetRegion: targetRegion ?? undefined,
      triggerReason: reason,
      status: 'initiated',
      affectedTenants,
      trafficShiftedPercent: 0,
      recoveryActions: [],
      initiatedAt: new Date().toISOString(),
    };

    this.events.set(event.id, event);
    this.activeFailovers.add(sourceRegion);
    this.openCircuit(sourceRegion);
    globalRegionManager.startCooldown(sourceRegion);
    this.emit(event);

    try {
      event.status = 'in_progress';
      event.eventType = 'failover_initiated';

      if (!targetRegion) {
        event.recoveryActions.push('No healthy failover region available');
        throw new Error('No healthy failover region found');
      }

      // Step 1 – State synchronization
      event.recoveryActions.push(`Initiating state sync: ${sourceRegion} → ${targetRegion}`);
      await this.synchronizeState(sourceRegion, targetRegion);
      event.recoveryActions.push('State synchronization completed');
      event.rpoAchievedSeconds = 0; // sync just completed

      // Step 2 – DNS failover
      event.recoveryActions.push('Initiating DNS failover');
      await this.coordinateDNSFailover(sourceRegion, targetRegion);
      event.recoveryActions.push(`DNS updated: ${sourceRegion} → ${targetRegion}`);

      // Step 3 – Traffic shift
      event.recoveryActions.push('Shifting traffic to target region');
      await this.shiftTraffic(sourceRegion, targetRegion);
      event.trafficShiftedPercent = 100;
      event.recoveryActions.push('Traffic fully shifted to failover region');

      // Step 4 – Deactivate failed region
      globalRegionManager.deactivateRegion(sourceRegion);
      event.recoveryActions.push(`Region ${sourceRegion} deactivated`);

      const rtoMs = Date.now() - new Date(event.initiatedAt).getTime();
      event.rtoAchievedSeconds = Math.round(rtoMs / 1000);
      event.status = 'completed';
      event.eventType = 'failover_completed';
      event.completedAt = new Date().toISOString();

      this.stateListeners.forEach(cb => cb(sourceRegion, targetRegion));
    } catch (err) {
      event.status = 'failed';
      event.eventType = 'failover_failed';
      event.errorDetails = String(err);
      event.completedAt = new Date().toISOString();
    } finally {
      this.activeFailovers.delete(sourceRegion);
    }

    this.events.set(event.id, event);
    this.emit(event);
    return event;
  }

  // -------------------------------------------------------------------------
  // Recovery & rollback
  // -------------------------------------------------------------------------

  /**
   * Initiate recovery when a previously failed region becomes healthy again.
   * Traffic is gradually shifted back (instant rollback if healthy).
   */
  async initiateRecovery(regionCode: string): Promise<FailoverEvent> {
    const event: FailoverEvent = {
      id: crypto.randomUUID(),
      eventType: 'recovery_initiated',
      sourceRegion: regionCode,
      triggerReason: 'Region health restored',
      status: 'initiated',
      affectedTenants: [],
      trafficShiftedPercent: 0,
      recoveryActions: [],
      initiatedAt: new Date().toISOString(),
    };

    this.events.set(event.id, event);
    this.emit(event);

    try {
      event.status = 'in_progress';
      event.recoveryActions.push(`Starting recovery for region ${regionCode}`);

      // Reactivate region
      globalRegionManager.activateRegion(regionCode);
      event.recoveryActions.push(`Region ${regionCode} reactivated`);

      // Close circuit breaker
      this.closeCircuit(regionCode);
      event.recoveryActions.push('Circuit breaker reset');

      // Restore DNS
      await this.restoreDNS(regionCode);
      event.recoveryActions.push('DNS restored');

      // Shift traffic back
      await this.shiftTrafficBack(regionCode);
      event.trafficShiftedPercent = 100;
      event.recoveryActions.push('Traffic restored to recovered region');

      const rtoMs = Date.now() - new Date(event.initiatedAt).getTime();
      event.rtoAchievedSeconds = Math.round(rtoMs / 1000);
      event.status = 'completed';
      event.eventType = 'recovery_completed';
      event.completedAt = new Date().toISOString();
    } catch (err) {
      event.status = 'failed';
      event.errorDetails = String(err);
      event.completedAt = new Date().toISOString();
    }

    this.events.set(event.id, event);
    this.emit(event);
    return event;
  }

  // -------------------------------------------------------------------------
  // Audit trail
  // -------------------------------------------------------------------------

  getEvents(): FailoverEvent[] {
    return Array.from(this.events.values())
      .sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime());
  }

  getActiveFailovers(): string[] {
    return Array.from(this.activeFailovers);
  }

  // -------------------------------------------------------------------------
  // Listeners
  // -------------------------------------------------------------------------

  onFailoverEvent(callback: (event: FailoverEvent) => void): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  onTrafficShifted(callback: (from: string, to: string) => void): () => void {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  // -------------------------------------------------------------------------
  // Health event subscription
  // -------------------------------------------------------------------------

  private subscribeToHealthEvents(): void {
    healthMonitor.onHealthEvent(async (event: HealthEvent) => {
      const { regionCode, snapshot } = event;

      if (event.type === 'status_changed') {
        if (snapshot.status === 'offline') {
          // Increment failure counter
          const failures = (this.failureCounters.get(regionCode) ?? 0) + 1;
          this.failureCounters.set(regionCode, failures);
          this.recoveryCounters.set(regionCode, 0);

          const region = globalRegionManager.getRegion(regionCode);
          const threshold =
            region?.failoverPolicy.threshold ?? this.config.failureThreshold;

          if (
            failures >= threshold &&
            region?.failoverPolicy.autoFailover &&
            !globalRegionManager.isInCooldown(regionCode)
          ) {
            await this.triggerFailover(regionCode, 'Region health offline').catch(() => null);
          }
        } else if (snapshot.status === 'healthy') {
          const recoveries = (this.recoveryCounters.get(regionCode) ?? 0) + 1;
          this.recoveryCounters.set(regionCode, recoveries);
          this.failureCounters.set(regionCode, 0);

          if (recoveries >= this.config.recoveryThreshold) {
            const cb = this.circuitBreakers.get(regionCode);
            if (cb && cb.state !== 'closed') {
              await this.initiateRecovery(regionCode).catch(() => null);
            }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // Infrastructure operations (override in production)
  // -------------------------------------------------------------------------

  /** Sync state/data from source → target region before failover */
  protected async synchronizeState(
    _source: string,
    _target: string,
  ): Promise<void> {
    await new Promise(resolve =>
      setTimeout(resolve, Math.min(this.config.syncTimeoutMs, 2_000))
    );
  }

  /** Update DNS records to route traffic to target region */
  protected async coordinateDNSFailover(
    _source: string,
    _target: string,
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** Shift 100% of traffic from source to target */
  protected async shiftTraffic(
    _source: string,
    _target: string,
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** Restore DNS records after recovery */
  protected async restoreDNS(_region: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** Shift traffic back to recovered region */
  protected async shiftTrafficBack(_region: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // -------------------------------------------------------------------------
  // Init
  // -------------------------------------------------------------------------

  private initializeCircuitBreakers(): void {
    globalRegionManager.getAllRegions().forEach(region => {
      this.circuitBreakers.set(region.regionCode, {
        regionCode: region.regionCode,
        state: 'closed',
        failureCount: 0,
        successCount: 0,
        lastStateChange: new Date().toISOString(),
      });
    });
  }

  private emit(event: FailoverEvent): void {
    this.eventListeners.forEach(cb => cb(event));
  }
}

export const failoverEngine = new FailoverEngine();
export default FailoverEngine;
