import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiActivity,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiShield,
  FiCpu,
  FiBarChart2,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/*
 * Backend UserRole values & Redirect mapping
 */
const ROLE_REDIRECTS = {
  Doctor: '/dashboard/doctor',
  'Hospital Admin': '/dashboard/admin',
  Researcher: '/dashboard/researcher',
  'System Admin': '/dashboard/sysadmin',
};

const ROLES_LIST = [
  { value: 'Doctor', label: 'Doctor', defaultEmail: 'sarah@hospital.com' },
  { value: 'Hospital Admin', label: 'Hospital Administrator', defaultEmail: 'admin@hospital.com' },
  { value: 'Researcher', label: 'Researcher', defaultEmail: 'researcher@hospital.com' },
  { value: 'System Admin', label: 'System Administrator', defaultEmail: 'sysadmin@hospital.com' },
];

const FEATURE_POINTS = [
  {
    icon: FiCpu,
    title: 'AI-powered patient risk prediction',
    desc: 'Machine learning readmission risk assessment tailored for clinical workflows.',
  },
  {
    icon: FiActivity,
    title: 'Clinical decision support',
    desc: 'Actionable risk intelligence delivered directly to attending care teams.',
  },
  {
    icon: FiShield,
    title: 'Secure patient management',
    desc: 'Enterprise-grade role-based access control and clinical data security.',
  },
  {
    icon: FiBarChart2,
    title: 'Healthcare analytics',
    desc: 'Real-time cohort insights and department performance monitoring.',
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('Doctor');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      selectedRole: 'Doctor',
      email: 'sarah@hospital.com',
      password: 'password',
    },
  });

  const selectRole = (roleVal) => {
    setActiveRole(roleVal);
    setValue('selectedRole', roleVal);
    const roleObj = ROLES_LIST.find((r) => r.value === roleVal);
    if (roleObj) {
      setValue('email', roleObj.defaultEmail);
      setValue('password', 'password');
    }
  };

  const onSubmit = async ({ email, password }) => {
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const role = user?.role;
      const normalizedRole = role?.toString().toLowerCase().replace(/\s+/g, '_');

      const redirectPath =
        location.state?.from?.pathname ||
        ROLE_REDIRECTS[role] ||
        (normalizedRole ? `/dashboard/${normalizedRole}` : '/');

      navigate(redirectPath, { replace: true });
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          e?.message ||
          'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* ───────────────── LEFT PANEL (Deep Navy/Blue/Violet Healthcare Visual Panel) ───────────────── */}
      <div 
        className="hidden lg:flex lg:w-[45%] xl:w-[44%] relative overflow-hidden flex-col justify-between p-10 xl:p-12 text-white border-r border-indigo-900/40"
        style={{
          background: 'linear-gradient(135deg, #0b1f4d 0%, #172f78 50%, #312e81 100%)',
        }}
      >
        {/* Soft Ambient Glow Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* TOP-LEFT BRANDING */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3 pt-2 pl-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-white/10">
            <FiActivity size={18} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-lg tracking-tight leading-none">
              CarePulse <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">AI</span>
            </span>
            <span className="text-[10px] font-bold text-slate-300/80 uppercase tracking-wider mt-1">
              HEALTHCARE MANAGEMENT PLATFORM
            </span>
          </div>
        </motion.div>

        {/* CENTER DECORATIVE ECG & TAGLINE */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            {/* Subtle ECG Waveform Graphic */}
            <div className="w-full h-28 relative flex items-center justify-center mb-3">
              <svg className="w-full h-full text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.5)]" viewBox="0 0 500 120" fill="none">
                <path
                  d="M0 60 L140 60 L155 35 L170 85 L185 15 L200 105 L215 60 L230 60 L242 45 L254 75 L266 60 L500 60"
                  stroke="url(#ecg-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#818CF8" stopOpacity="1" />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Small Center Tagline */}
            <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-300/90">
              Smarter care. Better outcomes.
            </p>
          </motion.div>
        </div>

        {/* BOTTOM EMPTY SPACER FOR BALANCE */}
        <div className="relative z-10 pb-2" />

      </div>

      {/* ───────────────── RIGHT PANEL / SIGN IN SECTION ───────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        
        {/* Top Back to Home navigation */}
        <div className="w-full max-w-md mb-6 flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xs">
              <FiArrowLeft size={13} />
            </span>
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Secure Access</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <FiActivity size={18} className="stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                CarePulse <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sign In</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Access your CarePulse AI workspace securely.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xl shadow-blue-500/5 transition-colors">
            
            {/* Role Selector Pills */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Healthcare Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES_LIST.map((r) => {
                  const isSelected = activeRole === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => selectRole(r.value)}
                      className={`text-xs font-semibold py-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{r.label}</span>
                      {isSelected && (
                        <FiCheckCircle size={13} className="text-white flex-shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      !
                    </span>
                    <span className="leading-snug">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="email"
                    placeholder="name@hospital.com"
                    className={`input-field pl-10 text-sm rounded-xl ${
                      errors.email ? 'border-rose-400 dark:border-rose-500' : ''
                    }`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </div>
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-field pl-10 pr-10 text-sm rounded-xl ${
                      errors.password ? 'border-rose-400 dark:border-rose-500' : ''
                    }`}
                    {...register('password', {
                      required: 'Password is required',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Sign In Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-primary w-full py-3 text-sm font-semibold mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight size={15} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}