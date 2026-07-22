import { LineChart, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Store Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep-dive customer behavior reports, search patterns, and sales trends.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <LineChart className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-playfair font-bold text-lg mb-2">Compiling customer telemetry...</h3>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Analytics dashboard connects once data thresholds are reached. Currently aggregating secure session details and visitor counts.
        </p>
      </div>
    </div>
  );
}
