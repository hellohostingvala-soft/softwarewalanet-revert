// Franchise Region-Based RBAC Service
// Strict geo filtering: city/state/country level access control

export interface FranchiseRegion {
  id: string;
  franchiseId: string;
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km for geo-fencing
}

export interface FranchiseUser {
  id: string;
  franchiseId: string;
  userId: string;
  role: 'admin' | 'manager' | 'sales' | 'support';
  regionAccess: FranchiseRegion[];
  permissions: string[];
}

export interface GeoFilter {
  country?: string;
  state?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

// In-memory storage
const franchiseUsers: Map<string, FranchiseUser> = new Map();
const franchiseRegions: Map<string, FranchiseRegion[]> = new Map();

/**
 * Check if user has access to specific region
 */
export function checkRegionAccess(userId: string, geoFilter: GeoFilter): {
  hasAccess: boolean;
  reason?: string;
  allowedRegions?: FranchiseRegion[];
} {
  const user = franchiseUsers.get(userId);
  
  if (!user) {
    return { hasAccess: false, reason: 'User not found' };
  }

  if (user.role === 'admin') {
    // Admin has full access to all franchise regions
    return { 
      hasAccess: true, 
      allowedRegions: franchiseRegions.get(user.franchiseId) || [] 
    };
  }

  const franchiseRegionsList = franchiseRegions.get(user.franchiseId) || [];
  const userRegions = user.regionAccess;

  // Check if user has any region access
  if (userRegions.length === 0) {
    return { hasAccess: false, reason: 'No region access assigned' };
  }

  // Filter by geo filter
  let allowedRegions: FranchiseRegion[] = [];

  if (geoFilter.country) {
    // Country-level access
    allowedRegions = userRegions.filter(r => r.country === geoFilter.country);
  }

  if (geoFilter.state && allowedRegions.length > 0) {
    // State-level access
    allowedRegions = allowedRegions.filter(r => r.state === geoFilter.state);
  }

  if (geoFilter.city && allowedRegions.length > 0) {
    // City-level access
    allowedRegions = allowedRegions.filter(r => r.city === geoFilter.city);
  }

  // Geo-fencing check (if coordinates provided)
  if (geoFilter.lat && geoFilter.lng && allowedRegions.length > 0) {
    allowedRegions = allowedRegions.filter(region => {
      if (!region.latitude || !region.longitude || !region.radius) return true;
      
      const distance = calculateDistance(
        geoFilter.lat!,
        geoFilter.lng!,
        region.latitude,
        region.longitude
      );
      
      return distance <= (region.radius || 10); // Default 10km radius
    });
  }

  return {
    hasAccess: allowedRegions.length > 0,
    allowedRegions: allowedRegions.length > 0 ? allowedRegions : userRegions,
    reason: allowedRegions.length === 0 ? 'Region access denied' : undefined
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Assign region access to user
 */
export function assignRegionAccess(
  userId: string,
  franchiseId: string,
  region: FranchiseRegion
): boolean {
  const user = franchiseUsers.get(userId);
  
  if (!user) {
    // Create new user
    const newUser: FranchiseUser = {
      id: userId,
      franchiseId,
      userId,
      role: 'sales',
      regionAccess: [region],
      permissions: ['view', 'create'],
    };
    franchiseUsers.set(userId, newUser);
  } else {
    // Add region to existing user
    if (!user.regionAccess.some(r => r.id === region.id)) {
      user.regionAccess.push(region);
      franchiseUsers.set(userId, user);
    }
  }

  // Update franchise regions
  const regions = franchiseRegions.get(franchiseId) || [];
  if (!regions.some(r => r.id === region.id)) {
    regions.push(region);
    franchiseRegions.set(franchiseId, regions);
  }

  return true;
}

/**
 * Get user's accessible regions
 */
export function getUserRegions(userId: string): FranchiseRegion[] {
  const user = franchiseUsers.get(userId);
  return user?.regionAccess || [];
}

/**
 * Filter data by user's region access
 */
export function filterDataByRegion<T extends { country?: string; state?: string; city?: string }>(
  userId: string,
  data: T[]
): T[] {
  const userRegions = getUserRegions(userId);
  
  if (userRegions.length === 0) {
    return [];
  }

  return data.filter(item => {
    return userRegions.some(region => {
      if (region.country && item.country !== region.country) return false;
      if (region.state && item.state !== region.state) return false;
      if (region.city && item.city !== region.city) return false;
      return true;
    });
  });
}

/**
 * Get franchise by region
 */
export function getFranchiseByRegion(geoFilter: GeoFilter): string | null {
  for (const [franchiseId, regions] of franchiseRegions.entries()) {
    const match = regions.some(region => {
      if (geoFilter.country && region.country !== geoFilter.country) return false;
      if (geoFilter.state && region.state !== geoFilter.state) return false;
      if (geoFilter.city && region.city !== geoFilter.city) return false;
      return true;
    });

    if (match) return franchiseId;
  }

  return null;
}

/**
 * Audit log for region access
 */
export interface RegionAccessLog {
  id: string;
  userId: string;
  franchiseId: string;
  action: string;
  region: GeoFilter;
  granted: boolean;
  reason?: string;
  timestamp: Date;
}

const accessLogs: RegionAccessLog[] = [];

export function logRegionAccess(
  userId: string,
  franchiseId: string,
  action: string,
  region: GeoFilter,
  granted: boolean,
  reason?: string
): void {
  const log: RegionAccessLog = {
    id: crypto.randomUUID(),
    userId,
    franchiseId,
    action,
    region,
    granted,
    reason,
    timestamp: new Date(),
  };
  
  accessLogs.push(log);
  
  // Sync to Boss Panel
  syncToBossPanel('region_access', log);
}

/**
 * Get access logs for user
 */
export function getAccessLogs(userId: string): RegionAccessLog[] {
  return accessLogs.filter(log => log.userId === userId);
}

/**
 * Sync to Boss Panel
 */
function syncToBossPanel(eventType: string, data: any): void {
  console.log(`[Region RBAC] Syncing to Boss Panel: ${eventType}`, data);
  // This will integrate with the event bus for real-time sync
}
