/**
 * DisasterRecovery
 * Cross-region data replication (RPO < 5 min), backup orchestration,
 * automated recovery testing, and RTO < 10 minutes support.
 */

import { globalRegionManager } from './region-manager';

// ============================================================================
// Types
// ============================================================================

export type ReplicationStatus = 'synced' | 'syncing' | 'pending' | 'stale' | 'failed';
export type BackupStatus      = 'completed' | 'in_progress' | 'failed' | 'scheduled';
export type RecoveryTestResult = 'passed' | 'failed' | 'skipped';

export interface ReplicationState {
  regionCode: string;
  status: ReplicationStatus;
  lag: number;           // seconds behind primary
  lastSyncAt: string;
  bytesPending: number;
  transactionsPending: number;
}

export interface BackupRecord {
  id: string;
  regionCode: string;
  status: BackupStatus;
  sizeBytes: number;
  rpoAchievedSeconds: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  storageLocation?: string;
}

export interface RecoveryTest {
  id: string;
  regionCode: string;
  result: RecoveryTestResult;
  rtoMeasuredSeconds: number;
  rpoMeasuredSeconds: number;
  testedAt: string;
  details: string[];
}

export interface DisasterRecoveryConfig {
  rpoTargetSeconds: number;     // RPO SLA (default 300 = 5 min)
  rtoTargetSeconds: number;     // RTO SLA (default 600 = 10 min)
  replicationIntervalMs: number;
  backupIntervalMs: number;
  autoRecoveryTestIntervalMs: number;
  maxReplicationLagSeconds: number; // lag above this triggers alert
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: DisasterRecoveryConfig = {
  rpoTargetSeconds: 300,
  rtoTargetSeconds: 600,
  replicationIntervalMs: 60_000,      // replicate every 60 s
  backupIntervalMs: 5 * 60 * 1000,    // backup every 5 min
  autoRecoveryTestIntervalMs: 24 * 60 * 60 * 1000, // test daily
  maxReplicationLagSeconds: 60,
};

// ============================================================================
// DisasterRecovery class
// ============================================================================

export class DisasterRecovery {
  private config: DisasterRecoveryConfig;
  private replicationStates: Map<string, ReplicationState> = new Map();
  private backupHistory: BackupRecord[] = [];
  private recoveryTests: RecoveryTest[] = [];
  private alertListeners: Set<(type: string, detail: string) => void> = new Set();
  private replicaIntervalHandle: ReturnType<typeof setInterval> | null = null;
  private backupIntervalHandle:  ReturnType<typeof setInterval> | null = null;
  private testIntervalHandle:    ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<DisasterRecoveryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeReplicationStates();
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  start(): void {
    if (!this.replicaIntervalHandle) {
      this.replicaIntervalHandle = setInterval(
        () => this.runReplication(),
        this.config.replicationIntervalMs,
      );
    }
    if (!this.backupIntervalHandle) {
      this.backupIntervalHandle = setInterval(
        () => this.runBackups(),
        this.config.backupIntervalMs,
      );
    }
    if (!this.testIntervalHandle) {
      this.testIntervalHandle = setInterval(
        () => this.runRecoveryTest(),
        this.config.autoRecoveryTestIntervalMs,
      );
    }
  }

  stop(): void {
    [this.replicaIntervalHandle, this.backupIntervalHandle, this.testIntervalHandle]
      .forEach(h => { if (h) clearInterval(h); });
    this.replicaIntervalHandle = null;
    this.backupIntervalHandle  = null;
    this.testIntervalHandle    = null;
  }

  // -------------------------------------------------------------------------
  // Cross-region replication
  // -------------------------------------------------------------------------

  async replicateToRegion(sourceRegion: string, targetRegion: string): Promise<ReplicationState> {
    const state = this.replicationStates.get(targetRegion) ?? this.makeInitialState(targetRegion);
    state.status = 'syncing';

    try {
      await this.performReplication(sourceRegion, targetRegion);

      state.status = 'synced';
      state.lag = 0;
      state.lastSyncAt = new Date().toISOString();
      state.bytesPending = 0;
      state.transactionsPending = 0;
    } catch (err) {
      state.status = 'failed';
      this.alert('replication_failed', `Replication ${sourceRegion}→${targetRegion} failed: ${err}`);
    }

    this.replicationStates.set(targetRegion, state);
    return state;
  }

