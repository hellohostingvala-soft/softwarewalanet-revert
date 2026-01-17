/**
 * useKPIValidation - STEP 11: KPI & Count Validation
 * Ensures all dashboard numbers match actual data and respect role scope
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalAppStore } from '@/stores/globalAppStore';
import { useDataScope } from './useDataScope';

export interface KPIDefinition {
  key: string;
  table: string;
  countField?: string;
  sumField?: string;
  filter?: Record<string, any>;
  refreshInterval?: number; // ms
}

export interface KPIValue {
  key: string;
  value: number;
  isLoading: boolean;
  lastUpdated: Date | null;
  error?: string;
}

export function useKPIValidation(definitions: KPIDefinition[]) {
  const [kpis, setKPIs] = useState<Record<string, KPIValue>>({});
  const { updateKPICache, getKPIValue, kpiCache } = useGlobalAppStore();
  const { scopeLevel, scopeIds, buildScopedQuery } = useDataScope();

  // Fetch a single KPI value with scope filtering
  const fetchKPI = useCallback(async (def: KPIDefinition): Promise<number> => {
    try {
      // Check cache first
      const cached = getKPIValue(def.key);
      if (cached !== null) {
        return cached;
      }

      // Build query with scope
      let query: any = supabase.from(def.table as any).select(
        def.sumField ? `${def.sumField}.sum()` : '*',
        def.sumField ? {} : { count: 'exact', head: true }
      );

      // Apply definition filters
      if (def.filter) {
        Object.entries(def.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'object' && value.gt !== undefined) {
              query = query.gt(key, value.gt);
            } else if (typeof value === 'object' && value.gte !== undefined) {
              query = query.gte(key, value.gte);
            } else if (typeof value === 'object' && value.lt !== undefined) {
              query = query.lt(key, value.lt);
            } else if (typeof value === 'object' && value.lte !== undefined) {
              query = query.lte(key, value.lte);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply scope filter for non-global roles
      if (scopeLevel !== 'global') {
        switch (scopeLevel) {
          case 'franchise_owned':
            query = query.or(`franchise_user_id.eq.${scopeIds.userId},user_id.eq.${scopeIds.userId}`);
            break;
          case 'assigned':
            query = query.eq('assigned_to', scopeIds.userId);
            break;
          case 'country':
            if (scopeIds.countryId) {
              query = query.eq('country_id', scopeIds.countryId);
            }
            break;
          case 'continent':
            if (scopeIds.continentId) {
              query = query.eq('continent_id', scopeIds.continentId);
            }
            break;
        }
      }

      const { data, count, error } = await query;

      if (error) throw error;

      let value: number;
      if (def.sumField && data && data[0]) {
        value = data[0][`${def.sumField}_sum`] || 0;
      } else {
        value = count || 0;
      }

      // Update cache
      updateKPICache(def.key, value);

      return value;
    } catch (err) {
      console.error(`KPI fetch error for ${def.key}:`, err);
      return 0;
    }
  }, [getKPIValue, updateKPICache, scopeLevel, scopeIds]);

  // Fetch all KPIs
  const fetchAllKPIs = useCallback(async () => {
    const results: Record<string, KPIValue> = {};

    // Set all to loading
    definitions.forEach(def => {
      results[def.key] = {
        key: def.key,
        value: kpis[def.key]?.value || 0,
        isLoading: true,
        lastUpdated: kpis[def.key]?.lastUpdated || null,
      };
    });
    setKPIs(results);

    // Fetch all in parallel
    await Promise.all(
      definitions.map(async (def) => {
        try {
          const value = await fetchKPI(def);
          setKPIs(prev => ({
            ...prev,
            [def.key]: {
              key: def.key,
              value,
              isLoading: false,
              lastUpdated: new Date(),
            },
          }));
        } catch (err: any) {
          setKPIs(prev => ({
            ...prev,
            [def.key]: {
              key: def.key,
              value: prev[def.key]?.value || 0,
              isLoading: false,
              lastUpdated: prev[def.key]?.lastUpdated || null,
              error: err.message,
            },
          }));
        }
      })
    );
  }, [definitions, fetchKPI, kpis]);

  // Refresh a single KPI
  const refreshKPI = useCallback(async (key: string) => {
    const def = definitions.find(d => d.key === key);
    if (!def) return;

    setKPIs(prev => ({
      ...prev,
      [key]: { ...prev[key], isLoading: true },
    }));

    try {
      const value = await fetchKPI(def);
      setKPIs(prev => ({
        ...prev,
        [key]: {
          key,
          value,
          isLoading: false,
          lastUpdated: new Date(),
        },
      }));
    } catch (err: any) {
      setKPIs(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          isLoading: false,
          error: err.message,
        },
      }));
    }
  }, [definitions, fetchKPI]);

  // Initial fetch
  useEffect(() => {
    fetchAllKPIs();
  }, [scopeLevel]); // Refetch when scope changes

  // Set up refresh intervals
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    definitions.forEach(def => {
      if (def.refreshInterval && def.refreshInterval > 0) {
        const interval = setInterval(() => {
          refreshKPI(def.key);
        }, def.refreshInterval);
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [definitions, refreshKPI]);

  // Get KPI value helper
  const getValue = useCallback((key: string): number => {
    return kpis[key]?.value || 0;
  }, [kpis]);

  // Check if KPI is loading
  const isKPILoading = useCallback((key: string): boolean => {
    return kpis[key]?.isLoading || false;
  }, [kpis]);

  // Validate KPI matches list count
  const validateAgainstList = useCallback((
    key: string,
    listData: any[]
  ): { valid: boolean; discrepancy: number } => {
    const kpiValue = kpis[key]?.value || 0;
    const listCount = listData.length;
    const discrepancy = Math.abs(kpiValue - listCount);
    
    return {
      valid: discrepancy === 0,
      discrepancy,
    };
  }, [kpis]);

  return {
    kpis,
    getValue,
    isKPILoading,
    refreshKPI,
    refreshAllKPIs: fetchAllKPIs,
    validateAgainstList,
  };
}

// Pre-defined KPI definitions for common use cases
export const COMMON_KPI_DEFINITIONS: Record<string, KPIDefinition[]> = {
  leads: [
    { key: 'total_leads', table: 'leads', filter: {} },
    { key: 'active_leads', table: 'leads', filter: { status: 'active' } },
    { key: 'converted_leads', table: 'leads', filter: { status: 'converted' } },
    { key: 'pending_leads', table: 'leads', filter: { status: 'pending' } },
  ],
  tasks: [
    { key: 'total_tasks', table: 'developer_tasks', filter: {} },
    { key: 'open_tasks', table: 'developer_tasks', filter: { status: 'open' } },
    { key: 'in_progress_tasks', table: 'developer_tasks', filter: { status: 'in_progress' } },
    { key: 'completed_tasks', table: 'developer_tasks', filter: { status: 'completed' } },
  ],
  users: [
    { key: 'total_users', table: 'profiles', filter: {} },
    { key: 'active_users', table: 'profiles', filter: { status: 'active' } },
    { key: 'pending_approval', table: 'profiles', filter: { is_approved: false } },
  ],
  franchises: [
    { key: 'total_franchises', table: 'franchise_accounts', filter: {} },
    { key: 'active_franchises', table: 'franchise_accounts', filter: { status: 'active' } },
  ],
};

export default useKPIValidation;
