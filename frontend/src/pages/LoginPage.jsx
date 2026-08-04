import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ShieldCheck, UserCheck, Hospital } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('doctor@metrohealth.org');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Doctor');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('doctor@metrohealth.org');
    setPassword('password123');
    setRole('Doctor');
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-medical-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-medical-teal/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medical-cyan to-medical-teal flex items-center justify-center shadow-cyan-glow mx-auto mb-3">
            <Activity className="w-7 h-7 text-slate-950 font-bold" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Clinician Portal Sign In</h2>
          <p className="text-xs text-slate-400">HealthForecast AI • MetroHealth General Hospital</p>
        </div>

        {/* Role Selection */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Select User Role</label>
          <div className="grid grid-cols-3 gap-2">
            {['Doctor', 'Administrator', 'Researcher'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
                  role === r
                    ? 'bg-medical-cyan/20 text-medical-cyan border border-medical-cyan/40 shadow-sm'
                    : 'bg-navy-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Hospital Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-medical-cyan transition-colors"
                placeholder="clinician@metrohealth.org"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-medical-cyan transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700 text-medical-cyan" />
              <span>Remember session</span>
            </label>
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-medical-cyan hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-medical-cyan to-medical-teal text-slate-950 font-bold text-xs shadow-cyan-glow hover:opacity-95 transition-opacity"
          >
            {loading ? 'Authenticating...' : `Access Portal as ${role}`}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-xs text-slate-400 hover:text-medical-cyan font-medium transition-colors"
          >
            ⚡ Auto-Fill Clinician Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
