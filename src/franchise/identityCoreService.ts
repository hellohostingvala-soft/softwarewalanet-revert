// Identity Core Service
// multi-tenant isolation (tenant_id everywhere)
// device fingerprint + session binding
// adaptive RBAC (context-aware permissions)

type TenantContext = {
  tenantId: string;
  organizationId: string;
  regionId: string;
};

type DeviceFingerprint = {
  deviceId: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  firstSeenAt: number;
  lastSeenAt: number;
  trustScore: number; // 0-100
};

type SessionBinding = {
  sessionId: string;
  userId: string;
  tenantId: string;
  deviceId: string;
  ipAddress: string;
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
  isActive: boolean;
};

type PermissionContext = {
  userId: string;
  tenantId: string;
  deviceId: string;
  ipAddress: string;
  timeOfDay: 'business_hours' | 'after_hours' | 'weekend';
  location: string;
  riskLevel: 'low' | 'medium' | 'high';
};

type AdaptivePermission = {
  permission: string;
  baseGranted: boolean;
  contextRules: {
    timeRestriction?: { start: string; end: string };
    locationRestriction?: string[];
    deviceRestriction?: 'trusted' | 'verified' | 'any';
    riskThreshold?: number;
  };
  adaptiveGranted: boolean;
  reason?: string;
};

class IdentityCoreService {
  private tenants: Map<string, TenantContext>;
  private deviceFingerprints: Map<string, DeviceFingerprint>;
  private sessionBindings: Map<string, SessionBinding>;
  private adaptivePermissions: Map<string, AdaptivePermission[]>;

  constructor() {
    this.tenants = new Map();
    this.deviceFingerprints = new Map();
    this.sessionBindings = new Map();
    this.adaptivePermissions = new Map();
  }

  /**
   * Generate device fingerprint
   */
  generateDeviceFingerprint(userAgent: string, screenResolution: string, timezone: string, language: string, platform: string): DeviceFingerprint {
    const hash = this.hashDevice(userAgent + screenResolution + timezone + language + platform);
    const existing = this.deviceFingerprints.get(hash);

    const fingerprint: DeviceFingerprint = existing || {
      deviceId: hash,
      userAgent,
      screenResolution,
      timezone,
      language,
      platform,
      firstSeenAt: Date.now(),
      lastSeenAt: Date.now(),
      trustScore: existing ? existing.trustScore : 50, // Start at 50 for new devices
    };

    if (!existing) {
      this.deviceFingerprints.set(hash, fingerprint);
    } else {
      fingerprint.lastSeenAt = Date.now();
      this.deviceFingerprints.set(hash, fingerprint);
    }

    return fingerprint;
  }

  /**
   * Hash device info
   */
  private hashDevice(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `dev_${hash.toString(36)}`;
  }

  /**
   * Create tenant context
   */
  createTenantContext(tenantId: string, organizationId: string, regionId: string): TenantContext {
    const context: TenantContext = {
      tenantId,
      organizationId,
      regionId,
    };

    this.tenants.set(tenantId, context);
    console.log(`[IdentityCore] Created tenant context for ${tenantId}`);
    return context;
  }

  /**
   * Get tenant context
   */
  getTenantContext(tenantId: string): TenantContext | null {
    return this.tenants.get(tenantId) || null;
  }

  /**
   * Bind session to device
   */
  bindSession(userId: string, tenantId: string, deviceId: string, ipAddress: string, durationHours: number = 24): SessionBinding {
    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const session: SessionBinding = {
      sessionId,
      userId,
      tenantId,
      deviceId,
      ipAddress,
      createdAt: now,
      expiresAt: now + (durationHours * 60 * 60 * 1000),
      lastActivityAt: now,
      isActive: true,
    };

    this.sessionBindings.set(sessionId, session);
    console.log(`[IdentityCore] Bound session ${sessionId} to device ${deviceId}`);
    return session;
  }

  /**
   * Validate session
   */
  validateSession(sessionId: string, deviceId: string): { valid: boolean; session?: SessionBinding; error?: string } {
    const session = this.sessionBindings.get(sessionId);

    if (!session) {
      return { valid: false, error: 'Session not found' };
    }

    if (!session.isActive) {
      return { valid: false, error: 'Session is inactive' };
    }

    if (session.expiresAt < Date.now()) {
      session.isActive = false;
      this.sessionBindings.set(sessionId, session);
      return { valid: false, error: 'Session expired' };
    }

    if (session.deviceId !== deviceId) {
      return { valid: false, error: 'Device mismatch' };
    }

    // Update last activity
    session.lastActivityAt = Date.now();
    this.sessionBindings.set(sessionId, session);

    return { valid: true, session };
  }

  /**
   * Revoke session
   */
  revokeSession(sessionId: string): boolean {
    const session = this.sessionBindings.get(sessionId);
    if (!session) return false;

    session.isActive = false;
    this.sessionBindings.set(sessionId, session);

    console.log(`[IdentityCore] Revoked session ${sessionId}`);
    return true;
  }

  /**
   * Revoke all user sessions
   */
  revokeAllUserSessions(userId: string): number {
    let revokedCount = 0;

    for (const [sessionId, session] of this.sessionBindings.entries()) {
      if (session.userId === userId && session.isActive) {
        session.isActive = false;
        this.sessionBindings.set(sessionId, session);
        revokedCount++;
      }
    }

    console.log(`[IdentityCore] Revoked ${revokedCount} sessions for user ${userId}`);
    return revokedCount;
  }

