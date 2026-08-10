export function RiskIndicator({ probability }: { probability: number }) {
  const pct = Math.round(probability * 100);
  const category = probability >= 0.6 ? "high" : probability >= 0.3 ? "medium" : "low";
  const labelColor = {
    low: "text-risk-low",
    medium: "text-risk-medium",
    high: "text-risk-high",
  }[category];

  return (
    <div className="flex items-center gap-2.5">
      <div className="risk-track">
        <div className="risk-marker" style={{ left: `calc(${pct}% - 1px)` }} />
      </div>
      <span className={`font-mono text-sm font-medium ${labelColor}`}>{pct}%</span>
    </div>
  );
}
