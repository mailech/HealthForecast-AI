import React, { useState } from 'react';
import { Cpu, Sparkles, RefreshCw, Play, CheckCircle2, ShieldCheck, Terminal, Award, ToggleRight, ToggleLeft } from 'lucide-react';
import { MODEL_METRICS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const AIModelManagementView = () => {
  const { currentRoleKey } = useAuth();
  const [isTraining, setIsTraining] = useState(false);
  const [logs, setLogs] = useState([
    "[SYSTEM] AI Model Management Console Initialized.",
    "[STATUS] Active Production Model: XGBoost Readmission Classifier v2.4",
    "[METRICS] Accuracy: 92.4% | Precision: 89.1% | Recall: 91.5% | ROC-AUC: 0.942"
  ]);
  const [isDeployed, setIsDeployed] = useState(true);

  const isSysAdmin = currentRoleKey === 'SYSADMIN';

  const handleRunTraining = () => {
    setIsTraining(true);
    setLogs(prev => [...prev, "[RUN] Initializing gradient boosting model training on 101,766 Diabetes encounters..."]);

    setTimeout(() => {
      setLogs(prev => [...prev, "[EPOCH 10/10] Train loss: 0.142 | Validation loss: 0.168"]);
    }, 1000);

    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        "[EVALUATION] Feature importance recalculated: Prior Inpatient Admissions (0.28), HbA1c (0.22).",
        "[SUCCESS] Model training complete! Validation ROC-AUC improved to 0.945."
      ]);
      setIsTraining(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              AI Model Management & Governance
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
              PDF Module 7 Requirement
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Machine learning model evaluation, feature importances, live retrain triggers, and deployment status
          </p>
        </div>

        {/* Deployment Toggle */}
        <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-300 font-semibold pl-2">Production Serving:</span>
          <button
            onClick={() => isSysAdmin && setIsDeployed(!isDeployed)}
            disabled={!isSysAdmin}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              isDeployed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isDeployed ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-rose-400" />}
            <span>{isDeployed ? 'ACTIVE (Online)' : 'OFFLINE (Paused)'}</span>
          </button>
        </div>
      </div>

      {/* Model Performance Cards (PDF Page 11-12 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Accuracy</span>
          <span className="text-xl font-extrabold text-white mt-0.5 block">{MODEL_METRICS.accuracy}</span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Precision</span>
          <span className="text-xl font-extrabold text-cyan-400 mt-0.5 block">{MODEL_METRICS.precision}</span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Recall</span>
          <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{MODEL_METRICS.recall}</span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">F1-Score</span>
          <span className="text-xl font-extrabold text-purple-400 mt-0.5 block">{MODEL_METRICS.f1Score}</span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">ROC-AUC</span>
          <span className="text-xl font-extrabold text-amber-400 mt-0.5 block">{MODEL_METRICS.rocAuc}</span>
        </div>
      </div>

      {/* Grid: Benchmark Comparison & Retrain Simulator Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Model Benchmarks */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Model Benchmark Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3 text-center">Accuracy</th>
                  <th className="py-2.5 px-3 text-center">ROC-AUC</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {MODEL_METRICS.benchmarkComparison.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 font-semibold text-slate-200">{m.algorithm}</td>
                    <td className="py-3 px-3 text-center text-cyan-300 font-bold">{m.accuracy}%</td>
                    <td className="py-3 px-3 text-center text-emerald-400 font-bold">{m.ror}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Retrain Console Terminal */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Live Training & Evaluation Console</h3>
              </div>
              <button
                onClick={handleRunTraining}
                disabled={isTraining || !isSysAdmin}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                  isSysAdmin ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
                <span>{isTraining ? 'Training...' : 'Trigger Model Retrain'}</span>
              </button>
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-cyan-300 space-y-1.5 min-h-[160px] max-h-[220px] overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="leading-relaxed">{log}</div>
              ))}
            </div>
          </div>

          {!isSysAdmin && (
            <p className="text-[11px] text-amber-400/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 mt-2">
              Note: Model retraining and deployment toggles require System Administrator role permissions.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
