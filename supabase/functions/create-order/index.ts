import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  errorResponse,
  jsonResponse,
  getSupabaseAdmin,
  getSupabaseClient,
  getUserFromToken,
  sanitizeInput,
  isValidUUID,
  isValidNumber,
  validateTokenFormat,
  checkRateLimit,
  rateLimitResponse,
  createAuditLog,
} from "../_shared/utils.ts";

// Supported payment gateways
const SUPPORTED_GATEWAYS = ["flutterwave", "stripe", "payu", "paypal"] as const;
type Gateway = typeof SUPPORTED_GATEWAYS[number];

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);

  // Rate limit: 10 order creation attempts per minute per IP
  const rateCheck = checkRateLimit(clientIP, "payment");
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.resetIn);
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const tokenCheck = validateTokenFormat(authHeader);
    if (!tokenCheck.valid) {
      return errorResponse(tokenCheck.error || "Unauthorized", 401);
    }

    const supabaseClient = getSupabaseClient(authHeader);
    const supabaseAdmin = getSupabaseAdmin();

    const user = await getUserFromToken(supabaseClient);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const { application_id, gateway, idempotency_key } = body as {
      application_id?: string;
      gateway?: string;
      idempotency_key?: string;
    };

    // Validate inputs
    if (!application_id || !isValidUUID(application_id)) {
      return errorResponse("Valid application_id is required", 400);
    }
    if (!gateway || !SUPPORTED_GATEWAYS.includes(gateway as Gateway)) {
      return errorResponse(
        `gateway must be one of: ${SUPPORTED_GATEWAYS.join(", ")}`,
        400,
      );
    }
    if (!idempotency_key) {
      return errorResponse("idempotency_key is required", 400);
    }
    const safeIdempotencyKey = sanitizeInput(String(idempotency_key)).slice(0, 128);
    if (!safeIdempotencyKey) {
      return errorResponse("Invalid idempotency_key", 400);
    }

    // Check idempotency — return existing order if key already used
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("idempotency_key", safeIdempotencyKey)
      .maybeSingle();

    if (existingOrder) {
      return jsonResponse({ order: existingOrder }, 200);
    }

    // Fetch application price from DB (never trust frontend price)
    const { data: app, error: appError } = await supabaseAdmin
      .from("marketplace_applications")
      .select("id, name, price_usd, currency, margin_floor, is_active")
      .eq("id", application_id)
      .maybeSingle();

    if (appError || !app) {
      return errorResponse("Application not found", 404);
    }
    if (!app.is_active) {
      return errorResponse("Application is not available for purchase", 400);
    }

    // Validate margin_floor enforcement: price must be >= price_usd
    const serverPrice = Number(app.price_usd);
    if (!isValidNumber(serverPrice, 0.01)) {
      return errorResponse("Invalid application price", 500);
    }

    // Create order — amount is always taken from DB
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.userId,
        application_id,
        amount_usd: serverPrice,
        currency: app.currency || "USD",
        gateway,
        status: "pending",
        idempotency_key: safeIdempotencyKey,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        metadata: {
          application_name: app.name,
          margin_floor: app.margin_floor,
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return errorResponse("Failed to create order", 500);
    }

    // Audit log
    await createAuditLog(supabaseAdmin, user.userId, user.role, "marketplace", "order_created", {
      order_id: order.id,
      application_id,
      gateway,
      amount_usd: serverPrice,
      ip: clientIP,
    });

    // Write to payment_audit_logs
    await supabaseAdmin.from("payment_audit_logs").insert({
      user_id: user.userId,
      order_id: order.id,
      event_type: "order_created",
      actor_id: user.userId,
      actor_role: user.role,
      ip_address: clientIP,
      payload: {
        application_id,
        gateway,
        amount_usd: serverPrice,
      },
    });

    return jsonResponse({ order }, 201);
  } catch (err) {
    console.error("create-order error:", err);
    return errorResponse("Internal server error", 500);
  }
});
