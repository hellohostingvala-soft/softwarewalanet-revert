/**
 * generate-license Edge Function
 * Generates a license key after a webhook-verified $249 payment.
 * Called internally by verify-payment-webhook after successful payment.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

/** Generate a cryptographically secure license key */
function generateLicenseKey(productId: string): string {
  const prefix = productId.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "X");
  const randomPart = crypto.randomUUID().replace(/-/g, "").toUpperCase().substring(0, 18);
  return `${prefix}-${randomPart.substring(0, 6)}-${randomPart.substring(6, 12)}-${randomPart.substring(12, 18)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the order (must be paid and webhook-verified)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, product_id, status, amount")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.status !== "paid") {
      return new Response(JSON.stringify({ error: "Order is not paid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the payment was webhook-verified
    const { data: payment } = await supabase
      .from("payments")
      .select("id, webhook_verified, amount")
      .eq("order_id", orderId)
      .eq("status", "completed")
      .eq("webhook_verified", true)
      .maybeSingle();

    if (!payment) {
      return new Response(JSON.stringify({ error: "No verified payment found for this order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if a license already exists (idempotent)
    const { data: existingLicense } = await supabase
      .from("licenses")
      .select("id, license_key")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingLicense) {
      console.log(`[generate-license] License already exists for order ${orderId}`);
      return new Response(
        JSON.stringify({ licenseKey: existingLicense.license_key, orderId, alreadyExisted: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const licenseKey = generateLicenseKey(order.product_id);

    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .insert({
        order_id: orderId,
        product_id: order.product_id,
        license_key: licenseKey,
        activated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (licenseError) {
      console.error("[generate-license] DB error:", licenseError);
      return new Response(JSON.stringify({ error: "Failed to create license" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit log
    await supabase.from("payment_audit_log").insert({
      event_type: "license_generated",
      order_id: orderId,
      details: { productId: order.product_id, licenseId: license.id },
    });

    console.log(`[generate-license] License ${license.id} created for order ${orderId}`);

    return new Response(
      JSON.stringify({ licenseKey: license.license_key, orderId, licenseId: license.id }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[generate-license] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
