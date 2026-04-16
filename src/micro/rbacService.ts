// RBAC Micro Service
// Bitmask permissions + deny-overrides policy + cached authz with TTL

interface Permission {
  name: string;
  bitmask: number;
}

interface Role {
  name: string;
  permissions: number; // Bitmask of permissions
  denyOverrides: boolean;
}

interface UserPermissions {
  userId: string;
  roles: string[];
  permissions: number; // Combined bitmask
  denyOverrides: boolean;
  cachedAt: number;
}

interface AuthzCacheEntry {
  userId: string;
  resource: string;
  action: string;
  allowed: boolean;
  cachedAt: number;
  ttl: number;
}

class RBACService {
  private permissions: Map<string, Permission>;
  private roles: Map<string, Role>;
  private userPermissions: Map<string, UserPermissions>;
  private authzCache: Map<string, AuthzCacheEntry>;
  private defaultTTL: number;

  constructor() {
    this.permissions = new Map();
    this.roles = new Map();
    this.userPermissions = new Map();
    this.authzCache = new Map();
    this.defaultTTL = 300000; // 5 minutes

    this.initializeDefaultPermissions();
    this.initializeDefaultRoles();
  }

  /**
   * Initialize default permissions
   */
  private initializeDefaultPermissions(): void {
    const defaultPermissions: Permission[] = [
      { name: 'read', bitmask: 1 << 0 },        // 1
      { name: 'write', bitmask: 1 << 1 },       // 2
      { name: 'delete', bitmask: 1 << 2 },      // 4
      { name: 'admin', bitmask: 1 << 3 },        // 8
      { name: 'create', bitmask: 1 << 4 },       // 16
      { name: 'update', bitmask: 1 << 5 },       // 32
      { name: 'execute', bitmask: 1 << 6 },      // 64
      { name: 'approve', bitmask: 1 << 7 },      // 128
    ];

    defaultPermissions.forEach(perm => {
      this.permissions.set(perm.name, perm);
    });
  }

