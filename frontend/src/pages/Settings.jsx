import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiMoon, FiSun, FiShield, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import { useAuth } from '../context/AuthContext';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SettingRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
        {desc && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const { darkMode, setDarkMode } = useAuth();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('hf_settings') || 'null') || {
    emailNotifs: true,
    riskAlerts: true,
    appointmentReminders: true,
    weeklyReport: false,
    compactMode: false,
    animations: true,
    twoFactor: false,
    sessionTimeout: true,
  });

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const handleSave = async () => {
    localStorage.setItem('hf_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Settings' }]} />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your preferences and account settings</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">
            <FiCheckCircle size={16} /> Settings saved!
          </motion.div>
        )}
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FiBell className="text-blue-600" size={16} />
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Notifications</h2>
          </div>
          <SettingRow label="Email Notifications" desc="Receive updates via email" checked={settings.emailNotifs} onChange={() => toggle('emailNotifs')} />
          <SettingRow label="Risk Alerts" desc="Get notified for high-risk patients" checked={settings.riskAlerts} onChange={() => toggle('riskAlerts')} />
          <SettingRow label="Appointment Reminders" desc="Reminders before scheduled appointments" checked={settings.appointmentReminders} onChange={() => toggle('appointmentReminders')} />
          <SettingRow label="Weekly Report" desc="Receive weekly analytics summary" checked={settings.weeklyReport} onChange={() => toggle('weeklyReport')} />
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              {darkMode ? <FiMoon className="text-purple-600" size={16} /> : <FiSun className="text-purple-600" size={16} />}
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Appearance</h2>
          </div>
          <SettingRow label="Dark Mode" desc="Switch to dark theme" checked={darkMode} onChange={setDarkMode} />
          <SettingRow label="Compact Mode" desc="Reduce spacing for more content" checked={settings.compactMode} onChange={() => toggle('compactMode')} />
          <SettingRow label="Animations" desc="Enable page transitions and animations" checked={settings.animations} onChange={() => toggle('animations')} />
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <FiShield className="text-green-600" size={16} />
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Security</h2>
          </div>
          <SettingRow label="Two-Factor Authentication" desc="Add an extra layer of security" checked={settings.twoFactor} onChange={() => toggle('twoFactor')} />
          <SettingRow label="Session Timeout" desc="Auto logout after 30 minutes of inactivity" checked={settings.sessionTimeout} onChange={() => toggle('sessionTimeout')} />
        </div>

        <button onClick={handleSave} className="btn-primary">Save Settings</button>
      </div>
    </DashboardLayout>
  );
}
