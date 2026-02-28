/**
 * GlobalRegionManager
 * Region orchestration for multi-region failover & auto-healing system.
 * Manages region registry (Asia/EU/US/Other), health scoring,
 * priority/weights, and failover policies per region.
 */

export type RegionContinent = 'Asia' | 'EU' | 'US' | 'Other';
export type ComplianceZone = 'GDPR' | 'CCPA' | 'LGPD' | 'PDPA' | 'POPIA' | 'GLOBAL';

export interface FailoverPolicy {
  autoFailover: boolean;
  threshold: number;           // consecutive failures before triggering
  cooldownSeconds: number;     // seconds before allowing another failover
  weightedRouting: boolean;
}

export interface RegionConfig {
  regionCode: string;
  name: string;
  continent: RegionContinent;
  endpoint: string;
  priority: number;            // lower = higher priority
  weight: number;              // routing weight (1-100)
  isActive: boolean;
  isPrimary: boolean;
  replicaOf?: string;
  complianceZone: ComplianceZone;
  failoverPolicy: FailoverPolicy;
  latencyThresholdMs: number;
  geoLat?: number;
  geoLng?: number;
}

export interface RegionHealthScore {
  regionCode: string;
  score: number;               // 0-100
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  errorRate: number;
  throughputRps: number;
  lastChecked: string;
}

const DEFAULT_FAILOVER_POLICY: FailoverPolicy = {
  autoFailover: true,
  threshold: 3,
  cooldownSeconds: 300,
  weightedRouting: true,
};

const GLOBAL_REGIONS: RegionConfig[] = [
  {
    regionCode: 'us-east-1',
    name: 'US East (Virginia)',
    continent: 'US',
    endpoint: 'us-east-1.softwarevala.io',
    priority: 10,
    weight: 10,
    isActive: true,
    isPrimary: true,
    complianceZone: 'CCPA',
    failoverPolicy: { ...DEFAULT_FAILOVER_POLICY },
    latencyThresholdMs: 100,
    geoLat: 37.9267,
    geoLng: -77.0144,
  },
  {
    regionCode: 'us-west-2',
    name: 'US West (Oregon)',
    continent: 'US',
    endpoint: 'us-west-2.softwarevala.io',
    priority: 20,
    weight: 8,
    isActive: true,
    isPrimary: false,
    replicaOf: 'us-east-1',
    complianceZone: 'CCPA',
    failoverPolicy: { ...DEFAULT_FAILOVER_POLICY },
    latencyThresholdMs: 120,
    geoLat: 45.8696,
    geoLng: -119.6881,
  },
  {
    regionCode: 'eu-west-1',
    name: 'EU West (Ireland)',
    continent: 'EU',
    endpoint: 'eu-west-1.softwarevala.io',
    priority: 10,
    weight: 10,
    isActive: true,
    isPrimary: true,
    complianceZone: 'GDPR',
    failoverPolicy: { ...DEFAULT_FAILOVER_POLICY },
    latencyThresholdMs: 80,
    geoLat: 53.3498,
    geoLng: -6.2603,
  },
  {
    regionCode: 'eu-central-1',
    name: 'EU Central (Frankfurt)',
    continent: 'EU',
    endpoint: 'eu-central-1.softwarevala.io',
    priority: 20,
    weight: 8,
    isActive: true,
    isPrimary: false,
    replicaOf: 'eu-west-1',
    complianceZone: 'GDPR',
    failoverPolicy: { ...DEFAULT_FAILOVER_POLICY },
    latencyThresholdMs: 80,
    geoLat: 50.1109,
    geoLng: 8.6821,
  },
  {
    regionCode: 'ap-south-1',
    name: 'Asia Pacific (Mumbai)',
    continent: 'Asia',
    endpoint: 'ap-south-1.softwarevala.io',
    priority: 10,
    weight: 10,
    isActive: true,
    isPrimary: true,
    complianceZone: 'PDPA',
    failoverPolicy: { ...DEFAULT_FAILOVER_POLICY },
    latencyThresholdMs: 120,
    geoLat: 19.076,
    geoLng: 72.8777,
  },
  {
    regionCode: 'ap-southeast-1',
    name: 'Asia Pacific (Singapore)',
    continent: 'Asia',
    endpoint: 'ap-southeast-1.softwarevala.io',
    priority: 20,
    weight: 8,
    isActive: true,
    isPrimary: false,
    replicaOf: 'ap-south-1',
    complianceZone: 'PDPA',
    failoverPolicy: { ...DEFAULT_FAILOVER_POLICY },
    latencyThresholdMs: 120,
    geoLat: 1.3521,
    geoLng: 103.8198,
  },
  {
    regionCode: 'me-south-1',
    name: 'Middle East (Bahrain)',
    continent: 'Other',
    endpoint: 'me-south-1.softwarevala.io',
    priority: 10,
    weight: 6,
    isActive: true,
    isPrimary: true,
    complianceZone: 'GLOBAL',
    failoverPolicy: { ...DEFAULT_FAILOVER_POLICY },
    latencyThresholdMs: 150,
    geoLat: 26.0667,
    geoLng: 50.5577,
  },
  {
    regionCode: 'sa-east-1',
    name: 'South America (São Paulo)',
    continent: 'Other',
    endpoint: 'sa-east-1.softwarevala.io',
    priority: 10,
    weight: 6,
    isActive: true,
    isPrimary: true,
    complianceZone: 'LGPD',
    failoverPolicy: { ...DEFAULT_FAILOVER_POLICY },
    latencyThresholdMs: 150,
    geoLat: -23.5558,
    geoLng: -46.6396,
  },
  {
    regionCode: 'af-south-1',
    name: 'Africa (Cape Town)',
    continent: 'Other',
    endpoint: 'af-south-1.softwarevala.io',
    priority: 20,
    weight: 4,
    isActive: true,
    isPrimary: false,
    replicaOf: 'eu-west-1',
    complianceZone: 'POPIA',
    failoverPolicy: { ...DEFAULT_FAILOVER_POLICY },
    latencyThresholdMs: 200,
    geoLat: -33.9249,
    geoLng: 18.4241,
  },
];

