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
import { toast } from "sonner";
import { useSocket } from "../context/SocketContext";

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
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-6 shadow-md shadow-slate-200/50 border border-slate-200/80">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bell className="text-blue-600" size={30} />
              Hospital Alerts & Notifications 🔔
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Real-time clinical triggers, risk threshold warnings, and system notices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <Wifi size={13} /> Live WebSocket Sync
            </div>

            <button
              onClick={handleMarkAllRead}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <CheckCircle2 size={16} className="text-emerald-600" /> Mark All Read
            </button>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="bg-white rounded-2xl p-3 shadow-md shadow-slate-200/50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["All", "Critical", "Warning", "Information"].map((filter) => {
              const count =
                filter === "All"
                  ? activeAlerts.length
                  : activeAlerts.filter((a) => a.severity === filter).length;

              return (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedFilter === filter
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{filter}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      selectedFilter === filter
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-bold px-2">
            Active Alerts: {activeAlerts.length}
          </div>
        </div>

        {/* Notification List Stack */}
        <div className="space-y-6">
          
          {(selectedFilter === "All" || selectedFilter === "Critical") &&
            criticalAlerts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-rose-200/80 overflow-hidden">
                <div className="bg-rose-50/80 px-6 py-3.5 border-b border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
                    <AlertCircle size={18} /> Critical Alerts ({criticalAlerts.length})
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                    REAL-TIME STREAM
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {criticalAlerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onResolve={handleResolve}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

          {(selectedFilter === "All" || selectedFilter === "Warning") &&
            warningAlerts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-amber-200/80 overflow-hidden">
                <div className="bg-amber-50/80 px-6 py-3.5 border-b border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider">
                    <AlertTriangle size={18} /> Warning Notifications ({warningAlerts.length})
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {warningAlerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onResolve={handleResolve}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

          {(selectedFilter === "All" || selectedFilter === "Information") &&
            infoAlerts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
                <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 font-extrabold text-xs uppercase tracking-wider">
                    <Info size={18} /> System Information ({infoAlerts.length})
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {infoAlerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onResolve={handleResolve}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

          {filteredAlerts.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-md shadow-slate-200/50">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-extrabold text-slate-900">No Active Alerts</h3>
              <p className="text-xs text-slate-400 mt-1">
                All notifications have been resolved or filtered out.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function AlertItem({ alert, onResolve, onDelete }) {
  return (
    <div
      className={`p-4 md:px-6 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-slate-50/80 ${
        !alert.read ? "bg-blue-50/20 font-semibold" : ""
      }`}
    >
      <div className="flex items-start gap-3.5 w-full md:w-auto">
        <div className="mt-1">
          {alert.severity === "Critical" && (
            <span className="w-3 h-3 rounded-full bg-rose-500 block shadow-sm shadow-rose-500/50 animate-pulse" />
          )}
          {alert.severity === "Warning" && (
            <span className="w-3 h-3 rounded-full bg-amber-500 block shadow-sm shadow-amber-500/50" />
          )}
          {alert.severity === "Information" && (
            <span className="w-3 h-3 rounded-full bg-blue-500 block shadow-sm shadow-blue-500/50" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <User size={14} className="text-slate-400" />
              {alert.patient}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              • {alert.id}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {alert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
          <Clock size={13} /> {alert.time || "Just now"}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onResolve(alert.id, alert.patient)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Check size={14} /> Resolve
          </button>

          <button
            onClick={() => onDelete(alert.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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