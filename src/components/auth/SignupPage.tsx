import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, SignupFormData } from '../../types';
import {
  Activity,
  UserCheck,
  Mail,
  Lock,
  Building2,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Microscope,
  Sliders,
  ChevronLeft,
  Info
} from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: (prefilledEmail?: string) => void;
  onReturnToWebsite?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigateToLogin,
  onReturnToWebsite
}) => {
  const { signupUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    hospital: 'St. Jude Metropolitan Health System',
    role: 'DOCTOR',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 15;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;
    return Math.min(100, score);
  };

  const strength = getPasswordStrength(formData.password);

  const getStrengthLabel = () => {
    if (!formData.password) return { text: 'Empty', color: 'bg-slate-200', textCol: 'text-slate-400' };
    if (strength < 40) return { text: 'Weak', color: 'bg-rose-500', textCol: 'text-rose-600' };
    if (strength < 75) return { text: 'Moderate', color: 'bg-amber-500', textCol: 'text-amber-600' };
    return { text: 'Strong (Enterprise Ready)', color: 'bg-emerald-500', textCol: 'text-emerald-600' };
  };

  const strengthInfo = getStrengthLabel();

  // Role details
  const roleOptions: { role: UserRole; title: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'DOCTOR',
      title: 'Doctor (Attending Physician)',
      desc: 'Assigned patient care, CDS recommendations, risk score inspection',
      icon: Stethoscope,
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
    },
    {
      role: 'HOSPITAL_ADMIN',
      title: 'Hospital Administrator',
      desc: 'Facility-wide performance analytics, CMS penalties, bed occupancy',
      icon: Building2,
      color: 'border-blue-200 bg-blue-50/50 text-blue-900'
    },
    {
      role: 'HEALTHCARE_RESEARCHER',
      title: 'Healthcare Researcher',
      desc: 'Safe-Harbor de-identified datasets, statistical cohorts, research CSV exports',
      icon: Microscope,
      color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900'
    },
    {
      role: 'SYSTEM_ADMIN',
      title: 'System Administrator',
      desc: 'AI model registry, dataset ingestion pipeline, audit surveillance & users',
      icon: Sliders,
      color: 'border-purple-200 bg-purple-50/50 text-purple-900'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }
    if (!formData.hospital.trim()) {
      setErrorMessage('Please specify your affiliated hospital or organization.');
      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!formData.agreeToTerms) {
      setErrorMessage('You must acknowledge the HIPAA Compliance & Evaluation Terms.');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await signupUser(formData);
      setSuccessMessage(
        `Demo account successfully created for ${newUser.name} with role: ${newUser.role.replace('_', ' ')}! Redirecting to login...`
      );
      setTimeout(() => {
        onNavigateToLogin(newUser.email);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Bar */}
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

        <button
          onClick={() => onNavigateToLogin()}
          className="text-xs font-semibold text-slate-600 hover:text-sky-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </header>

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                Demo Account Provisioning
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create your HealthForecast AI account
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Join the clinical intelligence platform to evaluate predictive readmission hazard curves and patient risk analytics.
            </p>
          </div>

          {/* Important Institutional Disclaimer Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5">
                <span>Enterprise Healthcare Role Policy:</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold uppercase font-mono">
                  Demo Mode
                </span>
              </div>
              <p className="text-amber-800">
                In a production hospital environment, clinical role assignments (e.g. Attending Doctor vs Administrator) are governed strictly by hospital credentialing committees and IT identity providers. For evaluation in this sandbox, you may select your test role below.
              </p>
            </div>
          </div>

          {/* Feedback alerts */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name & Institutional Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Julian Croft"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. j.croft@stjudehealth.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Hospital / Organization */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hospital / Health System / Institution <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Jude Metropolitan Health System"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Role Selection (Page 6 Matrix) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assigned Clinical Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.role === opt.role;
                  return (
                    <div
                      key={opt.role}
                      onClick={() => setFormData({ ...formData, role: opt.role })}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? `${opt.color} border-sky-600 shadow-xs ring-2 ring-sky-500/20`
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white shadow-2xs border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {opt.title}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 ml-1" />}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 chars, mix of case & numbers"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Security Strength:</span>
                      <span className={`font-bold ${strengthInfo.textCol}`}>{strengthInfo.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthInfo.color} transition-all duration-300`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 mt-0.5"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to the <strong>HIPAA Safe-Harbor De-Identification terms</strong>, acknowledge that clinical predictions are advisory decision support metrics, and agree to the institutional data privacy governance.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering Demo Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration & Proceed to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom link to Sign In */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already have an institutional account? </span>
            <button
              onClick={() => onNavigateToLogin()}
              className="font-bold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer ml-1"
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-600">
        HealthForecast AI Hospital Risk Intelligence • Machine Learning Decision Support • HIPAA Safe-Harbor
      </footer>
    </div>
  );
};
