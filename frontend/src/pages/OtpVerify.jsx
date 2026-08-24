import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiArrowLeft, FiShield, FiRefreshCw } from 'react-icons/fi';

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);

  /* countdown timer */
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputs.current[0]?.focus();
  };

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    if (code === '123456') {
      navigate('/reset-password', { state: { email, verified: true } });
    } else {
      setError('Invalid OTP. Use 123456 for demo.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background blobs */}
      <motion.div animate={{ scale:[1,1.15,1] }} transition={{ duration:20, repeat:Infinity, ease:'easeInOut' }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:25, repeat:Infinity, ease:'easeInOut', delay:5 }}
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Back */}
      <div className="absolute top-6 left-6">
        <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors group">
          <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors shadow-sm">
            <FiArrowLeft size={14} />
          </span>
          Back
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

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale:0 }} animate={{ scale:1 }}
              transition={{ type:'spring', stiffness:200, damping:15 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <FiShield className="text-white" size={28} />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Your Email</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Enter the 6-digit code sent to<br />
              <span className="font-semibold text-slate-700">{email}</span>
            </p>
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100 mt-3">
              Demo OTP: <span className="font-extrabold tracking-widest">123456</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP boxes */}
            <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
              {otp.map((d, i) => (
                <motion.input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  whileFocus={{ scale:1.08 }}
                  transition={{ type:'spring', stiffness:300, damping:20 }}
                  className={`w-12 h-14 text-center text-xl font-extrabold rounded-2xl border-2 transition-all duration-200 outline-none
                    ${d ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-400 focus:bg-white focus:shadow-sm focus:shadow-blue-500/15'}`}
                />
              ))}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5">
              {otp.map((d, i) => (
                <motion.div key={i}
                  animate={{ scale: d ? 1.2 : 1, backgroundColor: d ? '#2563eb' : '#e2e8f0' }}
                  transition={{ duration:0.15 }}
                  className="w-1.5 h-1.5 rounded-full" />
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl text-center">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading || filled < 6}
              whileHover={{ scale: (loading || filled < 6) ? 1 : 1.01 }}
              whileTap={{ scale: (loading || filled < 6) ? 1 : 0.98 }}
              className={`btn-primary w-full py-3 text-sm font-semibold transition-opacity ${filled < 6 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                : 'Verify Code'
              }
            </motion.button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            {canResend ? (
              <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }}
                onClick={handleResend}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                <FiRefreshCw size={14} /> Resend Code
              </motion.button>
            ) : (
              <p className="text-sm text-slate-400">
                Resend code in{' '}
                <span className="font-bold text-slate-600 tabular-nums">
                  0:{String(countdown).padStart(2, '0')}
                </span>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Wrong email?{' '}
          <Link to="/forgot-password" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Go back</Link>
        </p>
      </motion.div>
    </div>
  );
}
