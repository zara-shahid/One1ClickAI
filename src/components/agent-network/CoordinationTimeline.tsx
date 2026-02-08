import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface AgentMessage {
  from: string;
  to: string;
  type: string;
  content: { summary?: string; details?: Record<string, any> };
  timestamp_offset_ms: number;
}

const TYPE_STYLES: Record<string, string> = {
  discovery: "border-chart-1/30 text-chart-1",
  query: "border-chart-2/30 text-chart-2",
  response: "border-chart-3/30 text-chart-3",
  negotiate: "border-chart-4/30 text-chart-4",
  confirm: "border-success/30 text-success",
  alert: "border-critical/30 text-critical",
};

const AGENT_NAMES: Record<string, string> = {
  retailer: "RetailBot",
  manufacturer: "MfgCore",
  supplier: "SupplyLink",
  logistics: "LogiFlow",
  analytics: "InsightAI",
};

export default function CoordinationTimeline({ messages, animatedCount }: { messages: AgentMessage[]; animatedCount: number }) {
  const visible = messages.slice(0, animatedCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Coordination Cascade</CardTitle>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Run coordination to see agent messages</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {visible.map((msg, i) => {
              const style = TYPE_STYLES[msg.type] || "border-border text-muted-foreground";
              return (
                <div
                  key={i}
                  className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    {i < visible.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold">{AGENT_NAMES[msg.from] || msg.from}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-xs font-bold">{AGENT_NAMES[msg.to] || msg.to}</span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${style}`}>
                        {msg.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        +{(msg.timestamp_offset_ms / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{msg.content?.summary || JSON.stringify(msg.content)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
