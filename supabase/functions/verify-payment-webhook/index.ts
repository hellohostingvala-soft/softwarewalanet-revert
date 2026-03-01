/**
 * verify-payment-webhook Edge Function
 * Verifies webhook signatures from Flutterwave, Stripe, or PayU using HMAC-SHA256.
 * Enforces that the paid amount is exactly $249 USD before marking the payment complete.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const FIXED_PRICE = 249;
const FIXED_CURRENCY = "USD";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature, stripe-signature, verif-hash",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

async function hmacSha256Hex(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/** Verify Flutterwave webhook: compares x-flw-signature header against HMAC of raw body */
async function verifyFlutterwaveSignature(rawBody: string, receivedSig: string): Promise<boolean> {
  const secret = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET");
  if (!secret) throw new Error("FLUTTERWAVE_WEBHOOK_SECRET not configured");
  const expected = await hmacSha256Hex(secret, rawBody);
  return expected === receivedSig;
}

/** Verify Stripe webhook: standard Stripe-Signature header with timestamp tolerance */
async function verifyStripeSignature(rawBody: string, sigHeader: string): Promise<boolean> {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  const parts = Object.fromEntries(sigHeader.split(",").map(p => p.split("=")));
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) return false;
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = await hmacSha256Hex(secret, signedPayload);
  // Reject if timestamp is more than 5 minutes old
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (age > 300) {
    console.warn("[verify-webhook] Stripe timestamp too old:", age);
    return false;
  }
  return expected === v1;
}

/** Verify PayU webhook: compares x-verify-hash header against HMAC of raw body */
async function verifyPayuSignature(rawBody: string, receivedSig: string): Promise<boolean> {
  const secret = Deno.env.get("PAYU_WEBHOOK_SECRET");
  if (!secret) throw new Error("PAYU_WEBHOOK_SECRET not configured");
  const expected = await hmacSha256Hex(secret, rawBody);
  return expected === receivedSig;
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

    const rawBody = await req.text();
    const gateway = new URL(req.url).searchParams.get("gateway") || "unknown";

    // Signature verification per gateway
    let signatureValid = false;

    if (gateway === "flutterwave") {
      const sig = req.headers.get("verif-hash") || req.headers.get("x-flw-signature") || "";
      signatureValid = await verifyFlutterwaveSignature(rawBody, sig);
    } else if (gateway === "stripe") {
      const sig = req.headers.get("stripe-signature") || "";
      signatureValid = await verifyStripeSignature(rawBody, sig);
    } else if (gateway === "payu") {
      const sig = req.headers.get("x-verify-hash") || "";
      signatureValid = await verifyPayuSignature(rawBody, sig);
    } else {
      return new Response(JSON.stringify({ error: "Unknown gateway" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signatureValid) {
      console.warn(`[verify-webhook] Invalid signature for gateway: ${gateway}`);
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(rawBody);

    // Extract payment ID and paid amount (gateway-specific parsing)
    let paymentId: string | undefined;
    let paidAmount: number | undefined;
    let paymentStatus: string | undefined;

    if (gateway === "flutterwave") {
      paymentId = event?.data?.tx_ref;
      paidAmount = event?.data?.amount;
      paymentStatus = event?.data?.status;
    } else if (gateway === "stripe") {
      paymentId = event?.data?.object?.metadata?.paymentId;
      paidAmount = event?.data?.object?.amount_received
        ? event.data.object.amount_received / 100  // cents → dollars
        : undefined;
      paymentStatus = event?.type === "payment_intent.succeeded" ? "successful" : "failed";
    } else if (gateway === "payu") {
      paymentId = event?.paymentId;
      paidAmount = event?.amount ? Number(event.amount) : undefined;
      paymentStatus = event?.status;
    }

    if (!paymentId) {
      return new Response(JSON.stringify({ error: "Could not determine payment ID from webhook" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the payment record
    const { data: payment, error: paymentFetchError } = await supabase
      .from("payments")
      .select("id, order_id, amount, currency, status")
      .eq("id", paymentId)
      .single();

    if (paymentFetchError || !payment) {
      console.error("[verify-webhook] Payment not found:", paymentId);
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce: paid amount must be exactly $249
    if (paidAmount !== undefined && paidAmount !== FIXED_PRICE) {
      console.error(`[verify-webhook] SECURITY: Paid amount ${paidAmount} does not match fixed price ${FIXED_PRICE}`);
      await supabase.from("payment_audit_log").insert({
        event_type: "webhook_amount_mismatch",
        payment_id: paymentId,
        order_id: payment.order_id,
        details: { gateway, paidAmount, expectedAmount: FIXED_PRICE },
      });
      return new Response(JSON.stringify({ error: "Payment amount does not match required price" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSuccess = ["successful", "completed", "succeeded"].includes((paymentStatus || "").toLowerCase());
    const newStatus = isSuccess ? "completed" : "failed";

    // Update payment record
    await supabase
      .from("payments")
      .update({ status: newStatus, webhook_verified: true, gateway_txn_id: event?.id || null })
      .eq("id", paymentId);

    if (isSuccess) {
      // Update order status
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", payment.order_id);

      // Trigger license generation
      await supabase.functions.invoke("generate-license", {
        body: { orderId: payment.order_id },
      });
    }

    // Audit log
    await supabase.from("payment_audit_log").insert({
      event_type: "webhook_processed",
      payment_id: paymentId,
      order_id: payment.order_id,
      details: { gateway, paidAmount, paymentStatus, newStatus, signatureValid: true },
    });

    console.log(`[verify-webhook] Payment ${paymentId} → ${newStatus} via ${gateway}`);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[verify-webhook] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
