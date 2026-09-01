import React, { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import SpotlightCard from "../components/SpotlightCard";

function Dashboard() {
  const { liveVitals, isConnected } = useSocket();
  const [chartData, setChartData] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/prediction/analytics");
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.data) {
            setChartData(resJson.data);
          }
        }
      } catch (err) {
        console.warn("Analytics fetch notice:", err.message);
      }
    };
    fetchAnalytics();
  }, []);

  const readmissionCurves = chartData?.readmissionCurves || [
    { month: "Jan", predictedRisk: 18.2, actualReadmissions: 17.1 },
    { month: "Feb", predictedRisk: 17.5, actualReadmissions: 16.4 },
    { month: "Mar", predictedRisk: 16.8, actualReadmissions: 15.5 },
    { month: "Apr", predictedRisk: 15.9, actualReadmissions: 14.8 },
    { month: "May", predictedRisk: 15.1, actualReadmissions: 14.0 },
    { month: "Jun", predictedRisk: 14.4, actualReadmissions: 13.5 },
    { month: "Jul", predictedRisk: 13.8, actualReadmissions: 13.0 },
    { month: "Aug", predictedRisk: 13.2, actualReadmissions: 12.4 },
    { month: "Sep", predictedRisk: 12.7, actualReadmissions: 12.0 },
    { month: "Oct", predictedRisk: 12.3, actualReadmissions: 11.6 },
    { month: "Nov", predictedRisk: 11.9, actualReadmissions: 11.2 },
    { month: "Dec", predictedRisk: 11.4, actualReadmissions: 10.8 },
  ];

  const svgWidth = 500;
  const svgHeight = 160;
  const minVal = 5;
  const maxVal = 25;

  const pointsFor = (key) =>
    readmissionCurves.map((d, i) => {
      const x = (i / (readmissionCurves.length - 1)) * svgWidth;
      const val = d[key] || 10;
      const y = svgHeight - ((val - minVal) / (maxVal - minVal)) * (svgHeight - 30) - 15;
      return { x, y, month: d.month, val };
    });

  const generateLinePath = (key) => {
    const pts = pointsFor(key);
    if (!pts || pts.length === 0) return "";
    let d = `M ${pts[0].x},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const cx = (p1.x + p2.x) / 2;
      d += ` C ${cx.toFixed(1)},${p1.y.toFixed(1)} ${cx.toFixed(1)},${p2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const generateAreaPath = (key) => {
    const lineD = generateLinePath(key);
    if (!lineD) return "";
    return `${lineD} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;
  };

  const stats = [
    {
      title: "Total Patients Managed",
      value: "1,248",
      change: "+12% this month",
      icon: Users,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "High Readmission Risk",
      value: "42",
      change: "+3 urgent flags",
      icon: AlertTriangle,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Avg Readmission Rate",
      value: "8.4%",
      change: "-2.1% AI optimized",
      icon: Activity,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
    {
      title: "Bed Occupancy Rate",
      value: "87%",
      change: "284 / 320 beds filled",
      icon: BedDouble,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#090D16] min-h-screen text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <SpotlightCard className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
                Clinical Executive Overview 🏥
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Real-time workforce monitoring, readmission risk flags, and AI clinical telemetry.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold px-4 py-2 rounded-xl text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live ML Engine v2.4 Active</span>
            </div>
          </div>
        </SpotlightCard>

        {/* 4 Core Interactive KPI Spotlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <SpotlightCard key={idx} className="p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                    {stat.title}
                  </span>
                  <div className={`p-3 rounded-xl border ${stat.color}`}>
                    <IconComp size={20} />
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold font-mono tracking-tight text-white">
                    {stat.value}
                  </h2>
                  <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp size={14} className="text-emerald-400" />
                    {stat.change}
                  </p>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* LIVE WEBSOCKET TELEMETRY MONITOR CARD */}
        <SpotlightCard
          spotlightColor="rgba(52, 211, 153, 0.15)"
          className="p-6 md:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 mb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <HeartPulse size={26} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                  Live Patient Vitals Telemetry Monitor
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
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
              <p className="text-sm font-bold text-emerald-400">
                {liveVitals.patientName || "Rahul Verma"} (#{liveVitals.patientId || "1"})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 border-t border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Heart Rate (BPM)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-rose-400">
                  {liveVitals.heartRate}
                </span>
                <span className="text-xs text-slate-400 font-mono">bpm</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                  style={{ width: `${Math.min((liveVitals.heartRate / 140) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 border-t border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Oxygen Saturation (SpO2)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${liveVitals.spO2 < 92 ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                  {liveVitals.spO2}%
                </span>
                <span className="text-xs text-slate-400 font-mono">SpO2</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  style={{ width: `${liveVitals.spO2}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 border-t border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Blood Pressure (BP)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-teal-300">
                  {liveVitals.bp}
                </span>
                <span className="text-xs text-slate-400 font-mono">mmHg</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 border-t border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Fasting Glucose
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-amber-400">
                  {liveVitals.glucose}
                </span>
                <span className="text-xs text-slate-400 font-mono">mg/dL</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  style={{ width: `${Math.min((liveVitals.glucose / 250) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

          </div>
        </SpotlightCard>

        {/* Dynamic Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Hospital Readmission Trend Chart */}
          <SpotlightCard className="lg:col-span-8 p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  30-Day Readmission Trajectory Trend
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Actual readmissions vs AI predicted risk trajectory.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Monthly Aggregate
              </span>
            </div>

            {/* SVG Interactive Line Graph with Dynamic Gradient Fills & Micro-Hover Tooltips */}
            <div className="h-64 w-full pt-4 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#1e293b" strokeDasharray="4 4" />

                {/* Dynamic Fill Areas */}
                {generateAreaPath("predictedRisk") && (
                  <path d={generateAreaPath("predictedRisk")} fill="url(#emeraldGradient)" />
                )}
                {generateAreaPath("actualReadmissions") && (
                  <path d={generateAreaPath("actualReadmissions")} fill="url(#roseGradient)" />
                )}

                {/* Dynamic Smooth Line Curves */}
                {generateLinePath("predictedRisk") && (
                  <path
                    d={generateLinePath("predictedRisk")}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                )}
                {generateLinePath("actualReadmissions") && (
                  <path
                    d={generateLinePath("actualReadmissions")}
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
                )}

                {/* Data Points with Hover Physics */}
                {pointsFor("predictedRisk").map((p, idx) => (
                  <g
                    key={`p-${idx}`}
                    onMouseEnter={() => setHoveredPoint({ ...p, type: "Predicted Risk" })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={p.x} cy={p.y} r="5" fill="#10B981" className="transition-transform duration-200 hover:scale-150" />
                    {idx === pointsFor("predictedRisk").length - 1 && (
                      <circle cx={p.x} cy={p.y} r="8" fill="#10B981" className="animate-ping opacity-75" />
                    )}
                  </g>
                ))}
                {pointsFor("actualReadmissions").map((p, idx) => (
                  <circle
                    key={`a-${idx}`}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#F43F5E"
                    onMouseEnter={() => setHoveredPoint({ ...p, type: "Actual Readmissions" })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-150"
                  />
                ))}
              </svg>

              {/* Refined Dark Glass Floating Tooltip */}
              <AnimatePresence>
                {hoveredPoint && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 pointer-events-none bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-xl p-3 text-xs text-slate-100 min-w-[140px]"
                    style={{
                      left: Math.min(Math.max(hoveredPoint.x - 70, 0), 340),
                      top: Math.max(hoveredPoint.y - 65, 0),
                    }}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{hoveredPoint.month} Telemetry</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex justify-between gap-3">
                      <span>{hoveredPoint.type}:</span>
                      <span className="font-mono font-bold text-emerald-400">{hoveredPoint.val}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-800/80 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span className="text-slate-300">AI Predicted Risk Index</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-300">Actual Readmissions</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Department Occupancy Bar Chart */}
          <SpotlightCard className="lg:col-span-4 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Department Capacity
                </h3>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Live Load</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-200">Cardiology Ward</span>
                    <span className="text-rose-400 font-mono font-bold">92% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full w-[92%] shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-200">ICU & Critical Care</span>
                    <span className="text-amber-400 font-mono font-bold">85% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full w-[85%] shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-200">Endocrinology</span>
                    <span className="text-teal-400 font-mono font-bold">68% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full w-[68%] shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-200">General Medicine</span>
                    <span className="text-emerald-400 font-mono font-bold">54% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full w-[54%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-300">Total Ward Beds Available:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">36 Beds</span>
            </div>
          </SpotlightCard>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;