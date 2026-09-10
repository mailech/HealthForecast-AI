import React from 'react';
import { Cpu, AlertCircle } from 'lucide-react';

interface AiMockBannerProps {
  version?: string;
  confidence?: number;
  inline?: boolean;
}

export const AiMockBanner: React.FC<AiMockBannerProps> = ({
  version = 'v2.4-XGB-Readmit',
  confidence = 92,
  inline = false,
}) => {
  if (inline) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <Cpu className="w-3.5 h-3.5 text-sky-600" />
        <span className="font-semibold text-sky-800">Demo Prediction</span>
        <span className="text-slate-400">•</span>
        <span>{version}</span>
        <span className="text-slate-400">•</span>
        <span>{confidence}% Conf</span>
      </span>
    );
  }

  return (
    <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-sky-50/70 border border-sky-200/80 text-xs text-sky-950">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-sky-600 text-white font-bold text-[10px]">
          AI
        </span>
        <div>
          <span className="font-semibold text-sky-900">Demo Prediction / Mock AI Output:</span>{' '}
          <span className="text-slate-600">
            Simulated using XGBoost architecture trained on Diabetes 130-US Hospitals dataset. Fictional patient records.
          </span>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-slate-500 font-mono text-[11px]">
        <span>Model: {version}</span>
        <span>•</span>
        <span className="text-emerald-700 font-semibold">{confidence}% Confidence</span>
      </div>
    </div>
  );
};

export const ClinicalDisclaimer: React.FC = () => {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-950">Mandatory Clinical Decision Support Disclaimer:</span>{' '}
        <span>
          Clinical decision support is for informational purposes only and does not replace professional medical judgment.
          All treatment choices and discharge orders remain the strict responsibility of the attending physician.
        </span>
      </div>
    </div>
  );
};
