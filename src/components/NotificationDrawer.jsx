import React from 'react';
import { X, Bell, AlertTriangle, Activity, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotificationDrawer = () => {
  const { notificationsOpen, setNotificationsOpen, setActiveTab, setSelectedPatient } = useAuth();
  
  if (!notificationsOpen) return null;

  const notifications = [
    {
      id: 1,
      title: "High Readmission Risk Alert: PT-40182",
      patient: "Jameson Blake (Age 80-90)",
      message: "AI Score 92% - STEMI + Uncontrolled Glucose (>300). Immediate follow-up required.",
      time: "10 mins ago",
      type: "critical"
    },
    {
      id: 2,
      title: "Elevated A1C Risk Flag: PT-10492",
      patient: "Eleanor Vance (Age 70-80)",
      message: "Readmission forecast score increased to 87% following insulin dosage change.",
      time: "42 mins ago",
      type: "high"
    },
    {
      id: 3,
      title: "Model Retraining Completed",
      patient: "XGBoost Readmission Classifier v2.4",
      message: "Model precision improved to 89.1%, ROC-AUC reached 0.942.",
      time: "2 hours ago",
      type: "info"
    }
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100">Live Health Notifications</h3>
          <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300 font-medium">3 New</span>
        </div>
        <button
          onClick={() => setNotificationsOpen(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-3 flex-1">
        {notifications.map(n => (
          <div key={n.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-2">
            <div className="flex items-start justify-between">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                n.type === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                n.type === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}>
                {n.type}
              </span>
              <span className="text-[11px] text-slate-500">{n.time}</span>
            </div>
            <h4 className="font-semibold text-sm text-slate-100">{n.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-950/80 border-t border-slate-800">
        <button
          onClick={() => {
            setNotificationsOpen(false);
            setActiveTab('risk-prediction');
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center justify-center space-x-2 transition"
        >
          <span>View All Risk Predictions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
