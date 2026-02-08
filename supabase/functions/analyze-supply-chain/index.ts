import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId } = await req.json();
    if (!userId) throw new Error("userId is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's sales data
    const { data: salesData, error: salesErr } = await supabase
      .from("sales_data")
      .select("*")
      .eq("user_id", userId)
      .order("sale_date");

    if (salesErr) throw salesErr;
    if (!salesData?.length) throw new Error("No sales data found. Please upload data first.");

    // Get latest upload id
    const { data: latestUpload } = await supabase
      .from("uploads")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!latestUpload) throw new Error("No upload found");

    // Group by product for analysis
    const productMap: Record<string, any[]> = {};
    for (const row of salesData) {
      if (!productMap[row.product_name]) productMap[row.product_name] = [];
      productMap[row.product_name].push(row);
    }

    // Build summary for AI
    const productSummaries = Object.entries(productMap).map(([name, rows]) => {
      const latest = rows[rows.length - 1];
      const avgSold = rows.reduce((s, r) => s + r.quantity_sold, 0) / rows.length;
      const totalSold = rows.reduce((s, r) => s + r.quantity_sold, 0);
      return {
        name,
        avgDailySales: Math.round(avgSold * 100) / 100,
        totalSold,
        currentStock: latest.current_stock,
        reorderPoint: latest.reorder_point,
        unitPrice: latest.unit_price,
        dataPoints: rows.length,
        daysOfStock: latest.current_stock > 0 && avgSold > 0 ? Math.round(latest.current_stock / avgSold) : 0,
      };
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            content: `You are a supply chain analyst AI. Analyze inventory data and return a JSON array of product insights. For each product, provide:
- status: "healthy", "at_risk", or "critical"
- risk_level: "low", "medium", "high", or "critical"  
- recommendation: a short action (e.g. "Reorder now", "Reduce stock", "Monitor")
- explanation: 2-3 sentences explaining the reasoning
- recommended_order_qty: integer (0 if no order needed)
- forecast_next_30: array of 30 numbers representing predicted daily demand

Base your analysis on: current stock vs reorder point, average daily sales, days of stock remaining, and trends.
Return ONLY valid JSON array, no markdown or extra text.`,
          },
          {
            role: "user",
            content: `Analyze these products:\n${JSON.stringify(productSummaries, null, 2)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "supply_chain_analysis",
              description: "Return supply chain analysis results for all products",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_name: { type: "string" },
                        status: { type: "string", enum: ["healthy", "at_risk", "critical"] },
                        risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                        recommendation: { type: "string" },
                        explanation: { type: "string" },
                        recommended_order_qty: { type: "number" },
                        forecast_next_30: { type: "array", items: { type: "number" } },
                      },
                      required: ["product_name", "status", "risk_level", "recommendation", "explanation", "recommended_order_qty"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "supply_chain_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return expected tool call");

    const parsed = JSON.parse(toolCall.function.arguments);
    const insightsData = parsed.insights;

    // Delete old insights for this user, then insert new ones
    await supabase.from("ai_insights").delete().eq("user_id", userId);

    const insightRows = insightsData.map((i: any) => ({
      user_id: userId,
      upload_id: latestUpload.id,
      product_name: i.product_name,
      status: i.status,
      risk_level: i.risk_level,
      recommendation: i.recommendation,
      explanation: i.explanation,
      recommended_order_qty: i.recommended_order_qty,
      forecast_next_30: i.forecast_next_30 || null,
    }));

    const { error: insertErr } = await supabase.from("ai_insights").insert(insightRows);
    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ success: true, count: insightRows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
