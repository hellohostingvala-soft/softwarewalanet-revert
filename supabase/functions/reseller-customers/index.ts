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
        // List all customers for this reseller
        const { data: customers, error } = await supabaseClient
          .from('customers')
          .select('*')
          .eq('reseller_id', reseller.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ customers }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'stats') {
        // Get customer statistics
        const { data: customers } = await supabaseClient
          .from('customers')
          .select('id')
          .eq('reseller_id', reseller.id)

        const totalCustomers = customers?.length || 0

        // Get orders per customer
        const { data: orders } = await supabaseClient
          .from('orders')
          .select('customer_id')
          .eq('reseller_id', reseller.id)
          .not('customer_id', 'is', null)

        const ordersByCustomer = orders?.reduce((acc, order) => {
          acc[order.customer_id] = (acc[order.customer_id] || 0) + 1
          return acc
        }, {}) || {}

        const avgOrdersPerCustomer = totalCustomers > 0
          ? Object.values(ordersByCustomer).reduce((sum, count) => sum + count, 0) / totalCustomers
          : 0

        return new Response(
          JSON.stringify({
            totalCustomers,
            avgOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 100) / 100
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { name, email, phone, address } = body

      if (!name) {
        return new Response(
          JSON.stringify({ error: 'Customer name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create new customer
      const { data: customer, error } = await supabaseClient
        .from('customers')
        .insert({
          reseller_id: reseller.id,
          name,
          email,
          phone,
          address
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ customer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      const { id, name, email, phone, address } = body

      if (!id || !name) {
        return new Response(
          JSON.stringify({ error: 'Customer ID and name are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update customer
      const { data: customer, error } = await supabaseClient
        .from('customers')
        .update({
          name,
          email,
          phone,
          address
        })
        .eq('id', id)
        .eq('reseller_id', reseller.id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ customer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const id = url.searchParams.get('id')

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Customer ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Delete customer (this will cascade to orders)
      const { error } = await supabaseClient
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('reseller_id', reseller.id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
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
<parameter name="filePath">c:\Users\dell\softwarewalanet\supabase\functions\reseller-customers\index.ts