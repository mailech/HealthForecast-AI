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
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiCpu,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/*
 * Backend UserRole values:
 * Doctor
 * Hospital Admin
 * Researcher
 * System Admin
 */
const ROLE_REDIRECTS = {
  Doctor: '/dashboard/doctor',
  'Hospital Admin': '/dashboard/admin',
  Researcher: '/dashboard/researcher',
  'System Admin': '/dashboard/sysadmin',
};

/*
 * Demo accounts are kept only for UI convenience.
 * They will work only if these users actually exist
 * in the backend database with these credentials.
 */
const DEMO_ACCOUNTS = [
  {
    label: 'Doctor',
    name: 'Dr. Sarah Mitchell',
    email: 'sarah@hospital.com',
    password: 'password',
    role: 'Doctor',
    dept: 'Cardiology',
    emoji: '🩺',
    color: 'blue',
  },
  {
    label: 'Hospital Admin',
    name: 'James Carter',
    email: 'admin@hospital.com',
    password: 'password',
    role: 'Hospital Admin',
    dept: 'Administration',
    emoji: '🏥',
    color: 'violet',
  },
  {
    label: 'Researcher',
    name: 'Dr. Emily Chen',
    email: 'researcher@hospital.com',
    password: 'password',
    role: 'Researcher',
    dept: 'Research & Analytics',
    emoji: '🔬',
    color: 'emerald',
  },
  {
    label: 'Sys Admin',
    name: 'Alex Turner',
    email: 'sysadmin@hospital.com',
    password: 'password',
    role: 'System Admin',
    dept: 'IT & Infrastructure',
    emoji: '⚙️',
    color: 'orange',
  },
];

const COLOR = {
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500/30',
  },
  violet: {
    border: 'border-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    ring: 'ring-violet-500/30',
  },
  emerald: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
  },
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    ring: 'ring-orange-500/30',
  },
};

const LEFT_STATS = [
  {
    icon: FiCpu,
    value: '94.2%',
    label: 'AI Accuracy',
  },
  {
    icon: FiTrendingUp,
    value: '30%',
    label: 'Readmission Reduction',
  },
  {
    icon: FiUsers,
    value: '1,200+',
    label: 'Patients Monitored',
  },
  {
    icon: FiShield,
    value: '100%',
    label: 'HIPAA Compliant',
  },
];

