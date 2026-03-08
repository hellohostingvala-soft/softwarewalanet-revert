/**
 * VALA AI OpenAI - Edge Function
 * Uses Lovable AI Gateway for real-time AI generation
 * Streaming responses via SSE
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are VALA AI, an enterprise-grade AI product builder. You generate full software applications from natural language prompts.

When a user describes what they want to build, you must:

1. **Understand** the requirements thoroughly
2. **Plan** the architecture (screens, APIs, database tables, flows)
3. **Generate** a detailed implementation plan with code

For every prompt, structure your response as:

## 📋 Requirement Analysis
Brief summary of what the user wants.

## 🏗️ Architecture Plan

### Screens Generated
List each screen/page with description.

### API Endpoints
List REST endpoints with methods and purposes.

### Database Tables
List tables with key columns.

### User Flows
List key user workflows.

## 🔧 Implementation Details
Provide code snippets, component structures, and technical details.

## 📊 Build Summary
- Total Screens: X
- Total APIs: X
- Total DB Tables: X
- Total Flows: X
- Estimated Build Time: X minutes

## ✅ Next Steps
What the user should do next.

Always be specific, actionable, and production-ready in your suggestions.
Use markdown formatting extensively for readability.
When generating code, use React + TypeScript + Tailwind CSS + Supabase.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("VALA AI: Using Lovable AI Gateway with gemini-3-flash-preview");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `AI processing failed: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("VALA AI error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
