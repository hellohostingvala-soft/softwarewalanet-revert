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

    if (req.method === 'GET') {
      // Get reseller profile with user info
      const { data: userProfile } = await supabaseClient.auth.admin.getUserById(user.id)

      return new Response(
        JSON.stringify({
          reseller,
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            ...userProfile?.user?.user_metadata
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      const { commission_rate } = body

      // Update reseller profile (only commission rate for now)
      if (commission_rate !== undefined) {
        const { data: updatedReseller, error } = await supabaseClient
          .from('resellers')
          .update({ commission_rate })
          .eq('id', reseller.id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ reseller: updatedReseller }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'No valid fields to update' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})</content>
<parameter name="filePath">c:\Users\dell\softwarewalanet\supabase\functions\reseller-profile\index.ts