import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';

interface ForgotPasswordModalProps {
  onReturnToLogin: (prefilledEmail?: string) => void;
  onReturnToWebsite?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onReturnToLogin,
  onReturnToWebsite
}) => {
  const { requestReset, resetPassword } = useAuth();

  // Step: 'request' | 'simulated-email' | 'reset-form' | 'complete'
  const [step, setStep] = useState<'request' | 'simulated-email' | 'reset-form' | 'complete'>('request');

  const [email, setEmail] = useState('anita.sharma@stjudehealth.org');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 15;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;
    return Math.min(100, score);
  };

  const strength = getPasswordStrength(newPassword);

  const getStrengthLabel = () => {
    if (!newPassword) return { text: 'Empty', color: 'bg-slate-200', textCol: 'text-slate-400' };
    if (strength < 40) return { text: 'Weak', color: 'bg-rose-500', textCol: 'text-rose-600' };
    if (strength < 75) return { text: 'Moderate', color: 'bg-amber-500', textCol: 'text-amber-600' };
    return { text: 'Strong', color: 'bg-emerald-500', textCol: 'text-emerald-600' };
  };

  const strengthInfo = getStrengthLabel();

  // Handle request reset link
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestReset(email.trim());
      setResetToken(res.resetToken);
      setIsLoading(false);
      setStep('simulated-email');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process password reset request.');
      setIsLoading(false);
    }
  };

  // Handle setting new password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email.trim(), resetToken, newPassword);
      setIsLoading(false);
      setStep('complete');
      setSuccessMessage('Password updated successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Password update failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                HealthForecast
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase tracking-wider">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block leading-tight font-medium">
              Hospital Risk Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReturnToWebsite && (
            <button
              onClick={onReturnToWebsite}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Platform Overview
            </button>
          )}
          <button
            onClick={() => onReturnToLogin(email)}
            className="text-xs font-semibold text-slate-600 hover:text-sky-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10">
          
          {/* Step 1: Request Reset */}
          {step === 'request' && (
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Reset your password
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Enter your registered institutional email address. We will generate a secure reset link for your account.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Institutional Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. anita.sharma@stjudehealth.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Secure Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center">
                <button
                  onClick={() => onReturnToLogin()}
                  className="text-xs font-semibold text-slate-500 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Simulated Reset Email */}
          {step === 'simulated-email' && (
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
                <Mail className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  Demo Simulated Email
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2 tracking-tight">
                  Password Reset Link Generated
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  In a production environment, an automated email with a cryptographic token would be delivered to <strong className="text-slate-900">{email}</strong>.
                </p>
              </div>

              {/* Simulated Email Envelope Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 text-slate-500">
                  <span>From: security@healthforecast.ai</span>
                  <span className="font-mono text-[11px]">Token: {resetToken}</span>
                </div>
                <div className="text-xs text-slate-700 space-y-2">
                  <p className="font-semibold text-slate-900">Subject: Reset your HealthForecast AI credentials</p>
                  <p className="text-slate-600 leading-relaxed">
                    A password reset request was initiated for your clinical account. Click the button below to set your new password.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setStep('reset-form')}
                    className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Simulate Clicking Email Link (Set New Password)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setStep('request')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try a different email address</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: New Password Form */}
          {step === 'reset-form' && (
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Set new password
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Updating credentials for: <strong className="text-slate-900">{email}</strong>
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new password (min 8 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Strength:</span>
                        <span className={`font-bold ${strengthInfo.textCol}`}>{strengthInfo.text}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strengthInfo.color} transition-all duration-300`}
                          style={{ width: `${strength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Password Successfully Reset
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your credentials have been updated. You can now sign in with your new password.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onReturnToLogin(email)}
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-600">
        HealthForecast AI Hospital Risk Intelligence • Machine Learning Decision Support • HIPAA Safe-Harbor
      </footer>
    </div>
  );
};
