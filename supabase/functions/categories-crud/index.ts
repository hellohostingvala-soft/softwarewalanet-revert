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
    const moduleId = url.searchParams.get("module_id");

    switch (req.method) {
      case "GET":
        // List categories, optionally filtered by module_id
        let query = supabaseClient
          .from("categories")
          .select("*, modules(name)")
          .order("created_at", { ascending: false });

        if (moduleId) {
          query = query.eq("module_id", moduleId);
        }

        const { data: categories, error: listError } = await query;

        if (listError) throw listError;

        return new Response(JSON.stringify(categories), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "POST":
        // Create new category
        const { name, description, module_id } = await req.json();

        if (!name || !module_id) {
          return new Response(JSON.stringify({ error: "Name and module_id are required" }), {
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

        const { data: newCategory, error: createError } = await supabaseClient
          .from("categories")
          .insert({
            name,
            description,
            module_id,
            created_by: user.user.id,
          })
          .select("*, modules(name)")
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify(newCategory), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "PUT":
        // Update category
        if (!id || id === "categories-crud") {
          return new Response(JSON.stringify({ error: "Category ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const updateData = await req.json();
        const { data: updatedCategory, error: updateError } = await supabaseClient
          .from("categories")
          .update(updateData)
          .eq("id", id)
          .select("*, modules(name)")
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify(updatedCategory), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "DELETE":
        // Delete category
        if (!id || id === "categories-crud") {
          return new Response(JSON.stringify({ error: "Category ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: deleteError } = await supabaseClient
          .from("categories")
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