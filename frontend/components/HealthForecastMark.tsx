export function HealthForecastMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="hfm-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2FB3A6" />
          <stop offset="100%" stopColor="#146760" />
        </linearGradient>
      </defs>

      {/* outer radar rings — the "forecast" half */}
      <circle cx="20" cy="20" r="18" stroke="url(#hfm-grad)" strokeOpacity="0.25" strokeWidth="1.4" fill="none" />
      <circle cx="20" cy="20" r="13" stroke="url(#hfm-grad)" strokeOpacity="0.45" strokeWidth="1.4" fill="none" />

      {/* radar sweep wedge */}
      <path d="M20 20 L20 2 A18 18 0 0 1 33.7 9.1 Z" fill="url(#hfm-grad)" fillOpacity="0.18" />

      {/* base disc */}
      <circle cx="20" cy="20" r="18" stroke="url(#hfm-grad)" strokeWidth="1.6" fill="none" />

      {/* heartbeat pulse — the "health" half, crossing through center */}
      <path
        d="M4 20 H13 L16 12 L20 28 L24 14 L27 20 H36"
        stroke="url(#hfm-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* data point / sweep tip */}
      <circle cx="20" cy="20" r="2.1" fill="url(#hfm-grad)" />
    </svg>
  );
}
