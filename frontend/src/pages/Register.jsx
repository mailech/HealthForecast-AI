import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'Doctor', label: 'Doctor' },
  { value: 'Hospital Admin', label: 'Hospital Administrator' },
  { value: 'Researcher', label: 'Researcher' },
  { value: 'System Admin', label: 'System Administrator' },
];

const PERKS = [
  'AI-powered readmission prediction',
  'Real-time patient risk monitoring',
  'Role-based clinical dashboards',
  'Secure healthcare data management',
];

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Doctor');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'Doctor',
      full_name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const password = watch('password', '');

  const pickRole = (role) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const userData = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        password: data.password,
        role: data.role,
      };

      await registerUser(userData);
      navigate('/login', { state: { registered: true } });
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
        e?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fafafa] dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">

      {/* ───────────────── LEFT PANEL (Deep Navy/Blue Healthcare Visual Panel) ───────────────── */}
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
              HEALTHCARE INTELLIGENCE PLATFORM
            </span>
          </div>
        </motion.div>

        {/* CENTER DECORATIVE ECG & TAGLINE */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-sm flex flex-col items-center space-y-4"
          >
            {/* Medical Heartbeat / ECG Waveform Graphic */}
            <div className="w-full h-28 relative flex items-center justify-center mb-1">
              <svg className="w-full h-full text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.5)]" viewBox="0 0 500 120" fill="none">
                <path
                  d="M0 60 L140 60 L155 35 L170 85 L185 15 L200 105 L215 60 L230 60 L242 45 L254 75 L266 60 L500 60"
                  stroke="url(#ecg-gradient-reg)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="ecg-gradient-reg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#818CF8" stopOpacity="1" />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Center Text */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              Connected Care. Smarter Decisions.
            </h3>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-300/90 max-w-xs">
              A unified platform for modern healthcare management.
            </p>
          </motion.div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="relative z-10 text-xs text-slate-400/80 pl-1 pb-1">
          &copy; 2026 CarePulse AI
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-lg mb-4 flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-semibold transition-colors"
          >
            <span className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-xs">
              <FiArrowLeft size={13} />
            </span>
            Back to Home
          </Link>
          <span className="text-[11px] font-semibold text-zinc-400">Account Setup</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-lg"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Create Your Account
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
              Join the CarePulse AI healthcare intelligence platform.
            </p>
          </div>

          {/* ROLE SELECTOR */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Select Healthcare Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => {
                const active = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => pickRole(role.value)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs font-semibold flex items-center justify-between ${
                      active
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span className="truncate">{role.label}</span>
                    {active && <FiCheckCircle size={13} className="text-white dark:text-zinc-900 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register('role', { required: 'Please select a role' })} />
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>

          {/* FORM CARD */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs p-3.5 rounded-xl">
                    {error}
                  </div>
                )}
              </AnimatePresence>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className={`input-field pl-10 text-sm ${errors.full_name ? 'border-red-400' : ''}`}
                    {...register('full_name', { required: 'Full name is required' })}
                  />
                </div>
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className={`input-field pl-10 text-sm ${errors.email ? 'border-red-400' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                    })}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    className="input-field pl-10 text-sm"
                    {...register('phone')}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className={`input-field pl-10 pr-10 text-sm ${errors.password ? 'border-red-400' : ''}`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  >
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs text-zinc-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-zinc-900 dark:text-white font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}