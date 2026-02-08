import { Bot, MapPin, Shield, Cpu, Truck, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  location: string;
  policies: Record<string, any>;
}

const roleIcons: Record<string, any> = {
  Retailer: Bot,
  Manufacturer: Cpu,
  Supplier: Shield,
  Logistics: Truck,
  Analytics: BarChart3,
};

const roleColors: Record<string, string> = {
  Retailer: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Manufacturer: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Supplier: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Logistics: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Analytics: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

export default function AgentRegistry({ agents, activeAgent }: { agents: Agent[]; activeAgent?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {agents.map((agent) => {
        const Icon = roleIcons[agent.role] || Bot;
        const colorClass = roleColors[agent.role] || "bg-muted text-muted-foreground";
        const isActive = activeAgent === agent.id;
        return (
          <Card
            key={agent.id}
            className={`transition-all duration-300 ${isActive ? "ring-2 ring-primary shadow-lg scale-[1.02]" : "hover:shadow-md"}`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground">{agent.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{agent.location}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 2).map((cap) => (
                  <Badge key={cap} variant="secondary" className="text-[9px] px-1.5 py-0">
                    {cap.replace(/_/g, " ")}
                  </Badge>
                ))}
                {agent.capabilities.length > 2 && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    +{agent.capabilities.length - 2}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
