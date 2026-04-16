// Franchise Sub-Roles Service
// sub-role (manager/staff), module-level access control

type SubRole = 'manager' | 'staff' | 'sales' | 'support' | 'finance' | 'operations';
type Module = 'dashboard' | 'marketplace' | 'orders' | 'leads' | 'employees' | 'invoices' | 'wallet' | 'support' | 'legal' | 'settings' | 'seo';
type Permission = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'assign' | 'resolve';

interface ModulePermission {
  module: Module;
  permissions: Permission[];
}

interface SubRoleUser {
  id: string;
  franchiseId: string;
  userId: string;
  name: string;
  email: string;
  role: SubRole;
  modulePermissions: ModulePermission[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  active: boolean;
}

class FranchiseSubRolesService {
  private users: Map<string, SubRoleUser>;

  // Default module permissions per sub-role
  private defaultRolePermissions: Record<SubRole, ModulePermission[]> = {
    manager: [
      { module: 'dashboard', permissions: ['view', 'export'] },
      { module: 'marketplace', permissions: ['view', 'create', 'edit'] },
      { module: 'orders', permissions: ['view', 'create', 'edit', 'approve'] },
      { module: 'leads', permissions: ['view', 'create', 'edit', 'assign'] },
      { module: 'employees', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'invoices', permissions: ['view', 'create', 'edit', 'export'] },
      { module: 'wallet', permissions: ['view', 'export'] },
      { module: 'support', permissions: ['view', 'create', 'edit', 'resolve'] },
      { module: 'legal', permissions: ['view'] },
      { module: 'settings', permissions: ['view', 'edit'] },
      { module: 'seo', permissions: ['view', 'edit'] },
    ],
    staff: [
      { module: 'dashboard', permissions: ['view'] },
      { module: 'marketplace', permissions: ['view'] },
      { module: 'orders', permissions: ['view', 'create'] },
      { module: 'leads', permissions: ['view', 'create'] },
      { module: 'employees', permissions: ['view'] },
      { module: 'invoices', permissions: ['view'] },
      { module: 'wallet', permissions: ['view'] },
      { module: 'support', permissions: ['view', 'create'] },
      { module: 'legal', permissions: ['view'] },
      { module: 'settings', permissions: ['view'] },
      { module: 'seo', permissions: ['view'] },
    ],
    sales: [
      { module: 'dashboard', permissions: ['view'] },
      { module: 'marketplace', permissions: ['view'] },
      { module: 'orders', permissions: ['view', 'create'] },
      { module: 'leads', permissions: ['view', 'create', 'edit', 'assign'] },
      { module: 'employees', permissions: ['view'] },
      { module: 'invoices', permissions: ['view'] },
      { module: 'wallet', permissions: ['view'] },
      { module: 'support', permissions: ['view', 'create'] },
      { module: 'seo', permissions: ['view', 'edit'] },
    ],
    support: [
      { module: 'dashboard', permissions: ['view'] },
      { module: 'orders', permissions: ['view'] },
      { module: 'leads', permissions: ['view'] },
      { module: 'employees', permissions: ['view'] },
      { module: 'invoices', permissions: ['view'] },
      { module: 'wallet', permissions: ['view'] },
      { module: 'support', permissions: ['view', 'create', 'edit', 'resolve'] },
      { module: 'settings', permissions: ['view'] },
    ],
    finance: [
      { module: 'dashboard', permissions: ['view', 'export'] },
      { module: 'orders', permissions: ['view', 'approve'] },
      { module: 'invoices', permissions: ['view', 'create', 'edit', 'export'] },
      { module: 'wallet', permissions: ['view', 'export'] },
      { module: 'employees', permissions: ['view'] },
      { module: 'support', permissions: ['view'] },
      { module: 'settings', permissions: ['view', 'edit'] },
    ],
    operations: [
      { module: 'dashboard', permissions: ['view', 'export'] },
      { module: 'marketplace', permissions: ['view', 'create', 'edit'] },
      { module: 'orders', permissions: ['view', 'create', 'edit', 'approve'] },
      { module: 'leads', permissions: ['view', 'create', 'edit', 'assign'] },
      { module: 'employees', permissions: ['view', 'create', 'edit'] },
      { module: 'invoices', permissions: ['view', 'create', 'edit', 'export'] },
      { module: 'wallet', permissions: ['view', 'export'] },
      { module: 'support', permissions: ['view', 'create', 'edit', 'resolve'] },
      { module: 'settings', permissions: ['view', 'edit'] },
      { module: 'seo', permissions: ['view', 'edit'] },
    ],
  };

  constructor() {
    this.users = new Map();
  }

  /**
   * Create sub-role user
   */
  createUser(
    franchiseId: string,
    userId: string,
    name: string,
    email: string,
    role: SubRole,
    createdBy: string
  ): SubRoleUser {
    const user: SubRoleUser = {
      id: crypto.randomUUID(),
      franchiseId,
      userId,
      name,
      email,
      role,
      modulePermissions: this.defaultRolePermissions[role],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy,
      active: true,
    };

    this.users.set(user.id, user);
    console.log(`[SubRoles] Created ${role} user ${name} for franchise ${franchiseId}`);
    return user;
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): SubRoleUser | null {
    return this.users.get(userId) || null;
  }