  async forceSyncAll(): Promise<void> {
    const primaries = globalRegionManager.getPrimaryRegions();
    for (const primary of primaries) {
      const replicas = globalRegionManager.getAllRegions()
        .filter(r => r.replicaOf === primary.regionCode && r.isActive);
      for (const replica of replicas) {
        await this.replicateToRegion(primary.regionCode, replica.regionCode);
      }
    }
  }

  getReplicationState(regionCode: string): ReplicationState | undefined {
    return this.replicationStates.get(regionCode);
  }

  getAllReplicationStates(): ReplicationState[] {
    return Array.from(this.replicationStates.values());
  }

  isRPOCompliant(): boolean {
    return Array.from(this.replicationStates.values())
      .every(s => s.lag <= this.config.rpoTargetSeconds);
  }

  // -------------------------------------------------------------------------
  // Backup orchestration
  // -------------------------------------------------------------------------

  async createBackup(regionCode: string): Promise<BackupRecord> {
    const backup: BackupRecord = {
      id: crypto.randomUUID(),
      regionCode,
      status: 'in_progress',
      sizeBytes: 0,
      rpoAchievedSeconds: 0,
      startedAt: new Date().toISOString(),
    };

    this.backupHistory.push(backup);

    try {
      const result = await this.performBackup(regionCode);
      backup.sizeBytes          = result.sizeBytes;
      backup.rpoAchievedSeconds = result.rpoSeconds;
      backup.storageLocation    = result.location;
      backup.status             = 'completed';
      backup.completedAt        = new Date().toISOString();

      if (backup.rpoAchievedSeconds > this.config.rpoTargetSeconds) {
        this.alert(
          'rpo_breach',
          `Backup RPO ${backup.rpoAchievedSeconds}s exceeds target ${this.config.rpoTargetSeconds}s for ${regionCode}`,
        );
      }
    } catch (err) {
      backup.status = 'failed';
      backup.errorMessage = String(err);
      backup.completedAt = new Date().toISOString();
      this.alert('backup_failed', `Backup failed for ${regionCode}: ${err}`);
    }

    return backup;
  }

  async restoreFromBackup(regionCode: string): Promise<boolean> {
    const latest = this.getLatestBackup(regionCode);
    if (!latest || latest.status !== 'completed') {
      this.alert('restore_failed', `No completed backup available for ${regionCode}`);
      return false;
    }

    try {
      await this.performRestore(regionCode, latest);
      return true;
    } catch (err) {
      this.alert('restore_failed', `Restore failed for ${regionCode}: ${err}`);
      return false;
    }
  }

  getLatestBackup(regionCode: string): BackupRecord | undefined {
    return this.backupHistory
      .filter(b => b.regionCode === regionCode && b.status === 'completed')
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  }

  getBackupHistory(regionCode?: string): BackupRecord[] {
    return regionCode
      ? this.backupHistory.filter(b => b.regionCode === regionCode)
      : [...this.backupHistory];
  }

  // -------------------------------------------------------------------------
  // Automated recovery testing
  // -------------------------------------------------------------------------

  async runRecoveryTest(regionCode?: string): Promise<RecoveryTest[]> {
    const regions = regionCode
      ? [globalRegionManager.getRegion(regionCode)].filter(Boolean) as NonNullable<ReturnType<typeof globalRegionManager.getRegion>>[]
      : globalRegionManager.getActiveRegions();

    const results: RecoveryTest[] = [];

    for (const region of regions) {
      if (!region) continue;
      const test = await this.testRecovery(region.regionCode);
      this.recoveryTests.push(test);
      results.push(test);

      if (test.result === 'failed') {
        this.alert(
          'recovery_test_failed',
          `Recovery test failed for ${region.regionCode}: ${test.details.join('; ')}`,
        );
      }
    }

    return results;
  }

