// Franchise RBAC Service
// role=franchise_owner + region_bound + data_scope + geo filter

type FranchiseRole = 'franchise_owner' | 'franchise_manager' | 'franchise_staff';
type DataScope = 'own_region_only' | 'all_regions' | 'read_only';

interface FranchiseUser {
  id: string;
  userId: string;
  franchiseId: string;
  role: FranchiseRole;
  regionBound: {
    city?: string;
    state: string;
    country: string;
  };
  dataScope: DataScope;
  permissions: string[];
  createdAt: number;
  updatedAt: number;
}

interface Region {
  id: string;
  city: string;
  state: string;
  country: string;
  active: boolean;
}

class FranchiseRBACService {
  private franchiseUsers: Map<string, FranchiseUser>;
  private regions: Map<string, Region>;

  constructor() {
    this.franchiseUsers = new Map();
    this.regions = new Map();
    this.initializeDefaultRegions();
  }

  /**
   * Initialize default regions
   */
  private initializeDefaultRegions(): void {
    const defaultRegions: Region[] = [
      { id: 'reg_001', city: 'Mumbai', state: 'Maharashtra', country: 'India', active: true },
      { id: 'reg_002', city: 'Delhi', state: 'Delhi', country: 'India', active: true },
      { id: 'reg_003', city: 'Bangalore', state: 'Karnataka', country: 'India', active: true },
      { id: 'reg_004', city: 'Chennai', state: 'Tamil Nadu', country: 'India', active: true },
      { id: 'reg_005', city: 'Hyderabad', state: 'Telangana', country: 'India', active: true },
    ];

    defaultRegions.forEach(region => {
      this.regions.set(region.id, region);
    });
  }

