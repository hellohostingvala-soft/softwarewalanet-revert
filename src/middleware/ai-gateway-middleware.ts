/**
 * AI Gateway Middleware
 * Enforces that all AI/API calls go through AI_GATEWAY().
 * Provides request validation, role-based access control,
 * and cost-cap enforcement before routing to the gateway.
 */

import { supabase } from '@/integrations/supabase/client';
import AI_GATEWAY, { GatewayRequest, GatewayResponse, ProviderType } from '@/lib/ai-orchestration/ai-gateway';
import { checkCostAlerts } from '@/lib/ai-orchestration/usage-tracker';

export interface MiddlewareContext {
  userId?: string;
  tenantId?: string;
  userRole?: string;
}

/** Roles allowed to use each provider */
const PROVIDER_ROLE_ALLOWLIST: Record<ProviderType, string[]> = {
  openai: ['super_admin', 'admin', 'developer', 'manager'],
  elevenlabs: ['super_admin', 'admin', 'manager'],
  github: ['super_admin', 'admin', 'developer'],
  whatsapp: ['super_admin', 'admin', 'manager', 'support'],
  stripe: ['super_admin', 'admin', 'finance'],
  firebase_fcm: ['super_admin', 'admin', 'developer'],
};

/**
 * Check if the current monthly cost for a service has exceeded its cap.
 * Returns true if the call should be blocked.
 */
async function isCostCapExceeded(provider: ProviderType): Promise<boolean> {
  const alerts = await checkCostAlerts();
  return alerts.some(
    a =>
      a.level === 'exceeded_100' &&
      a.serviceName?.toLowerCase().includes(provider.replace('_', ''))
  );
}

/**
 * Enforce role-based access control for a provider.
 */
function isRoleAllowed(provider: ProviderType, role?: string): boolean {
  if (!role) return false;
  return PROVIDER_ROLE_ALLOWLIST[provider]?.includes(role) ?? false;
}

/**
 * Guarded AI_GATEWAY call – validates role and cost cap before routing.
 *
 * @example
 * const result = await gatewayWithGuards(
 *   { provider: 'openai', endpoint: '/chat/completions', body: {...} },
 *   { userId: user.id, tenantId: tenant.id, userRole: 'developer' }
 * );
 */
export async function gatewayWithGuards<T = unknown>(
  req: GatewayRequest,
  ctx: MiddlewareContext
): Promise<GatewayResponse<T>> {
  // 1. Role-based access check
  if (!isRoleAllowed(req.provider, ctx.userRole)) {
    return {
      data: null,
      status: 403,
      ok: false,
      error: `Role '${ctx.userRole ?? 'unknown'}' is not authorized to use provider '${req.provider}'`,
    };
  }

  // 2. Cost cap check
  const blocked = await isCostCapExceeded(req.provider);
  if (blocked) {
    return {
      data: null,
      status: 429,
      ok: false,
      error: `Monthly cost cap exceeded for provider '${req.provider}'. Call blocked.`,
    };
  }

  // 3. Inject context into request
  const enrichedReq: GatewayRequest = {
    ...req,
    userId: req.userId ?? ctx.userId,
    tenantId: req.tenantId ?? ctx.tenantId,
  };

  return AI_GATEWAY<T>(enrichedReq);
}

export default gatewayWithGuards;
