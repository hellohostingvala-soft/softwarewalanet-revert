import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated admin user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!userRole || !["admin", "boss_owner"].includes(userRole.role)) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { application_id, action, reviewer_notes } = body;

    if (!application_id || !["approve", "reject"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid request data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get application
    const { data: application, error: appError } = await supabase
      .from("reseller_applications")
      .select("*")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      return new Response(
        JSON.stringify({ error: "Application not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (application.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Application already processed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "approve") {
      // Update application status
      await supabase
        .from("reseller_applications")
        .update({
          status: "approved",
          reviewer_id: user.id,
          reviewer_notes: reviewer_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", application_id);

      // Create reseller record
      const { data: reseller, error: resellerError } = await supabase
        .from("resellers")
        .insert({
          user_id: application.user_id,
          status: "ACTIVE",
          commission_rate: 10.00
        })
        .select()
        .single();

      if (resellerError) {
        return new Response(
          JSON.stringify({ error: "Failed to create reseller: " + resellerError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update user role
      await supabase
        .from("user_roles")
        .upsert({
          user_id: application.user_id,
          role: "reseller"
        });

      return new Response(
        JSON.stringify({
          success: true,
          action: "approved",
          reseller_id: reseller.id
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      // Reject application
      await supabase
        .from("reseller_applications")
        .update({
          status: "rejected",
          reviewer_id: user.id,
          reviewer_notes: reviewer_notes || null,
          rejection_reason: reviewer_notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", application_id);

      return new Response(
        JSON.stringify({
          success: true,
          action: "rejected"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Reseller approve error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});