  private async testRecovery(regionCode: string): Promise<RecoveryTest> {
    const start = Date.now();
    const details: string[] = [];
    let passed = true;

    // Check replication lag
    const repState = this.replicationStates.get(regionCode);
    if (repState) {
      if (repState.lag > this.config.rpoTargetSeconds) {
        details.push(`Replication lag ${repState.lag}s exceeds RPO target`);
        passed = false;
      } else {
        details.push(`Replication lag ${repState.lag}s within RPO target`);
      }
    }

    // Check backup availability
    const backup = this.getLatestBackup(regionCode);
    if (!backup) {
      details.push('No completed backup available');
      passed = false;
    } else {
      details.push(`Latest backup: ${backup.completedAt} (${backup.rpoAchievedSeconds}s RPO)`);
    }

    // Simulate recovery time measurement
    await new Promise(resolve => setTimeout(resolve, 50));
    const rtoMeasuredSeconds = Math.round((Date.now() - start) / 1000);

    return {
      id: crypto.randomUUID(),
      regionCode,
      result: passed ? 'passed' : 'failed',
      rtoMeasuredSeconds,
      rpoMeasuredSeconds: repState?.lag ?? 0,
      testedAt: new Date().toISOString(),
      details,
    };
  }

  getRecoveryTests(regionCode?: string): RecoveryTest[] {
    return regionCode
      ? this.recoveryTests.filter(t => t.regionCode === regionCode)
      : [...this.recoveryTests];
  }

  // -------------------------------------------------------------------------
  // SLA summary
  // -------------------------------------------------------------------------

  getSLASummary(): {
    rtoTarget: number;
    rpoTarget: number;
    rpoCompliant: boolean;
    regionsInSync: number;
    totalRegions: number;
    latestTestsPassed: number;
  } {
    const allRegions = globalRegionManager.getActiveRegions();
    const synced = Array.from(this.replicationStates.values())
      .filter(s => s.lag <= this.config.rpoTargetSeconds).length;

    const latestTests = new Map<string, RecoveryTest>();
    for (const test of this.recoveryTests) {
      const prev = latestTests.get(test.regionCode);
      if (!prev || new Date(test.testedAt) > new Date(prev.testedAt)) {
        latestTests.set(test.regionCode, test);
      }
    }
    const passed = Array.from(latestTests.values()).filter(t => t.result === 'passed').length;

    return {
      rtoTarget:  this.config.rtoTargetSeconds,
      rpoTarget:  this.config.rpoTargetSeconds,
      rpoCompliant: this.isRPOCompliant(),
      regionsInSync: synced,
      totalRegions: allRegions.length,
      latestTestsPassed: passed,
    };
  }

  // -------------------------------------------------------------------------
  // Listeners
  // -------------------------------------------------------------------------

  onAlert(callback: (type: string, detail: string) => void): () => void {
    this.alertListeners.add(callback);
    return () => this.alertListeners.delete(callback);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private initializeReplicationStates(): void {
    globalRegionManager.getAllRegions().forEach(region => {
      this.replicationStates.set(region.regionCode, this.makeInitialState(region.regionCode));
    });
  }

  private makeInitialState(regionCode: string): ReplicationState {
    return {
      regionCode,
      status: 'synced',
      lag: 0,
      lastSyncAt: new Date().toISOString(),
      bytesPending: 0,
      transactionsPending: 0,
    };
  }

  private async runReplication(): Promise<void> {
    await this.forceSyncAll();
  }

  private async runBackups(): Promise<void> {
    const primaries = globalRegionManager.getPrimaryRegions();
    for (const primary of primaries) {
      await this.createBackup(primary.regionCode);
    }
  }

  /** Override in production to perform actual data replication */
  protected async performReplication(
    _source: string,
    _target: string,
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /** Override in production to perform actual backup */
  protected async performBackup(
    _regionCode: string,
  ): Promise<{ sizeBytes: number; rpoSeconds: number; location: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      sizeBytes: Math.floor(Math.random() * 1_000_000_000),
      rpoSeconds: Math.floor(Math.random() * 60),
      location: `s3://softwarevala-backups/${_regionCode}/${new Date().toISOString()}`,
    };
  }

  /** Override in production to perform actual restore */
  protected async performRestore(
    _regionCode: string,
    _backup: BackupRecord,
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private alert(type: string, detail: string): void {
    this.alertListeners.forEach(cb => cb(type, detail));
  }
}

export const disasterRecovery = new DisasterRecovery();
export default DisasterRecovery;
