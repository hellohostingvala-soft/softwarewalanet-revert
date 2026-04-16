// Franchise Dashboard Service
// Franchise dashboard connected to Boss Panel via role sync

export interface FranchiseMetrics {
  franchiseId: string;
  totalSales: number;
  totalRevenue: number;
  commissionEarned: number;
  pendingCommission: number;
  activeResellers: number;
  totalResellers: number;
  productsSold: number;
  conversionRate: number;
  territory: string;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface FranchiseCommission {
  commissionId: string;
  franchiseId: string;
  resellerId: string;
  orderId: string;
  productId: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
}

export interface FranchiseReseller {
  resellerId: string;
  franchiseId: string;
  resellerName: string;
  resellerEmail: string;
  totalSales: number;
  totalRevenue: number;
  commissionEarned: number;
  activeCustomers: number;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: Date;
}

export interface FranchiseTerritory {
  territoryId: string;
  franchiseId: string;
  territoryName: string;
  region: string;
  country: string;
  cities: string[];
  assignedResellers: number;
  totalSales: number;
  totalRevenue: number;
}

// In-memory storage
const franchiseMetrics: Map<string, FranchiseMetrics> = new Map();
const franchiseCommissions: Map<string, FranchiseCommission[]> = new Map();
const franchiseResellers: Map<string, FranchiseReseller[]> = new Map();
const franchiseTerritories: Map<string, FranchiseTerritory[]> = new Map();

/**
 * Get franchise dashboard data
 */
export function getFranchiseDashboardData(franchiseId: string): {
  metrics: FranchiseMetrics | null;
  commissions: FranchiseCommission[];
  resellers: FranchiseReseller[];
  territories: FranchiseTerritory[];
} {
  const metrics = franchiseMetrics.get(franchiseId) || null;
  const commissions = franchiseCommissions.get(franchiseId) || [];
  const resellers = franchiseResellers.get(franchiseId) || [];
  const territories = franchiseTerritories.get(franchiseId) || [];

  return {
    metrics,
    commissions,
    resellers,
    territories,
  };
}

/**
 * Update franchise metrics
 */
export function updateFranchiseMetrics(franchiseId: string, metrics: Partial<FranchiseMetrics>): boolean {
  const existing = franchiseMetrics.get(franchiseId);
  const updated = existing ? { ...existing, ...metrics } : { franchiseId, ...metrics } as FranchiseMetrics;
  
  franchiseMetrics.set(franchiseId, updated);

  // Sync to Boss Panel
  syncToBossPanel('franchise', franchiseId, updated);

  return true;
}

/**
 * Add commission
 */
export function addFranchiseCommission(commission: Omit<FranchiseCommission, 'commissionId' | 'createdAt'>): FranchiseCommission {
  const commissionId = crypto.randomUUID();
  const newCommission: FranchiseCommission = {
    ...commission,
    commissionId,
    createdAt: new Date(),
  };

  const commissions = franchiseCommissions.get(commission.franchiseId) || [];
  commissions.push(newCommission);
  franchiseCommissions.set(commission.franchiseId, commissions);

  // Sync to Boss Panel
  syncToBossPanel('franchise', commission.franchiseId, { commission: newCommission });

  return newCommission;
}

/**
 * Get pending commissions
 */
export function getPendingFranchiseCommissions(franchiseId: string): FranchiseCommission[] {
  const commissions = franchiseCommissions.get(franchiseId) || [];
  return commissions.filter(c => c.status === 'pending');
}

/**
 * Approve commission
 */
export function approveFranchiseCommission(commissionId: string): boolean {
  for (const [franchiseId, commissions] of franchiseCommissions.entries()) {
    const commission = commissions.find(c => c.commissionId === commissionId);
    if (commission) {
      commission.status = 'approved';
      commission.approvedAt = new Date();
      franchiseCommissions.set(franchiseId, commissions);

      // Sync to Boss Panel
      syncToBossPanel('franchise', franchiseId, { commissionApproved: commission });

      return true;
    }
  }
  return false;
}

/**
 * Pay commission
 */
export function payFranchiseCommission(commissionId: string): boolean {
  for (const [franchiseId, commissions] of franchiseCommissions.entries()) {
    const commission = commissions.find(c => c.commissionId === commissionId);
    if (commission && commission.status === 'approved') {
      commission.status = 'paid';
      commission.paidAt = new Date();
      franchiseCommissions.set(franchiseId, commissions);

      // Sync to Boss Panel
      syncToBossPanel('franchise', franchiseId, { commissionPaid: commission });

      return true;
    }
  }
  return false;
}

/**
 * Add reseller
 */
export function addFranchiseReseller(reseller: Omit<FranchiseReseller, 'resellerId' | 'joinedAt'>): FranchiseReseller {
  const resellerId = crypto.randomUUID();
  const newReseller: FranchiseReseller = {
    ...reseller,
    resellerId,
    joinedAt: new Date(),
  };

  const resellers = franchiseResellers.get(reseller.franchiseId) || [];
  resellers.push(newReseller);
  franchiseResellers.set(reseller.franchiseId, resellers);

  // Update active resellers count
  const metrics = franchiseMetrics.get(reseller.franchiseId);
  if (metrics) {
    metrics.totalResellers = resellers.length;
    metrics.activeResellers = resellers.filter(r => r.status === 'active').length;
    franchiseMetrics.set(reseller.franchiseId, metrics);
  }

  // Sync to Boss Panel
  syncToBossPanel('franchise', reseller.franchiseId, { reseller: newReseller });

  return newReseller;
}

/**
 * Get resellers
 */
export function getFranchiseResellers(franchiseId: string): FranchiseReseller[] {
  return franchiseResellers.get(franchiseId) || [];
}

/**
 * Update reseller status
 */
export function updateResellerStatus(franchiseId: string, resellerId: string, status: 'active' | 'inactive' | 'suspended'): boolean {
  const resellers = franchiseResellers.get(franchiseId);
  if (!resellers) return false;

  const reseller = resellers.find(r => r.resellerId === resellerId);
  if (!reseller) return false;

  reseller.status = status;
  franchiseResellers.set(franchiseId, resellers);

  // Update active resellers count
  const metrics = franchiseMetrics.get(franchiseId);
  if (metrics) {
    metrics.activeResellers = resellers.filter(r => r.status === 'active').length;
    franchiseMetrics.set(franchiseId, metrics);
  }

  // Sync to Boss Panel
  syncToBossPanel('franchise', franchiseId, { resellerStatusUpdated: { resellerId, status } });

  return true;
}

/**
 * Add territory
 */
export function addTerritory(territory: Omit<FranchiseTerritory, 'territoryId'>): FranchiseTerritory {
  const territoryId = crypto.randomUUID();
  const newTerritory: FranchiseTerritory = {
    ...territory,
    territoryId,
  };

  const territories = franchiseTerritories.get(territory.franchiseId) || [];
  territories.push(newTerritory);
  franchiseTerritories.set(territory.franchiseId, territories);

  // Sync to Boss Panel
  syncToBossPanel('franchise', territory.franchiseId, { territory: newTerritory });

  return newTerritory;
}

/**
 * Get territories
 */
export function getFranchiseTerritories(franchiseId: string): FranchiseTerritory[] {
  return franchiseTerritories.get(franchiseId) || [];
}

/**
 * Get franchise statistics
 */
export function getFranchiseStatistics(franchiseId: string): {
  totalSales: number;
  totalRevenue: number;
  commissionEarned: number;
  pendingCommission: number;
  activeResellers: number;
  totalResellers: number;
  productsSold: number;
  conversionRate: number;
  territories: number;
} {
  const metrics = franchiseMetrics.get(franchiseId);
  const commissions = franchiseCommissions.get(franchiseId) || [];
  const resellers = franchiseResellers.get(franchiseId) || [];
  const territories = franchiseTerritories.get(franchiseId) || [];

  const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const pendingCommission = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);
  const activeResellers = resellers.filter(r => r.status === 'active').length;
  const totalResellers = resellers.length;

  return {
    totalSales: metrics?.totalSales || 0,
    totalRevenue: metrics?.totalRevenue || 0,
    commissionEarned: totalCommission,
    pendingCommission,
    activeResellers,
    totalResellers,
    productsSold: metrics?.productsSold || 0,
    conversionRate: metrics?.conversionRate || 0,
    territories: territories.length,
  };
}

/**
 * Sync to Boss Panel
 */
function syncToBossPanel(role: string, entityId: string, data: any): void {
  // This will use the roleDashboardSync service
  // For now, we'll log the sync
  console.log(`[Franchise Dashboard] Syncing to Boss Panel: ${role} - ${entityId}`, data);
}

/**
 * Delete franchise data
 */
export function deleteFranchiseData(franchiseId: string): boolean {
  franchiseMetrics.delete(franchiseId);
  franchiseCommissions.delete(franchiseId);
  franchiseResellers.delete(franchiseId);
  franchiseTerritories.delete(franchiseId);
  return true;
}

/**
 * Get all franchises
 */
export function getAllFranchises(): string[] {
  return Array.from(franchiseMetrics.keys());
}
