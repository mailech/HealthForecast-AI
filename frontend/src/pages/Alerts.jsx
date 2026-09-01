import React, { useState, useMemo, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  Check,
  User,
  Clock,
  Wifi,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSocket } from "../context/SocketContext";
import SpotlightCard from "../components/SpotlightCard";

const INITIAL_ALERTS = [
  {
    id: "ALT-001",
    patient: "Rahul Verma",
    message: "High readmission risk detected (92%). Immediate review required.",
    severity: "Critical",
    time: "10 mins ago",
    date: "2026-08-03 10:14 AM",
    read: false,
    resolved: false,
  },
  {
    id: "ALT-002",
    patient: "Priya Sharma",
    message: "Systolic Blood Pressure crossed threshold (165/105 mmHg).",
    severity: "Critical",
    time: "25 mins ago",
    date: "2026-08-03 09:59 AM",
    read: false,
    resolved: false,
  },
  {
    id: "ALT-003",
    patient: "System Facility",
    message: "ICU Ward occupancy reached 95% capacity.",
    severity: "Critical",
    time: "45 mins ago",
    date: "2026-08-03 09:39 AM",
    read: false,
    resolved: false,
  },
  {
    id: "ALT-004",
    patient: "Ramesh Kumar",
    message: "Follow-up consultation required within 48 hours of discharge.",
    severity: "Warning",
    time: "2 hours ago",
    date: "2026-08-03 08:14 AM",
    read: true,
    resolved: false,
  },
  {
    id: "ALT-005",
    patient: "Sneha Patel",
    message: "Asthma patient missed scheduled morning glucose log entry.",
    severity: "Warning",
    time: "3 hours ago",
    date: "2026-08-03 07:00 AM",
    read: true,
    resolved: false,
  },
];

function Alerts() {
  const { liveAlerts, isConnected } = useSocket();
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Merge incoming WebSocket live breach alerts
  useEffect(() => {
    if (liveAlerts && liveAlerts.length > 0) {
      setAlerts((prevAlerts) => {
        const existingIds = new Set(prevAlerts.map((a) => a.id));
        const newBreaches = liveAlerts.filter((a) => !existingIds.has(a.id));
        return [...newBreaches, ...prevAlerts];
      });
    }
  }, [liveAlerts]);

  const handleResolve = (id, patient) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, resolved: true } : alert
      )
    );
    toast.success(`Alert for ${patient} marked as resolved!`);
  };

  const handleDelete = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
    toast.info("Notification dismissed.");
  };

  const handleMarkAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
    toast.success("All notifications marked as read!");
  };

  const activeAlerts = useMemo(() => {
    return alerts.filter((alert) => !alert.resolved);
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (selectedFilter === "All") return activeAlerts;
    return activeAlerts.filter((a) => a.severity === selectedFilter);
  }, [activeAlerts, selectedFilter]);

  const criticalAlerts = filteredAlerts.filter((a) => a.severity === "Critical");
  const warningAlerts = filteredAlerts.filter((a) => a.severity === "Warning");
  const infoAlerts = filteredAlerts.filter((a) => a.severity === "Information");

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#090D16] min-h-screen text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <SpotlightCard className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight flex items-center gap-2.5">
                <Bell className="text-emerald-400" size={30} />
                Hospital Alerts & Notifications 🔔
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Real-time clinical triggers, risk threshold warnings, and system notices.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <Wifi size={13} /> Live WebSocket Sync
              </div>

              <button
                onClick={handleMarkAllRead}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-mono font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <CheckCircle2 size={16} className="text-emerald-400" /> Mark All Read
              </button>
            </div>
          </div>
        </SpotlightCard>

        {/* Filter Tabs Bar */}
        <SpotlightCard className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {["All", "Critical", "Warning", "Information"].map((filter) => {
                const count =
                  filter === "All"
                    ? activeAlerts.length
                    : activeAlerts.filter((a) => a.severity === filter).length;
                const isActive = selectedFilter === filter;

                return (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`relative px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{filter}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive
                          ? "bg-slate-950/20 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-400 font-mono font-bold px-2">
              Active Alerts: {activeAlerts.length}
            </div>
          </div>
        </SpotlightCard>

        {/* Notification List Stack */}
        <div className="space-y-6">
          
          {(selectedFilter === "All" || selectedFilter === "Critical") &&
            criticalAlerts.length > 0 && (
              <SpotlightCard className="overflow-hidden">
                <div className="bg-rose-950/40 px-6 py-3.5 border-b border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase tracking-wider">
                    <AlertCircle size={18} /> Critical Alerts ({criticalAlerts.length})
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                    REAL-TIME STREAM
                  </span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {criticalAlerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onResolve={handleResolve}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SpotlightCard>
            )}

          {(selectedFilter === "All" || selectedFilter === "Warning") &&
            warningAlerts.length > 0 && (
              <SpotlightCard className="overflow-hidden">
                <div className="bg-amber-950/40 px-6 py-3.5 border-b border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle size={18} /> Warning Notifications ({warningAlerts.length})
                  </div>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {warningAlerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onResolve={handleResolve}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SpotlightCard>
            )}

          {(selectedFilter === "All" || selectedFilter === "Information") &&
            infoAlerts.length > 0 && (
              <SpotlightCard className="overflow-hidden">
                <div className="bg-slate-950/60 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 font-mono font-bold text-xs uppercase tracking-wider">
                    <Info size={18} /> System Information ({infoAlerts.length})
                  </div>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {infoAlerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onResolve={handleResolve}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SpotlightCard>
            )}

          {filteredAlerts.length === 0 && (
            <SpotlightCard className="p-12 text-center">
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No Active Alerts</h3>
              <p className="text-xs text-slate-400 mt-1">
                All notifications have been resolved or filtered out.
              </p>
            </SpotlightCard>
          )}

        </div>
      </div>
    </div>
  );
}

function AlertItem({ alert, onResolve, onDelete }) {
  return (
    <div
      className={`p-4 md:px-6 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-slate-800/50 ${
        !alert.read ? "bg-emerald-950/20 font-semibold" : ""
      }`}
    >
      <div className="flex items-start gap-3.5 w-full md:w-auto">
        <div className="mt-1">
          {alert.severity === "Critical" && (
            <span className="w-3 h-3 rounded-full bg-rose-500 block shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
          )}
          {alert.severity === "Warning" && (
            <span className="w-3 h-3 rounded-full bg-amber-400 block shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          )}
          {alert.severity === "Information" && (
            <span className="w-3 h-3 rounded-full bg-emerald-400 block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <User size={14} className="text-slate-400" />
              {alert.patient}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              • {alert.id}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {alert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
        <span className="text-[11px] text-slate-400 font-mono font-medium flex items-center gap-1 whitespace-nowrap">
          <Clock size={13} /> {alert.time || "Just now"}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onResolve(alert.id, alert.patient)}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Check size={14} /> Resolve
          </button>

          <button
            onClick={() => onDelete(alert.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Dismiss Alert"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Alerts;