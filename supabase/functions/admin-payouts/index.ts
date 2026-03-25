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

    // Check if user is admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || !['admin', 'super_admin'].includes(userRole.role)) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (req.method === 'GET') {
      if (action === 'list') {
        // List all payouts with reseller info
        const { data: payouts, error } = await supabaseClient
          .from('payouts')
          .select(`
            *,
            resellers (
              user:user_id (
                email
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ payouts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'stats') {
        // Get payout statistics
        const { data: payouts } = await supabaseClient
          .from('payouts')
          .select('amount, status, created_at')

        const totalPaid = payouts?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        const pendingPayouts = payouts?.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        const totalPayouts = payouts?.length || 0

        // Monthly payouts (last 12 months)
        const monthlyPayouts = payouts?.reduce((acc, p) => {
          const month = new Date(p.created_at).toISOString().slice(0, 7) // YYYY-MM
          acc[month] = (acc[month] || 0) + (p.amount || 0)
          return acc
        }, {}) || {}

        return new Response(
          JSON.stringify({
            totalPaid,
            pendingPayouts,
            totalPayouts,
            monthlyPayouts
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      const { id, status } = body

      if (!id || !status) {
        return new Response(
          JSON.stringify({ error: 'Payout ID and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update payout status
      const updateData = { status }
      if (status === 'PAID') {
        updateData.processed_at = new Date().toISOString()
      }

      const { data: payout, error } = await supabaseClient
        .from('payouts')
        .update(updateData)
        .eq('id', id)
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
<parameter name="filePath">c:\Users\dell\softwarewalanet\supabase\functions\admin-payouts\index.ts