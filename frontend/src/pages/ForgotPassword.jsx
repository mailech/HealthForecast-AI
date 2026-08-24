import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiActivity, FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
    setTimeout(() => navigate('/otp-verify', { state: { email } }), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background blobs */}
      <motion.div animate={{ scale:[1,1.15,1], rotate:[0,10,0] }} transition={{ duration:20, repeat:Infinity, ease:'easeInOut' }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ scale:[1,1.1,1], rotate:[0,-8,0] }} transition={{ duration:25, repeat:Infinity, ease:'easeInOut', delay:5 }}
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Back */}
      <div className="absolute top-6 left-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors group">
          <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors shadow-sm">
            <FiArrowLeft size={14} />
          </span>
          Back to Sign In
        </Link>
      </div>

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
        className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <FiActivity className="text-white" size={20} />
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">
              HealthForecast <span className="text-blue-600">AI</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-premium p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent"
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0 }} transition={{ duration:0.35 }}
                className="text-center py-4">
                <motion.div
                  initial={{ scale:0 }} animate={{ scale:1 }}
                  transition={{ type:'spring', stiffness:200, damping:15, delay:0.1 }}
                  className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
                  <FiCheckCircle className="text-white" size={36} />
                </motion.div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">OTP Sent!</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  We've sent a 6-digit verification code to your email address.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <span className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                  Redirecting to verification...
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <FiMail className="text-blue-600" size={22} />
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password?</h1>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                    No worries. Enter your email and we'll send you a reset code.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input type="email" placeholder="you@hospital.com"
                        className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                        {...register('email', { required:'Email is required', pattern:{ value:/^\S+@\S+$/i, message:'Invalid email' } })} />
                    </div>
                    {errors.email && (
                      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-red-500 text-xs mt-1">
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>

                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="btn-primary w-full py-3 text-sm font-semibold">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP...</>
                      : <><span>Send Reset Code</span><FiArrowRight size={15} /></>
                    }
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
