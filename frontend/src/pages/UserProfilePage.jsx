import React, { useState } from 'react';
import { UserCheck, Shield, Key, Bell, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserProfilePage = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || 'Dr. Sarah Jenkins',
    email: user?.email || 'doctor@metrohealth.org',
    hospital_name: user?.hospital_name || 'MetroHealth General Hospital',
    role: user?.role || 'Doctor',
    notifyHighRisk: true,
    notifyDailyDigest: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess('Clinician profile settings successfully updated.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-6 rounded-3xl border border-slate-700/80">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Clinician Settings & Preferences</h1>
        <p className="text-xs text-slate-400">Manage user account profile, hospital node, and clinical notification alerts.</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-medical-cyan" />
            <span>Profile Details</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Hospital / Medical Center</label>
              <input
                type="text"
                value={formData.hospital_name}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Role / Privilege</label>
              <input
                type="text"
                disabled
                value={formData.role}
                className="w-full p-2.5 rounded-xl bg-navy-900/50 border border-slate-800 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-medical-teal" />
            <span>Clinical Alerts & Notifications</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-navy-900/60 border border-slate-800 cursor-pointer">
              <div>
                <p className="font-bold text-white">High-Risk Patient Readmission Alerts</p>
                <p className="text-[11px] text-slate-400">Receive instant notifications when an inpatient score exceeds 60% readmission risk.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyHighRisk}
                onChange={(e) => setFormData({ ...formData, notifyHighRisk: e.target.checked })}
                className="w-4 h-4 rounded text-medical-cyan bg-slate-800 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-navy-900/60 border border-slate-800 cursor-pointer">
              <div>
                <p className="font-bold text-white">Daily Executive Readmission Digest</p>
                <p className="text-[11px] text-slate-400">Summary email every morning at 07:00 AM.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyDailyDigest}
                onChange={(e) => setFormData({ ...formData, notifyDailyDigest: e.target.checked })}
                className="w-4 h-4 rounded text-medical-cyan bg-slate-800 border-slate-700"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-medical-cyan to-medical-teal text-slate-950 font-bold text-xs shadow-cyan-glow hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </form>
    </div>
  );
};