export class GlobalRegionManager {
  private regions: Map<string, RegionConfig> = new Map();
  private healthScores: Map<string, RegionHealthScore> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private changeListeners: Set<(regionCode: string) => void> = new Set();

  constructor(regions: RegionConfig[] = GLOBAL_REGIONS) {
    regions.forEach(r => this.regions.set(r.regionCode, r));
    this.initializeHealthScores();
  }

  // -------------------------------------------------------------------------
  // Region registry
  // -------------------------------------------------------------------------

  getRegion(regionCode: string): RegionConfig | undefined {
    return this.regions.get(regionCode);
  }

  getAllRegions(): RegionConfig[] {
    return Array.from(this.regions.values());
  }

  getActiveRegions(): RegionConfig[] {
    return this.getAllRegions().filter(r => r.isActive);
  }

  getPrimaryRegions(): RegionConfig[] {
    return this.getActiveRegions().filter(r => r.isPrimary);
  }

  getRegionsByContinent(continent: RegionContinent): RegionConfig[] {
    return this.getActiveRegions().filter(r => r.continent === continent);
  }

  getRegionsByCompliance(zone: ComplianceZone): RegionConfig[] {
    return this.getActiveRegions().filter(r => r.complianceZone === zone);
  }

  // -------------------------------------------------------------------------
  // Health scoring
  // -------------------------------------------------------------------------

  updateHealthScore(regionCode: string, score: Partial<RegionHealthScore>): void {
    const current = this.healthScores.get(regionCode);
    if (current) {
      this.healthScores.set(regionCode, { ...current, ...score, lastChecked: new Date().toISOString() });
    }
  }

  getHealthScore(regionCode: string): RegionHealthScore | undefined {
    return this.healthScores.get(regionCode);
  }

  getAllHealthScores(): RegionHealthScore[] {
    return Array.from(this.healthScores.values());
  }

  isRegionHealthy(regionCode: string): boolean {
    const score = this.healthScores.get(regionCode);
    return score?.status === 'healthy';
  }

