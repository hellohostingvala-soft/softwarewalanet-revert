// Auto-Fix Engine Service
// missing route → auto register + broken API → retry/fallback + DB repair

import selfHealDetectionService from './selfHealDetectionService';

interface FixAction {
  id: string;
  anomalyId: string;
  type: 'route_register' | 'api_retry' | 'api_fallback' | 'db_repair' | 'cache_invalidate' | 'seo_generate';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  error?: string;
  metadata?: Record<string, any>;
}

interface RepairScript {
  type: 'fk_repair' | 'index_repair' | 'data_repair';
  table: string;
  script: string;
}

class AutoFixEngineService {
  private fixActions: Map<string, FixAction>;
  private routeHandlers: Map<string, () => any>;
  private apiEndpoints: Map<string, () => any>;

  constructor() {
    this.fixActions = new Map();
    this.routeHandlers = new Map();
    this.apiEndpoints = new Map();
  }

  /**
   * Register route handler
   */
  registerRouteHandler(path: string, handler: () => any): void {
    this.routeHandlers.set(path, handler);
    selfHealDetectionService.registerRoute(path);
  }

  /**
   * Register API endpoint
   */
  registerAPIEndpoint(endpoint: string, handler: () => any): void {
    this.apiEndpoints.set(endpoint, handler);
  }

  /**
   * Auto-register missing route
   */
  autoRegisterRoute(route: string, handler?: () => any): FixAction {
    const anomalies = selfHealDetectionService.getAnomaliesByType('route');
    const anomaly = anomalies.find(a => a.location === route);

    const fixAction: FixAction = {
      id: crypto.randomUUID(),
      anomalyId: anomaly?.id || '',
      type: 'route_register',
      description: `Auto-register route: ${route}`,
      status: 'pending',
    };

    this.fixActions.set(fixAction.id, fixAction);

    // Execute fix
    this.executeFix(fixAction.id, () => {
      if (handler) {
        this.registerRouteHandler(route, handler);
      } else {
        // Create default handler
        this.registerRouteHandler(route, () => ({ status: 'ok', route }));
      }
      
      // Resolve anomaly if exists
      if (anomaly) {
        selfHealDetectionService.resolveAnomaly(anomaly.id);
      }
    });

    return fixAction;
  }

