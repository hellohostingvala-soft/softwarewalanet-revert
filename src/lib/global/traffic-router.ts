/**
 * TrafficRouter
 * Geo-DNS routing, health-aware load balancing, session affinity with
 * failover support, and request queuing during failover.
 */

import { globalRegionManager, RegionConfig } from './region-manager';

// ============================================================================
// Types
// ============================================================================

export interface GeoLocation {
  lat: number;
  lng: number;
  countryCode?: string;
  continent?: string;
}

export interface RoutingDecision {
  regionCode: string;
  reason: 'geo_nearest' | 'session_affinity' | 'weighted' | 'failover' | 'fallback';
  latencyEstimateMs?: number;
}

export interface SessionAffinityRecord {
  sessionId: string;
  regionCode: string;
  createdAt: string;
  lastAccessedAt: string;
}

export interface QueuedRequest {
  id: string;
  sessionId?: string;
  payload: unknown;
  queuedAt: string;
  retries: number;
}

export interface TrafficRouterConfig {
  sessionAffinityTtlMs: number;    // how long to maintain session affinity
  maxQueueSize: number;             // max requests to buffer during failover
  queueDrainIntervalMs: number;
  geoRoutingEnabled: boolean;
  weightedRoutingEnabled: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: TrafficRouterConfig = {
  sessionAffinityTtlMs: 30 * 60 * 1000,  // 30 minutes
  maxQueueSize: 5_000,
  queueDrainIntervalMs: 1_000,
  geoRoutingEnabled: true,
  weightedRoutingEnabled: true,
};

// Approximate latency matrix (ms) between continents – used for geo routing
const GEO_LATENCY_MATRIX: Record<string, Record<string, number>> = {
  US:    { US: 20,  EU: 90,  Asia: 180, Other: 150 },
  EU:    { US: 90,  EU: 20,  Asia: 150, Other: 100 },
  Asia:  { US: 180, EU: 150, Asia: 20,  Other: 80  },
  Other: { US: 150, EU: 100, Asia: 80,  Other: 30  },
};

// ============================================================================
// TrafficRouter class
// ============================================================================

export class TrafficRouter {
  private config: TrafficRouterConfig;
  private sessionAffinity: Map<string, SessionAffinityRecord> = new Map();
  private requestQueue: QueuedRequest[] = [];
  private drainIntervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<TrafficRouterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // -------------------------------------------------------------------------
  // Core routing
  // -------------------------------------------------------------------------

  /**
   * Route a request to the best available region.
   * Priority: session affinity → geo-nearest → weighted → failover
   */
  route(sessionId?: string, clientGeo?: GeoLocation): RoutingDecision {
    // 1. Session affinity
    if (sessionId) {
      const affinity = this.sessionAffinity.get(sessionId);
      if (affinity && this.isAffinityValid(affinity)) {
        if (globalRegionManager.isRegionHealthy(affinity.regionCode)) {
          affinity.lastAccessedAt = new Date().toISOString();
          this.sessionAffinity.set(sessionId, affinity);
          return { regionCode: affinity.regionCode, reason: 'session_affinity' };
        }
        // Affinity region is unhealthy – fall through to pick a new one
        this.sessionAffinity.delete(sessionId);
      }
    }

    const activeRegions = globalRegionManager.getActiveRegions()
      .filter(r => globalRegionManager.isRegionHealthy(r.regionCode));

    if (activeRegions.length === 0) {
      // Complete blackout – use any active region even if unhealthy
      const any = globalRegionManager.getActiveRegions()[0];
      return { regionCode: any?.regionCode ?? 'us-east-1', reason: 'fallback' };
    }

    // 2. Geo-nearest
    if (this.config.geoRoutingEnabled && clientGeo) {
      const nearest = this.getNearestRegion(clientGeo, activeRegions);
      if (nearest) {
        if (sessionId) this.setAffinity(sessionId, nearest.regionCode);
        return {
          regionCode: nearest.regionCode,
          reason: 'geo_nearest',
          latencyEstimateMs: this.estimateLatency(clientGeo, nearest),
        };
      }
    }

    // 3. Weighted random
    if (this.config.weightedRoutingEnabled) {
      const codes = activeRegions.map(r => r.regionCode);
      const selected = globalRegionManager.selectRegionWeighted(codes);
      if (selected) {
        if (sessionId) this.setAffinity(sessionId, selected);
        return { regionCode: selected, reason: 'weighted' };
      }
    }

    // 4. Fallback – first active healthy region
    const fallback = activeRegions[0].regionCode;
    if (sessionId) this.setAffinity(sessionId, fallback);
    return { regionCode: fallback, reason: 'fallback' };
  }

  // -------------------------------------------------------------------------
  // Geo-DNS helpers
  // -------------------------------------------------------------------------

