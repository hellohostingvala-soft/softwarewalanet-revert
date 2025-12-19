// Middleware for Software Vala API
import {
  getSupabaseAdmin,
  getSupabaseClient,
  getUserFromToken,
  createAuditLog,
  checkIPLock,
  checkSubscription,
  checkKYC,
  hasAnyRole,
  errorResponse,
  corsHeaders,
  parseRequest,
} from "./utils.ts";

export interface RequestContext {
  supabase: any;
  supabaseAdmin: any;
  user: { userId: string; role: string; email: string };
  body: any;
  deviceId: string;
  clientIP: string;
}

// Roles that require IP lock
const IP_LOCKED_ROLES = ["franchise", "reseller", "prime", "developer"];

// Roles that require KYC verification
const KYC_REQUIRED_ROLES = ["franchise", "reseller", "developer", "influencer"];

// Roles that require active subscription
const SUBSCRIPTION_REQUIRED_ROLES = ["franchise", "reseller", "prime"];

// Main middleware wrapper
export async function withAuth(
  req: Request,
  allowedRoles: string[],
  handler: (ctx: RequestContext) => Promise<Response>,
  options: {
    requireKYC?: boolean;
    requireSubscription?: boolean;
    skipIPLock?: boolean;
    module?: string;
    action?: string;
  } = {}
): Promise<Response> {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { body, authHeader, deviceId, clientIP } = await parseRequest(req);

  // Check auth header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse("Unauthorized: Missing or invalid token", 401);
  }

  const supabase = getSupabaseClient(authHeader);
  const supabaseAdmin = getSupabaseAdmin();

  // Get user from token
  const user = await getUserFromToken(supabase);
  if (!user) {
    return errorResponse("Unauthorized: Invalid token", 401);
  }

  // Check role access
  if (allowedRoles.length > 0 && !hasAnyRole(user.role, allowedRoles)) {
    await createAuditLog(supabaseAdmin, user.userId, user.role, options.module || "auth", "access_denied", {
      attempted_action: options.action,
      client_ip: clientIP,
    });
    return errorResponse("Forbidden: Insufficient permissions", 403);
  }

  // IP Lock check for certain roles
  if (!options.skipIPLock && IP_LOCKED_ROLES.includes(user.role)) {
    const ipCheck = await checkIPLock(supabaseAdmin, user.userId, clientIP, deviceId);
    if (!ipCheck.allowed) {
      await createAuditLog(supabaseAdmin, user.userId, user.role, "security", "ip_lock_violation", {
        ip: clientIP,
        device: deviceId,
      });
      return errorResponse(ipCheck.reason || "IP/Device not authorized", 403);
    }
  }

  // KYC check
  if ((options.requireKYC || KYC_REQUIRED_ROLES.includes(user.role))) {
    const kycStatus = await checkKYC(supabaseAdmin, user.userId);
    if (!kycStatus.verified) {
      return errorResponse(`KYC verification required. Current status: ${kycStatus.status}`, 403);
    }
  }

  // Subscription check
  if ((options.requireSubscription || SUBSCRIPTION_REQUIRED_ROLES.includes(user.role))) {
    const subStatus = await checkSubscription(supabaseAdmin, user.userId);
    if (!subStatus.active) {
      return errorResponse("Active subscription required", 402);
    }
  }

  // Create audit log for this request
  if (options.module && options.action) {
    await createAuditLog(supabaseAdmin, user.userId, user.role, options.module, options.action, {
      client_ip: clientIP,
      device_id: deviceId,
      request_body: body,
    });
  }

  // Execute handler
  try {
    return await handler({ supabase, supabaseAdmin, user, body, deviceId, clientIP });
  } catch (err) {
    const error = err as Error;
    console.error("Handler error:", error);
    await createAuditLog(supabaseAdmin, user.userId, user.role, options.module || "system", "error", {
      error: error.message,
      action: options.action,
    });
    return errorResponse(error.message || "Internal server error", 500);
  }
}

// Public endpoint wrapper (no auth required, but still logs)
export async function withPublic(
  req: Request,
  handler: (ctx: { supabaseAdmin: any; body: any; clientIP: string; deviceId: string }) => Promise<Response>,
  options: { module?: string; action?: string } = {}
): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { body, deviceId, clientIP } = await parseRequest(req);
  const supabaseAdmin = getSupabaseAdmin();

  if (options.module && options.action) {
    await createAuditLog(supabaseAdmin, null, null, options.module, options.action, {
      client_ip: clientIP,
      device_id: deviceId,
    });
  }

  try {
    return await handler({ supabaseAdmin, body, clientIP, deviceId });
  } catch (err) {
    const error = err as Error;
    console.error("Handler error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

// Super admin only wrapper
export async function withSuperAdmin(
  req: Request,
  handler: (ctx: RequestContext) => Promise<Response>,
  options: { module?: string; action?: string } = {}
): Promise<Response> {
  return withAuth(req, ["super_admin"], handler, {
    ...options,
    skipIPLock: true,
    requireKYC: false,
    requireSubscription: false,
  });
}

// Prime user priority wrapper
export async function withPrimePriority(
  req: Request,
  handler: (ctx: RequestContext & { isPrime: boolean }) => Promise<Response>,
  allowedRoles: string[],
  options: { module?: string; action?: string } = {}
): Promise<Response> {
  return withAuth(req, allowedRoles, async (ctx) => {
    const isPrime = ctx.user.role === "prime";
    return handler({ ...ctx, isPrime });
  }, options);
}
