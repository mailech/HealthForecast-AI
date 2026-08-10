const ACCENTS = {
  violet: { bg: "bg-violet-light", text: "text-violet" },
  amber: { bg: "bg-amber-light", text: "text-amber" },
  indigo: { bg: "bg-indigo-light", text: "text-indigo" },
} as const;

export function ComingSoon({
  title,
  description,
  milestone,
  accent = "violet",
}: {
  title: string;
  description: string;
  milestone: string;
  accent?: keyof typeof ACCENTS;
}) {
  const c = ACCENTS[accent];
  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-2xl text-navy">{title}</h1>
        <p className="text-sm text-muted mt-1">{description}</p>
      </header>
      <div className="bg-card border border-line rounded-xl shadow-card p-10 text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${c.bg} ${c.text} text-xs font-medium mb-4`}>
          {milestone}
        </div>
        <p className="text-sm text-muted max-w-md mx-auto">
          This module is scoped in the project plan but not yet built. It follows the same
          pattern as Patients and Risk Predictions — a live API endpoint plus a dashboard
          view — once the underlying data workflow is implemented.
        </p>
      </div>
    </>
  );
}
