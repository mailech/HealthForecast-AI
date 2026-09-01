import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Activity,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = pathToken || searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Validate token presence
    const timer = setTimeout(() => {
      if (!token || token.trim() === "") {
        setTokenValid(false);
        setErrorMessage("No password reset token provided. Please request a new link.");
      } else {
        setTokenValid(true);
      }
      setValidating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!password) {
      setErrorMessage("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify and try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        toast.success("Password reset successfully!", {
          description: "You may now sign in with your new credentials.",
        });
      } else {
        const errorMsg = data.message || data.error || "Password reset failed. Please check your token or try requesting a new link.";
        setErrorMessage(errorMsg);
        toast.error("Password Reset Failed", {
          description: errorMsg,
        });
      }
    } catch (err) {
      console.error("Backend reset error:", err.message);
      const errorMsg = "Unable to connect to authentication server. Please try again.";
      setErrorMessage(errorMsg);
      toast.error("Network Error", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06090e] bg-cyber-grid text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      {/* Animated Cyber Emerald Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none animate-mesh-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[140px] pointer-events-none animate-mesh-pulse" />

      {/* Main Container Card */}
      <div className="w-full max-w-md glass-panel rounded-3xl border border-white/10 shadow-2xl p-8 z-10">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 glow-emerald">
            <Activity size={26} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
              HealthForecast <span className="text-emerald-400 font-mono">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Security Governance Suite</p>
          </div>
        </div>

        {/* State 1: Token Validation Spinner */}
        {validating && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 size={36} className="text-emerald-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400">Validating Cyber Emerald token...</p>
          </div>
        )}

        {/* State 2: Invalid or Missing Token Error */}
        {!validating && !tokenValid && (
          <div className="py-6 space-y-6 text-center">
            <div className="mx-auto w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400">
              <AlertCircle size={24} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-100">Invalid Reset Token</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{errorMessage}</p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl font-medium transition text-xs"
            >
              <ArrowLeft size={16} />
              Return to Sign In
            </Link>
          </div>
        )}

        {/* State 3: Reset Success Screen */}
        {!validating && tokenValid && submitted && (
          <div className="py-6 space-y-6 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-500/15 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 glow-emerald">
              <CheckCircle2 size={26} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-100">Password Reset Complete</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your hospital staff credentials have been updated successfully. You may now sign in using your new password.
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-2xl font-extrabold transition text-xs shadow-lg glow-emerald flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Proceed to Sign In</span>
            </button>
          </div>
        )}

        {/* State 4: Reset Password Form */}
        {!validating && tokenValid && !submitted && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <KeyRound size={20} className="text-emerald-400" />
                Reset Account Password
              </h2>
              <p className="text-xs text-slate-400">Enter a new secure password for your hospital account.</p>
            </div>

            {/* Token Badge */}
            {token && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-sans font-medium">
                  <ShieldCheck size={14} /> Security Token:
                </span>
                <span className="truncate max-w-[160px] text-emerald-300 font-bold">{token}</span>
              </div>
            )}

            {/* Inline Error Alert */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-sans">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Password</label>
                <div className="relative flex items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-3 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15 transition">
                  <Lock size={16} className="text-slate-500 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-transparent ml-2.5 text-xs text-slate-100 outline-none placeholder-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-emerald-400 shrink-0 ml-2 transition focus:outline-none cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                <div className="relative flex items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-3 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15 transition">
                  <Lock size={16} className="text-slate-500 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-transparent ml-2.5 text-xs text-slate-100 outline-none placeholder-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-emerald-400 shrink-0 ml-2 transition focus:outline-none cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Cyber Emerald Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 rounded-2xl font-extrabold text-xs shadow-lg glow-emerald flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-slate-950" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Update Account Password</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition font-medium"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
