import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Users, Stethoscope, TrendingUp, Cpu } from "lucide-react";
import { getAnalyticsSummary, getModelInfo } from "../api/client";

function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalyticsSummary()
      .then(setAnalytics)
      .catch((err) => setError(err.message));

    getModelInfo()
      .then(setModelInfo)
      .catch(() => {});
  }, []);

  const outcomeColors = {
    improved: "bg-emerald-500",
    no_change: "bg-amber-500",
    worsened: "bg-rose-500",
  };

  return (
    <div className="flex bg-pista-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header title="Healthcare Analytics Reports" subtitle="Treatment effectiveness & patient outcome analysis" />

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {analytics && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div className="bg-gradient-to-br from-pista-500 to-pista-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10"></div>
                <div className="bg-white/20 w-11 h-11 rounded-xl flex items-center justify-center mb-4 relative z-10">
                  <Users size={22} />
                </div>
                <p className="text-3xl font-bold relative z-10">{analytics.total_patients}</p>
                <p className="text-sm text-white/85 mt-1 relative z-10">Total Patients</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10"></div>
                <div className="bg-white/20 w-11 h-11 rounded-xl flex items-center justify-center mb-4 relative z-10">
                  <Stethoscope size={22} />
                </div>
                <p className="text-3xl font-bold relative z-10">{analytics.total_treatments}</p>
                <p className="text-sm text-white/85 mt-1 relative z-10">Total Treatments</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl border border-pista-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={18} className="text-pista-600" />
                  <h2 className="text-base font-semibold text-slate-800">Treatment Outcomes</h2>
                </div>
                <div className="space-y-4">
                  {Object.entries(analytics.treatment_outcomes).map(([key, value]) => {
                    const pct = analytics.total_treatments > 0 ? (value / analytics.total_treatments) * 100 : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-slate-600">{key.replace("_", " ")}</span>
                          <span className="font-semibold text-slate-800">{value}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={outcomeColors[key] + " h-2 rounded-full"} style={{ width: pct + "%" }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-pista-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Stethoscope size={18} className="text-pista-600" />
                  <h2 className="text-base font-semibold text-slate-800">Diagnosis Breakdown</h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(analytics.diagnosis_breakdown).map(([diagnosis, count]) => (
                    <div key={diagnosis} className="flex items-center justify-between text-sm border-b border-pista-50 pb-2 last:border-0">
                      <span className="text-slate-600">{diagnosis}</span>
                      <span className="font-semibold text-slate-800 bg-pista-50 px-2.5 py-1 rounded-full text-xs">{count} patient{count !== 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {modelInfo && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center gap-2 mb-1">
              <Cpu size={18} className="text-pista-400" />
              <h2 className="text-base font-semibold">AI Model Performance</h2>
            </div>
            <p className="text-sm text-slate-400 mb-5">{modelInfo.model_type} — trained on {modelInfo.trained_on}</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-slate-400 text-xs mb-1">Accuracy</p>
                <p className="font-bold text-xl text-pista-400">{(modelInfo.performance_metrics.accuracy * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-slate-400 text-xs mb-1">Precision</p>
                <p className="font-bold text-xl text-pista-400">{(modelInfo.performance_metrics.precision * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-slate-400 text-xs mb-1">Recall</p>
                <p className="font-bold text-xl text-pista-400">{(modelInfo.performance_metrics.recall * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-slate-400 text-xs mb-1">F1 Score</p>
                <p className="font-bold text-xl text-pista-400">{(modelInfo.performance_metrics.f1_score * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-slate-400 text-xs mb-1">ROC-AUC</p>
                <p className="font-bold text-xl text-pista-400">{modelInfo.performance_metrics.roc_auc.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reports;