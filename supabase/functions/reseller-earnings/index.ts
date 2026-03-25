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
      if (action === 'earnings') {
        // Get earnings/transactions data
        const { data: transactions, error } = await supabaseClient
          .from('transactions')
          .select(`
            *,
            orders (
              product_name,
              amount,
              order_date
            )
          `)
          .eq('reseller_id', reseller.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Calculate earnings summary
        const totalEarned = transactions?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0
        const pendingEarnings = transactions?.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0
        const completedEarnings = totalEarned - pendingEarnings

        return new Response(
          JSON.stringify({
            transactions,
            summary: {
              totalEarned,
              pendingEarnings,
              completedEarnings,
              commissionRate: reseller.commission_rate
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'payouts') {
        // Get payouts data
        const { data: payouts, error } = await supabaseClient
          .from('payouts')
          .select('*')
          .eq('reseller_id', reseller.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Calculate payout summary
        const totalPaid = payouts?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        const pendingPayouts = payouts?.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + (p.amount || 0), 0) || 0

        return new Response(
          JSON.stringify({
            payouts,
            summary: {
              totalPaid,
              pendingPayouts
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'stats') {
        // Get comprehensive earnings stats
        const { data: transactions } = await supabaseClient
          .from('transactions')
          .select('commission_amount, status, created_at')
          .eq('reseller_id', reseller.id)

        const { data: payouts } = await supabaseClient
          .from('payouts')
          .select('amount, status')
          .eq('reseller_id', reseller.id)

        const totalCommission = transactions?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0
        const paidCommission = payouts?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        const availableForPayout = totalCommission - paidCommission

        // Monthly earnings (last 12 months)
        const monthlyEarnings = transactions?.reduce((acc, t) => {
          const month = new Date(t.created_at).toISOString().slice(0, 7) // YYYY-MM
          acc[month] = (acc[month] || 0) + (t.commission_amount || 0)
          return acc
        }, {}) || {}

        return new Response(
          JSON.stringify({
            totalCommission,
            paidCommission,
            availableForPayout,
            monthlyEarnings,
            commissionRate: reseller.commission_rate
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'POST' && action === 'request-payout') {
      const body = await req.json()
      const { amount, payment_method, payment_details } = body

      if (!amount || amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Valid amount is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check available balance
      const { data: transactions } = await supabaseClient
        .from('transactions')
        .select('commission_amount')
        .eq('reseller_id', reseller.id)
        .eq('status', 'COMPLETED')

      const { data: payouts } = await supabaseClient
        .from('payouts')
        .select('amount')
        .eq('reseller_id', reseller.id)
        .eq('status', 'PAID')

      const totalEarned = transactions?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0
      const totalPaid = payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      const availableBalance = totalEarned - totalPaid

      if (amount > availableBalance) {
        return new Response(
          JSON.stringify({ error: 'Insufficient balance for payout' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create payout request
      const { data: payout, error } = await supabaseClient
        .from('payouts')
        .insert({
          reseller_id: reseller.id,
          amount,
          payment_method,
          payment_details: payment_details || {}
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ payout }),
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
<parameter name="filePath">c:\Users\dell\softwarewalanet\supabase\functions\reseller-earnings\index.ts