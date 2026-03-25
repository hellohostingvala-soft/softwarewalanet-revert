import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    switch (req.method) {
      case "GET":
        // List modules accessible to user
        const { data: modules, error: listError } = await supabaseClient
          .from("modules")
          .select("*")
          .order("created_at", { ascending: false });

        if (listError) throw listError;

        return new Response(JSON.stringify(modules), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "POST":
        // Create new module
        const { name, description } = await req.json();

        if (!name) {
          return new Response(JSON.stringify({ error: "Name is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: user } = await supabaseClient.auth.getUser();
        if (!user.user) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: newModule, error: createError } = await supabaseClient
          .from("modules")
          .insert({
            name,
            description,
            created_by: user.user.id,
          })
          .select()
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify(newModule), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "PUT":
        // Update module
        if (!id || id === "modules-crud") {
          return new Response(JSON.stringify({ error: "Module ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const updateData = await req.json();
        const { data: updatedModule, error: updateError } = await supabaseClient
          .from("modules")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify(updatedModule), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "DELETE":
        // Delete module
        if (!id || id === "modules-crud") {
          return new Response(JSON.stringify({ error: "Module ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: deleteError } = await supabaseClient
          .from("modules")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});