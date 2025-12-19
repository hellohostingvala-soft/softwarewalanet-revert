import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  jsonResponse,
  errorResponse,
  validateRequired,
} from "../_shared/utils.ts";
import { withAuth, RequestContext } from "../_shared/middleware.ts";

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/subscribe", "").replace("/api/subscription", "").replace("/api/invoice", "");

  // POST /subscribe
  if ((path === "" || path === "/") && req.method === "POST") {
    return withAuth(req, [], async ({ supabaseAdmin, body, user }) => {
      const validation = validateRequired(body, ["plan", "amount"]);
      if (validation) return errorResponse(validation);

      // Calculate validity
      let validityDays = 30;
      if (body.plan === "yearly") validityDays = 365;
      if (body.plan === "lifetime") validityDays = 36500; // 100 years

      const activatedAt = new Date();
      const expiredAt = new Date(activatedAt.getTime() + validityDays * 24 * 60 * 60 * 1000);

      // Deactivate existing subscriptions
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "replaced" })
        .eq("user_id", user.userId)
        .eq("status", "active");

      const { data, error } = await supabaseAdmin.from("subscriptions").insert({
        user_id: user.userId,
        plan: body.plan,
        amount: body.amount,
        validity: validityDays,
        status: "active",
        activated_at: activatedAt.toISOString(),
        expired_at: expiredAt.toISOString(),
      }).select().single();

      if (error) return errorResponse(error.message, 400);

      // Create invoice
      await supabaseAdmin.from("invoices").insert({
        user_id: user.userId,
        amount: body.amount,
        tax: body.amount * 0.18, // 18% GST
        currency: "INR",
      });

      return jsonResponse({
        message: "Subscription activated",
        subscription_id: data.sub_id,
        plan: body.plan,
        expires_at: expiredAt.toISOString(),
      }, 201);
    }, { module: "subscriptions", action: "subscribe" });
  }

  // GET /subscription/status
  if (path === "/status" && req.method === "GET") {
    return withAuth(req, [], async ({ supabaseAdmin, user }) => {
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.userId)
        .eq("status", "active")
        .order("activated_at", { ascending: false })
        .limit(1)
        .single();

      if (!sub) {
        return jsonResponse({
          active: false,
          message: "No active subscription",
        });
      }

      const now = new Date();
      const expiry = new Date(sub.expired_at);
      const daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

      return jsonResponse({
        active: expiry > now,
        subscription_id: sub.sub_id,
        plan: sub.plan,
        activated_at: sub.activated_at,
        expires_at: sub.expired_at,
        days_remaining: daysRemaining,
      });
    }, { module: "subscriptions", action: "status" });
  }

  // POST /invoice/generate
  if (path === "/generate" && req.method === "POST") {
    return withAuth(req, ["super_admin", "admin", "finance_manager"], async ({ supabaseAdmin, body, user }) => {
      const validation = validateRequired(body, ["user_id", "amount"]);
      if (validation) return errorResponse(validation);

      const tax = body.amount * (body.tax_rate || 0.18);

      const { data, error } = await supabaseAdmin.from("invoices").insert({
        user_id: body.user_id,
        amount: body.amount,
        tax,
        currency: body.currency || "INR",
        pdf_link: body.pdf_link,
      }).select().single();

      if (error) return errorResponse(error.message, 400);

      return jsonResponse({
        message: "Invoice generated",
        invoice_id: data.invoice_id,
        total: body.amount + tax,
      }, 201);
    }, { module: "invoices", action: "generate" });
  }

  // GET /invoices
  if (path === "s" && req.method === "GET") {
    return withAuth(req, [], async ({ supabaseAdmin, user }) => {
      let query = supabaseAdmin.from("invoices").select("*");

      // Only admins can see all invoices
      if (!["super_admin", "admin", "finance_manager"].includes(user.role)) {
        query = query.eq("user_id", user.userId);
      }

      const { data, error } = await query.order("timestamp", { ascending: false });

      if (error) return errorResponse(error.message, 400);

      return jsonResponse({
        invoices: data?.map((inv: any) => ({
          invoice_id: inv.invoice_id,
          amount: inv.amount,
          tax: inv.tax,
          total: inv.amount + inv.tax,
          currency: inv.currency,
          pdf_link: inv.pdf_link,
          created_at: inv.timestamp,
        })) || [],
      });
    }, { module: "invoices", action: "list" });
  }

  return errorResponse("Not found", 404);
});
