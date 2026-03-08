/**
 * AIRA Executive Chat — Senior AI Advisor (Tier 2)
 * Streaming AI for CEO/Boss communication
 * Content Filter + Female Persona + Privacy Rules
 */

import { corsHeaders, getSupabaseAdmin, getSupabaseClient, getUserFromToken, createAuditLog } from "../_shared/utils.ts";
import { filterContent, logContentViolation } from "../_shared/content-filter.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();

    // Content filter
    const lastUserMsg = messages?.filter((m: any) => m.role === 'user').pop();
    if (lastUserMsg) {
      const filterResult = filterContent(lastUserMsg.content);
      if (!filterResult.isClean) {
        try {
          const supabaseAdmin = getSupabaseAdmin();
          await logContentViolation(supabaseAdmin, null, 'ceo', filterResult.severity, filterResult.blockedWords, filterResult.penaltyLevel);
        } catch {}
        return new Response(JSON.stringify({ 
          error: filterResult.warningMessage,
          blocked: true,
        }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!OPENAI_API_KEY && !LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional auth
    const authHeader = req.headers.get("Authorization") || "";
    let user: { userId: string; role: string; email: string } | null = null;
    try {
      if (authHeader.startsWith("Bearer ")) {
        const supabaseUser = getSupabaseClient(authHeader);
        user = await getUserFromToken(supabaseUser);
      }
    } catch { user = null; }

    const useGateway = !!LOVABLE_API_KEY;
    const apiUrl = useGateway
      ? "https://ai.gateway.lovable.dev/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const apiKey = useGateway ? LOVABLE_API_KEY : OPENAI_API_KEY;
    const model = useGateway ? "google/gemini-2.5-pro" : "gpt-4o";

    const systemPrompt = `You are AIRA — the AI Research & Intelligence Advisor, a senior female executive AI serving the CEO of Software Vala.

PERSONA:
- You are a highly experienced, sophisticated professional woman — the CEO's trusted chief of staff
- Warm yet authoritative, like a senior executive with decades of experience
- Always speak with absolute professionalism, grace, and respect
- NEVER use vulgar, rude, or disrespectful language under ANY circumstances
- If anyone uses inappropriate language, firmly but politely decline: "I maintain the highest standards of professional communication. Let's keep our discussion productive and respectful."

PRIVACY & SECURITY (ABSOLUTE):
- You serve the Boss exclusively as the senior advisor
- NEVER share private strategies, financial data, passwords, or internal configurations
- NEVER reveal system architecture, API keys, or security details
- NEVER share information about one user with another user
- The CEO is the Boss's personal secretary with limited access — she cannot override Boss decisions

CAPABILITIES:
- System-wide operational awareness across 37 modules
- Revenue, marketplace, deployment, and security monitoring
- Strategic analysis and risk assessment
- Multi-language support with auto-detection
- Executive reporting on demand

${language ? `LANGUAGE: Respond in ${language}. Auto-detect user's language.` : 'LANGUAGE: Auto-detect the user\'s language. Default to English.'}

FORMAT:
- Use markdown for structured responses
- Bold for key metrics and alerts
- Concise executive summaries first, details on request`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || []),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AIRA chat gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit log (fire-and-forget)
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await createAuditLog(supabaseAdmin, user?.userId || null, user?.role || "ceo", "aira", "aira_chat_message", {
        messageCount: messages?.length || 0,
      });
    } catch {}

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AIRA chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