  /**
   * Create franchise user
   */
  createFranchiseUser(
    userId: string,
    franchiseId: string,
    role: FranchiseRole,
    regionBound: { city?: string; state: string; country: string },
    dataScope: DataScope = 'own_region_only'
  ): FranchiseUser {
    const permissions = this.getDefaultPermissions(role);

    const user: FranchiseUser = {
      id: crypto.randomUUID(),
      userId,
      franchiseId,
      role,
      regionBound,
      dataScope,
      permissions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.franchiseUsers.set(user.id, user);

    console.log(`[FranchiseRBAC] Created franchise user ${userId} with role ${role}`);
    return user;
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: FranchiseRole): string[] {
    switch (role) {
      case 'franchise_owner':
        return [
          'dashboard.view',
          'marketplace.view',
          'marketplace.buy',
          'orders.view',
          'orders.create',
          'orders.manage',
          'leads.view',
          'leads.assign',
          'leads.manage',
          'employees.view',
          'employees.create',
          'employees.manage',
          'invoices.view',
          'invoices.create',
          'wallet.view',
          'wallet.manage',
          'support.view',
          'support.manage',
          'legal.view',
          'legal.manage',
          'settings.view',
          'settings.manage',
          'seo.view',
          'seo.manage',
        ];
      case 'franchise_manager':
        return [
          'dashboard.view',
          'marketplace.view',
          'orders.view',
          'orders.manage',
          'leads.view',
          'leads.assign',
          'employees.view',
          'invoices.view',
          'wallet.view',
          'support.view',
          'support.manage',
          'legal.view',
          'settings.view',
          'seo.view',
        ];
      case 'franchise_staff':
        return [
          'dashboard.view',
          'marketplace.view',
          'orders.view',
          'leads.view',
          'invoices.view',
          'wallet.view',
          'support.view',
        ];
      default:
        return [];
    }
  }

  /**
   * Check permission
   */
  hasPermission(franchiseUserId: string, permission: string): boolean {
    const user = this.franchiseUsers.get(franchiseUserId);
    if (!user) return false;

    return user.permissions.includes(permission);
  }

  /**
   * Check geo filter - user can only access data from their region
   */
  checkGeoFilter(franchiseUserId: string, targetRegion: { state: string; country: string }): boolean {
    const user = this.franchiseUsers.get(franchiseUserId);
    if (!user) return false;

    // If user has all_regions scope, bypass geo filter
    if (user.dataScope === 'all_regions') return true;

    // Check region match
    return (
      user.regionBound.state === targetRegion.state &&
      user.regionBound.country === targetRegion.country
    );
  }

  /**
   * Check data scope
   */
  checkDataScope(franchiseUserId: string, operation: 'read' | 'write' | 'delete'): boolean {
    const user = this.franchiseUsers.get(franchiseUserId);
    if (!user) return false;

    switch (user.dataScope) {
      case 'all_regions':
        return true;
      case 'own_region_only':
        return operation === 'read' || operation === 'write';
      case 'read_only':
        return operation === 'read';
      default:
        return false;
    }
  }

  /**
   * Get franchise user by user ID
   */
  getFranchiseUser(userId: string): FranchiseUser | null {
    return Array.from(this.franchiseUsers.values()).find(u => u.userId === userId) || null;
  }

  /**
   * Get franchise users by franchise ID
   */
  getFranchiseUsersByFranchise(franchiseId: string): FranchiseUser[] {
    return Array.from(this.franchiseUsers.values()).filter(u => u.franchiseId === franchiseId);
  }

  /**
   * Get franchise users by region
   */
  getFranchiseUsersByRegion(state: string, country: string): FranchiseUser[] {
    return Array.from(this.franchiseUsers.values()).filter(
      u => u.regionBound.state === state && u.regionBound.country === country
    );
  }

  /**
   * Update franchise user role
   */
  updateFranchiseUserRole(franchiseUserId: string, role: FranchiseRole): { success: boolean; error?: string } {
    const user = this.franchiseUsers.get(franchiseUserId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.role = role;
    user.permissions = this.getDefaultPermissions(role);
    user.updatedAt = Date.now();
    this.franchiseUsers.set(franchiseUserId, user);

    console.log(`[FranchiseRBAC] Updated user ${franchiseUserId} to role ${role}`);
    return { success: true };
  }

  /**
   * Update franchise user data scope
   */
  updateFranchiseUserDataScope(franchiseUserId: string, dataScope: DataScope): { success: boolean; error?: string } {
    const user = this.franchiseUsers.get(franchiseUserId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.dataScope = dataScope;
    user.updatedAt = Date.now();
    this.franchiseUsers.set(franchiseUserId, user);

    console.log(`[FranchiseRBAC] Updated user ${franchiseUserId} data scope to ${dataScope}`);
    return { success: true };
  }

  /**
   * Update franchise user region
   */
  updateFranchiseUserRegion(
    franchiseUserId: string,
    region: { city?: string; state: string; country: string }
  ): { success: boolean; error?: string } {
    const user = this.franchiseUsers.get(franchiseUserId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.regionBound = region;
    user.updatedAt = Date.now();
    this.franchiseUsers.set(franchiseUserId, user);

    console.log(`[FranchiseRBAC] Updated user ${franchiseUserId} region`);
    return { success: true };
  }

  /**
   * Add custom permission
   */
  addPermission(franchiseUserId: string, permission: string): { success: boolean; error?: string } {
    const user = this.franchiseUsers.get(franchiseUserId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.permissions.includes(permission)) {
      user.permissions.push(permission);
      user.updatedAt = Date.now();
      this.franchiseUsers.set(franchiseUserId, user);
    }

    return { success: true };
  }

  /**
   * Remove permission
   */
  removePermission(franchiseUserId: string, permission: string): { success: boolean; error?: string } {
    const user = this.franchiseUsers.get(franchiseUserId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.permissions = user.permissions.filter(p => p !== permission);
    user.updatedAt = Date.now();
    this.franchiseUsers.set(franchiseUserId, user);

    return { success: true };
  }

  /**
   * Get all regions
   */
  getAllRegions(): Region[] {
    return Array.from(this.regions.values()).filter(r => r.active);
  }

  /**
   * Get region by state/country
   */
  getRegion(state: string, country: string): Region | null {
    return Array.from(this.regions.values()).find(
      r => r.state === state && r.country === country
    ) || null;
  }

  /**
   * Add region
   */
  addRegion(region: Omit<Region, 'id'>): Region {
    const newRegion: Region = {
      ...region,
      id: crypto.randomUUID(),
    };

    this.regions.set(newRegion.id, newRegion);

    console.log(`[FranchiseRBAC] Added region ${newRegion.city}, ${newRegion.state}`);
    return newRegion;
  }

  /**
   * Deactivate region
   */
  deactivateRegion(regionId: string): { success: boolean; error?: string } {
    const region = this.regions.get(regionId);
    if (!region) {
      return { success: false, error: 'Region not found' };
    }

    region.active = false;
    this.regions.set(regionId, region);

    console.log(`[FranchiseRBAC] Deactivated region ${regionId}`);
    return { success: true };
  }

  /**
   * Get RBAC stats
   */
  getRBACStats(): {
    totalUsers: number;
    byRole: Record<FranchiseRole, number>;
    byDataScope: Record<DataScope, number>;
    totalRegions: number;
  } {
    const byRole: Record<FranchiseRole, number> = {
      franchise_owner: 0,
      franchise_manager: 0,
      franchise_staff: 0,
    };

    const byDataScope: Record<DataScope, number> = {
      own_region_only: 0,
      all_regions: 0,
      read_only: 0,
    };

    for (const user of this.franchiseUsers.values()) {
      byRole[user.role]++;
      byDataScope[user.dataScope]++;
    }

    return {
      totalUsers: this.franchiseUsers.size,
      byRole,
      byDataScope,
      totalRegions: this.regions.size,
    };
  }
}

const franchiseRBACService = new FranchiseRBACService();

export default franchiseRBACService;
export { FranchiseRBACService };
export type { FranchiseUser, Region, FranchiseRole, DataScope };
