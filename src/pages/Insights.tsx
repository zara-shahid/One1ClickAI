import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type InsightRow = Tables<"ai_insights">;

export default function InsightsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const loadInsights = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setInsights(data || []);
    setLoading(false);
  };

  useEffect(() => { loadInsights(); }, [user]);

  const runAnalysis = async () => {
    if (!user) return;
    setAnalyzing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-supply-chain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (${response.status})`);
      }

      toast({ title: "Analysis complete!", description: "AI insights have been generated." });
      await loadInsights();
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const statusColor = (status: string) => {
    if (status === "critical") return "bg-critical/10 text-critical";
    if (status === "at_risk") return "bg-warning/10 text-warning";
    return "bg-success/10 text-success";
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">AI-powered supply chain recommendations</p>
        </div>
        <Button onClick={runAnalysis} disabled={analyzing} className="gap-2">
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {analyzing ? "Analyzing..." : "One-Click Analysis"}
        </Button>
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No insights yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Upload data and click "One-Click Analysis" to generate AI insights</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Analysis</CardTitle>
            <CardDescription>{insights.length} products analyzed</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Recommended Qty</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insights.map(row => (
                  <>
                    <TableRow key={row.id} className="cursor-pointer" onClick={() => toggleExpand(row.id)}>
                      <TableCell className="font-medium">{row.product_name}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(row.status)}`}>
                          {row.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize">{row.risk_level}</TableCell>
                      <TableCell>{row.recommended_order_qty ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.recommendation || "—"}</TableCell>
                      <TableCell>
                        {expanded.has(row.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </TableCell>
                    </TableRow>
                    {expanded.has(row.id) && (
                      <TableRow key={`${row.id}-detail`}>
                        <TableCell colSpan={6} className="bg-muted/30 p-4">
                          <p className="text-sm font-medium mb-1">AI Explanation</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{row.explanation || "No detailed explanation available."}</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
