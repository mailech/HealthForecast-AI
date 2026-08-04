import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-medical-cyan" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl glass-card border border-slate-700/80 shadow-2xl animate-in slide-in-from-bottom-5">
      {icons[type]}
      <p className="text-xs font-semibold text-slate-200">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
