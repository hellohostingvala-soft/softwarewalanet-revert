// Hook for Franchise Dashboard Service
// Connects franchise UI to backend service with Boss Panel sync

import { useState, useEffect, useCallback } from 'react';
import {
  getFranchiseDashboardData,
  updateFranchiseMetrics,
  addFranchiseCommission,
  getPendingFranchiseCommissions,
  approveFranchiseCommission,
  payFranchiseCommission,
  addFranchiseReseller,
  getFranchiseResellers,
  updateResellerStatus,
  addTerritory,
  getFranchiseTerritories,
  getFranchiseStatistics,
} from '../services/franchiseDashboardService';

export interface FranchiseDashboardData {
  metrics: any;
  commissions: any[];
  resellers: any[];
  territories: any[];
}

export const useFranchiseDashboardService = (franchiseId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<FranchiseDashboardData | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = getFranchiseDashboardData(franchiseId);
      setDashboardData(data);
      
      const stats = getFranchiseStatistics(franchiseId);
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [franchiseId]);

  // Update metrics
  const updateMetrics = useCallback(async (metrics: any) => {
    setLoading(true);
    setError(null);
    try {
      updateFranchiseMetrics(franchiseId, metrics);
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metrics');
    } finally {
      setLoading(false);
    }
  }, [franchiseId, loadDashboardData]);

  // Add commission
  const addCommission = useCallback(async (commission: any) => {
    setLoading(true);
    setError(null);
    try {
      addFranchiseCommission({
        ...commission,
        franchiseId,
      });
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add commission');
    } finally {
      setLoading(false);
    }
  }, [franchiseId, loadDashboardData]);

  // Get pending commissions
  const getPendingCommissions = useCallback(() => {
    return getPendingFranchiseCommissions(franchiseId);
  }, [franchiseId]);

  // Approve commission
  const approveCommission = useCallback(async (commissionId: string) => {
    setLoading(true);
    setError(null);
    try {
      approveFranchiseCommission(commissionId);
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve commission');
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

  // Pay commission
  const payCommission = useCallback(async (commissionId: string) => {
    setLoading(true);
    setError(null);
    try {
      payFranchiseCommission(commissionId);
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pay commission');
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

  // Add reseller
  const addReseller = useCallback(async (reseller: any) => {
    setLoading(true);
    setError(null);
    try {
      addFranchiseReseller({
        ...reseller,
        franchiseId,
      });
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reseller');
    } finally {
      setLoading(false);
    }
  }, [franchiseId, loadDashboardData]);

  // Get resellers
  const getResellers = useCallback(() => {
    return getFranchiseResellers(franchiseId);
  }, [franchiseId]);

  // Update reseller status
  const updateResellerStatusFn = useCallback(async (resellerId: string, status: 'active' | 'inactive' | 'suspended') => {
    setLoading(true);
    setError(null);
    try {
      updateResellerStatus(franchiseId, resellerId, status);
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reseller status');
    } finally {
      setLoading(false);
    }
  }, [franchiseId, loadDashboardData]);

  // Add territory
  const addTerritoryFn = useCallback(async (territory: any) => {
    setLoading(true);
    setError(null);
    try {
      addTerritory({
        ...territory,
        franchiseId,
      });
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add territory');
    } finally {
      setLoading(false);
    }
  }, [franchiseId, loadDashboardData]);

  // Get territories
  const getTerritories = useCallback(() => {
    return getFranchiseTerritories(franchiseId);
  }, [franchiseId]);

  // Load on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    loading,
    error,
    dashboardData,
    statistics,
    loadDashboardData,
    updateMetrics,
    addCommission,
    getPendingCommissions,
    approveCommission,
    payCommission,
    addReseller,
    getResellers,
    updateResellerStatus: updateResellerStatusFn,
    addTerritory: addTerritoryFn,
    getTerritories,
  };
};
