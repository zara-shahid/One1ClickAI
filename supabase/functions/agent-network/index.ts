import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Agent definitions
const AGENTS = [
  {
    id: "retailer",
    name: "RetailBot",
    role: "Retailer",
    capabilities: ["demand_forecasting", "order_placement", "inventory_tracking"],
    location: "New York, US",
    policies: { min_stock_days: 7, max_order_value: 50000 },
  },
  {
    id: "manufacturer",
    name: "MfgCore",
    role: "Manufacturer",
    capabilities: ["production_planning", "capacity_management", "quality_control"],
    location: "Detroit, US",
    policies: { lead_time_days: 5, max_capacity_units: 10000 },
  },
  {
    id: "supplier",
    name: "SupplyLink",
    role: "Supplier",
    capabilities: ["raw_materials", "component_supply", "bulk_pricing"],
    location: "Shenzhen, CN",
    policies: { min_order_qty: 100, shipping_days: 3 },
  },
  {
    id: "logistics",
    name: "LogiFlow",
    role: "Logistics",
    capabilities: ["routing", "warehousing", "last_mile_delivery", "cold_chain"],
    location: "Memphis, US",
    policies: { max_weight_kg: 5000, delivery_guarantee_days: 2 },
  },
  {
    id: "analytics",
    name: "InsightAI",
    role: "Analytics",
    capabilities: ["risk_assessment", "demand_prediction", "cost_optimization"],
    location: "Cloud",
    policies: { confidence_threshold: 0.85 },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId, triggerType, disruption } = await req.json();
    if (!userId) throw new Error("userId is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Create coordination session
    const { data: session, error: sessionErr } = await supabase
      .from("coordination_sessions")
      .insert({ user_id: userId, trigger_type: triggerType || "demand_signal", status: "running" })
      .select()
      .single();
    if (sessionErr) throw sessionErr;

    // Fetch user's sales data for context
    const { data: salesData } = await supabase
      .from("sales_data")
      .select("*")
      .eq("user_id", userId)
      .order("sale_date");

    const productSummary = summarizeProducts(salesData || []);

    // Build the coordination scenario
    const scenario = disruption
      ? `DISRUPTION SCENARIO: ${disruption.type} - ${disruption.description}. Products affected: ${disruption.products?.join(", ") || "all"}. Current inventory: ${JSON.stringify(productSummary)}`
      : `DEMAND SIGNAL: Retailer detected increased demand. Current inventory: ${JSON.stringify(productSummary)}`;

    // Use AI to simulate the full multi-agent coordination
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are simulating a multi-agent supply chain coordination network. There are 5 agents:
${AGENTS.map(a => `- ${a.name} (${a.role}): capabilities=${a.capabilities.join(", ")}, location=${a.location}, policies=${JSON.stringify(a.policies)}`).join("\n")}

Simulate a realistic coordination cascade where agents discover each other, share data, negotiate, and reach agreements. Generate the full message exchange and final coordination report.

Return a JSON object with this exact structure:
{
  "messages": [
    {
      "from": "agent_id",
      "to": "agent_id", 
      "type": "discovery|query|response|negotiate|confirm|alert",
      "content": { "summary": "short description", "details": { ... relevant data } },
      "timestamp_offset_ms": number (0 to 30000, simulating time progression)
    }
  ],
  "report": {
    "title": "string",
    "summary": "2-3 sentence executive summary",
    "total_agents": number,
    "total_messages": number,
    "coordination_time_ms": number,
    "decisions": [
      { "agent": "agent_id", "action": "string", "details": "string", "cost_estimate": number, "timeline_days": number }
    ],
    "risk_assessment": { "level": "low|medium|high|critical", "factors": ["string"] },
    "bottlenecks": [{ "node": "agent_id", "issue": "string", "severity": "low|medium|high" }],
    "graph": {
      "nodes": [{ "id": "agent_id", "role": "string", "status": "active|stressed|critical" }],
      "edges": [{ "from": "agent_id", "to": "agent_id", "type": "material|information|financial", "label": "string", "weight": number }]
    }
  }
}

Generate 8-15 realistic messages showing the full coordination cascade. Make it feel like real agents communicating.`,
          },
          {
            role: "user",
            content: scenario,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "coordination_result",
              description: "Return the full multi-agent coordination result",
              parameters: {
                type: "object",
                properties: {
                  messages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        from: { type: "string" },
                        to: { type: "string" },
                        type: { type: "string" },
                        content: { type: "object" },
                        timestamp_offset_ms: { type: "number" },
                      },
                      required: ["from", "to", "type", "content", "timestamp_offset_ms"],
                    },
                  },
                  report: { type: "object" },
                },
                required: ["messages", "report"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "coordination_result" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI coordination failed");
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return coordination result");

    const parsed = JSON.parse(toolCall.function.arguments);

    // Store messages
    if (parsed.messages?.length) {
      const messageRows = parsed.messages.map((m: any) => ({
        session_id: session.id,
        user_id: userId,
        from_agent: m.from,
        to_agent: m.to,
        message_type: m.type,
        content: m.content,
      }));
      await supabase.from("agent_messages").insert(messageRows);
    }

    // Update session with report
    await supabase
      .from("coordination_sessions")
      .update({ status: "completed", report: parsed.report, completed_at: new Date().toISOString() })
      .eq("id", session.id);

    return new Response(JSON.stringify({
      success: true,
      session_id: session.id,
      agents: AGENTS,
      messages: parsed.messages || [],
      report: parsed.report || {},
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("agent-network error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function summarizeProducts(salesData: any[]) {
  const productMap: Record<string, any[]> = {};
  for (const row of salesData) {
    if (!productMap[row.product_name]) productMap[row.product_name] = [];
    productMap[row.product_name].push(row);
  }
  return Object.entries(productMap).map(([name, rows]) => {
    const latest = rows[rows.length - 1];
    const avgSold = rows.reduce((s: number, r: any) => s + r.quantity_sold, 0) / rows.length;
    return {
      name,
      avgDailySales: Math.round(avgSold * 100) / 100,
      currentStock: latest.current_stock,
      reorderPoint: latest.reorder_point,
      daysOfStock: avgSold > 0 ? Math.round(latest.current_stock / avgSold) : 999,
    };
  });
}
