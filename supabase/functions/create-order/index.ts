/**
 * create-order Edge Function
 * Creates an order with amount hardcoded to $249 USD.
 * Frontend cannot supply or override the amount.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FIXED_PRICE = 249;
const FIXED_CURRENCY = "USD";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve the requesting user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { productId, productName, customerName, customerEmail, gateway, idempotencyKey } = body;

    if (!productId || !productName || !customerName || !customerEmail || !gateway) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: productId, productName, customerName, customerEmail, gateway" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validGateways = ["flutterwave", "stripe", "payu"];
    if (!validGateways.includes(gateway)) {
      return new Response(
        JSON.stringify({ error: `Invalid gateway. Must be one of: ${validGateways.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Idempotency: return existing order if same key already used
    if (idempotencyKey) {
      const { data: existing } = await supabase
        .from("orders")
        .select("id, amount, status")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (existing) {
        console.log(`[create-order] Idempotency hit for key: ${idempotencyKey}`);
        return new Response(JSON.stringify({ orderId: existing.id, amount: existing.amount, currency: FIXED_CURRENCY }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Create order — amount is ALWAYS 249, set server-side
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        product_id: productId,
        amount: FIXED_PRICE,           // hardcoded; frontend value ignored
        currency: FIXED_CURRENCY,
        status: "pending",
        idempotency_key: idempotencyKey ?? null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("[create-order] DB error:", orderError);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit log
    await supabase.from("payment_audit_log").insert({
      event_type: "order_created",
      order_id: order.id,
      details: { productId, productName, customerEmail, gateway, amount: FIXED_PRICE, currency: FIXED_CURRENCY },
    });

    console.log(`[create-order] Order ${order.id} created for user ${user.id}, product ${productId}`);

    return new Response(
      JSON.stringify({ orderId: order.id, amount: FIXED_PRICE, currency: FIXED_CURRENCY }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[create-order] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
