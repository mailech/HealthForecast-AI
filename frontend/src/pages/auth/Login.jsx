import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, Lock, Mail, ArrowRight, Stethoscope, Building2, FlaskConical, Settings } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectUserByRole(user.role?.name);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const redirectUserByRole = (roleName) => {
    switch (roleName) {
      case 'Doctor':
        navigate('/doctor/dashboard');
        break;
      case 'Hospital Administrator':
        navigate('/admin/dashboard');
        break;
      case 'Healthcare Researcher':
        navigate('/researcher/dashboard');
        break;
      case 'System Administrator':
        navigate('/sysadmin/users');
        break;
      default:
        navigate('/doctor/dashboard');
    }
  };

  const handleQuickRoleSelect = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 items-center justify-center shadow-xl shadow-cyan-500/20 mb-4">
            <Activity className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">HealthForecast <span className="text-cyan-400">AI</span></h1>
          <p className="text-sm text-slate-400 mt-2">Hospital Readmission & Patient Risk Intelligence Platform</p>
        </div>

        {/* Login Glass Panel */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-cyan-400" />
            Portal Sign In
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Role Test Sign-In */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick Role Test Sign-In
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('doctor@hospital.org', 'Doctor@123')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-slate-800 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <Stethoscope className="h-3.5 w-3.5" /> Doctor
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">doctor@hospital.org</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect('hospital_admin@hospital.org', 'Admin@123')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-sky-500/10 hover:border-sky-500/30 border border-slate-800 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                  <Building2 className="h-3.5 w-3.5" /> Hospital Administrator
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">hospital_admin@hospital.org</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect('researcher@hospital.org', 'Research@123')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-purple-500/10 hover:border-purple-500/30 border border-slate-800 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <FlaskConical className="h-3.5 w-3.5" /> Healthcare Researcher
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">researcher@hospital.org</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect('admin@hospital.org', 'Admin@123')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-amber-500/10 hover:border-amber-500/30 border border-slate-800 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Settings className="h-3.5 w-3.5" /> System Administrator
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">admin@hospital.org</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Diabetes 130-US Hospitals Dataset Analytics Platform
        </p>
      </div>
    </div>
  );
};

export default Login;
