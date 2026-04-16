// Auth Micro Service
// Token kid + rotation + refresh token binding + step-up auth for payments

import clockIdService from './clockIdService';

interface KeyRotationConfig {
  keyId: string;
  version: number;
  createdAt: number;
  expiresAt: number;
}

interface TokenPayload {
  userId: string;
  kid: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
  stepUpRequired?: boolean;
}

interface RefreshTokenBinding {
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  boundAt: number;
}

interface StepUpAuthContext {
  userId: string;
  requiredFor: string[];
  expiresAt: number;
  verified: boolean;
}

class AuthService {
  private keyRotationConfig: KeyRotationConfig;
  private activeKeys: Map<string, string>; // kid -> secret
  private refreshTokenBindings: Map<string, RefreshTokenBinding>;
  private stepUpContexts: Map<string, StepUpAuthContext>;

  constructor() {
    this.keyRotationConfig = {
      keyId: 'key-1',
      version: 1,
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000, // 24 hours
    };

    this.activeKeys = new Map([['key-1', 'secret-1']]);
    this.refreshTokenBindings = new Map();
    this.stepUpContexts = new Map();
  }

  /**
   * Generate token with kid
   */
  generateToken(
    userId: string,
    type: 'access' | 'refresh',
    expiresIn: number = 3600000
  ): string {
    const kid = this.keyRotationConfig.keyId;
    const now = Date.now();

    const payload: TokenPayload = {
      userId,
      kid,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + expiresIn) / 1000),
      type,
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT',
      kid,
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = this.sign(encodedHeader, encodedPayload, kid);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Sign token
   */
  private sign(header: string, payload: string, kid: string): string {
    const secret = this.activeKeys.get(kid);
    if (!secret) {
      throw new Error(`Key not found: ${kid}`);
    }

    const data = `${header}.${payload}`;
    // In production, use HMAC-SHA256
    const signature = btoa(data + secret);
    return signature;
  }