  /**
   * Returns the nearest active+healthy region to the client's geo coordinates.
   */
  private getNearestRegion(
    clientGeo: GeoLocation,
    candidates: RegionConfig[],
  ): RegionConfig | undefined {
    let nearest: RegionConfig | undefined;
    let minDistance = Infinity;

    for (const region of candidates) {
      if (region.geoLat === undefined || region.geoLng === undefined) continue;
      const dist = this.haversineKm(clientGeo.lat, clientGeo.lng, region.geoLat, region.geoLng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = region;
      }
    }

    return nearest;
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private estimateLatency(clientGeo: GeoLocation, region: RegionConfig): number {
    const clientContinent = clientGeo.continent ?? 'Other';
    return GEO_LATENCY_MATRIX[clientContinent]?.[region.continent] ?? 100;
  }

  // -------------------------------------------------------------------------
  // Session affinity
  // -------------------------------------------------------------------------

  private setAffinity(sessionId: string, regionCode: string): void {
    this.sessionAffinity.set(sessionId, {
      sessionId,
      regionCode,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    });
  }

  private isAffinityValid(record: SessionAffinityRecord): boolean {
    return Date.now() - new Date(record.lastAccessedAt).getTime() < this.config.sessionAffinityTtlMs;
  }

  clearSessionAffinity(sessionId: string): void {
    this.sessionAffinity.delete(sessionId);
  }

  migrateSessionAffinity(sessionId: string, newRegion: string): void {
    const record = this.sessionAffinity.get(sessionId);
    if (record) {
      record.regionCode = newRegion;
      record.lastAccessedAt = new Date().toISOString();
      this.sessionAffinity.set(sessionId, record);
    }
  }

  /** Migrate all sessions away from a failed region */
  failoverSessionAffinity(failedRegion: string): number {
    let migrated = 0;
    for (const [sessionId, record] of this.sessionAffinity.entries()) {
      if (record.regionCode === failedRegion) {
        this.sessionAffinity.delete(sessionId);
        migrated++;
      }
    }
    return migrated;
  }

  // -------------------------------------------------------------------------
  // Request queuing
  // -------------------------------------------------------------------------

  enqueueRequest(payload: unknown, sessionId?: string): string | null {
    if (this.requestQueue.length >= this.config.maxQueueSize) {
      return null;
    }
    const req: QueuedRequest = {
      id: crypto.randomUUID(),
      sessionId,
      payload,
      queuedAt: new Date().toISOString(),
      retries: 0,
    };
    this.requestQueue.push(req);
    return req.id;
  }

  getQueueLength(): number {
    return this.requestQueue.length;
  }

  startQueueDrain(handler: (req: QueuedRequest) => Promise<void>): void {
    if (this.drainIntervalHandle) return;
    this.drainIntervalHandle = setInterval(async () => {
      if (this.requestQueue.length === 0) return;
      const batch = this.requestQueue.splice(0, 50);
      await Promise.allSettled(batch.map(req => handler(req)));
    }, this.config.queueDrainIntervalMs);
  }

  stopQueueDrain(): void {
    if (this.drainIntervalHandle) {
      clearInterval(this.drainIntervalHandle);
      this.drainIntervalHandle = null;
    }
  }

  // -------------------------------------------------------------------------
  // Health-aware load balancing
  // -------------------------------------------------------------------------

  /**
   * Returns a sorted list of candidate regions for a continent,
   * ordered by health score then weight.
   */
  getBestRegionsForContinent(continent: string): RegionConfig[] {
    const regions = globalRegionManager
      .getActiveRegions()
      .filter(r => r.continent === continent && globalRegionManager.isRegionHealthy(r.regionCode));

    return regions.sort((a, b) => {
      const scoreA = globalRegionManager.getHealthScore(a.regionCode)?.score ?? 0;
      const scoreB = globalRegionManager.getHealthScore(b.regionCode)?.score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.weight - a.weight;
    });
  }

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------

  pruneExpiredAffinities(): number {
    let pruned = 0;
    for (const [sessionId, record] of this.sessionAffinity.entries()) {
      if (!this.isAffinityValid(record)) {
        this.sessionAffinity.delete(sessionId);
        pruned++;
      }
    }
    return pruned;
  }

  getStats(): {
    activeAffinities: number;
    queueLength: number;
    healthyRegions: number;
  } {
    return {
      activeAffinities: this.sessionAffinity.size,
      queueLength: this.requestQueue.length,
      healthyRegions: globalRegionManager.getActiveRegions()
        .filter(r => globalRegionManager.isRegionHealthy(r.regionCode)).length,
    };
  }
}

export const trafficRouter = new TrafficRouter();
export default TrafficRouter;
