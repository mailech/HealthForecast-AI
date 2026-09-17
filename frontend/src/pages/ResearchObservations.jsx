import { useEffect, useState } from "react";
import {
  FlaskConical,
  RefreshCw,
  Download,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  FileText,
} from "lucide-react";
import api from "../api/api";

export default function ResearchObservations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);

      const res = await api.get(`/research/summary?_=${Date.now()}`);
      setData(res.data);
    } catch (error) {
      console.error("Research error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportResearch = () => {
    if (!data) return;

    const rows = [
      ["Research Metric", "Value"],
      ["Total Patients", data.total_patients || 0],
      ["High Risk Patients", data.high_risk_patients || 0],
      ["Total Predictions", data.total_predictions || 0],
      ["Average Risk Score", data.average_risk_score || 0],
    ];

    const csv = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "healthforecast-research.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] p-6 text-slate-500">
        Loading research workspace...
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
              <FlaskConical size={16} />
              RESEARCH WORKSPACE
            </div>

            <h1 className="text-2xl font-semibold">
              Research
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Aggregate observations and research findings from HealthForecast AI.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-sm hover:bg-white/15 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={exportResearch}
              className="flex items-center gap-2 rounded-lg bg-[#C8755B] px-4 py-2.5 text-sm font-medium hover:bg-[#B5654C]"
            >
              <Download size={16} />
              Export
            </button>

          </div>
        </div>
      </div>

      {/* Research metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Metric
          icon={FileText}
          title="Patients"
          value={total}
          text="Records available"
        />

        <Metric
          icon={AlertTriangle}
          title="High Risk"
          value={highRisk}
          text={`${highRiskPercent}% of cohort`}
          accent
        />

        <Metric
          icon={TrendingUp}
          title="Predictions"
          value={predictions}
          text="AI prediction records"
        />

        <Metric
          icon={FlaskConical}
          title="Average Risk"
          value={`${(averageRisk * 100).toFixed(1)}%`}
          text="Aggregate risk score"
          accent
        />

      </div>

      {/* Research observations */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-[#F1E1DB] p-3 text-[#C8755B]">
            <Lightbulb size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-[#0B1F33]">
              Research Observations
            </h2>

            <p className="text-xs text-slate-500">
              Current system-level observations
            </p>
          </div>

        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">

          <Observation
            title="Readmission Risk"
            value={`${(averageRisk * 100).toFixed(1)}%`}
            text="Average predicted readmission risk across the available prediction records."
          />

          <Observation
            title="High-Risk Cohort"
            value={`${highRiskPercent}%`}
            text="Share of the current patient cohort classified as high risk."
          />

          <Observation
            title="AI Utilization"
            value={predictions}
            text="Readmission-risk predictions currently recorded in the system."
          />

          <Observation
            title="Research Coverage"
            value={total}
            text="Patient records currently available for aggregate-level research analysis."
          />

        </div>
      </div>

      {/* Findings */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">

        <div className="rounded-2xl bg-[#12395B] p-5 text-white">

          <div className="flex items-center gap-2 text-[#E5B7A7]">
            <TrendingUp size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">
              Key Finding
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            Risk-Based Research
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            The current system can be used to investigate relationships between
            patient cohorts and predicted readmission risk.
          </p>

          <div className="mt-5 rounded-xl bg-white/10 p-4">

            <p className="text-3xl font-semibold">
              {highRisk}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              high-risk records currently identified
            </p>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-[#C8755B]" />

            <h2 className="font-semibold text-[#0B1F33]">
              Research Opportunities
            </h2>
          </div>

          <div className="mt-4 space-y-3">

            <ResearchItem text="Compare risk levels across different patient cohorts." />

            <ResearchItem text="Study patterns in demographic and clinical groups." />

            <ResearchItem text="Analyze model performance and prediction behaviour." />

            <ResearchItem text="Use aggregate findings for further healthcare research." />

          </div>

        </div>
      </div>

      {/* Methodology */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

        <h2 className="font-semibold text-[#0B1F33]">
          Research Methodology
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          How research information is produced.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">

          <Method
            number="01"
            title="Collect"
            text="Healthcare records and prediction results are collected."
          />

          <Method
            number="02"
            title="Analyze"
            text="Aggregate metrics and cohort patterns are calculated."
          />

          <Method
            number="03"
            title="Interpret"
            text="Researchers examine system-level observations and findings."
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
            Privacy Protected Research
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            Research observations are based on aggregate information.
            Individual patient identifiers are not displayed or exported.
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

function Observation({ title, value, text }) {
  return (
    <div className="rounded-xl bg-[#F5F7F9] p-4">

      <div className="flex items-center justify-between">

        <p className="text-sm font-semibold text-[#0B1F33]">
          {title}
        </p>

        <span className="text-lg font-semibold text-[#C8755B]">
          {value}
        </span>

      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

function ResearchItem({ text }) {
  return (
    <div className="flex gap-3 rounded-xl bg-[#F5F7F9] p-3">

      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C8755B]" />

      <p className="text-xs leading-5 text-slate-600">
        {text}
      </p>

    </div>
  );
}

function Method({ number, title, text }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">

      <span className="text-xs font-semibold text-[#C8755B]">
        {number}
      </span>

      <h3 className="mt-2 text-sm font-semibold text-[#0B1F33]">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}