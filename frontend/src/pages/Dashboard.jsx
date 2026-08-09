import React from "react";
import {
  Users,
  AlertTriangle,
  Activity,
  BedDouble,
  TrendingUp,
  Brain,
  ArrowUpRight,
  HeartPulse,
  Gauge,
  Wifi,
} from "lucide-react";
import { useSocket } from "../context/SocketContext";

function Dashboard() {
  const { liveVitals, isConnected } = useSocket();

  const stats = [
    {
      title: "Total Patients Managed",
      value: "1,248",
      change: "+12% this month",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "High Readmission Risk",
      value: "42",
      change: "+3 urgent flags",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      title: "Avg Readmission Rate",
      value: "8.4%",
      change: "-2.1% AI optimized",
      icon: Activity,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Bed Occupancy Rate",
      value: "87%",
      change: "284 / 320 beds filled",
      icon: BedDouble,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-6 shadow-md shadow-slate-200/50 border border-slate-200/80">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              Clinical Executive Overview 🏥
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Real-time workforce monitoring, readmission risk flags, and AI clinical telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold px-4 py-2 rounded-xl text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <span>Live ML Engine v2.4 Active</span>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200/50 border border-slate-200/80 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                    {stat.title}
                  </span>
                  <div className={`p-3 rounded-xl border ${stat.color}`}>
                    <IconComp size={20} />
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp size={14} className="text-emerald-600" />
                    {stat.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* LIVE WEBSOCKET TELEMETRY MONITOR CARD */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 mb-6 border-b border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
                <HeartPulse size={26} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  Live Patient Vitals Telemetry Monitor
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <Wifi size={12} /> WebSocket Stream
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time 5-second vital signs stream for active ward patients.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Monitoring Active Patient:</span>
              <p className="text-sm font-extrabold text-blue-400">
                {liveVitals.patientName || "Rahul Verma"} (#{liveVitals.patientId || "1"})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Heart Rate (BPM)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-rose-400">
                  {liveVitals.heartRate}
                </span>
                <span className="text-xs text-slate-400 font-bold">bpm</span>
              </div>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((liveVitals.heartRate / 140) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Oxygen Saturation (SpO2)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-2xl md:text-3xl font-extrabold ${liveVitals.spO2 < 92 ? "text-amber-400 animate-pulse" : "text-cyan-400"}`}>
                  {liveVitals.spO2}%
                </span>
                <span className="text-xs text-slate-400 font-bold">SpO2</span>
              </div>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${liveVitals.spO2}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Blood Pressure (BP)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-indigo-400">
                  {liveVitals.bp}
                </span>
                <span className="text-xs text-slate-400 font-bold">mmHg</span>
              </div>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Fasting Glucose
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-amber-400">
                  {liveVitals.glucose}
                </span>
                <span className="text-xs text-slate-400 font-bold">mg/dL</span>
              </div>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((liveVitals.glucose / 250) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Hospital Readmission Trend Chart */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-md shadow-slate-200/50 border border-slate-200/80">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  30-Day Readmission Trajectory Trend
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Actual readmissions vs AI predicted risk trajectory.
                </p>
              </div>

              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Monthly Aggregate
              </span>
            </div>

            {/* SVG Interactive Line Graph with Gradient Fills */}
            <div className="h-64 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />

                {/* Fill Paths */}
                <path
                  d="M 0,140 Q 100,110 200,70 T 400,90 T 500,40 L 500,180 L 0,180 Z"
                  fill="url(#blueGradient)"
                />
                <path
                  d="M 0,160 Q 100,140 200,110 T 400,130 T 500,90 L 500,180 L 0,180 Z"
                  fill="url(#roseGradient)"
                />

                {/* Smooth Curves */}
                <path
                  d="M 0,140 Q 100,110 200,70 T 400,90 T 500,40"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 0,160 Q 100,140 200,110 T 400,130 T 500,90"
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="200" cy="70" r="5" fill="#2563eb" className="animate-ping opacity-75" />
                <circle cx="200" cy="70" r="5" fill="#2563eb" />
                <circle cx="500" cy="40" r="5" fill="#2563eb" />
              </svg>
            </div>

            <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-100 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-slate-700">AI Predicted Risk Index</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-700">Actual Readmissions</span>
              </div>
            </div>
          </div>

          {/* Department Occupancy Bar Chart */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-md shadow-slate-200/50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Department Capacity
                </h3>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Live Load</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-800">Cardiology Ward</span>
                    <span className="text-rose-600">92% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full w-[92%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-800">ICU & Critical Care</span>
                    <span className="text-amber-600">85% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full w-[85%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-800">Endocrinology</span>
                    <span className="text-blue-600">68% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full w-[68%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-800">General Medicine</span>
                    <span className="text-emerald-600">54% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full w-[54%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
              <span className="font-bold text-blue-900">Total Ward Beds Available:</span>
              <span className="font-extrabold text-blue-700 text-sm">36 Beds</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;