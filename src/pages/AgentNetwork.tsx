import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, Play, Zap, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AgentRegistry, { type Agent } from "@/components/agent-network/AgentRegistry";
import SupplyGraph from "@/components/agent-network/SupplyGraph";
import CoordinationTimeline, { type AgentMessage } from "@/components/agent-network/CoordinationTimeline";
import CoordinationReport from "@/components/agent-network/CoordinationReport";

const DISRUPTION_SCENARIOS = [
  { value: "none", label: "Normal Demand Signal" },
  { value: "stockout", label: "⚠️ Supplier Stockout", type: "inventory_shortage", description: "Primary supplier reports critical component shortage, affecting 60% of production capacity", products: ["Webcam HD", "USB-C Hub"] },
  { value: "logistics_delay", label: "🚚 Logistics Delay", type: "logistics_disruption", description: "Major shipping route blocked, expected 7-day delay on all inbound shipments", products: ["Monitor Stand", "Mechanical Keyboard"] },
  { value: "demand_spike", label: "📈 Demand Spike", type: "demand_surge", description: "Unexpected 300% increase in demand detected from retail channels", products: ["Wireless Mouse", "Laptop Sleeve"] },
];

export default function AgentNetwork() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [report, setReport] = useState<any>(null);
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [activeAgent, setActiveAgent] = useState<string | undefined>();
  const [scenario, setScenario] = useState("none");

  // Animate messages appearing one by one
  useEffect(() => {
    if (animatedCount >= messages.length) {
      setActiveAgent(undefined);
      return;
    }
    const msg = messages[animatedCount];
    setActiveAgent(msg?.from);
    const timer = setTimeout(() => setAnimatedCount((c) => c + 1), 600);
    return () => clearTimeout(timer);
  }, [animatedCount, messages]);

  const runCoordination = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setMessages([]);
    setReport(null);
    setGraphNodes([]);
    setGraphEdges([]);
    setAnimatedCount(0);
    setActiveAgent(undefined);

    try {
      const disruption = DISRUPTION_SCENARIOS.find((s) => s.value === scenario);
      const body: any = { userId: user.id, triggerType: scenario === "none" ? "demand_signal" : "disruption" };
      if (disruption && scenario !== "none") {
        body.disruption = { type: disruption.type, description: disruption.description, products: disruption.products };
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-network`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Coordination failed");
      }

      const data = await response.json();
      setAgents(data.agents || []);
      setMessages(data.messages || []);
      setReport(data.report || null);
      setGraphNodes(data.report?.graph?.nodes || []);
      setGraphEdges(data.report?.graph?.edges || []);

      toast({ title: "Coordination Complete", description: `${data.messages?.length || 0} agent messages exchanged` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, scenario, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" /> Agent Network
          </h1>
          <p className="text-muted-foreground">Autonomous supply chain coordination with AI agents</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISRUPTION_SCENARIOS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={runCoordination} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : scenario === "none" ? <Play className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {loading ? "Coordinating..." : "Run Coordination"}
          </Button>
        </div>
      </div>

      {/* Agents / empty state */}
      {agents.length > 0 ? (
        <AgentRegistry agents={agents} activeAgent={activeAgent} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Network className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No coordination yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              Click "Run Coordination" to launch 5 autonomous agents that will discover each other, negotiate, and coordinate a supply chain response.
            </p>
            {scenario !== "none" && (
              <div className="flex items-center gap-2 mt-4 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" />
                Disruption scenario selected — agents will renegotiate under stress
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Graph + Timeline */}
      {(graphNodes.length > 0 || messages.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SupplyGraph nodes={graphNodes} edges={graphEdges} />
          <CoordinationTimeline messages={messages} animatedCount={animatedCount} />
        </div>
      )}

      {/* Report */}
      {report && <CoordinationReport report={report} />}
    </div>
  );
}
