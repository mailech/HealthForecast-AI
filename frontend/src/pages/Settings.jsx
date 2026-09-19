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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SettingRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>}
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage preferences, notifications, and security policies.</p>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700"
          >
            <FiCheckCircle size={15} /> Settings saved successfully
          </motion.div>
        )}
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Notifications */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg flex items-center justify-center">
              <FiBell size={16} />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Notification Preferences</h2>
          </div>
          <SettingRow label="Email Notifications" desc="Receive updates via email" checked={settings.emailNotifs} onChange={() => toggle('emailNotifs')} />
          <SettingRow label="Risk Alerts" desc="Get notified for high-risk patients" checked={settings.riskAlerts} onChange={() => toggle('riskAlerts')} />
          <SettingRow label="Appointment Reminders" desc="Reminders before scheduled appointments" checked={settings.appointmentReminders} onChange={() => toggle('appointmentReminders')} />
          <SettingRow label="Weekly Report" desc="Receive weekly analytics summary" checked={settings.weeklyReport} onChange={() => toggle('weeklyReport')} />
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg flex items-center justify-center">
              {darkMode ? <FiMoon size={16} /> : <FiSun size={16} />}
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Appearance & Display</h2>
          </div>
          <SettingRow label="Dark Mode" desc="Switch between light and dark monochrome theme" checked={darkMode} onChange={setDarkMode} />
          <SettingRow label="Compact Mode" desc="Reduce spacing for high-density content" checked={settings.compactMode} onChange={() => toggle('compactMode')} />
          <SettingRow label="Animations" desc="Enable smooth page transitions" checked={settings.animations} onChange={() => toggle('animations')} />
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg flex items-center justify-center">
              <FiShield size={16} />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Security Controls</h2>
          </div>
          <SettingRow label="Two-Factor Authentication (2FA)" desc="Require secondary verification at login" checked={settings.twoFactor} onChange={() => toggle('twoFactor')} />
          <SettingRow label="Auto Session Timeout" desc="Automatically logout after 30 minutes of inactivity" checked={settings.sessionTimeout} onChange={() => toggle('sessionTimeout')} />
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary text-xs py-2.5 px-5 font-bold uppercase tracking-wider">
            Save Preferences
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
