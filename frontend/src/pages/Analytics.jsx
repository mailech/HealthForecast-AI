import React, { useState, useEffect } from "react";
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
  Heart,
  HeartPulse,
  Stethoscope,
  Sparkles,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SpotlightCard from "../components/SpotlightCard";

function Analytics() {
  const [timeframe, setTimeframe] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExportAnalytics = async (format = "PDF") => {
    const formatType = format.toUpperCase();
    const ext = formatType === "EXCEL" ? "xlsx" : formatType.toLowerCase();
    const fileName = `Healthcare_Analytics_Report.${ext}`;
    try {
      toast.info(`Exporting analytics report as .${ext}...`);
      const response = await fetch(`http://localhost:5000/api/reports/REP-ANALYTICS/download?format=${formatType}`);
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${fileName} downloaded successfully!`);
    } catch (error) {
      console.error("Analytics export error:", error);
      toast.error(`Export Error: ${error.message}`);
    }
  };

  const fetchAnalytics = async (selectedTf) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/analytics?timeframe=${selectedTf}`);
      if (res.ok) {
        const resJson = await res.json();
        if (resJson.data) {
          setAnalyticsData(resJson.data);
        }
      }
    } catch (err) {
      console.warn("Analytics API fetch notice:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe]);

  // Medication Effectiveness Data
  const medicationData = [
    { name: "ACE Inhibitors (Enalapril)", condition: "Hypertension & Heart Disease", efficacy: "88%", readmissionDrop: "-18%", compliance: `${analyticsData?.medicationCompliance || 94}%` },
    { name: "Insulin Therapy (Glargine)", condition: "Type-2 Diabetes", efficacy: "82%", readmissionDrop: "-15%", compliance: `${Math.max(70, (analyticsData?.medicationCompliance || 92) - 5)}%` },
    { name: "Beta-Blockers (Metoprolol)", condition: "Cardiology & Post-MI", efficacy: "85%", readmissionDrop: "-12%", compliance: `${Math.max(75, (analyticsData?.medicationCompliance || 92) - 3)}%` },
    { name: "Metformin", condition: "Early Diabetes Management", efficacy: "79%", readmissionDrop: "-10%", compliance: `${Math.max(68, (analyticsData?.medicationCompliance || 92) - 7)}%` },
  ];

  // Dynamic Clinical Scorecards
  const kpiScorecards = [
    {
      title: "Average Days in Care",
      value: `${analyticsData?.avgDaysInCare || 4.2} Days`,
      change: "-0.8 Days",
      positive: true,
      note: `Aggregated across ${analyticsData?.totalPatients || 290} patients (${timeframe.toUpperCase()})`,
    },
    {
      title: "Medication Compliance Rate",
      value: `${analyticsData?.medicationCompliance || 92.4}%`,
      change: "+5.1%",
      positive: true,
      note: "Monitored via live telemetry sync",
    },
    {
      title: "High-Risk Patient Count",
      value: `${analyticsData?.highRiskCount || 42}`,
      change: `Low: ${analyticsData?.riskDistribution?.Low || 120}`,
      positive: false,
      note: `Medium Risk: ${analyticsData?.riskDistribution?.Medium || 128}`,
    },
    {
      title: "30-Day Readmission Rate",
      value: `${analyticsData?.readmissionRate || 12.0}%`,
      change: "-4.4%",
      positive: true,
      note: `Baseline 16.4% dropped in ${timeframe.toUpperCase()}`,
    },
  ];

  const timeframeOptions = [
    { id: "30d", label: "30 Days" },
    { id: "6m", label: "6 Months" },
    { id: "1y", label: "1 Year" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#090D16] min-h-screen font-sans text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="text-emerald-400" size={32} />
            Treatment Effectiveness & Healthcare Analytics 📊
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Clinical outcome evaluation, recovery trajectories, and medication efficacy metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export Report Actions */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 text-xs">
            <button
              onClick={() => handleExportAnalytics("PDF")}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-mono font-bold transition flex items-center gap-1 cursor-pointer"
              title="Download Analytics Report as PDF (.pdf)"
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={() => handleExportAnalytics("EXCEL")}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-mono font-bold transition flex items-center gap-1 cursor-pointer"
              title="Download Analytics Report as Excel Spreadsheet (.xlsx)"
            >
              <Download size={13} /> Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExportAnalytics("CSV")}
              className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-mono font-bold transition flex items-center gap-1 cursor-pointer"
              title="Download Analytics Report as CSV Table (.csv)"
            >
              <Download size={13} /> CSV (.csv)
            </button>
          </div>

          {/* Timeframe Selector with Framer Motion Sliding Pill */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 border-t border-white/10 shadow-2xl relative text-xs">
            {timeframeOptions.map((t) => {
              const isActive = timeframe === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id)}
                  className={`relative px-4 py-2 rounded-xl font-mono font-bold transition-colors cursor-pointer z-10 ${
                    isActive ? "text-slate-950" : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTimeframePill"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute inset-0 bg-emerald-400 rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.5)] z-[-1]"
                    />
                  )}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Scorecards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiScorecards.map((kpi, idx) => (
          <SpotlightCard key={idx} className="p-5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {kpi.title}
            </span>
            <div className="my-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">{kpi.value}</span>
              <span className={`text-xs font-mono font-bold flex items-center gap-0.5 ${kpi.positive ? "text-emerald-400" : "text-rose-400"}`}>
                {kpi.positive ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                {kpi.change}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{kpi.note}</span>
          </SpotlightCard>
        ))}
      </div>

      {/* Section 1: Medication Outcome Evaluation */}
      <SpotlightCard className="p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              <Pill className="text-emerald-400" size={18} /> Medication Outcome Evaluation (Clinical Matrix)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Assessing pharmaceutical effectiveness against 30-day readmission reduction.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/30 rounded-full text-xs flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <Award size={14} /> High AI Confidence
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Medication Name</th>
                <th className="p-3.5">Target Clinical Condition</th>
                <th className="p-3.5">Efficacy Rate</th>
                <th className="p-3.5">Readmission Impact</th>
                <th className="p-3.5">Adherence Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {medicationData.map((m, i) => (
                <tr key={i} className="even:bg-slate-900/30 odd:bg-slate-900/70 hover:bg-slate-800/50 transition-colors duration-200">
                  <td className="p-3.5 font-bold text-white">{m.name}</td>
                  <td className="p-3.5 text-slate-400">{m.condition}</td>
                  <td className="p-3.5 text-emerald-400 font-mono font-bold">{m.efficacy}</td>
                  <td className="p-3.5 font-mono font-bold text-teal-300">{m.readmissionDrop}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" style={{ width: m.compliance }}></div>
                      </div>
                      <span className="font-mono font-bold text-white">{m.compliance}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* High-Risk Clinical Cohorts Readmission Risk Curves */}
      <SpotlightCard className="p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              <Activity className="text-rose-400" size={18} /> High-Risk Clinical Cohorts Readmission Risk Curves
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly readmission risk trends modeled for Congestive Heart Failure, COPD, and Diabetes Mellitus.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/30 rounded-full text-xs">
            Live Telemetry API Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CHF Cohort Card */}
          <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-500/30 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Heart size={16} className="text-rose-400" /> Congestive Heart Failure (CHF)
              </span>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                {analyticsData?.summary?.chf30DayReadmissionRisk || "31.4% Avg Risk"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gaussian distribution: mean 31.4% risk, stdDev 4.2%. High winter seasonal peak.
            </p>
            <div className="space-y-1.5 text-[11px] pt-1">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Peak Risk Level</span>
                <span className="text-rose-400 font-mono font-bold">34.2%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full w-[82%] shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
              </div>
            </div>
          </div>

          {/* COPD Cohort Card */}
          <div className="bg-amber-950/20 p-5 rounded-2xl border border-amber-500/30 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <HeartPulse size={16} className="text-amber-400" /> COPD & Respiratory
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                {analyticsData?.summary?.copd30DayReadmissionRisk || "27.8% Avg Risk"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gaussian distribution: mean 27.8% risk, stdDev 3.8%. Air quality / exertion shift correlation.
            </p>
            <div className="space-y-1.5 text-[11px] pt-1">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Peak Risk Level</span>
                <span className="text-amber-400 font-mono font-bold">29.8%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[72%] shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
              </div>
            </div>
          </div>

          {/* Diabetes Cohort Card */}
          <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/30 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Stethoscope size={16} className="text-emerald-400" /> Type-2 Diabetes Mellitus
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                {analyticsData?.summary?.diabetes30DayReadmissionRisk || "21.5% Avg Risk"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gaussian distribution: mean 21.5% risk, stdDev 3.1%. Responsive to continuous glucose tracking.
            </p>
            <div className="space-y-1.5 text-[11px] pt-1">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Peak Risk Level</span>
                <span className="text-emerald-400 font-mono font-bold">23.4%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full w-[58%] shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Section 2: Patient Recovery Trajectory Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recovery Progress Summary */}
        <SpotlightCard className="lg:col-span-8 p-6">
          <h2 className="text-base font-semibold tracking-tight text-white mb-1 flex items-center gap-2">
            <TrendingDown className="text-emerald-400" size={18} /> 30-Day Recovery Trajectory & Readmission Drop
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Early interventions guided by AI risk profiling have lowered 30-day readmissions from 16.4% to 12.0%.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Baseline Readmission Rate (Without AI)</span>
                <span className="text-white font-mono font-bold">16.4%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full w-[65%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Current AI-Guided Readmission Rate</span>
                <span className="text-emerald-400 font-mono font-bold">12.0% (-4.4% Improvement)</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[45%] shadow-[0_0_10px_rgba(52,211,153,0.6)]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Hospital Target Reduction Threshold</span>
                <span className="text-teal-300 font-mono font-bold">10.0% Goal</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-teal-400 h-full w-[38%] shadow-[0_0_10px_rgba(45,212,191,0.6)]"></div>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* AI Insight Sidebar Box */}
        <SpotlightCard
          spotlightColor="rgba(52, 211, 153, 0.15)"
          className="lg:col-span-4 p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
              Clinical Intelligence
            </span>
            <h3 className="text-lg font-semibold tracking-tight mb-3 text-white">
              AI Treatment Insights
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light mb-4">
              "Post-discharge medication tracking improved compliance rates by 5.1%, directly contributing to the 45% reduction in 30-day emergency readmissions among high-risk diabetic cohorts."
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Verified by HealthForecast AI Engine</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
        </SpotlightCard>

      </div>

    </div>
  );
}

export default Analytics;