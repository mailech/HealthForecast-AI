import React, { useState } from 'react';
import { Info, ShieldAlert, Sparkles, X } from 'lucide-react';

interface DisclaimerBannerProps {
  type?: 'clinical' | 'demo' | 'research';
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  type = 'clinical',
  compact = false
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (type === 'demo') {
    return (
      <div className="bg-sky-50/80 border border-sky-200 text-sky-900 rounded-lg px-3.5 py-2.5 text-xs flex items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="font-semibold">Demo Prediction & Mock AI Architecture:</strong> Values are derived from simulated XGBoost/Random Forest inference on the Diabetes 130-US Hospitals dataset. Realistic fictional records for project demonstration.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-sky-600 hover:text-sky-800 p-0.5 rounded cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (type === 'research') {
    return (
      <div className="bg-indigo-50/80 border border-indigo-200 text-indigo-950 rounded-lg px-3.5 py-2.5 text-xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong className="font-semibold">De-Identified Research Mode:</strong> Personally identifiable health information (PHI) has been masked (HIPAA Safe-Harbor method) for population analytics.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-amber-50/90 border border-amber-200/80 text-amber-950 rounded-lg ${
        compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-xs'
      } flex items-start sm:items-center justify-between gap-2`}
    >
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
        <span>
          <strong className="font-semibold text-amber-900">Clinical Advisory:</strong> Clinical decision support is for informational purposes only and does not replace professional medical judgment.
        </span>
      </div>
    </div>
  );
};
