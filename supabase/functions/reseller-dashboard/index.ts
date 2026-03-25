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

  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
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

    // Get reseller record
    const { data: reseller, error: resellerError } = await supabase
      .from("resellers")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .single();

    if (resellerError || !reseller) {
      return new Response(
        JSON.stringify({ error: "Reseller account not found or inactive" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get dashboard data
    const [customersResult, ordersResult, transactionsResult, payoutsResult] = await Promise.all([
      // Customers count
      supabase
        .from("customers")
        .select("id", { count: "exact" })
        .eq("reseller_id", reseller.id),

      // Orders summary
      supabase
        .from("orders")
        .select("amount, status")
        .eq("reseller_id", reseller.id),

      // Transactions summary
      supabase
        .from("transactions")
        .select("commission_amount, status")
        .eq("reseller_id", reseller.id),

      // Payouts summary
      supabase
        .from("payouts")
        .select("amount, status")
        .eq("reseller_id", reseller.id)
    ]);

    // Calculate totals
    const customersCount = customersResult.count || 0;

    const orders = ordersResult.data || [];
    const totalOrderValue = orders.reduce((sum, order) => sum + Number(order.amount), 0);
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    const transactions = transactionsResult.data || [];
    const totalCommission = transactions.reduce((sum, t) => sum + Number(t.commission_amount), 0);
    const paidCommission = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.commission_amount), 0);

    const payouts = payoutsResult.data || [];
    const totalPaid = payouts
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingPayouts = payouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return new Response(
      JSON.stringify({
        reseller: {
          id: reseller.id,
          commission_rate: reseller.commission_rate,
          joined_at: reseller.joined_at
        },
        stats: {
          customers: customersCount,
          total_orders: orders.length,
          completed_orders: completedOrders,
          total_order_value: totalOrderValue,
          total_commission: totalCommission,
          paid_commission: paidCommission,
          pending_commission: totalCommission - paidCommission,
          total_paid: totalPaid,
          pending_payouts: pendingPayouts
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Reseller dashboard error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});