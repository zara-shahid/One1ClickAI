import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Upload, BarChart3, Brain, Shield, History, FileText, Code2 } from "lucide-react";

const features = [
  { icon: Shield, title: "Authentication", desc: "Secure user accounts with email verification" },
  { icon: Upload, title: "CSV Upload", desc: "Drag & drop CSV upload with validation" },
  { icon: BarChart3, title: "Interactive Dashboard", desc: "Charts, KPIs, and risk alerts at a glance" },
  { icon: Brain, title: "AI Insights", desc: "One-click analysis with natural language explanations" },
  { icon: Zap, title: "Instant Recommendations", desc: "Reorder quantities and procurement actions" },
  { icon: History, title: "Upload History", desc: "Track all data imports over time" },
];

const techStack = [
  { label: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Recharts"] },
  { label: "Backend", items: ["Lovable Cloud", "Edge Functions", "PostgreSQL"] },
  { label: "Data", items: ["PapaParse CSV", "Real-time sync"] },
  { label: "AI", items: ["Gemini 3 Flash", "Structured outputs", "Function calling"] },
];

const steps = [
  { num: "1", title: "Sign Up", desc: "Create your account with email verification" },
  { num: "2", title: "Upload CSV", desc: "Drag & drop your supply chain data (sample provided)" },
  { num: "3", title: "View Dashboard", desc: "See sales trends, inventory health, and KPIs" },
  { num: "4", title: "One-Click Analysis", desc: "AI generates risk assessments and recommendations" },
  { num: "5", title: "Take Action", desc: "Follow AI-guided reorder quantities and priorities" },
];

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold">One-Click AI</h1>
        </div>
        <p className="text-lg text-muted-foreground">Supply Chain Decision Engine</p>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Web-based AI tool that transforms raw CSV inventory data into actionable supply chain insights. 
          Upload your data → AI forecasts demand → get instant recommendations → make better decisions in seconds, not hours.
        </p>
      </div>

      {/* Problem / Solution */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="ring-1 ring-critical/20">
          <CardHeader>
            <CardTitle className="text-base text-critical">The Problem</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Supply chain decisions are slow, manual, and error-prone.</p>
            <p>Teams spend hours analyzing spreadsheets to detect stockouts and overstock risks.</p>
            <p>Late decisions lead to lost revenue, excess inventory, and supply disruptions.</p>
          </CardContent>
        </Card>
        <Card className="ring-1 ring-success/20">
          <CardHeader>
            <CardTitle className="text-base text-success">Our Solution</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>AI analyzes inventory data and produces instant insights.</p>
            <p>Reduces decision time from hours to seconds with one-click analysis.</p>
            <p>Prioritizes procurement actions with clear reorder recommendations.</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card>
        <CardHeader><CardTitle className="text-base">Key Features</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card>
        <CardHeader><CardTitle className="text-base">How to Use</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {s.num}
                </div>
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                {i < steps.length - 1 && <div className="hidden" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Code2 className="h-4 w-4" /> Tech Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {techStack.map(t => (
              <div key={t.label}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">{t.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.items.map(item => (
                    <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample CSV */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Sample CSV</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>6 products × 10 days = 60 data points with varying risk levels:</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-critical/30 text-critical">Webcam HD — Stockout</Badge>
            <Badge variant="outline" className="border-warning/30 text-warning">Wireless Mouse — Depleting</Badge>
            <Badge variant="outline" className="border-warning/30 text-warning">Monitor Stand — Near reorder</Badge>
            <Badge variant="outline" className="border-success/30 text-success">USB-C Hub — Healthy</Badge>
            <Badge variant="outline" className="border-success/30 text-success">Mechanical Keyboard — Stable</Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">Laptop Sleeve — Overstocked</Badge>
          </div>
          <p className="text-xs mt-2">Columns: Product Name, Date, Quantity Sold, Unit Price, Current Stock, Reorder Point</p>
        </CardContent>
      </Card>

      {/* Impact */}
      <Card>
        <CardHeader><CardTitle className="text-base">Impact</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-primary/5 p-4 text-center">
              <p className="text-2xl font-bold text-primary">⚡</p>
              <p className="font-medium text-foreground mt-1">Hours → Seconds</p>
              <p className="text-xs">Decision time reduction</p>
            </div>
            <div className="rounded-lg bg-success/5 p-4 text-center">
              <p className="text-2xl font-bold text-success">🔍</p>
              <p className="font-medium text-foreground mt-1">Risk Detection</p>
              <p className="text-xs">Stockout & overstock alerts</p>
            </div>
            <div className="rounded-lg bg-warning/5 p-4 text-center">
              <p className="text-2xl font-bold text-warning">📋</p>
              <p className="font-medium text-foreground mt-1">Action Priority</p>
              <p className="text-xs">AI-ranked procurement list</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