  /**
   * Verify token with kid
   */
  verifyToken(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1])) as TokenPayload;

      // Check if key exists
      if (!this.activeKeys.has(header.kid)) {
        return { valid: false, error: 'Key not found or rotated' };
      }

      // Verify signature
      const expectedSignature = this.sign(parts[0], parts[1], header.kid);
      if (parts[2] !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Token parsing failed' };
    }
  }

  /**
   * Rotate keys
   */
  rotateKeys(): void {
    const oldKeyId = this.keyRotationConfig.keyId;
    const newKeyId = `key-${this.keyRotationConfig.version + 1}`;
    const newSecret = `secret-${this.keyRotationConfig.version + 1}`;

    // Add new key
    this.activeKeys.set(newKeyId, newSecret);

    // Update config
    this.keyRotationConfig = {
      keyId: newKeyId,
      version: this.keyRotationConfig.version + 1,
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000,
    };

    // Remove old key after grace period (5 minutes)
    setTimeout(() => {
      this.activeKeys.delete(oldKeyId);
    }, 300000);

    console.log(`[Auth] Keys rotated: ${oldKeyId} -> ${newKeyId}`);
  }

  /**
   * Get current key id
   */
  getCurrentKeyId(): string {
    return this.keyRotationConfig.keyId;
  }

  /**
   * Bind refresh token to device
   */
  bindRefreshToken(
    refreshToken: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string
  ): void {
    const binding: RefreshTokenBinding = {
      deviceId,
      ipAddress,
      userAgent,
      boundAt: Date.now(),
    };

    this.refreshTokenBindings.set(refreshToken, binding);
  }

  /**
   * Verify refresh token binding
   */
  verifyRefreshTokenBinding(
    refreshToken: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string
  ): boolean {
    const binding = this.refreshTokenBindings.get(refreshToken);

    if (!binding) {
      return false;
    }

    // Check device binding
    if (binding.deviceId !== deviceId) {
      console.warn(`[Auth] Refresh token device mismatch`);
      return false;
    }

    // Check IP binding (optional, can be lenient)
    if (binding.ipAddress !== ipAddress) {
      console.warn(`[Auth] Refresh token IP mismatch (lenient)`);
      // Don't fail on IP mismatch, just log
    }

    // Check user agent
    if (binding.userAgent !== userAgent) {
      console.warn(`[Auth] Refresh token user agent mismatch`);
      return false;
    }

    return true;
  }

  /**
   * Revoke refresh token
   */
  revokeRefreshToken(refreshToken: string): void {
    this.refreshTokenBindings.delete(refreshToken);
  }

  /**
   * Create step-up auth context
   */
  createStepUpContext(
    userId: string,
    requiredFor: string[],
    expiresIn: number = 900000 // 15 minutes
  ): string {
    const contextId = clockIdService.generateId();

    const context: StepUpAuthContext = {
      userId,
      requiredFor,
      expiresAt: Date.now() + expiresIn,
      verified: false,
    };

    this.stepUpContexts.set(contextId, context);

    // Auto-cleanup after expiration
    setTimeout(() => {
      this.stepUpContexts.delete(contextId);
    }, expiresIn);

    return contextId;
  }

  /**
   * Verify step-up auth
   */
  verifyStepUpAuth(contextId: string, userId: string): boolean {
    const context = this.stepUpContexts.get(contextId);

    if (!context) {
      return false;
    }

    // Check user
    if (context.userId !== userId) {
      return false;
    }

    // Check expiration
    if (Date.now() > context.expiresAt) {
      this.stepUpContexts.delete(contextId);
      return false;
    }

    return context.verified;
  }

  /**
   * Mark step-up auth as verified
   */
  markStepUpVerified(contextId: string): void {
    const context = this.stepUpContexts.get(contextId);
    if (context) {
      context.verified = true;
    }
  }

  /**
   * Check if step-up auth is required for operation
   */
  requiresStepUpAuth(userId: string, operation: string): { required: boolean; contextId?: string } {
    // Step-up required for payments and sensitive operations
    const sensitiveOperations = ['payment', 'wallet_transfer', 'admin_action'];

    if (sensitiveOperations.includes(operation)) {
      const contextId = this.createStepUpContext(userId, [operation]);
      return { required: true, contextId };
    }

    return { required: false };
  }

  /**
   * Refresh access token
   */
  refreshAccessToken(refreshToken: string, deviceId: string, ipAddress: string, userAgent: string): {
    success: boolean;
    accessToken?: string;
    error?: string;
  } {
    // Verify refresh token
    const tokenResult = this.verifyToken(refreshToken);
    if (!tokenResult.valid || tokenResult.payload?.type !== 'refresh') {
      return { success: false, error: 'Invalid refresh token' };
    }

    // Verify binding
    if (!this.verifyRefreshTokenBinding(refreshToken, deviceId, ipAddress, userAgent)) {
      return { success: false, error: 'Refresh token binding verification failed' };
    }

    // Generate new access token
    const userId = tokenResult.payload.userId;
    const accessToken = this.generateToken(userId, 'access');

    return { success: true, accessToken };
  }

  /**
   * Get key rotation status
   */
  getKeyRotationStatus(): {
    currentKeyId: string;
    version: number;
    activeKeys: number;
    expiresAt: number;
  } {
    return {
      currentKeyId: this.keyRotationConfig.keyId,
      version: this.keyRotationConfig.version,
      activeKeys: this.activeKeys.size,
      expiresAt: this.keyRotationConfig.expiresAt,
    };
  }

  /**
   * Get refresh token binding stats
   */
  getRefreshTokenStats(): {
    total: number;
    expired: number;
  } {
    const now = Date.now();
    let expired = 0;

    for (const binding of this.refreshTokenBindings.values()) {
      if (now - binding.boundAt > 2592000000) { // 30 days
        expired++;
      }
    }

    return {
      total: this.refreshTokenBindings.size,
      expired,
    };
  }

  /**
   * Cleanup expired bindings
   */
  cleanupExpiredBindings(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, binding] of this.refreshTokenBindings.entries()) {
      if (now - binding.boundAt > 2592000000) { // 30 days
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.refreshTokenBindings.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[Auth] Cleaned up ${keysToDelete.length} expired refresh token bindings`);
    }
  }
}

// Singleton instance
const authService = new AuthService();

// Auto-cleanup expired bindings every hour
setInterval(() => {
  authService.cleanupExpiredBindings();
}, 3600000);

export default authService;
export { AuthService };
export type { KeyRotationConfig, TokenPayload, RefreshTokenBinding, StepUpAuthContext };
