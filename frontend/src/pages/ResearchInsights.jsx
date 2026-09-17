import { useEffect, useState } from "react";
import {
  BrainCircuit,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import api from "../api/api";

export default function ResearchInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get(`/research/summary?_=${Date.now()}`);
      setData(res.data);
    } catch (error) {
      console.error("AI insights error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] p-6 text-slate-500">
        Loading AI insights...
      </div>
    );
  }

  const total = data?.total_patients || 0;
  const highRisk = data?.high_risk_patients || 0;
  const predictions = data?.total_predictions || 0;
  const averageRisk = data?.average_risk_score || 0;

  const highRiskPercent = total
    ? ((highRisk / total) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-5 lg:p-6">

      {/* Header */}
      <div className="mb-5 rounded-2xl bg-[#0B1F33] p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-[#E5B7A7]">
              <BrainCircuit size={16} />
              AI RESEARCH INTELLIGENCE
            </div>

            <h1 className="text-2xl font-semibold">
              AI Insights
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Research-level insights generated from aggregate healthcare data.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#C8755B] px-4 py-2.5 text-sm font-medium hover:bg-[#B5654C] disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Metric
          icon={TrendingUp}
          title="Average Risk"
          value={`${(averageRisk * 100).toFixed(1)}%`}
          text="Aggregate risk score"
        />

        <Metric
          icon={AlertTriangle}
          title="High Risk"
          value={highRisk}
          text={`${highRiskPercent}% of cohort`}
          accent
        />

        <Metric
          icon={BrainCircuit}
          title="AI Predictions"
          value={predictions}
          text="Predictions recorded"
        />

        <Metric
          icon={Lightbulb}
          title="Cohort Size"
          value={total}
          text="Records analyzed"
        />

      </div>

      {/* Main insights */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-[#F1E1DB] p-3 text-[#C8755B]">
              <BrainCircuit size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-[#0B1F33]">
                Research Insights
              </h2>

              <p className="text-xs text-slate-500">
                Current observations from the healthcare cohort
              </p>
            </div>

          </div>

          <div className="mt-5 space-y-3">

            <Insight
              title="Risk Monitoring"
              text={`${highRisk} patients are currently classified as high risk within the analyzed cohort.`}
            />

            <Insight
              title="Prediction Activity"
              text={`${predictions} readmission-risk predictions have been recorded by the system.`}
            />

            <Insight
              title="Average Risk Pattern"
              text={`The current cohort has an aggregate average readmission risk of ${(averageRisk * 100).toFixed(1)}%.`}
            />

            <Insight
              title="Research Opportunity"
              text="Risk groups can be compared further using cohort filters, disease categories and demographic segments."
            />

          </div>

        </div>

        {/* AI status */}
        <div className="rounded-2xl bg-[#12395B] p-5 text-white">

          <div className="flex items-center gap-2 text-[#E5B7A7]">
            <BrainCircuit size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">
              AI Engine
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            Analysis Available
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            AI prediction data is available for aggregate research analysis.
          </p>

          <div className="mt-5 rounded-xl bg-white/10 p-4">

            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-[#E5B7A7]" />
              <span className="text-sm font-medium">
                Research Safe
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Insights are presented without exposing individual patient
              identifiers.
            </p>

          </div>

          <div className="mt-4 rounded-xl bg-white/10 p-4">

            <p className="text-2xl font-semibold">
              {(averageRisk * 100).toFixed(1)}%
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current average risk score
            </p>

          </div>

        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-[#C8755B]" />

          <h2 className="font-semibold text-[#0B1F33]">
            Research Interpretation
          </h2>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">

          <Interpretation
            title="Cohort"
            value={total}
            text="patients currently available for aggregate analysis."
          />

          <Interpretation
            title="Risk Signal"
            value={`${highRiskPercent}%`}
            text="of the cohort is currently classified as high risk."
          />

          <Interpretation
            title="AI Activity"
            value={predictions}
            text="prediction records are available for research analysis."
          />

        </div>
      </div>

      {/* Privacy */}
      <div className="mt-5 flex gap-3 rounded-xl border border-[#DFC6BD] bg-[#F4E9E5] p-4">

        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-[#C8755B]"
        />

        <div>
          <p className="text-sm font-semibold text-[#0B1F33]">
            Privacy Protected
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            AI Insights are intended for aggregate research purposes.
            Individual patient information is not displayed.
          </p>
        </div>

      </div>

    </div>
  );
}

function Metric({ icon: Icon, title, value, text, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-semibold text-[#0B1F33]">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {text}
          </p>
        </div>

        <div
          className={`rounded-xl p-2.5 ${
            accent
              ? "bg-[#F1E1DB] text-[#C8755B]"
              : "bg-[#E8EEF3] text-[#12395B]"
          }`}
        >
          <Icon size={19} />
        </div>

      </div>
    </div>
  );
}

function Insight({ title, text }) {
  return (
    <div className="rounded-xl bg-[#F5F7F9] p-4">

      <p className="text-sm font-semibold text-[#0B1F33]">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

function Interpretation({ title, value, text }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">

      <p className="text-xs font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-semibold text-[#C8755B]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}