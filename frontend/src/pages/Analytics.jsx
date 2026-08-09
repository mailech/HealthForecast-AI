import React, { useState } from "react";
import {
  Activity,
  BarChart3,
  TrendingDown,
  Pill,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function Analytics() {
  const [timeframe, setTimeframe] = useState("6 Months");

  // Medication Effectiveness Data
  const medicationData = [
    { name: "ACE Inhibitors (Enalapril)", condition: "Hypertension & Heart Disease", efficacy: "88%", readmissionDrop: "-18%", compliance: "94%" },
    { name: "Insulin Therapy (Glargine)", condition: "Type-2 Diabetes", efficacy: "82%", readmissionDrop: "-15%", compliance: "89%" },
    { name: "Beta-Blockers (Metoprolol)", condition: "Cardiology & Post-MI", efficacy: "85%", readmissionDrop: "-12%", compliance: "91%" },
    { name: "Metformin", condition: "Early Diabetes Management", efficacy: "79%", readmissionDrop: "-10%", compliance: "87%" },
  ];

  // Clinical Scorecards
  const kpiScorecards = [
    { title: "Average Days in Care", value: "4.2 Days", change: "-0.8 Days", positive: true, note: "Reduced overall hospital stay" },
    { title: "Medication Compliance Rate", value: "92.4%", change: "+5.1%", positive: true, note: "Improved via AI reminders" },
    { title: "Post-Op Recovery Rate", value: "94.8%", change: "+3.2%", positive: true, note: "Above national benchmark" },
    { title: "30-Day Readmission Rate", value: "12.0%", change: "-4.4%", positive: true, note: "Dropped from 16.4% baseline" },
  ];

  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={32} />
            Treatment Effectiveness & Healthcare Analytics 📊
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Clinical outcome evaluation, recovery trajectories, and medication efficacy metrics.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs">
          {["30 Days", "6 Months", "1 Year"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                timeframe === t ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Scorecards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiScorecards.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {kpi.title}
            </span>
            <div className="my-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900">{kpi.value}</span>
              <span className={`text-xs font-bold flex items-center ${kpi.positive ? "text-emerald-600" : "text-rose-600"}`}>
                {kpi.positive ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                {kpi.change}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{kpi.note}</span>
          </div>
        ))}
      </div>

      {/* Section 1: Medication Outcome Evaluation */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Pill className="text-blue-600" size={18} /> Medication Outcome Evaluation (PDF Page 7)
            </h2>
            <p className="text-xs text-slate-400">
              Assessing pharmaceutical effectiveness against 30-day readmission reduction.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-full text-xs flex items-center gap-1">
            <Award size={14} /> High AI Confidence
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Medication Name</th>
                <th className="p-3.5">Target Clinical Condition</th>
                <th className="p-3.5">Efficacy Rate</th>
                <th className="p-3.5">Readmission Impact</th>
                <th className="p-3.5">Adherence Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {medicationData.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-bold text-slate-900">{m.name}</td>
                  <td className="p-3.5 text-slate-500">{m.condition}</td>
                  <td className="p-3.5 text-emerald-600 font-bold">{m.efficacy}</td>
                  <td className="p-3.5 font-bold text-blue-600">{m.readmissionDrop}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: m.compliance }}></div>
                      </div>
                      <span className="font-bold text-slate-800">{m.compliance}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Patient Recovery Trajectory Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recovery Progress Summary */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
          <h2 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
            <TrendingDown className="text-emerald-600" size={18} /> 30-Day Recovery Trajectory & Readmission Drop
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Early interventions guided by AI risk profiling have lowered 30-day readmissions from 16.4% to 12.0%.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-600">Baseline Readmission Rate (Without AI)</span>
                <span className="text-slate-800">16.4%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full w-[65%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-600">Current AI-Guided Readmission Rate</span>
                <span className="text-emerald-600">12.0% (-4.4% Improvement)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[45%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-600">Hospital Target Reduction Threshold</span>
                <span className="text-blue-600">10.0% Goal</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[38%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Sidebar Box */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">
              Clinical Intelligence
            </span>
            <h3 className="text-lg font-bold mb-3 text-white">
              AI Treatment Insights
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light mb-4">
              "Post-discharge medication tracking improved compliance rates by 5.1%, directly contributing to the 45% reduction in 30-day emergency readmissions among high-risk diabetic cohorts."
            </p>
          </div>

          <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Verified by HealthForecast AI Engine</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
        </div>

      </div>

    </div>
  );
}

export default Analytics;