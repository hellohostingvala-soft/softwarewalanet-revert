import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get reseller record
    const { data: reseller, error: resellerError } = await supabaseClient
      .from('resellers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .single()

    if (resellerError || !reseller) {
      return new Response(
        JSON.stringify({ error: 'Reseller not found or not active' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (req.method === 'GET') {
      if (action === 'list') {
        // List all orders for this reseller
        const { data: orders, error } = await supabaseClient
          .from('orders')
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)
          .eq('reseller_id', reseller.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ orders }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'stats') {
        // Get order statistics
        const { data: stats, error } = await supabaseClient
          .rpc('get_reseller_order_stats', { reseller_id: reseller.id })

        if (error) {
          // Fallback if RPC doesn't exist
          const { data: orders } = await supabaseClient
            .from('orders')
            .select('amount, status')
            .eq('reseller_id', reseller.id)

          const totalOrders = orders?.length || 0
          const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
          const completedOrders = orders?.filter(o => o.status === 'COMPLETED').length || 0

          return new Response(
            JSON.stringify({
              totalOrders,
              totalRevenue,
              completedOrders,
              pendingOrders: totalOrders - completedOrders
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(stats),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'POST') {
      const body = await req.json()

      if (action === 'create') {
        // Create new order
        const { customer_id, product_name, amount, currency = 'USD' } = body

        if (!product_name || !amount) {
          return new Response(
            JSON.stringify({ error: 'Product name and amount are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: order, error } = await supabaseClient
          .from('orders')
          .insert({
            reseller_id: reseller.id,
            customer_id,
            product_name,
            amount,
            currency,
            status: 'PENDING'
          })
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ order }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      const { id, status } = body

      if (!id || !status) {
        return new Response(
          JSON.stringify({ error: 'Order ID and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update order status
      const { data: order, error } = await supabaseClient
        .from('orders')
        .update({ status })
        .eq('id', id)
        .eq('reseller_id', reseller.id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ order }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})</content>
<parameter name="filePath">c:\Users\dell\softwarewalanet\supabase\functions\reseller-orders\index.ts