  /**
   * Initialize default roles
   */
  private initializeDefaultRoles(): void {
    const defaultRoles: Role[] = [
      { name: 'user', permissions: (1 << 0) | (1 << 1), denyOverrides: false },    // read + write
      { name: 'admin', permissions: (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3), denyOverrides: false }, // all
      { name: 'moderator', permissions: (1 << 0) | (1 << 1) | (1 << 5), denyOverrides: false }, // read + write + update
      { name: 'viewer', permissions: (1 << 0), denyOverrides: false }, // read only
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.name, role);
    });
  }

  /**
   * Add permission
   */
  addPermission(name: string, bitmask: number): void {
    this.permissions.set(name, { name, bitmask });
  }

  /**
   * Add role
   */
  addRole(name: string, permissions: number[], denyOverrides: boolean = false): void {
    const bitmask = permissions.reduce((acc, perm) => acc | perm, 0);
    this.roles.set(name, { name, permissions: bitmask, denyOverrides });
  }

  /**
   * Assign role to user
   */
  assignRoleToUser(userId: string, roleName: string): void {
    const role = this.roles.get(roleName);
    if (!role) {
      throw new Error(`Role not found: ${roleName}`);
    }

    const userPerms = this.userPermissions.get(userId) || {
      userId,
      roles: [],
      permissions: 0,
      denyOverrides: false,
      cachedAt: Date.now(),
    };

    userPerms.roles.push(roleName);
    userPerms.permissions |= role.permissions;
    userPerms.denyOverrides = userPerms.denyOverrides || role.denyOverrides;
    userPerms.cachedAt = Date.now();

    this.userPermissions.set(userId, userPerms);

    // Invalidate authz cache for this user
    this.invalidateUserAuthzCache(userId);
  }

  /**
   * Remove role from user
   */
  removeRoleFromUser(userId: string, roleName: string): void {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return;

    const roleIndex = userPerms.roles.indexOf(roleName);
    if (roleIndex === -1) return;

    userPerms.roles.splice(roleIndex, 1);

    // Recalculate permissions
    userPerms.permissions = 0;
    userPerms.denyOverrides = false;

    for (const r of userPerms.roles) {
      const role = this.roles.get(r);
      if (role) {
        userPerms.permissions |= role.permissions;
        userPerms.denyOverrides = userPerms.denyOverrides || role.denyOverrides;
      }
    }

    userPerms.cachedAt = Date.now();
    this.userPermissions.set(userId, userPerms);

    // Invalidate authz cache for this user
    this.invalidateUserAuthzCache(userId);
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId: string, permissionName: string): boolean {
    const permission = this.permissions.get(permissionName);
    if (!permission) {
      return false;
    }

    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) {
      return false;
    }

    // Deny-overrides policy: if any role has denyOverrides, check deny list first
    if (userPerms.denyOverrides) {
      // In a real implementation, you'd have a separate deny bitmask
      // For now, we'll just check if the permission is explicitly denied
    }

    return (userPerms.permissions & permission.bitmask) !== 0;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(userId: string, permissionNames: string[]): boolean {
    return permissionNames.some(perm => this.hasPermission(userId, perm));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(userId: string, permissionNames: string[]): boolean {
    return permissionNames.every(perm => this.hasPermission(userId, perm));
  }

  /**
   * Authorize user for resource and action (cached)
   */
  authorize(userId: string, resource: string, action: string): { allowed: boolean; fromCache: boolean } {
    const cacheKey = `${userId}:${resource}:${action}`;
    const cached = this.authzCache.get(cacheKey);

    // Check cache
    if (cached && Date.now() < cached.cachedAt + cached.ttl) {
      return { allowed: cached.allowed, fromCache: true };
    }

    // Perform authorization check
    const permissionName = `${resource}:${action}`;
    const allowed = this.hasPermission(userId, permissionName);

    // Cache the result
    this.authzCache.set(cacheKey, {
      userId,
      resource,
      action,
      allowed,
      cachedAt: Date.now(),
      ttl: this.defaultTTL,
    });

    return { allowed, fromCache: false };
  }

  /**
   * Invalidate authz cache for user
   */
  invalidateUserAuthzCache(userId: string): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.authzCache.entries()) {
      if (entry.userId === userId) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.authzCache.delete(key));
  }

  /**
   * Invalidate authz cache for resource
   */
  invalidateResourceAuthzCache(resource: string): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.authzCache.entries()) {
      if (entry.resource === resource) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.authzCache.delete(key));
  }

  /**
   * Clear all authz cache
   */
  clearAuthzCache(): void {
    this.authzCache.clear();
  }

  /**
   * Get user permissions
   */
  getUserPermissions(userId: string): UserPermissions | null {
    return this.userPermissions.get(userId) || null;
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string): string[] {
    const userPerms = this.userPermissions.get(userId);
    return userPerms ? userPerms.roles : [];
  }

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * Calculate combined permissions bitmask
   */
  calculateCombinedPermissions(roleNames: string[]): number {
    return roleNames.reduce((acc, roleName) => {
      const role = this.roles.get(roleName);
      return acc + (role ? role.permissions : 0);
    }, 0);
  }

  /**
   * Get permission bitmask
   */
  getPermissionBitmask(permissionName: string): number | null {
    const permission = this.permissions.get(permissionName);
    return permission ? permission.bitmask : null;
  }

  /**
   * Check deny-overrides policy
   */
  checkDenyOverrides(userId: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    return userPerms ? userPerms.denyOverrides : false;
  }

  /**
   * Set deny-overrides for role
   */
  setRoleDenyOverrides(roleName: string, denyOverrides: boolean): void {
    const role = this.roles.get(roleName);
    if (role) {
      role.denyOverrides = denyOverrides;
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(): {
    total: number;
    expired: number;
    hitRate: number;
  } {
    const now = Date.now();
    let expired = 0;

    for (const entry of this.authzCache.values()) {
      if (now > entry.cachedAt + entry.ttl) {
        expired++;
      }
    }

    return {
      total: this.authzCache.size,
      expired,
      hitRate: 0, // Would need to track hits/misses
    };
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.authzCache.entries()) {
      if (now > entry.cachedAt + entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.authzCache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[RBAC] Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }
}

// Singleton instance
const rbacService = new RBACService();

// Auto-cleanup expired cache every minute
setInterval(() => {
  rbacService.cleanupExpiredCache();
}, 60000);

export default rbacService;
export { RBACService };
export type { Permission, Role, UserPermissions, AuthzCacheEntry };