export default function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const pickDemo = (account) => {
    setSelected(account);

    setValue('email', account.email);
    setValue('password', account.password);

    setError('');
  };

  const onSubmit = async ({ email, password }) => {
    setError('');
    setLoading(true);

    try {
      /*
       * AuthContext login now connects to the real backend.
       */
      const user = await login(email, password);

      /*
       * Backend role is used for redirect.
       */
      const role = user?.role;

      const from =
        location.state?.from?.pathname ||
        ROLE_REDIRECTS[role] ||
        '/';

      navigate(from, { replace: true });
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
    <div className="min-h-screen flex">

      {/* ───────────────── LEFT PANEL ───────────────── */}

      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            'linear-gradient(135deg, #1e3a8a 0%, #2563eb 45%, #7c3aed 100%)',
        }}
      >

        {/* Noise background */}

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />

        {/* Animated blobs */}

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 12, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"
        />

        {/* Logo */}

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
            <FiActivity className="text-white" size={20} />
          </div>

          <span className="text-white font-bold text-xl tracking-tight">
            HealthForecast{' '}
            <span className="text-blue-200">AI</span>
          </span>
        </motion.div>

        {/* Center content */}

        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >

            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 mb-6">
              🏥 Healthcare AI Platform
            </span>

            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Predict Patient
              <br />

              <span className="text-blue-200">
                Readmissions
              </span>

              <br />

              with AI Precision
            </h2>

            <p className="text-blue-100/80 text-base leading-relaxed mb-10 max-w-sm">
              Empowering clinicians with real-time risk intelligence
              and data-driven insights to improve patient outcomes.
            </p>

          </motion.div>

          {/* Floating dashboard */}

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative"
          >

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl"
            >

              <div className="flex items-center justify-between mb-4">

                <div>
                  <p className="text-white/60 text-xs font-medium">
                    Live Risk Monitor
                  </p>

                  <p className="text-white font-bold text-sm">
                    Patient Alerts
                  </p>
                </div>

                <span className="flex items-center gap-1.5 bg-green-400/20 text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-400/30">

                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />

                  Live
                </span>

              </div>

              {[
                {
                  name: 'Robert Kim',
                  risk: 91,
                  bar: 'bg-purple-400',
                },
                {
                  name: 'John Anderson',
                  risk: 87,
                  bar: 'bg-red-400',
                },
                {
                  name: 'David Wilson',
                  risk: 75,
                  bar: 'bg-orange-400',
                },
                {
                  name: 'Maria Garcia',
                  risk: 62,
                  bar: 'bg-yellow-400',
                },
              ].map((p, i) => (

                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + i * 0.08,
                  }}
                  className="flex items-center gap-3 mb-3 last:mb-0"
                >

                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {p.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex justify-between mb-1">

                      <span className="text-white/80 text-xs truncate">
                        {p.name}
                      </span>

                      <span className="text-white text-xs font-bold ml-2">
                        {p.risk}%
                      </span>

                    </div>

                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p.risk}%` }}
                        transition={{
                          duration: 1,
                          delay: 0.5 + i * 0.1,
                        }}
                        className={`h-full rounded-full ${p.bar}`}
                      />

                    </div>

                  </div>

                </motion.div>

              ))}

            </motion.div>

            {/* Accuracy chip */}

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl px-3 py-2 border border-slate-100"
            >
              <p className="text-xs text-slate-400">
                Model Accuracy
              </p>

              <p className="text-base font-extrabold text-blue-600">
                94.2%
              </p>
            </motion.div>

            {/* Alerts chip */}

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
              className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl px-3 py-2 border border-slate-100"
            >
              <p className="text-xs text-slate-400">
                Alerts Today
              </p>

              <p className="text-base font-extrabold text-red-500">
                3 Active
              </p>
            </motion.div>

          </motion.div>

        </div>

        {/* Stats */}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.4,
          }}
          className="relative z-10 grid grid-cols-4 gap-3"
        >

          {LEFT_STATS.map((s, i) => {

            const Icon = s.icon;

            return (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 text-center"
              >

                <Icon
                  className="text-white/70 mx-auto mb-1"
                  size={14}
                />

                <p className="text-white font-extrabold text-sm">
                  {s.value}
                </p>

                <p className="text-white/50 text-xs leading-tight mt-0.5">
                  {s.label}
                </p>

              </div>
            );
          })}

        </motion.div>

      </div>

      {/* ───────────────── RIGHT PANEL ───────────────── */}

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 bg-slate-50 overflow-y-auto">

        {/* Back */}

        <div className="w-full max-w-md mb-4">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors group"
          >

            <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors shadow-sm">
              <FiArrowLeft size={13} />
            </span>

            Back to Home

          </Link>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >

          {/* Mobile logo */}

          <div className="lg:hidden flex items-center gap-2 mb-6">

            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiActivity
                className="text-white"
                size={18}
              />
            </div>

            <span className="font-bold text-slate-800 text-lg">
              HealthForecast{' '}
              <span className="text-blue-600">
                AI
              </span>
            </span>

          </div>

          {/* Heading */}

          <div className="mb-7">

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back 👋
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              Sign in to your healthcare dashboard
            </p>

          </div>

          {/* Demo role cards */}

          <div className="mb-5">

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Quick Demo — Select a Role
            </p>

            <div className="grid grid-cols-2 gap-2">

              {DEMO_ACCOUNTS.map((a) => {

                const c = COLOR[a.color];
                const active =
                  selected?.email === a.email;

                return (

                  <motion.button
                    key={a.email}
                    type="button"
                    whileHover={{
                      scale: 1.02,
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={() => pickDemo(a)}
                    className={`relative text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                      active
                        ? `${c.border} ${c.bg} ring-2 ${c.ring}`
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >

                    <div className="flex items-center gap-2 mb-0.5">

                      <span className="text-sm">
                        {a.emoji}
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          active
                            ? c.text
                            : 'text-slate-700'
                        }`}
                      >
                        {a.label}
                      </span>

                      {active && (
                        <FiCheckCircle
                          size={11}
                          className={`ml-auto ${c.text}`}
                        />
                      )}

                    </div>

                    <p className="text-xs text-slate-400 truncate">
                      {a.name}
                    </p>

                  </motion.button>

                );
              })}

            </div>

          </div>

          {/* Selected account banner */}

          <AnimatePresence mode="wait">

            {selected && (

              <motion.div
                key={selected.email}
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -8,
                }}
                transition={{ duration: 0.22 }}
                className={`mb-5 rounded-xl p-3.5 border ${
                  COLOR[selected.color].bg
                } ${
                  COLOR[selected.color].border
                } border-opacity-40`}
              >

                <div className="flex items-center gap-3">

                  <span className="text-2xl">
                    {selected.emoji}
                  </span>

                  <div>

                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        COLOR[selected.color].text
                      }`}
                    >
                      {selected.label}
                    </p>

                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      Welcome Back, {selected.name} 👋
                    </p>

                    <p className="text-xs text-slate-500">
                      {selected.dept}
                    </p>

                  </div>

                </div>

              </motion.div>

            )}

          </AnimatePresence>

          {/* Login form */}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >

              <AnimatePresence>

                {error && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -6,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2"
                  >

                    <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      !
                    </span>

                    {error}

                  </motion.div>

                )}

              </AnimatePresence>

              {/* Email */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>

                <div className="relative">

                  <FiMail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />

                  <input
                    type="email"
                    placeholder="you@hospital.com"
                    className={`input-field pl-10 ${
                      errors.email
                        ? 'border-red-400'
                        : ''
                    }`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email',
                      },
                    })}
                  />

                </div>

                {errors.email && (

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.email.message}
                  </motion.p>

                )}

              </div>

              {/* Password */}

              <div>

                <div className="flex items-center justify-between mb-1.5">

                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="relative">

                  <FiLock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />

                  <input
                    type={
                      showPass
                        ? 'text'
                        : 'password'
                    }
                    placeholder="••••••••"
                    className={`input-field pl-10 pr-10 ${
                      errors.password
                        ? 'border-red-400'
                        : ''
                    }`}
                    {...register('password', {
                      required:
                        'Password is required',
                      minLength: {
                        value: 8,
                        message:
                          'Minimum 8 characters',
                      },
                    })}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPass(!showPass)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? (
                      <FiEyeOff size={15} />
                    ) : (
                      <FiEye size={15} />
                    )}
                  </button>

                </div>

                {errors.password && (

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.password.message}
                  </motion.p>

                )}

              </div>

              {/* Submit */}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{
                  scale: loading ? 1 : 1.01,
                }}
                whileTap={{
                  scale: loading ? 1 : 0.98,
                }}
                className="btn-primary w-full py-3 text-sm font-semibold mt-1"
              >

                {loading ? (

                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>

                ) : (

                  <>
                    <span>
                      Sign In
                    </span>

                    <FiArrowRight size={15} />
                  </>

                )}

              </motion.button>

            </form>

            <p className="text-center text-sm text-slate-500 mt-5">

              Don't have an account?{' '}

              <Link
                to="/register"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Create account
              </Link>

            </p>

          </div>

        </motion.div>

      </div>

    </div>
  );
}