import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiActivity, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const resetToken = location.state?.resetToken;

  if (!location.state?.verified || !resetToken) {
    navigate('/forgot-password');
    return null;
  }

  const onSubmit = async ({ password }) => {
    setLoading(true);
    setApiError('');
    try {
      await api.post('/auth/reset-password', { reset_token: resetToken, new_password: password });
      setLoading(false);
      setDone(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setLoading(false);
      setApiError(err?.response?.data?.detail || err?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden text-zinc-900 dark:text-zinc-100">
      
      <div className="absolute top-6 left-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-semibold transition-colors">
          <span className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-xs">
            <FiArrowLeft size={14} />
          </span>
          Back to Sign In
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center text-white dark:text-zinc-950 shadow-xs">
              <FiActivity size={18} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              CarePulse AI
            </span>
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                className="text-center py-4">
                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-900 dark:text-white">
                  <FiCheckCircle size={28} />
                </div>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">Password Reset!</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-4">
                  Your password has been updated securely.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <span className="w-3.5 h-3.5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                  Redirecting to sign in...
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Set New Password</h1>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed">
                    Choose a strong password to secure your CarePulse AI workspace.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`input-field pl-10 pr-10 text-sm ${errors.password ? 'border-red-400' : ''}`}
                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                      >
                        {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    {apiError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mt-2">
                        {apiError}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? 'Saving...' : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
