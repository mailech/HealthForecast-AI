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
  {
    value: 'Doctor',
    label: 'Doctor',
    emoji: '🩺',
    color: 'blue',
  },
  {
    value: 'Hospital Admin',
    label: 'Hospital Administrator',
    emoji: '🏥',
    color: 'violet',
  },
  {
    value: 'Researcher',
    label: 'Healthcare Researcher',
    emoji: '🔬',
    color: 'emerald',
  },
  {
    value: 'System Admin',
    label: 'System Administrator',
    emoji: '⚙️',
    color: 'orange',
  },
];

const COLOR = {
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-500/30',
  },
  violet: {
    border: 'border-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    ring: 'ring-violet-500/30',
  },
  emerald: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500/30',
  },
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-500/30',
  },
};

function getStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: '',
      color: '',
    };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return {
      score,
      label: 'Weak',
      color: 'bg-red-500',
    };
  }

  if (score <= 3) {
    return {
      score,
      label: 'Fair',
      color: 'bg-yellow-500',
    };
  }

  if (score <= 4) {
    return {
      score,
      label: 'Good',
      color: 'bg-blue-500',
    };
  }

  return {
    score,
    label: 'Strong',
    color: 'bg-emerald-500',
  };
}

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
  const [selectedRole, setSelectedRole] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');
  const strength = getStrength(password);

  const pickRole = (role) => {
    setSelectedRole(role);

    setValue('role', role, {
      shouldValidate: true,
    });
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

      navigate('/login', {
        state: {
          registered: true,
        },
      });
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
    <div className="min-h-screen flex">

      {/* LEFT PANEL */}

      <div
        className="hidden lg:flex lg:w-[44%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)',
        }}
      >

        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 5,
          }}
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl"
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
            <span className="text-blue-200">
              AI
            </span>
          </span>
        </motion.div>

        {/* Content */}

        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
          >

            <h2 className="text-3xl font-extrabold text-white leading-tight mb-3 tracking-tight">
              Join the Future
              <br />
              of{' '}
              <span className="text-blue-200">
                Healthcare AI
              </span>
            </h2>

            <p className="text-blue-100/75 text-sm leading-relaxed mb-8 max-w-xs">
              Create your account and get access to AI-powered patient
              risk intelligence.
            </p>

            <div className="space-y-3">

              {PERKS.map((perk, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.08,
                  }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle
                      size={11}
                      className="text-white"
                    />
                  </div>

                  <span className="text-white/80 text-sm">
                    {perk}
                  </span>
                </motion.div>
              ))}

            </div>

          </motion.div>

          {/* Security card */}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.35,
            }}
            className="mt-10"
          >

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5"
            >

              <div className="flex items-center gap-3 mb-4">

                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiShield
                    className="text-white"
                    size={16}
                  />
                </div>

                <div>
                  <p className="text-white font-semibold text-sm">
                    Secure Authentication
                  </p>

                  <p className="text-white/50 text-xs">
                    JWT · Role Based Access
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-3 gap-2">

                {[
                  'JWT Security',
                  'Role-based Access',
                  'Protected API',
                ].map((text, index) => (
                  <div
                    key={index}
                    className="bg-white/10 rounded-lg px-2 py-1.5 text-center"
                  >
                    <p className="text-white/70 text-xs font-medium">
                      {text}
                    </p>
                  </div>
                ))}

              </div>

            </motion.div>

          </motion.div>

        </div>

        <p className="relative z-10 text-white/40 text-xs">
          © 2026 HealthForecast AI
        </p>

      </div>

      {/* RIGHT PANEL */}

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 bg-slate-50 overflow-y-auto">

        <div className="w-full max-w-lg mb-4">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors group"
          >
            <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <FiArrowLeft size={13} />
            </span>

            Back to Home
          </Link>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-lg"
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

          <div className="mb-6">

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create your account
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              Join the healthcare intelligence platform
            </p>

          </div>

          {/* ROLE */}

          <div className="mb-5">

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Select Your Role
            </p>

            <div className="grid grid-cols-2 gap-2">

              {ROLES.map((role) => {

                const c = COLOR[role.color];

                const active =
                  selectedRole === role.value;

                return (
                  <motion.button
                    key={role.value}
                    type="button"
                    whileHover={{
                      scale: 1.02,
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={() =>
                      pickRole(role.value)
                    }
                    className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                      active
                        ? `${c.border} ${c.bg} ring-2 ${c.ring}`
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >

                    <div className="flex items-center gap-2">

                      <span className="text-base">
                        {role.emoji}
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          active
                            ? c.text
                            : 'text-slate-700'
                        }`}
                      >
                        {role.label}
                      </span>

                      {active && (
                        <FiCheckCircle
                          size={11}
                          className={`ml-auto ${c.text}`}
                        />
                      )}

                    </div>

                  </motion.button>
                );
              })}

            </div>

            <input
              type="hidden"
              {...register('role', {
                required: 'Please select a role',
              })}
            />

            {errors.role && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.role.message}
              </p>
            )}

          </div>

          {/* FORM */}

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
                    className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}

              </AnimatePresence>

              {/* FULL NAME */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>

                <div className="relative">

                  <FiUser
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />

                  <input
                    type="text"
                    placeholder="Dr. John Smith"
                    className={`input-field pl-10 ${
                      errors.full_name
                        ? 'border-red-400'
                        : ''
                    }`}
                    {...register('full_name', {
                      required:
                        'Full name is required',
                      minLength: {
                        value: 2,
                        message:
                          'Minimum 2 characters',
                      },
                    })}
                  />

                </div>

                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.full_name.message}
                  </p>
                )}

              </div>

              {/* EMAIL */}

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
                      required:
                        'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message:
                          'Invalid email',
                      },
                    })}
                  />

                </div>

                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}

              </div>

              {/* PHONE */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>

                <div className="relative">

                  <FiPhone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />

                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="input-field pl-10"
                    {...register('phone')}
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>

                <div className="relative">

                  <FiLock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />

                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPass ? (
                      <FiEyeOff size={15} />
                    ) : (
                      <FiEye size={15} />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}

                {password && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2"
                  >

                    <div className="flex gap-1 mb-1">

                      {[1, 2, 3, 4, 5].map(
                        (n) => (
                          <div
                            key={n}
                            className={`h-1 flex-1 rounded-full ${
                              n <= strength.score
                                ? strength.color
                                : 'bg-slate-200'
                            }`}
                          />
                        )
                      )}

                    </div>

                    <p className="text-xs font-semibold">
                      {strength.label}
                    </p>

                  </motion.div>
                )}

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>

                <div className="relative">

                  <FiLock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />

                  <input
                    type="password"
                    placeholder="Repeat password"
                    className={`input-field pl-10 ${
                      errors.confirm
                        ? 'border-red-400'
                        : ''
                    }`}
                    {...register('confirm', {
                      required:
                        'Please confirm password',
                      validate: (value) =>
                        value === password ||
                        'Passwords do not match',
                    })}
                  />

                </div>

                {errors.confirm && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirm.message}
                  </p>
                )}

              </div>

              {/* SUBMIT */}

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
                    Creating account...
                  </>
                ) : (
                  <>
                    <span>
                      Create Account
                    </span>
                    <FiArrowRight size={15} />
                  </>
                )}

              </motion.button>

            </form>

            <p className="text-center text-sm text-slate-500 mt-5">

              Already have an account?{' '}

              <Link
                to="/login"
                className="text-blue-600 font-bold hover:text-blue-700"
              >
                Sign in
              </Link>

            </p>

          </div>

        </motion.div>

      </div>

    </div>
  );
}