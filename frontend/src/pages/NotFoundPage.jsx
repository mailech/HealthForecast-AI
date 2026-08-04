import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 mb-2">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404 — Clinical Route Not Found</h1>
      <p className="text-xs text-slate-400 max-w-md">The page or patient record you requested does not exist or has been moved.</p>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-medical-cyan text-slate-950 font-bold text-xs shadow-cyan-glow"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
