import { HealthForecastMark } from "./HealthForecastMark";

const ACCENTS = {
  teal: "from-teal/15 via-teal/5",
  rose: "from-rose/15 via-rose/5",
  amber: "from-amber/15 via-amber/5",
  violet: "from-violet/15 via-violet/5",
  indigo: "from-indigo/15 via-indigo/5",
} as const;

export function SectionHeader({
  title,
  subtitle,
  accent = "teal",
  action,
}: {
  title: string;
  subtitle: string;
  accent?: keyof typeof ACCENTS;
  action?: React.ReactNode;
}) {
  return (
    <header className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${ACCENTS[accent]} to-transparent mb-6 px-6 py-6 border border-line`}>
      {/* faint oversized brand mark watermark, echoing the login hero */}
      <div className="absolute -right-6 -top-6 opacity-[0.08] pointer-events-none">
        <HealthForecastMark size={140} />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-navy">{title}</h1>
          <p className="text-sm text-muted mt-1 max-w-lg">{subtitle}</p>
        </div>
        {action}
      </div>
    </header>
  );
}