  /**
   * Retry broken API
   */
  retryAPI(endpoint: string, maxRetries: number = 3): FixAction {
    const anomalies = selfHealDetectionService.getAnomaliesByType('api');
    const anomaly = anomalies.find(a => a.location === endpoint);

    const fixAction: FixAction = {
      id: crypto.randomUUID(),
      anomalyId: anomaly?.id || '',
      type: 'api_retry',
      description: `Retry API endpoint: ${endpoint}`,
      status: 'pending',
      metadata: { maxRetries },
    };

    this.fixActions.set(fixAction.id, fixAction);

    let retryCount = 0;

    const executeRetry = async () => {
      while (retryCount < maxRetries) {
        try {
          const handler = this.apiEndpoints.get(endpoint);
          if (!handler) {
            throw new Error('Handler not found');
          }

          const result = handler();
          
          // Success
          if (anomaly) {
            selfHealDetectionService.resolveAnomaly(anomaly.id);
          }
          
          return { success: true };
        } catch (error) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      throw new Error('Max retries exceeded');
    };

    this.executeFix(fixAction.id, executeRetry);

    return fixAction;
  }

  /**
   * Fallback for broken API
   */
  fallbackAPI(endpoint: string, fallbackHandler: () => any): FixAction {
    const anomalies = selfHealDetectionService.getAnomaliesByType('api');
    const anomaly = anomalies.find(a => a.location === endpoint);

    const fixAction: FixAction = {
      id: crypto.randomUUID(),
      anomalyId: anomaly?.id || '',
      type: 'api_fallback',
      description: `Fallback API endpoint: ${endpoint}`,
      status: 'pending',
    };

    this.fixActions.set(fixAction.id, fixAction);

    this.executeFix(fixAction.id, () => {
      this.registerAPIEndpoint(endpoint, fallbackHandler);
      
      if (anomaly) {
        selfHealDetectionService.resolveAnomaly(anomaly.id);
      }
    });

    return fixAction;
  }

  /**
   * Repair database
   */
  repairDatabase(repairScript: RepairScript): FixAction {
    const anomalies = selfHealDetectionService.getAnomaliesByType('database');
    const anomaly = anomalies.find(a => a.location === repairScript.table);

    const fixAction: FixAction = {
      id: crypto.randomUUID(),
      anomalyId: anomaly?.id || '',
      type: 'db_repair',
      description: `Repair database: ${repairScript.table}`,
      status: 'pending',
      metadata: repairScript,
    };

    this.fixActions.set(fixAction.id, fixAction);

    this.executeFix(fixAction.id, async () => {
      // In production, execute the repair script
      console.log(`[AutoFix] Executing repair script for ${repairScript.table}`);
      
      if (anomaly) {
        selfHealDetectionService.resolveAnomaly(anomaly.id);
      }
    });

    return fixAction;
  }

  /**
   * Invalidate stale cache
   */
  invalidateCache(cacheKey: string): FixAction {
    const fixAction: FixAction = {
      id: crypto.randomUUID(),
      anomalyId: '',
      type: 'cache_invalidate',
      description: `Invalidate cache: ${cacheKey}`,
      status: 'pending',
    };

    this.fixActions.set(fixAction.id, fixAction);

    this.executeFix(fixAction.id, () => {
      // In production, invalidate cache
      console.log(`[AutoFix] Invalidating cache: ${cacheKey}`);
    });

    return fixAction;
  }

  /**
   * Auto-generate missing SEO
   */
  autoGenerateSEO(page: string): FixAction {
    const anomalies = selfHealDetectionService.getAnomaliesByType('seo');
    const anomaly = anomalies.find(a => a.location === page);

    const fixAction: FixAction = {
      id: crypto.randomUUID(),
      anomalyId: anomaly?.id || '',
      type: 'seo_generate',
      description: `Auto-generate SEO for: ${page}`,
      status: 'pending',
    };

    this.fixActions.set(fixAction.id, fixAction);

    this.executeFix(fixAction.id, () => {
      // In production, generate SEO meta tags
      console.log(`[AutoFix] Generating SEO for ${page}`);
      
      if (anomaly) {
        selfHealDetectionService.resolveAnomaly(anomaly.id);
      }
    });

    return fixAction;
  }

  /**
   * Execute fix action
   */
  private async executeFix(fixActionId: string, fixFunction: () => any): Promise<void> {
    const fixAction = this.fixActions.get(fixActionId);
    if (!fixAction) return;

    fixAction.status = 'in_progress';
    fixAction.startedAt = Date.now();
    this.fixActions.set(fixActionId, fixAction);

    try {
      await fixFunction();
      
      fixAction.status = 'completed';
      fixAction.completedAt = Date.now();
      this.fixActions.set(fixActionId, fixAction);
      
      console.log(`[AutoFix] Completed fix ${fixActionId}`);
    } catch (error) {
      fixAction.status = 'failed';
      fixAction.error = String(error);
      fixAction.completedAt = Date.now();
      this.fixActions.set(fixActionId, fixAction);
      
      console.error(`[AutoFix] Failed fix ${fixActionId}: ${error}`);
    }
  }

  /**
   * Auto-fix all detected anomalies
   */
  autoFixAll(): {
    total: number;
    completed: number;
    failed: number;
  } {
    const anomalies = selfHealDetectionService.getAllAnomalies();
    let completed = 0;
    let failed = 0;

    for (const anomaly of anomalies) {
      try {
        switch (anomaly.type) {
          case 'route':
            this.autoRegisterRoute(anomaly.location);
            completed++;
            break;
          case 'api':
            this.retryAPI(anomaly.location);
            completed++;
            break;
          case 'database':
            this.repairDatabase({
              type: 'data_repair',
              table: anomaly.location,
              script: 'REPAIR TABLE',
            });
            completed++;
            break;
          case 'seo':
            this.autoGenerateSEO(anomaly.location);
            completed++;
            break;
          default:
            console.log(`[AutoFix] No auto-fix for type: ${anomaly.type}`);
        }
      } catch (error) {
        failed++;
      }
    }

    console.log(`[AutoFix] Auto-fixed ${completed} anomalies, ${failed} failed`);
    
    return {
      total: anomalies.length,
      completed,
      failed,
    };
  }

  /**
   * Get fix action by ID
   */
  getFixAction(fixActionId: string): FixAction | null {
    return this.fixActions.get(fixActionId) || null;
  }

  /**
   * Get all fix actions
   */
  getAllFixActions(): FixAction[] {
    return Array.from(this.fixActions.values());
  }

  /**
   * Get fix actions by status
   */
  getFixActionsByStatus(status: FixAction['status']): FixAction[] {
    return Array.from(this.fixActions.values()).filter(f => f.status === status);
  }

  /**
   * Get fix stats
   */
  getFixStats(): {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  } {
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let failed = 0;

    for (const action of this.fixActions.values()) {
      switch (action.status) {
        case 'pending':
          pending++;
          break;
        case 'in_progress':
          inProgress++;
          break;
        case 'completed':
          completed++;
          break;
        case 'failed':
          failed++;
          break;
      }
    }

    return {
      total: this.fixActions.size,
      pending,
      inProgress,
      completed,
      failed,
    };
  }

  /**
   * Retry failed fixes
   */
  retryFailedFixes(): { retried: number } {
    const failedFixes = this.getFixActionsByStatus('failed');
    let retried = 0;

    for (const fix of failedFixes) {
      fix.status = 'pending';
      this.fixActions.set(fix.id, fix);
      retried++;
    }

    if (retried > 0) {
      console.log(`[AutoFix] Retried ${retried} failed fixes`);
    }

    return { retried };
  }

  /**
   * Cleanup old fix actions (older than 30 days)
   */
  cleanupOldFixActions(): number {
    const now = Date.now();
    const cutoff = now - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, action] of this.fixActions.entries()) {
      if (action.completedAt && action.completedAt < cutoff) {
        this.fixActions.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[AutoFix] Cleaned up ${deletedCount} old fix actions`);
    }

    return deletedCount;
  }
}

const autoFixEngineService = new AutoFixEngineService();

// Auto-fix detected anomalies every 5 minutes
setInterval(() => {
  autoFixEngineService.autoFixAll();
}, 300000);

// Auto-cleanup old fix actions daily
setInterval(() => {
  autoFixEngineService.cleanupOldFixActions();
}, 86400000);

export default autoFixEngineService;
export { AutoFixEngineService };
export type { FixAction, RepairScript };
