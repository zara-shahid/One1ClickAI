import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Tables } from "@/integrations/supabase/types";

type SalesRow = Tables<"sales_data">;
type InsightRow = Tables<"ai_insights">;

export default function Dashboard() {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<SalesRow[]>([]);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [loading, setLoading] = useState(true);

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
  const atRiskItems = insights.filter(i => i.risk_level === "high" || i.risk_level === "critical").length;
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

  // Risk alerts
  const riskAlerts = insights.filter(i => i.risk_level !== "low").slice(0, 5);

  const isEmpty = salesData.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Supply chain overview at a glance</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Package} label="Total Products" value={totalProducts} />
        <KpiCard icon={AlertTriangle} label="At-Risk Items" value={atRiskItems} highlight={atRiskItems > 0} />
        <KpiCard icon={DollarSign} label="Inventory Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <KpiCard icon={TrendingUp} label="Units Sold" value={totalSold.toLocaleString()} />
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

          {/* Risk Alerts */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Risk Alerts</CardTitle></CardHeader>
            <CardContent>
              {riskAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No risk alerts. Run AI analysis from the Insights page to detect risks.</p>
              ) : (
                <div className="space-y-3">
                  {riskAlerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${alert.risk_level === "critical" ? "bg-critical" : "bg-warning"}`} />
                      <div>
                        <p className="font-medium text-sm">{alert.product_name}</p>
                        <p className="text-xs text-muted-foreground">{alert.recommendation || "Review recommended"}</p>
                      </div>
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                        alert.risk_level === "critical" ? "bg-critical/10 text-critical" : "bg-warning/10 text-warning"
                      }`}>
                        {alert.risk_level}
                      </span>
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

function KpiCard({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string | number; highlight?: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${highlight ? "bg-critical/10 text-critical" : "bg-primary/10 text-primary"}`}>
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
