import { useEffect, useState } from "react";
import {
  Users,
  AlertTriangle,
  BrainCircuit,
  Activity,
  RefreshCw,
  Download,
  ShieldCheck,
  Database,
  FlaskConical,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/api";

export default function Research() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState("");

  const loadData = async () => {
    try {
      setRefreshing(true);

      const res = await api.get(`/research/summary?_=${Date.now()}`);
      setData(res.data);

      setUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (error) {
      console.error("Research data error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportCSV = () => {
    if (!data) return;

    const rows = [
      ["Research Metric", "Value"],
      ["Total Patients", data.total_patients],
      ["High Risk Patients", data.high_risk_patients],
      ["Total Predictions", data.total_predictions],
      ["Average Risk Score", data.average_risk_score],
    ];

    const csv = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "research-summary.csv";
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

  const chartData = [
    { name: "High Risk", value: highRisk },
    { name: "Other", value: Math.max(0, total - highRisk) },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-5 lg:p-6">

      {/* Header */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-[#0B1F33] text-white">

        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#E7B8A8]">
              <FlaskConical size={16} />
              RESEARCH WORKSPACE
            </div>

            <h1 className="text-2xl font-semibold">
              Research Overview
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Aggregate healthcare intelligence for research analysis.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-sm transition hover:bg-white/15 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-lg bg-[#C8755B] px-4 py-2.5 text-sm font-medium transition hover:bg-[#B5654C]"
            >
              <Download size={16} />
              Export
            </button>

          </div>
        </div>

        {updated && (
          <div className="border-t border-white/10 px-6 py-3 text-[11px] text-slate-400">
            Last updated at {updated}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Stat
          icon={Users}
          title="Patients Analyzed"
          value={total}
        />

        <Stat
          icon={AlertTriangle}
          title="High Risk"
          value={highRisk}
          accent
        />

        <Stat
          icon={BrainCircuit}
          title="Predictions"
          value={predictions}
        />

        <Stat
          icon={Activity}
          title="Average Risk"
          value={`${(averageRisk * 100).toFixed(1)}%`}
        />

      </div>

      {/* Main analysis */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-[#0B1F33]">
                Cohort Risk Distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current aggregate patient risk profile
              </p>
            </div>

            <div className="rounded-xl bg-[#F1E1DB] p-2.5 text-[#C8755B]">
              <TrendingUp size={18} />
            </div>

          </div>

          <div className="h-[260px]">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#C8755B"
                  radius={[7, 7, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Status */}
        <div className="rounded-2xl bg-[#12395B] p-5 text-white">

          <div className="flex items-center gap-2 text-[#E7B8A8]">
            <Database size={18} />

            <span className="text-xs font-medium uppercase tracking-wider">
              Research Status
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            Analysis Active
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            The research environment is processing aggregate healthcare
            information without exposing individual patient identities.
          </p>

          <div className="mt-5 rounded-xl bg-white/10 p-4">

            <div className="flex items-center gap-2">
              <ShieldCheck
                size={17}
                className="text-[#E7B8A8]"
              />

              <span className="text-sm font-medium">
                Privacy Protected
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Research access is limited to aggregate-level information.
            </p>

          </div>
        </div>
      </div>

      {/* Snapshot */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

        <div className="mb-4">
          <h2 className="font-semibold text-[#0B1F33]">
            Research Snapshot
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current system-level observations
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">

          <Snapshot
            title="Cohort Coverage"
            value={total}
            text="patient records available for aggregate analysis"
          />

          <Snapshot
            title="Risk Monitoring"
            value={highRisk}
            text="patients currently classified as high risk"
          />

          <Snapshot
            title="AI Activity"
            value={predictions}
            text="readmission predictions recorded"
          />

        </div>
      </div>

      {/* Privacy */}
      <div className="mt-5 flex gap-3 rounded-xl border border-[#DFC6BD] bg-[#F4E9E5] p-4">

        <ShieldCheck
          className="mt-0.5 text-[#C8755B]"
          size={19}
        />

        <div>
          <p className="text-sm font-semibold text-[#0B1F33]">
            Research Privacy
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            This workspace is designed for aggregate research analysis.
            Individual patient identifiers are not displayed.
          </p>
        </div>

      </div>

    </div>
  );
}

function Stat({ icon: Icon, title, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0B1F33]">
            {value}
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

function Snapshot({ title, value, text }) {
  return (
    <div className="rounded-xl bg-[#F5F7F9] p-4">

      <p className="text-xs font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-semibold text-[#0B1F33]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
} 