  /**
   * Evaluate permission context
   */
  evaluatePermissionContext(userId: string, tenantId: string, deviceId: string, ipAddress: string): PermissionContext {
    const device = this.deviceFingerprints.get(deviceId);
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    let timeOfDay: 'business_hours' | 'after_hours' | 'weekend';
    if (day === 0 || day === 6) {
      timeOfDay = 'weekend';
    } else if (hour >= 9 && hour < 17) {
      timeOfDay = 'business_hours';
    } else {
      timeOfDay = 'after_hours';
    }

    // Calculate risk level based on device trust and IP
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (device && device.trustScore < 30) {
      riskLevel = 'high';
    } else if (device && device.trustScore < 60) {
      riskLevel = 'medium';
    }

    // IP-based risk (simplified)
    if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
      // Internal IP - lower risk
      if (riskLevel === 'high') riskLevel = 'medium';
    }

    return {
      userId,
      tenantId,
      deviceId,
      ipAddress,
      timeOfDay,
      location: 'Unknown', // In production, use geolocation service
      riskLevel,
    };
  }

  /**
   * Configure adaptive permission
   */
  configureAdaptivePermission(
    permission: string,
    baseGranted: boolean,
    contextRules: AdaptivePermission['contextRules']
  ): void {
    const existing = this.adaptivePermissions.get(permission) || [];
    const adaptivePermission: AdaptivePermission = {
      permission,
      baseGranted,
      contextRules,
      adaptiveGranted: baseGranted,
    };

    const index = existing.findIndex(p => p.permission === permission);
    if (index >= 0) {
      existing[index] = adaptivePermission;
    } else {
      existing.push(adaptivePermission);
    }

    this.adaptivePermissions.set(permission, existing);
    console.log(`[IdentityCore] Configured adaptive permission ${permission}`);
  }

  /**
   * Check adaptive permission
   */
  checkAdaptivePermission(permission: string, context: PermissionContext): { granted: boolean; reason?: string } {
    const permissions = this.adaptivePermissions.get(permission);
    if (!permissions) {
      return { granted: false, reason: 'Permission not configured' };
    }

    const adaptivePermission = permissions[0];
    if (!adaptivePermission) {
      return { granted: false, reason: 'Permission not configured' };
    }

    // Start with base permission
    let granted = adaptivePermission.baseGranted;
    let reason = '';

    // Apply context rules
    const rules = adaptivePermission.contextRules;

    // Time restriction
    if (rules.timeRestriction) {
      const now = new Date();
      const currentHour = now.getHours();
      const startHour = parseInt(rules.timeRestriction.start.split(':')[0]);
      const endHour = parseInt(rules.timeRestriction.end.split(':')[0]);

      if (currentHour < startHour || currentHour >= endHour) {
        granted = false;
        reason = 'Outside allowed time window';
      }
    }

    // Location restriction
    if (rules.locationRestriction && granted) {
      if (!rules.locationRestriction.includes(context.location)) {
        granted = false;
        reason = 'Location not allowed';
      }
    }

    // Device restriction
    if (rules.deviceRestriction && granted) {
      const device = this.deviceFingerprints.get(context.deviceId);
      if (!device) {
        granted = false;
        reason = 'Device not recognized';
      } else if (rules.deviceRestriction === 'trusted' && device.trustScore < 70) {
        granted = false;
        reason = 'Device not trusted enough';
      } else if (rules.deviceRestriction === 'verified' && device.trustScore < 40) {
        granted = false;
        reason = 'Device not verified';
      }
    }

    // Risk threshold
    if (rules.riskThreshold !== undefined && granted) {
      const riskScore = context.riskLevel === 'low' ? 20 : context.riskLevel === 'medium' ? 50 : 80;
      if (riskScore > rules.riskThreshold) {
        granted = false;
        reason = 'Risk level too high';
      }
    }

    adaptivePermission.adaptiveGranted = granted;
    adaptivePermission.reason = reason;
    this.adaptivePermissions.set(permission, [adaptivePermission]);

    return { granted, reason };
  }

  /**
   * Update device trust score
   */
  updateDeviceTrust(deviceId: string, delta: number): void {
    const device = this.deviceFingerprints.get(deviceId);
    if (!device) return;

    device.trustScore = Math.max(0, Math.min(100, device.trustScore + delta));
    this.deviceFingerprints.set(deviceId, device);

    console.log(`[IdentityCore] Updated device ${deviceId} trust score to ${device.trustScore}`);
  }

  /**
   * Get device trust score
   */
  getDeviceTrust(deviceId: string): number {
    const device = this.deviceFingerprints.get(deviceId);
    return device ? device.trustScore : 0;
  }

  /**
   * Get active sessions for user
   */
  getUserSessions(userId: string): SessionBinding[] {
    return Array.from(this.sessionBindings.values()).filter(
      s => s.userId === userId && s.isActive
    );
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessionBindings.entries()) {
      if (session.expiresAt < now && session.isActive) {
        session.isActive = false;
        this.sessionBindings.set(sessionId, session);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[IdentityCore] Cleaned up ${cleanedCount} expired sessions`);
    }

    return cleanedCount;
  }

  /**
   * Get identity stats
   */
  getIdentityStats(): {
    totalTenants: number;
    totalDevices: number;
    activeSessions: number;
    totalPermissions: number;
  } {
    return {
      totalTenants: this.tenants.size,
      totalDevices: this.deviceFingerprints.size,
      activeSessions: Array.from(this.sessionBindings.values()).filter(s => s.isActive).length,
      totalPermissions: this.adaptivePermissions.size,
    };
  }
}

const identityCoreService = new IdentityCoreService();

// Cleanup expired sessions hourly
setInterval(() => {
  identityCoreService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

export default identityCoreService;
export { IdentityCoreService };
export type { TenantContext, DeviceFingerprint, SessionBinding, PermissionContext, AdaptivePermission };
