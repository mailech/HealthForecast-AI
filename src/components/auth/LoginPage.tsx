import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Stethoscope,
  Microscope,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Hospital
} from 'lucide-react';

interface LoginPageProps {
  initialEmail?: string;
  onSuccessRedirect?: (role?: UserRole) => void;
  onNavigateToSignup?: () => void;
  onNavigateToForgot?: () => void;
  onReturnToWebsite?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialEmail = '',
  onSuccessRedirect,
  onNavigateToSignup,
  onNavigateToForgot,
  onReturnToWebsite
}) => {
  const { loginWithCredentials, loginWithDemo } = useAuth();

  // Form State
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRole | null>(null);

  // Sync initialEmail if changed
  React.useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Status & Validation
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Demo account profiles
  const demoProfiles = [
    {
      role: 'DOCTOR' as UserRole,
      title: 'Doctor',
      name: 'Dr. Anita Sharma',
      email: 'anita.sharma@stjudehealth.org',
      pass: 'Doctor@2026!',
      desc: 'Assigned Patients, Clinical Decision Support & Care Plans',
      icon: Stethoscope,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:border-emerald-400'
    },
    {
      role: 'HOSPITAL_ADMIN' as UserRole,
      title: 'Hospital Admin',
      name: 'Dr. Katherine Vance',
      email: 'katherine.vance@stjudehealth.org',
      pass: 'Admin@2026!',
      desc: 'Hospital-wide Analytics, CMS HRRP Penalties & Census',
      icon: Building2,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 hover:border-blue-400'
    },
    {
      role: 'HEALTHCARE_RESEARCHER' as UserRole,
      title: 'Researcher',
      name: 'Dr. Marcus Chen',
      email: 'marcus.chen@healthresearch.edu',
      pass: 'Research@2026!',
      desc: 'Safe-Harbor Anonymized Datasets & Population Analytics',
      icon: Microscope,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:border-indigo-400'
    },
    {
      role: 'SYSTEM_ADMIN' as UserRole,
      title: 'System Admin',
      name: 'Alex Mercer',
      email: 'alex.mercer@stjudehealth.org',
      pass: 'SysAdmin@2026!',
      desc: 'Full Governance, AI Models, RBAC Matrix & Audit Logs',
      icon: Sliders,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 hover:border-purple-400'
    }
  ];

  // Quick fill demo credentials
  const handleSelectDemo = (p: typeof demoProfiles[0]) => {
    setSelectedDemoRole(p.role);
    setEmail(p.email);
    setPassword(p.pass);
    setErrorMessage(null);
  };

  // Immediate 1-click Demo Login
  const handleOneClickDemo = async (role: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithDemo(role, rememberMe);
      setSuccessMessage(`Authenticated as ${user.name} (${user.role.replace('_', ' ')})`);
      setTimeout(() => {
        if (onSuccessRedirect) onSuccessRedirect(user.role);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!email.trim()) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginWithCredentials(email, password, rememberMe);
      setSuccessMessage(`Welcome back, ${user.name}! Directing to ${user.role.replace('_', ' ')} Dashboard...`);
      setTimeout(() => {
        if (onSuccessRedirect) onSuccessRedirect(user.role);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                HealthForecast
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase tracking-wider">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block leading-tight font-medium">
              Hospital Risk Intelligence
            </span>
          </div>
        </div>

        {onReturnToWebsite && (
          <button
            onClick={onReturnToWebsite}
            className="text-xs font-semibold text-slate-600 hover:text-sky-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span>Platform Overview</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Branding & Medical Intelligence Visual (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Branding */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Clinical Decision Support Engine</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  HealthForecast AI
                </h1>
                <p className="text-sm font-semibold text-teal-300 mt-1">
                  Intelligent insights. Proactive patient care.
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Predict 30-day hospital readmissions, quantify hazard trajectories, and evaluate comparative treatment effectiveness with real-time machine learning.
              </p>
            </div>

            {/* Middle: Abstract Medical Intelligence Visual */}
            <div className="my-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs relative z-10 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  XGBoost v2.4 Inference Stream
                </span>
                <span className="font-mono text-emerald-400 text-[11px] font-bold">ROC-AUC 0.842</span>
              </div>

              {/* Simulated Risk Trajectory Graphic */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">30-Day Readmission Hazard:</span>
                  <span className="text-rose-400 font-bold font-mono">78% High Risk</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 w-[78%] rounded-full" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Day 0 (Discharge)</span>
                  <span>Day 14 (Critical Window)</span>
                  <span>Day 30</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/5 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Cohort Baseline</span>
                  <span className="text-white font-bold font-mono">101,766</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">CMS Penalty Saved</span>
                  <span className="text-teal-400 font-bold font-mono">$380,000</span>
                </div>
              </div>
            </div>

            {/* Bottom Compliance Badges */}
            <div className="relative z-10 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>HIPAA Safe-Harbor Privacy Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>4-Tier Role-Based Access Control (RBAC)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Hospital className="w-4 h-4 text-teal-400 shrink-0" />
                <span>St. Jude Metropolitan Health EHR Bridge</span>
              </div>
            </div>
          </div>

          {/* Right Column: Unified Login Form (7 Cols) */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
            <div>
              {/* Header */}
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                  Unified Clinical Access
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Sign in to your HealthForecast AI account. One common portal for clinicians, executives, researchers, and administrators.
                </p>
              </div>

              {/* Alert Feedback */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-semibold">{successMessage}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Institutional Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. anita.sharma@stjudehealth.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    {onNavigateToForgot && (
                      <button
                        type="button"
                        onClick={onNavigateToForgot}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      Remember this workstation (14 days)
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials & Role Clearance...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Healthcare Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Login Quick Selector */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-sky-600" />
                    Demo Account Selector (Evaluator Testing)
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">Fictional Profiles</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {demoProfiles.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedDemoRole === p.role;
                    return (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => handleSelectDemo(p)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/20 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                        title={`Click to fill credentials for ${p.title}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="w-6 h-6 rounded-lg bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-slate-700">
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.badgeColor}`}>
                            {p.title}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                            {p.name.split(' ')[1] || p.name}
                          </span>
                          <span className="text-[10px] text-slate-600 block truncate">
                            {p.title}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedDemoRole && (
                  <div className="mt-2.5 p-2.5 bg-sky-50/80 border border-sky-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-sky-900 block truncate">
                        Selected: {demoProfiles.find((p) => p.role === selectedDemoRole)?.name}
                      </span>
                      <span className="text-[11px] text-sky-700 truncate block">
                        {demoProfiles.find((p) => p.role === selectedDemoRole)?.desc}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOneClickDemo(selectedDemoRole)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs shrink-0 shadow-xs cursor-pointer transition-colors"
                    >
                      Instant Login →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Signup Link & Footer */}
            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                <span>Don't have an account? </span>
                {onNavigateToSignup ? (
                  <button
                    onClick={onNavigateToSignup}
                    className="font-bold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer ml-1"
                  >
                    Request Demo Account
                  </button>
                ) : (
                  <span className="font-bold text-sky-600">Contact Hospital IT</span>
                )}
              </div>

              <div className="text-[11px] text-slate-600 font-mono">
                Demo environment — fictional patient data
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="text-center py-4 text-xs text-slate-600">
        HealthForecast AI Hospital Risk Intelligence • Machine Learning Decision Support • HIPAA Safe-Harbor
      </footer>
    </div>
  );
};
