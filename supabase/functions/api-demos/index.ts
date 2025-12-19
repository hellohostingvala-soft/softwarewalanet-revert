import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  jsonResponse,
  errorResponse,
  validateRequired,
  createAuditLog,
  createBuzzerAlert,
} from "../_shared/utils.ts";
import { withAuth, RequestContext } from "../_shared/middleware.ts";

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/demos", "");

  // POST /demos/create
  if (path === "/create" && req.method === "POST") {
    return withAuth(req, ["super_admin", "admin", "demo_manager", "product_manager"], async ({ supabaseAdmin, body, user }) => {
      const validation = validateRequired(body, ["title", "category", "url"]);
      if (validation) return errorResponse(validation);

      const { data, error } = await supabaseAdmin.from("demos").insert({
        title: body.title,
        category: body.category,
        url: body.url,
        description: body.description,
        tech_stack: body.tech_stack || "other",
        status: "active",
        created_by: user.userId,
      }).select().single();

      if (error) return errorResponse(error.message, 400);

      return jsonResponse({
        message: "Demo created",
        demo_id: data.id,
      }, 201);
    }, { module: "demos", action: "create" });
  }

  // PUT /demos/assign
  if (path === "/assign" && req.method === "PUT") {
    return withAuth(req, ["super_admin", "admin", "demo_manager", "franchise"], async ({ supabaseAdmin, body, user }) => {
      const validation = validateRequired(body, ["demo_id", "assigned_to"]);
      if (validation) return errorResponse(validation);

      // Create rental link
      const maskedUrl = `https://demo.softwarevala.com/v/${Date.now().toString(36)}`;
      
      const { data: rental, error } = await supabaseAdmin.from("demo_rental_links").insert({
        demo_id: body.demo_id,
        requester_id: user.userId,
        requester_role: user.role,
        real_url: body.real_url || "",
        masked_url: maskedUrl,
        expires_at: body.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_views: body.max_views || 100,
        status: "approved",
        approved_by: user.userId,
        approved_at: new Date().toISOString(),
      }).select().single();

      if (error) return errorResponse(error.message, 400);

      return jsonResponse({
        message: "Demo assigned",
        rental_id: rental.id,
        masked_url: maskedUrl,
        expires_at: rental.expires_at,
      });
    }, { module: "demos", action: "assign" });
  }

  // POST /demos/log (click tracking)
  if (path === "/log" && req.method === "POST") {
    return withAuth(req, [], async ({ supabaseAdmin, body, user, clientIP }) => {
      const validation = validateRequired(body, ["demo_id"]);
      if (validation) return errorResponse(validation);

      await supabaseAdmin.from("demo_clicks").insert({
        demo_id: body.demo_id,
        user_id: user.userId,
        user_role: user.role,
        ip_address: clientIP,
        device_type: body.device_type,
        browser: body.browser,
        referrer: body.referrer,
      });

      // Update rental link views if applicable
      if (body.rental_id) {
        await supabaseAdmin.rpc("increment_demo_views", { rental_id: body.rental_id });
      }

      return jsonResponse({ logged: true });
    }, { module: "demos", action: "log_click" });
  }

  // GET /demos/failures
  if (path === "/failures" && req.method === "GET") {
    return withAuth(req, ["super_admin", "admin", "demo_manager", "support"], async ({ supabaseAdmin }) => {
      const { data: failures } = await supabaseAdmin
        .from("demo_health")
        .select(`
          *,
          demos (id, title, url, category)
        `)
        .in("status", ["down", "degraded"])
        .order("checked_at", { ascending: false })
        .limit(50);

      // Get escalations
      const { data: escalations } = await supabaseAdmin
        .from("demo_escalations")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      const hasActiveFailures = (failures?.length || 0) > 0;

      return jsonResponse({
        buzzer: hasActiveFailures,
        failures: failures?.map((f: any) => ({
          health_id: f.id,
          demo_id: f.demo_id,
          demo_title: f.demos?.title,
          status: f.status,
          error: f.error_message,
          checked_at: f.checked_at,
        })) || [],
        escalations: escalations?.map((e: any) => ({
          id: e.id,
          demo_id: e.demo_id,
          reason: e.reason,
          level: e.escalation_level,
          created_at: e.created_at,
        })) || [],
      }, 200, hasActiveFailures);
    }, { module: "demos", action: "failures" });
  }

  // GET /demos (list)
  if ((path === "" || path === "/") && req.method === "GET") {
    return withAuth(req, ["super_admin", "admin", "demo_manager", "franchise", "reseller", "prime", "client"], async ({ supabaseAdmin, user }) => {
      const urlParams = new URL(req.url);
      const category = urlParams.searchParams.get("category");
      const status = urlParams.searchParams.get("status");

      let query = supabaseAdmin.from("demos").select("*");

      if (category) query = query.eq("category", category);
      if (status) query = query.eq("status", status);

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) return errorResponse(error.message, 400);

      // Mask URLs for non-admin users
      const demos = data?.map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        description: d.description,
        tech_stack: d.tech_stack,
        status: d.status,
        health_score: d.health_score,
        url: ["super_admin", "admin", "demo_manager"].includes(user.role) ? d.url : d.masked_url,
        created_at: d.created_at,
      })) || [];

      return jsonResponse({ demos });
    }, { module: "demos", action: "list" });
  }

  // POST /demos/health-check (internal)
  if (path === "/health-check" && req.method === "POST") {
    return withAuth(req, ["super_admin", "admin", "demo_manager"], async ({ supabaseAdmin, body }) => {
      const { data: demos } = await supabaseAdmin
        .from("demos")
        .select("id, url, title")
        .eq("status", "active");

      const results: any[] = [];

      for (const demo of demos || []) {
        try {
          const start = Date.now();
          const response = await fetch(demo.url, { method: "HEAD", signal: AbortSignal.timeout(10000) });
          const responseTime = Date.now() - start;

          const status = response.ok ? "active" : "degraded";

          await supabaseAdmin.from("demo_health").insert({
            demo_id: demo.id,
            status,
            response_time: responseTime,
          });

          results.push({ demo_id: demo.id, status, response_time: responseTime });

          // Create buzzer if down
          if (!response.ok) {
            await createBuzzerAlert(supabaseAdmin, "demo_failure", "demo_manager", null, null, "critical");
          }
        } catch (err) {
          await supabaseAdmin.from("demo_health").insert({
            demo_id: demo.id,
            status: "down",
            error_message: (err as Error).message,
          });

          await createBuzzerAlert(supabaseAdmin, "demo_failure", "demo_manager", null, null, "critical");

          results.push({ demo_id: demo.id, status: "down", error: (err as Error).message });
        }
      }

      return jsonResponse({
        checked: results.length,
        results,
      });
    }, { module: "demos", action: "health_check" });
  }

  return errorResponse("Not found", 404);
});
