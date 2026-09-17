import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Target,
  Users,
  Zap,
  ChevronRight
} from "lucide-react";
import api from "../api/api";


function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
          <Icon size={18} className="text-slate-700" />
        </div>
        <ArrowUpRight size={16} className="text-slate-300" />
      </div>

      <p className="text-xs text-slate-400 mt-4">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>

      {detail && (
        <p className="text-xs text-slate-500 mt-1">{detail}</p>
      )}
    </div>
  );
}


function RiskRow({ label, value, total, type }) {
  const width = total ? Math.min((value / total) * 100, 100) : 0;

  const style = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-slate-400"
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}</span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${style[type] || style.low}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}


function ActionItem({ text, index }) {
  return (
    <div className="group flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-700">
          {text}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          AI-assisted workflow recommendation
        </p>
      </div>

      <ChevronRight
        size={17}
        className="text-slate-300 group-hover:text-slate-600"
      />
    </div>
  );
}


function Optimization() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadOptimization = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/optimization/");
      setData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load optimization data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptimization();
  }, []);

  const total = data?.total_patients || 0;

  const highPercent = useMemo(
    () => total ? Math.round((data.high_risk / total) * 100) : 0,
    [data, total]
  );

  const mediumPercent = useMemo(
    () => total ? Math.round((data.medium_risk / total) * 100) : 0,
    [data, total]
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <RefreshCw size={20} className="animate-spin" />
            <div>
              <p className="font-semibold">Optimization Engine</p>
              <p className="text-xs text-slate-400 mt-1">
                Analyzing current patient workload...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
          <AlertTriangle
            size={30}
            className="mx-auto text-red-500"
          />

          <h2 className="font-bold text-slate-800 mt-3">
            Optimization data unavailable
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {error}
          </p>

          <button
            onClick={loadOptimization}
            className="mt-5 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* HERO */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden text-white">
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
              <Zap size={15} />
              Optimization Engine
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mt-2">
              Care Priority Workspace
            </h1>

            <p className="text-sm text-slate-300 mt-2 leading-6">
              Convert current patient risk information into focused
              monitoring and care-priority actions.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-300">
              <Activity size={15} />
              Engine Active
            </div>

            <button
              onClick={loadOptimization}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-100"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-white/10">

          <div className="p-4">
            <p className="text-xs text-slate-400">Patients analyzed</p>
            <p className="text-xl font-bold mt-1">{total}</p>
          </div>

          <div className="p-4 border-l border-white/10">
            <p className="text-xs text-slate-400">High-risk share</p>
            <p className="text-xl font-bold mt-1">{highPercent}%</p>
          </div>

          <div className="p-4 border-l border-white/10">
            <p className="text-xs text-slate-400">Current priority</p>
            <p className="text-xl font-bold mt-1">
              {data.priority || "Normal"}
            </p>
          </div>

        </div>
      </div>


      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <StatCard
          icon={Users}
          label="Total Patients"
          value={data.total_patients}
          detail="Current patient population"
        />

        <StatCard
          icon={AlertTriangle}
          label="High Risk"
          value={data.high_risk}
          detail={`${highPercent}% of patients`}
        />

        <StatCard
          icon={Clock3}
          label="Medium Risk"
          value={data.medium_risk}
          detail={`${mediumPercent}% of patients`}
        />

        <StatCard
          icon={Target}
          label="Priority Level"
          value={data.priority || "Normal"}
          detail="Current workflow priority"
        />

      </div>


      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-[1fr_1.25fr] gap-5">

        {/* RISK DISTRIBUTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">

          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Patient Load
              </p>

              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Risk Distribution
              </h2>
            </div>

            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Activity size={18} className="text-slate-700" />
            </div>
          </div>

          <div className="flex items-end gap-2 h-20 mb-7">

            <div
              className="bg-slate-900 rounded-t-lg flex-1 min-h-[12px]"
              style={{
                height: `${Math.max(highPercent, 10)}%`
              }}
            />

            <div
              className="bg-slate-500 rounded-t-lg flex-1 min-h-[12px]"
              style={{
                height: `${Math.max(mediumPercent, 10)}%`
              }}
            />

            <div
              className="bg-slate-200 rounded-t-lg flex-1 min-h-[12px]"
              style={{
                height: `${Math.max(100 - highPercent - mediumPercent, 10)}%`
              }}
            />

          </div>

          <RiskRow
            label="High Risk"
            value={data.high_risk}
            total={total}
            type="high"
          />

          <RiskRow
            label="Medium Risk"
            value={data.medium_risk}
            total={total}
            type="medium"
          />

          <RiskRow
            label="Lower Risk"
            value={Math.max(total - data.high_risk - data.medium_risk, 0)}
            total={total}
            type="low"
          />

        </div>


        {/* PRIORITY PANEL */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-slate-200 flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Workflow Intelligence
              </p>

              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Recommended Actions
              </h2>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              <CheckCircle2 size={14} />
              {data.actions?.length || 0} actions
            </div>

          </div>

          <div>
            {data.actions?.length ? (
              data.actions.map((action, index) => (
                <ActionItem
                  key={index}
                  text={action}
                  index={index}
                />
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-400">
                No optimization actions are currently available.
              </div>
            )}
          </div>

        </div>

      </div>


      {/* PRIORITY SUMMARY */}
      <div className="grid md:grid-cols-3 gap-3">

        <div className="bg-slate-900 text-white rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
            <ShieldCheck size={15} />
            Decision Support
          </div>

          <p className="text-sm text-slate-300 mt-3 leading-6">
            Optimization uses available patient risk information to
            organize the current care workload.
          </p>
        </div>


        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider">
            <Target size={15} />
            Current Priority
          </div>

          <p className="text-2xl font-bold text-slate-900 mt-3">
            {data.priority || "Normal"}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Based on current patient risk distribution
          </p>
        </div>


        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider">
            <Clock3 size={15} />
            Last Analysis
          </div>

          <p className="text-sm font-bold text-slate-900 mt-3">
            {lastUpdated
              ? lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "-"}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Refresh to recalculate workflow data
          </p>
        </div>

      </div>

    </div>
  );
}

export default Optimization; 