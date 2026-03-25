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
        // List all resellers with stats
        const { data: resellers, error } = await supabaseClient
          .from('resellers')
          .select(`
            *,
            user:user_id (
              email
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Get stats for each reseller
        const resellersWithStats = await Promise.all(
          resellers.map(async (reseller) => {
            const { data: orders } = await supabaseClient
              .from('orders')
              .select('amount, status')
              .eq('reseller_id', reseller.id)

            const { data: transactions } = await supabaseClient
              .from('transactions')
              .select('commission_amount')
              .eq('reseller_id', reseller.id)

            const totalOrders = orders?.length || 0
            const totalRevenue = orders?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0
            const totalCommission = transactions?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0

            return {
              ...reseller,
              stats: {
                totalOrders,
                totalRevenue,
                totalCommission
              }
            }
          })
        )

        return new Response(
          JSON.stringify({ resellers: resellersWithStats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'stats') {
        // Get overall reseller statistics
        const { data: resellers } = await supabaseClient
          .from('resellers')
          .select('id, status')

        const { data: orders } = await supabaseClient
          .from('orders')
          .select('amount, status')

        const { data: transactions } = await supabaseClient
          .from('transactions')
          .select('commission_amount')

        const totalResellers = resellers?.length || 0
        const activeResellers = resellers?.filter(r => r.status === 'ACTIVE').length || 0
        const totalOrders = orders?.length || 0
        const totalRevenue = orders?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0
        const totalCommission = transactions?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0

        return new Response(
          JSON.stringify({
            totalResellers,
            activeResellers,
            totalOrders,
            totalRevenue,
            totalCommission
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      const { id, status, commission_rate } = body

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Reseller ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update reseller
      const updateData = {}
      if (status) updateData.status = status
      if (commission_rate) updateData.commission_rate = commission_rate

      const { data: reseller, error } = await supabaseClient
        .from('resellers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ reseller }),
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
<parameter name="filePath">c:\Users\dell\softwarewalanet\supabase\functions\admin-resellers\index.ts