  computeHealthScore(latencyMs: number, errorRate: number, throughputRps: number): number {
    const region = Array.from(this.regions.values())
      .find(r => r.latencyThresholdMs > 0);
    const latencyThreshold = region?.latencyThresholdMs ?? 200;

    const latencyScore  = Math.max(0, 100 - (latencyMs / latencyThreshold) * 50);
    const errorScore    = Math.max(0, 100 - errorRate * 1000);
    const throughputScore = Math.min(100, (throughputRps / 100) * 20 + 80);

    return Math.round((latencyScore * 0.4 + errorScore * 0.4 + throughputScore * 0.2));
  }

  // -------------------------------------------------------------------------
  // Failover routing
  // -------------------------------------------------------------------------

  /**
   * Returns the best failover region for a failed region, respecting compliance
   * zones and the region's own failover policy.
   */
  getFailoverRegion(regionCode: string): string | null {
    const failed = this.regions.get(regionCode);
    if (!failed) return null;

    // Check cooldown
    const cooldownUntil = this.cooldowns.get(regionCode) ?? 0;
    if (Date.now() < cooldownUntil) return null;

    // Prefer replica if configured and healthy
    if (failed.replicaOf) {
      const replica = this.regions.get(failed.replicaOf);
      if (replica?.isActive && this.isRegionHealthy(replica.regionCode)) {
        return replica.regionCode;
      }
    }

    // Find healthy region in same compliance zone, ordered by priority then weight
    const candidates = this.getActiveRegions()
      .filter(r =>
        r.regionCode !== regionCode &&
        r.complianceZone === failed.complianceZone &&
        this.isRegionHealthy(r.regionCode)
      )
      .sort((a, b) => a.priority - b.priority || b.weight - a.weight);

    return candidates[0]?.regionCode ?? null;
  }

  /**
   * Weighted selection across healthy regions (for active-active routing).
   */
  selectRegionWeighted(candidates: string[]): string | null {
    const eligible = candidates
      .map(code => this.regions.get(code))
      .filter((r): r is RegionConfig => !!r && r.isActive && this.isRegionHealthy(r.regionCode));

    if (eligible.length === 0) return null;

    const totalWeight = eligible.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;

    for (const region of eligible) {
      random -= region.weight;
      if (random <= 0) return region.regionCode;
    }

    return eligible[eligible.length - 1].regionCode;
  }

  // -------------------------------------------------------------------------
  // Failover policy management
  // -------------------------------------------------------------------------

  setFailoverPolicy(regionCode: string, policy: Partial<FailoverPolicy>): void {
    const region = this.regions.get(regionCode);
    if (region) {
      region.failoverPolicy = { ...region.failoverPolicy, ...policy };
      this.regions.set(regionCode, region);
    }
  }

  startCooldown(regionCode: string): void {
    const region = this.regions.get(regionCode);
    const seconds = region?.failoverPolicy.cooldownSeconds ?? 300;
    this.cooldowns.set(regionCode, Date.now() + seconds * 1000);
  }

  isInCooldown(regionCode: string): boolean {
    return Date.now() < (this.cooldowns.get(regionCode) ?? 0);
  }

  // -------------------------------------------------------------------------
  // Region lifecycle
  // -------------------------------------------------------------------------

  activateRegion(regionCode: string): void {
    const region = this.regions.get(regionCode);
    if (region) {
      region.isActive = true;
      this.regions.set(regionCode, region);
      this.changeListeners.forEach(cb => cb(regionCode));
    }
  }

  deactivateRegion(regionCode: string): void {
    const region = this.regions.get(regionCode);
    if (region) {
      region.isActive = false;
      this.regions.set(regionCode, region);
      this.changeListeners.forEach(cb => cb(regionCode));
    }
  }

  // -------------------------------------------------------------------------
  // Listeners
  // -------------------------------------------------------------------------

  onRegionChange(callback: (regionCode: string) => void): () => void {
    this.changeListeners.add(callback);
    return () => this.changeListeners.delete(callback);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private initializeHealthScores(): void {
    this.regions.forEach(region => {
      this.healthScores.set(region.regionCode, {
        regionCode: region.regionCode,
        score: 100,
        status: 'healthy',
        latencyMs: 0,
        errorRate: 0,
        throughputRps: 0,
        lastChecked: new Date().toISOString(),
      });
    });
  }
}

export const globalRegionManager = new GlobalRegionManager();
export default GlobalRegionManager;
