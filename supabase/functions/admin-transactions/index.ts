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
        // List all transactions with reseller and order info
        const { data: transactions, error } = await supabaseClient
          .from('transactions')
          .select(`
            *,
            resellers (
              user:user_id (
                email
              )
            ),
            orders (
              product_name,
              amount,
              status,
              customers (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ transactions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'stats') {
        // Get transaction statistics
        const { data: transactions } = await supabaseClient
          .from('transactions')
          .select('commission_amount, status, created_at')

        const totalCommission = transactions?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0
        const pendingCommission = transactions?.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0
        const completedCommission = totalCommission - pendingCommission

        // Monthly commission (last 12 months)
        const monthlyCommission = transactions?.reduce((acc, t) => {
          const month = new Date(t.created_at).toISOString().slice(0, 7) // YYYY-MM
          acc[month] = (acc[month] || 0) + (t.commission_amount || 0)
          return acc
        }, {}) || {}

        return new Response(
          JSON.stringify({
            totalCommission,
            pendingCommission,
            completedCommission,
            monthlyCommission
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
          JSON.stringify({ error: 'Transaction ID and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update transaction status
      const { data: transaction, error } = await supabaseClient
        .from('transactions')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ transaction }),
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
<parameter name="filePath">c:\Users\dell\softwarewalanet\supabase\functions\admin-transactions\index.ts