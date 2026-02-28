import { validateTenantAccess } from '@/middleware/tenant-isolation';
import { checkPermission } from '@/middleware/rbac-enforcer';
import type { AppRole, RBACContext } from '@/middleware/rbac-enforcer';
import { defaultRateLimiter } from '@/middleware/rate-limiter';

export interface MiddlewareContext {
  tenantId: string;
  userId: string;
  role: string;
  permission: string;
}

export async function applyMiddleware(
  ctx: MiddlewareContext,
): Promise<{ allowed: boolean; error?: string }> {
  // 1. Tenant isolation
  const tenantOk = await validateTenantAccess(ctx.userId, ctx.tenantId);
  if (!tenantOk) {
    return { allowed: false, error: 'Tenant access denied' };
  }

  // 2. RBAC permission check
  const rbacCtx: RBACContext = {
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    role: ctx.role as AppRole,
  };
  if (!checkPermission(rbacCtx, ctx.permission)) {
    return { allowed: false, error: `Permission denied: '${ctx.permission}'` };
  }

  // 3. Rate limit
  const rateLimitKey = `${ctx.tenantId}:${ctx.userId}`;
  if (!defaultRateLimiter.isAllowed(rateLimitKey)) {
    return { allowed: false, error: 'Rate limit exceeded' };
  }

  return { allowed: true };
}
