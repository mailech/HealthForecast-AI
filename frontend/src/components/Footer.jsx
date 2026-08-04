import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-navy-950 py-8 px-6 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-medical-cyan/20 text-medical-cyan flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-200">HealthForecast AI Platform</span>
          <span className="text-[10px] text-slate-500">• Version 1.0.0 (Production Build)</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            HIPAA Compliant Data Pipeline
          </span>
          <span>•</span>
          <span className="hover:text-slate-200 transition-colors cursor-pointer">Clinical Governance Policy</span>
          <span>•</span>
          <span className="hover:text-slate-200 transition-colors cursor-pointer">System Status</span>
        </div>

        <p className="text-[11px] text-slate-500">
          Engineered for Academic & Clinical Research Excellence
        </p>
      </div>
    </footer>
  );
};
