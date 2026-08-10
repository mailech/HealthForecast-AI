const ACCENTS = {
  teal: { text: "text-teal", bg: "bg-teal-light" },
  indigo: { text: "text-indigo", bg: "bg-indigo-light" },
  amber: { text: "text-amber", bg: "bg-amber-light" },
  violet: { text: "text-violet", bg: "bg-violet-light" },
  rose: { text: "text-rose", bg: "bg-rose-light" },
} as const;

export function StatCard({
  label,
  value,
  sublabel,
  accent = "teal",
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: keyof typeof ACCENTS;
}) {
  const c = ACCENTS[accent];
  return (
    <div className="bg-card border border-line rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        <span className={`w-2 h-2 rounded-full ${c.bg} ring-4 ring-opacity-30`} />
      </div>
      <div className={`font-mono text-3xl font-semibold ${c.text}`}>{value}</div>
      {sublabel && <div className="text-xs text-muted mt-1.5">{sublabel}</div>}
    </div>
  );
}
