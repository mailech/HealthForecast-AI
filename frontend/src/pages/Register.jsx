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
  { value: 'Doctor', label: 'Doctor', defaultEmail: 'sarah@hospital.com' },
  { value: 'Hospital Admin', label: 'Hospital Administrator', defaultEmail: 'admin@hospital.com' },
  { value: 'Researcher', label: 'Researcher', defaultEmail: 'researcher@hospital.com' },
  { value: 'System Admin', label: 'System Administrator', defaultEmail: 'sysadmin@hospital.com' },
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

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden flex-col justify-between p-12 bg-zinc-950 text-white border-r border-zinc-800">
        
        {/* Top Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-950 shadow-xs">
            <FiActivity size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-white font-extrabold text-xl tracking-tight">
              CarePulse AI
            </span>
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Healthcare Intelligence Platform
            </p>
          </div>
        </motion.div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-3 tracking-tight">
              Join the Future of Healthcare AI
            </h2>

            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs">
              Create your account to access clinical intelligence and risk evaluation dashboards.
            </p>

            <div className="space-y-3.5">
              {PERKS.map((perk, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle size={11} className="text-zinc-300" />
                  </div>
                  <span className="text-zinc-300 text-xs font-medium">
                    {perk}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-10 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center border border-zinc-700">
                <FiShield size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Enterprise Access Control</p>
                <p className="text-[11px] text-zinc-400">Strict RBAC & JWT Authorization</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-zinc-500 text-xs">
          &copy; 2026 CarePulse AI
        </p>
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
                    placeholder="Dr. Sarah Johnson"
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
                    placeholder="sarah@hospital.com"
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
                    placeholder="+1 555-0199"
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
                    placeholder="••••••••"
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