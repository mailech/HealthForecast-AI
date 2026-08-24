import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiActivity, FiCheckCircle, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

function getStrength(pw) {
  if (!pw) return { score:0, label:'', color:'' };
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score:s, label:'Weak',   color:'bg-red-500'    };
  if (s <= 3) return { score:s, label:'Fair',   color:'bg-yellow-500' };
  if (s <= 4) return { score:s, label:'Good',   color:'bg-blue-500'   };
  return              { score:s, label:'Strong', color:'bg-emerald-500' };
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');
  const strength = getStrength(password);

  if (!location.state?.verified) {
    navigate('/forgot-password');
    return null;
  }

  const onSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setDone(true);
    setTimeout(() => navigate('/login'), 2200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background blobs */}
      <motion.div animate={{ scale:[1,1.15,1] }} transition={{ duration:20, repeat:Infinity, ease:'easeInOut' }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:25, repeat:Infinity, ease:'easeInOut', delay:5 }}
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
            {done ? (
              <motion.div key="done"
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0 }} transition={{ duration:0.35 }}
                className="text-center py-4">
                <motion.div
                  initial={{ scale:0 }} animate={{ scale:1 }}
                  transition={{ type:'spring', stiffness:200, damping:15, delay:0.1 }}
                  className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
                  <FiCheckCircle className="text-white" size={36} />
                </motion.div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">Password Reset!</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Your password has been updated successfully.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <span className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                  Redirecting to sign in...
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <FiLock className="text-blue-600" size={22} />
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create New Password</h1>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                    Your new password must be at least 6 characters long.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input type={showPass ? 'text' : 'password'} placeholder="Min 6 characters"
                        className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                        {...register('password', { required:'Password is required', minLength:{ value:6, message:'Min 6 characters' } })} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    {/* Strength meter */}
                    {password && (
                      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4,5].map(n => (
                            <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.score ? strength.color : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <p className={`text-xs font-semibold ${strength.score <= 1 ? 'text-red-500' : strength.score <= 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                          Password strength: {strength.label}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
                        className={`input-field pl-10 pr-10 ${errors.confirm ? 'border-red-400' : ''}`}
                        {...register('confirm', { required:'Please confirm', validate: v => v === password || 'Passwords do not match' })} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                    {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
                  </div>

                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="btn-primary w-full py-3 text-sm font-semibold mt-1">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
                      : <><span>Reset Password</span><FiArrowRight size={15} /></>
                    }
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