  /**
   * Get users by franchise
   */
  getUsersByFranchise(franchiseId: string): SubRoleUser[] {
    return Array.from(this.users.values()).filter(u => u.franchiseId === franchiseId && u.active);
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: SubRole): SubRoleUser[] {
    return Array.from(this.users.values()).filter(u => u.role === role && u.active);
  }

  /**
   * Update user role
   */
  updateUserRole(userId: string, newRole: SubRole, updatedBy: string): SubRoleUser {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.role = newRole;
    user.modulePermissions = this.defaultRolePermissions[newRole];
    user.updatedAt = Date.now();
    this.users.set(userId, user);

    console.log(`[SubRoles] Updated user ${user.name} role to ${newRole}`);
    return user;
  }

  /**
   * Update user module permissions
   */
  updateModulePermissions(
    userId: string,
    modulePermissions: ModulePermission[],
    updatedBy: string
  ): SubRoleUser {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.modulePermissions = modulePermissions;
    user.updatedAt = Date.now();
    this.users.set(userId, user);

    console.log(`[SubRoles] Updated module permissions for user ${user.name}`);
    return user;
  }

  /**
   * Add module permission
   */
  addModulePermission(userId: string, module: Module, permission: Permission): SubRoleUser {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const modulePerm = user.modulePermissions.find(mp => mp.module === module);
    if (modulePerm) {
      if (!modulePerm.permissions.includes(permission)) {
        modulePerm.permissions.push(permission);
      }
    } else {
      user.modulePermissions.push({ module, permissions: [permission] });
    }

    user.updatedAt = Date.now();
    this.users.set(userId, user);

    console.log(`[SubRoles] Added ${permission} permission for ${module} to user ${user.name}`);
    return user;
  }

  /**
   * Remove module permission
   */
  removeModulePermission(userId: string, module: Module, permission: Permission): SubRoleUser {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const modulePerm = user.modulePermissions.find(mp => mp.module === module);
    if (modulePerm) {
      modulePerm.permissions = modulePerm.permissions.filter(p => p !== permission);
      if (modulePerm.permissions.length === 0) {
        user.modulePermissions = user.modulePermissions.filter(mp => mp.module !== module);
      }
    }

    user.updatedAt = Date.now();
    this.users.set(userId, user);

    console.log(`[SubRoles] Removed ${permission} permission for ${module} from user ${user.name}`);
    return user;
  }

  /**
   * Check module permission
   */
  hasModulePermission(userId: string, module: Module, permission: Permission): boolean {
    const user = this.users.get(userId);
    if (!user || !user.active) {
      return false;
    }

    const modulePerm = user.modulePermissions.find(mp => mp.module === module);
    if (!modulePerm) {
      return false;
    }

    return modulePerm.permissions.includes(permission);
  }

  /**
   * Check any module permission
   */
  hasAnyModulePermission(userId: string, module: Module, permissions: Permission[]): boolean {
    return permissions.some(perm => this.hasModulePermission(userId, module, perm));
  }

  /**
   * Deactivate user
   */
  deactivateUser(userId: string, deactivatedBy: string): SubRoleUser {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.active = false;
    user.updatedAt = Date.now();
    this.users.set(userId, user);

    console.log(`[SubRoles] Deactivated user ${user.name}`);
    return user;
  }

  /**
   * Activate user
   */
  activateUser(userId: string, activatedBy: string): SubRoleUser {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.active = true;
    user.updatedAt = Date.now();
    this.users.set(userId, user);

    console.log(`[SubRoles] Activated user ${user.name}`);
    return user;
  }

  /**
   * Delete user
   */
  deleteUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    this.users.delete(userId);
    console.log(`[SubRoles] Deleted user ${user.name}`);
    return true;
  }

  /**
   * Get user stats
   */
  getUserStats(franchiseId?: string): {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<SubRole, number>;
  } {
    const users = franchiseId
      ? Array.from(this.users.values()).filter(u => u.franchiseId === franchiseId)
      : Array.from(this.users.values());

    const stats = {
      total: users.length,
      active: 0,
      inactive: 0,
      byRole: {
        manager: 0,
        staff: 0,
        sales: 0,
        support: 0,
        finance: 0,
        operations: 0,
      },
    };

    for (const user of users) {
      if (user.active) {
        stats.active++;
      } else {
        stats.inactive++;
      }
      stats.byRole[user.role]++;
    }

    return stats;
  }

  /**
   * Get default permissions for role
   */
  getDefaultPermissions(role: SubRole): ModulePermission[] {
    return this.defaultRolePermissions[role];
  }
}

const franchiseSubRolesService = new FranchiseSubRolesService();

export default franchiseSubRolesService;
export { FranchiseSubRolesService };
export type { SubRoleUser, SubRole, Module, Permission, ModulePermission };
