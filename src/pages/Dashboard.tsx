import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, TrendingUp, DollarSign, ShieldCheck, ShieldAlert, ShieldX, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Tables } from "@/integrations/supabase/types";

type SalesRow = Tables<"sales_data">;
type InsightRow = Tables<"ai_insights">;

export default function Dashboard() {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<SalesRow[]>([]);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [salesRes, insightsRes] = await Promise.all([
        supabase.from("sales_data").select("*").eq("user_id", user.id).order("sale_date"),
        supabase.from("ai_insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setSalesData(salesRes.data || []);
      setInsights(insightsRes.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading dashboard...</div>;

  const products = [...new Set(salesData.map(r => r.product_name))];
  const totalProducts = products.length;
  const criticalCount = insights.filter(i => i.status === "critical").length;
  const atRiskCount = insights.filter(i => i.status === "at_risk").length;
  const healthyCount = insights.filter(i => i.status === "healthy").length;
  const totalValue = salesData.reduce((sum, r) => sum + r.current_stock * r.unit_price, 0);
  const totalSold = salesData.reduce((sum, r) => sum + r.quantity_sold, 0);

  // Sales trend (group by date)
  const salesByDate = salesData.reduce<Record<string, number>>((acc, r) => {
    acc[r.sale_date] = (acc[r.sale_date] || 0) + r.quantity_sold;
    return acc;
  }, {});
  const salesTrend = Object.entries(salesByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, qty]) => ({ date, quantity: qty }));

  // Inventory health (latest stock vs reorder point per product)
  const latestStock = products.map(p => {
    const productRows = salesData.filter(r => r.product_name === p);
    const latest = productRows[productRows.length - 1];
    return {
      product: p.length > 15 ? p.slice(0, 15) + "…" : p,
      stock: latest?.current_stock || 0,
      reorderPoint: latest?.reorder_point || 0,
    };
  }).slice(0, 10);

  // Top actions from insights
  const topActions = insights.filter(i => i.risk_level !== "low").slice(0, 5);

  const isEmpty = salesData.length === 0;

  const generateBriefing = () => {
    if (!insights.length) return "";
    const critical = insights.filter(i => i.status === "critical");
    const atRisk = insights.filter(i => i.status === "at_risk");
    let text = `Executive briefing. ${insights.length} products analyzed. `;
    if (critical.length) {
      text += `${critical.length} product${critical.length > 1 ? "s are" : " is"} critical: ${critical.map(c => c.product_name).join(", ")}. `;
    }
    if (atRisk.length) {
      text += `${atRisk.length} product${atRisk.length > 1 ? "s are" : " is"} at risk: ${atRisk.map(c => c.product_name).join(", ")}. `;
    }
    const reorders = insights.filter(i => (i.recommended_order_qty ?? 0) > 0);
    if (reorders.length) {
      text += "Recommended actions: ";
      reorders.forEach(r => { text += `Reorder ${r.recommended_order_qty} units of ${r.product_name}. `; });
    }
    if (!critical.length && !atRisk.length) {
      text += "All products are healthy. No immediate action required.";
    }
    return text;
  };

  const playVoiceBriefing = async () => {
    const briefing = generateBriefing();
    if (!briefing) return;
    setSpeaking(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-briefing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: briefing }),
      });
      if (!response.ok) throw new Error("Voice briefing failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setSpeaking(false);
      await audio.play();
    } catch {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(briefing);
      utterance.onend = () => setSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Supply chain overview at a glance</p>
        </div>
        {insights.length > 0 && (
          <Button variant="outline" onClick={playVoiceBriefing} disabled={speaking} className="gap-2">
            {speaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            {speaking ? "Speaking..." : "Voice Briefing"}
          </Button>
        )}
      </div>

      {/* Status KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Package} label="Total Products" value={totalProducts} />
        <StatusCard icon={ShieldX} label="Critical" count={criticalCount} status="critical" />
        <StatusCard icon={ShieldAlert} label="At Risk" count={atRiskCount} status="warning" />
        <StatusCard icon={ShieldCheck} label="Healthy" count={healthyCount} status="success" />
      </div>

      {/* Financial KPIs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard icon={DollarSign} label="Inventory Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <KpiCard icon={TrendingUp} label="Total Units Sold" value={totalSold.toLocaleString()} />
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No data yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Upload a CSV file to see your supply chain dashboard</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sales Trend */}
          <Card>
            <CardHeader><CardTitle className="text-base">Sales Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Line type="monotone" dataKey="quantity" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inventory Health */}
          <Card>
            <CardHeader><CardTitle className="text-base">Inventory Health</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={latestStock}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="product" tick={{ fontSize: 10 }} className="fill-muted-foreground" angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend />
                  <Bar dataKey="stock" name="Current Stock" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reorderPoint" name="Reorder Point" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Recommended Actions</CardTitle></CardHeader>
            <CardContent>
              {topActions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No risk alerts. Run AI analysis from the Insights page to detect risks.</p>
              ) : (
                <div className="space-y-3">
                  {topActions.map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 rounded-lg border p-4">
                      <div className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${alert.status === "critical" ? "bg-critical" : "bg-warning"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{alert.product_name}</p>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                            alert.status === "critical" ? "border-critical/30 text-critical" : "border-warning/30 text-warning"
                          }`}>
                            {alert.risk_level}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {alert.recommendation || "Review recommended"}
                          {(alert.recommended_order_qty ?? 0) > 0 && (
                            <span className="ml-2 text-primary font-semibold">→ Reorder {alert.recommended_order_qty} units</span>
                          )}
                        </p>
                        {alert.explanation && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.explanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusCard({ icon: Icon, label, count, status }: { icon: any; label: string; count: number; status: "critical" | "warning" | "success" }) {
  const styles = {
    critical: { bg: "bg-critical/10", text: "text-critical", ring: "ring-critical/20" },
    warning: { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
    success: { bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  };
  const s = styles[status];
  return (
    <Card className={`ring-1 ${s.ring}`}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.bg} ${s.text}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${s.text}`}>{count}</p>
        </div>
      </CardContent>
    </Card>
  );
}
