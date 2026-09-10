import React, { useState } from 'react';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import { Notification } from '../../types';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Sliders,
  Filter,
  Check,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Mail,
  Smartphone
} from 'lucide-react';

interface NotificationsViewProps {
  onSelectPatientById: (patientId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onSelectPatientById
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Alert settings state
  const [highRiskThreshold, setHighRiskThreshold] = useState<number>(70);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [smsUrgent, setSmsUrgent] = useState<boolean>(true);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (selectedSeverity !== 'ALL' && n.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;
    return true;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Clinical Alerts & Notification Dispatcher
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time patient deterioration alerts, ML threshold events, and care coordination notifications.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Notifications list */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter tabs */}
          <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200/80 text-xs flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    selectedSeverity === sev
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sev === 'ALL' ? 'All Severities' : sev}
                </button>
              ))}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="Clinical">Clinical</option>
              <option value="System">System</option>
              <option value="Model">Model</option>
              <option value="Administrative">Administrative</option>
            </select>
          </div>

          {/* Alert cards */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No notifications match the selected criteria.
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                    n.read
                      ? 'bg-white border-slate-200/70 opacity-80'
                      : 'bg-sky-50/40 border-sky-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                        n.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : n.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {n.severity === 'CRITICAL' ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : n.severity === 'HIGH' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                            n.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : n.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {n.severity}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {n.category} • {n.timestamp}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>

                      {n.patientId && (
                        <button
                          onClick={() => onSelectPatientById(n.patientId!)}
                          className="mt-2 text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review Patient Dossier ({n.patientId})</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Dismiss alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alert Threshold Settings Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs h-fit space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Alert Dispatch Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize notification thresholds and routing channels
            </p>
          </div>

          {settingsSavedToast && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold">
              Alert preferences saved.
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>High-Risk Trigger Score:</span>
                <span className="text-red-600">{highRiskThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={90}
                value={highRiskThreshold}
                onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500">
                Fires urgent notification to attending physician when ML risk exceeds this threshold.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700">Email Shift Summaries</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded text-sky-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700">SMS Urgent Critical Pager</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsUrgent}
                  onChange={(e) => setSmsUrgent(e.target.checked)}
                  className="rounded text-sky-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              Save Dispatch Rules
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
