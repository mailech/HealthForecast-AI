import React from 'react';
import { X, ShieldCheck, CheckCircle, XCircle, Info, Lock } from 'lucide-react';
import { ACCESS_MATRIX } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const AccessMatrixModal = () => {
  const { accessMatrixOpen, setAccessMatrixOpen, currentRoleKey } = useAuth();

  if (!accessMatrixOpen) return null;

  const roleHeaders = [
    { key: "DOCTOR", name: "Doctor", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
    { key: "ADMIN", name: "Hospital Admin", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    { key: "RESEARCHER", name: "Researcher", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
    { key: "SYSADMIN", name: "System Admin", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" }
  ];

  const getBadgeStyle = (val) => {
    if (val === "Yes" || val === "Full Access") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
    if (val === "No") {
      return "bg-rose-500/10 text-rose-400 border-rose-500/30 opacity-60";
    }
    return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Role-Based Access Control (RBAC) Matrix
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PDF Page 6 Requirement
                </span>
              </h3>
              <p className="text-xs text-slate-400">Detailed permission breakdown across the 4 platform user roles</p>
            </div>
          </div>
          <button
            onClick={() => setAccessMatrixOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Feature / Module</th>
                  {roleHeaders.map(rh => (
                    <th key={rh.key} className={`py-3.5 px-4 font-semibold text-center ${currentRoleKey === rh.key ? 'bg-slate-800/80 text-white border-b-2 border-cyan-400' : ''}`}>
                      <div className="flex items-center justify-center space-x-1.5">
                        <span>{rh.name}</span>
                        {currentRoleKey === rh.key && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-bold uppercase">Active</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ACCESS_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-200">{row.feature}</td>
                    
                    <td className={`py-3 px-4 text-center ${currentRoleKey === 'DOCTOR' ? 'bg-slate-800/40 font-semibold' : ''}`}>
                      <span className={`inline-block px-2.5 py-1 text-xs rounded-full border ${getBadgeStyle(row.doctor)}`}>
                        {row.doctor}
                      </span>
                    </td>

                    <td className={`py-3 px-4 text-center ${currentRoleKey === 'ADMIN' ? 'bg-slate-800/40 font-semibold' : ''}`}>
                      <span className={`inline-block px-2.5 py-1 text-xs rounded-full border ${getBadgeStyle(row.admin)}`}>
                        {row.admin}
                      </span>
                    </td>

                    <td className={`py-3 px-4 text-center ${currentRoleKey === 'RESEARCHER' ? 'bg-slate-800/40 font-semibold' : ''}`}>
                      <span className={`inline-block px-2.5 py-1 text-xs rounded-full border ${getBadgeStyle(row.researcher)}`}>
                        {row.researcher}
                      </span>
                    </td>

                    <td className={`py-3 px-4 text-center ${currentRoleKey === 'SYSADMIN' ? 'bg-slate-800/40 font-semibold' : ''}`}>
                      <span className={`inline-block px-2.5 py-1 text-xs rounded-full border ${getBadgeStyle(row.sysadmin)}`}>
                        {row.sysadmin}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Info className="w-4 h-4 text-purple-400" />
            Switching roles in the top navbar instantly updates UI access & permissions.
          </span>
          <button
            onClick={() => setAccessMatrixOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
