import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock, DollarSign } from "lucide-react";

interface Decision {
  agent: string;
  action: string;
  details: string;
  cost_estimate?: number;
  timeline_days?: number;
}

interface Bottleneck {
  node: string;
  issue: string;
  severity: string;
}

interface Report {
  title?: string;
  summary?: string;
  total_agents?: number;
  total_messages?: number;
  coordination_time_ms?: number;
  decisions?: Decision[];
  risk_assessment?: { level: string; factors: string[] };
  bottlenecks?: Bottleneck[];
}

const AGENT_NAMES: Record<string, string> = {
  retailer: "RetailBot",
  manufacturer: "MfgCore",
  supplier: "SupplyLink",
  logistics: "LogiFlow",
  analytics: "InsightAI",
};

const RISK_STYLES: Record<string, string> = {
  low: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  critical: "bg-critical/10 text-critical border-critical/20",
};

export default function CoordinationReport({ report }: { report: Report }) {
  if (!report?.summary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Network Coordination Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
          <h3 className="font-bold text-sm mb-1">{report.title || "Coordination Complete"}</h3>
          <p className="text-sm text-muted-foreground">{report.summary}</p>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span>{report.total_agents} agents</span>
            <span>{report.total_messages} messages</span>
            <span>{((report.coordination_time_ms || 0) / 1000).toFixed(1)}s coordination</span>
          </div>
        </div>

        {/* Risk Assessment */}
        {report.risk_assessment && (
          <div className={`rounded-lg border p-4 ${RISK_STYLES[report.risk_assessment.level] || ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-bold capitalize">Risk: {report.risk_assessment.level}</span>
            </div>
            <ul className="space-y-1">
              {report.risk_assessment.factors?.map((f, i) => (
                <li key={i} className="text-xs">• {f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Decisions */}
        {report.decisions?.length ? (
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Agent Decisions
            </h4>
            <div className="space-y-2">
              {report.decisions.map((d, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px]">{AGENT_NAMES[d.agent] || d.agent}</Badge>
                    <span className="text-sm font-semibold">{d.action}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.details}</p>
                  <div className="flex gap-3 mt-2">
                    {d.cost_estimate != null && (
                      <span className="text-xs flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />${d.cost_estimate.toLocaleString()}
                      </span>
                    )}
                    {d.timeline_days != null && (
                      <span className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />{d.timeline_days} days
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Bottlenecks */}
        {report.bottlenecks?.length ? (
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Bottlenecks
            </h4>
            <div className="space-y-2">
              {report.bottlenecks.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${b.severity === "high" ? "bg-critical" : b.severity === "medium" ? "bg-warning" : "bg-muted-foreground"}`} />
                  <span className="font-medium">{AGENT_NAMES[b.node] || b.node}:</span>
                  <span className="text-muted-foreground">{b.issue}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
