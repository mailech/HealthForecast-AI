import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiActivity, FiArrowLeft, FiShield } from 'react-icons/fi';
import api from '../services/api';

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const maskedEmail = location.state?.maskedEmail || email || 'your email';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);

  /* countdown timer */
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = async () => {
    if (!email) return;
    setError('');
    setResendMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setResendMsg('New verification code sent to your email.');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to resend verification code.');
    }
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
    setResendMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { email, otp: code });
      setLoading(false);
      const resetToken = response.data?.reset_token;
      navigate('/reset-password', { state: { email, resetToken, verified: true } });
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.detail || err?.message || 'Invalid verification code.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden text-zinc-900 dark:text-zinc-100">
      
      {/* Back */}
      <div className="absolute top-6 left-6">
        <Link to="/forgot-password" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-semibold transition-colors">
          <span className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-xs">
            <FiArrowLeft size={14} />
          </span>
          Back
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
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Verify Code</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed">
              Verification code sent to <span className="font-semibold text-slate-800 dark:text-slate-200">{maskedEmail}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => (inputs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none"
                />
              ))}
            </div>

            {error && <p className="text-xs text-rose-600 dark:text-rose-400 text-center font-medium">{error}</p>}
            {resendMsg && <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">{resendMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              {loading ? 'Verifying...' : 'Verify & Proceed'}
            </button>

            <div className="text-center text-xs text-zinc-500">
              {canResend ? (
                <button type="button" onClick={handleResend} className="font-bold text-zinc-900 dark:text-white hover:underline">
                  Resend verification code
                </button>
              ) : (
                <span>Resend code in {countdown}s</span>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
