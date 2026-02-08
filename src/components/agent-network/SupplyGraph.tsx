import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GraphNode {
  id: string;
  role: string;
  status: string;
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
  label: string;
  weight: number;
}

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const STATUS_COLORS: Record<string, string> = {
  active: "hsl(152, 60%, 42%)",
  stressed: "hsl(38, 92%, 50%)",
  critical: "hsl(0, 84%, 60%)",
};

const EDGE_COLORS: Record<string, string> = {
  material: "hsl(217, 91%, 50%)",
  information: "hsl(152, 60%, 42%)",
  financial: "hsl(38, 92%, 50%)",
};

const ROLE_LABELS: Record<string, string> = {
  retailer: "🏪 Retailer",
  manufacturer: "🏭 Manufacturer",
  supplier: "📦 Supplier",
  logistics: "🚚 Logistics",
  analytics: "🧠 Analytics",
};

export default function SupplyGraph({ nodes, edges }: Props) {
  const positions = useMemo(() => {
    // Arrange nodes in a pentagon
    const cx = 250, cy = 180, r = 130;
    const map: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n, i) => {
      const angle = (i * 2 * Math.PI) / nodes.length - Math.PI / 2;
      map[n.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    return map;
  }, [nodes]);

  if (!nodes.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Supply Network Graph</CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 500 370" className="w-full h-auto">
          {/* Edges */}
          {edges.map((e, i) => {
            const from = positions[e.from];
            const to = positions[e.to];
            if (!from || !to) return null;
            const color = EDGE_COLORS[e.type] || "hsl(var(--muted-foreground))";
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2 - 10;
            return (
              <g key={i}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={color} strokeWidth={Math.max(1.5, e.weight / 2)}
                  strokeOpacity={0.6} strokeDasharray={e.type === "information" ? "6 3" : undefined}
                />
                <text x={midX} y={midY} textAnchor="middle" fontSize="8" fill={color} fontWeight="500">
                  {e.label}
                </text>
              </g>
            );
          })}
          {/* Nodes */}
          {nodes.map((n) => {
            const pos = positions[n.id];
            if (!pos) return null;
            const color = STATUS_COLORS[n.status] || STATUS_COLORS.active;
            return (
              <g key={n.id}>
                <circle cx={pos.x} cy={pos.y} r={28} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={2.5} />
                <circle cx={pos.x} cy={pos.y} r={6} fill={color} />
                <text x={pos.x} y={pos.y + 44} textAnchor="middle" fontSize="11" fontWeight="600" className="fill-foreground">
                  {ROLE_LABELS[n.id] || n.role}
                </text>
              </g>
            );
          })}
        </svg>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 justify-center">
          {Object.entries(EDGE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2 w-5 rounded" style={{ backgroundColor: color, opacity: 0.7 }} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
