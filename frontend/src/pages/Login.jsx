import React, { useState } from "react";
import {
  Activity,
  HeartPulse,
  Mail,
  Lock,
  Building2,
  ArrowRight,
  Loader2,
  X,
  CheckCircle2,
  Stethoscope,
  Microscope,
  ShieldAlert,
  UserCheck,
  Globe,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRole } from "../context/RoleContext";
import SSOModal from "../components/SSOModal";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid hospital email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const FALLBACK_ACCOUNTS = {
  "john.smith@healthforecast.ai": {
    name: "Dr. John Smith",
    email: "john.smith@healthforecast.ai",
    role: "DOCTOR",
    department: "Cardiology & ICU",
    password: "password123",
  },
  "admin@healthforecast.ai": {
    name: "Admin Sarah Jenkins",
    email: "admin@healthforecast.ai",
    role: "HOSPITAL_ADMIN",
    department: "Hospital Administration",
    password: "password123",
  },
  "admin.sarah@healthforecast.ai": {
    name: "Admin Sarah Jenkins",
    email: "admin@healthforecast.ai",
    role: "HOSPITAL_ADMIN",
    department: "Hospital Administration",
    password: "password123",
  },
  "researcher@healthforecast.ai": {
    name: "Dr. Alan Turing",
    email: "researcher@healthforecast.ai",
    role: "RESEARCHER",
    department: "Population Health & Research",
    password: "password123",
  },
  "researcher.elena@healthforecast.ai": {
    name: "Dr. Alan Turing",
    email: "researcher@healthforecast.ai",
    role: "RESEARCHER",
    department: "Population Health & Research",
    password: "password123",
  },
  "mounikavelam@gmail.com": {
    name: "Velam Mounika",
    email: "mounikavelam@gmail.com",
    role: "SYS_ADMIN",
    department: "IT & System Administration",
    password: "password123",
  },
  "23u41a4257@diet.edu.in": {
    name: "Student 23U41A4257",
    email: "23u41a4257@diet.edu.in",
    role: "DOCTOR",
    department: "Cardiology & ICU",
    password: "password123",
  },
  "sysadmin@healthforecast.ai": {
    name: "Super Admin",
    email: "sysadmin@healthforecast.ai",
    role: "SYS_ADMIN",
    department: "IT & Platform Governance",
    password: "password123",
  },
  "sysadmin.marcus@healthforecast.ai": {
    name: "Super Admin",
    email: "sysadmin@healthforecast.ai",
    role: "SYS_ADMIN",
    department: "IT & Platform Governance",
    password: "password123",
  },
};

function Login() {
  const navigate = useNavigate();
  const { login: loginSession } = useRole();

  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Request Credentials Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    department: "Clinical Care",
    requestedRole: "DOCTOR",
    reason: "",
  });
  const [requestLoading, setRequestLoading] = useState(false);

  // SSO Modal State
  const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
  const [ssoProvider, setSSOProvider] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 1. Connect to backend Express POST /api/auth/login with fallback & error handling
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const userObj = resData.user || resData.data;
        const token = resData.token || resData.data?.accessToken || "mock_jwt_token_2026";

        const userData = {
          name: userObj?.name || data.email.split("@")[0],
          email: userObj?.email || data.email,
          role: userObj?.role || "DOCTOR",
          department: userObj?.department || "Clinical Care",
        };

        loginSession(userData, token);

        toast.success(`Welcome back, ${userData.name}!`, {
          description: `Role: ${userData.role} • Authenticated with JWT session.`,
        });
        navigate("/dashboard");
        return;
      } else {
        toast.error("Invalid email or password", {
          description: resData.error || resData.message || "Authentication failed",
        });
        return;
      }
    } catch (error) {
      console.warn("Express backend auth offline, using fallback auth:", error.message);

      // Offline Fallback for Seeded Accounts
      const normalizedEmail = data.email.trim().toLowerCase();
      const matchedAccount = FALLBACK_ACCOUNTS[normalizedEmail];

      if (matchedAccount) {
        if (data.password !== matchedAccount.password) {
          toast.error("Invalid email or password", {
            description: "Incorrect password for demo account.",
          });
          return;
        }

        const userData = {
          name: matchedAccount.name,
          email: matchedAccount.email,
          role: matchedAccount.role,
          department: matchedAccount.department,
        };

        loginSession(userData, "mock_jwt_token_2026");

        toast.success(`Welcome back, ${userData.name}!`, {
          description: `Role: ${userData.role} • Authenticated via clinical portal.`,
        });
        navigate("/dashboard");
      } else {
        toast.error("Invalid email or password", {
          description: "Backend offline and account credentials not recognized.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Forgot Password Reset Handler (Calls Express backend & Nodemailer)
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@")) {
      toast.error("Please enter a valid hospital email address");
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("Password Reset Link Sent!", {
          description: `Instructions dispatched to ${resetEmail}. Check your inbox.`,
        });
      } else {
        throw new Error(resData.error || "Reset request failed");
      }
    } catch (err) {
      console.warn("Backend reset API offline, using local fallback:", err.message);
      toast.success("Password Reset Link Sent!", {
        description: `Instructions dispatched to ${resetEmail} (Offline Sim Mode).`,
      });
    } finally {
      setResetLoading(false);
      setIsForgotModalOpen(false);
      setResetEmail("");
    }
  };

  // 3. Request Hospital Credentials Form Handler (Calls Express backend & Nodemailer)
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.name || !requestForm.email || !requestForm.reason) {
      toast.error("Please complete all required fields");
      return;
    }

    setRequestLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/request-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestForm),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("Request Submitted! Check your inbox.", {
          description: `Credential application for ${requestForm.name} sent. Confirmation email dispatched.`,
        });
      } else {
        throw new Error(resData.error || "Submission failed");
      }
    } catch (err) {
      console.warn("Backend access request API offline, saving locally:", err.message);
      const existing = JSON.parse(localStorage.getItem("hospitalAccessRequests") || "[]");
      existing.push({
        id: `REQ-${Date.now().toString().slice(-4)}`,
        ...requestForm,
        date: new Date().toLocaleDateString(),
        status: "Pending Review",
      });
      localStorage.setItem("hospitalAccessRequests", JSON.stringify(existing));

      toast.success("Request Submitted! Check your inbox.", {
        description: `Access request for ${requestForm.requestedRole} role logged.`,
      });
    } finally {
      setRequestLoading(false);
      setIsRequestModalOpen(false);
      setRequestForm({
        name: "",
        email: "",
        department: "Clinical Care",
        requestedRole: "DOCTOR",
        reason: "",
      });
    }
  };

  // 4. Functional Enterprise SSO Handler
  const triggerSSO = (provider) => {
    setSSOProvider(provider);
    setIsSSOModalOpen(true);
  };

  const handleSSOLoginConfirm = (roleType, profileObject, verifiedPassword, authResponseData) => {
    let ssoUser = profileObject || {
      name: "Dr. John Smith",
      email: "john.smith@healthforecast.ai",
      role: roleType || "DOCTOR",
      department: "Cardiology & ICU",
    };

    if (authResponseData && (authResponseData.user || authResponseData.data)) {
      const u = authResponseData.user || authResponseData.data;
      ssoUser = {
        name: u.name || ssoUser.name,
        email: u.email || ssoUser.email,
        role: u.role || ssoUser.role,
        department: u.department || ssoUser.department,
      };
    }

    setIsSSOModalOpen(false);

    // Instantly sync RoleContext state and localStorage with exact profile object
    const token = authResponseData?.token || authResponseData?.data?.accessToken || `mock_${(ssoProvider || "SSO").toLowerCase().replace(/\s+/g, "_")}_token`;
    loginSession(ssoUser, token);

    toast.success(`${ssoProvider || "Enterprise SSO"} Authentication Successful!`, {
      description: `Signed in as ${ssoUser.name} (${ssoUser.role} • ${ssoUser.department})`,
    });

    navigate("/dashboard");
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* LEFT SIDE: Hero Visual */}
      <div className="w-full md:w-1/2 h-full relative flex flex-col justify-center items-center p-12 text-white bg-gradient-to-tr from-[#0f172a] via-[#1e293b] to-[#1e3a8a] overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-15 pointer-events-none stroke-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-100,150 C200,50 400,250 700,100 S1100,300 1400,150" fill="none" strokeWidth="1.5" />
          <path d="M-100,300 C250,150 500,400 800,200 S1200,450 1500,250" fill="none" strokeWidth="1.5" />
          <path d="M-100,450 C150,300 450,550 750,350 S1150,600 1450,400" fill="none" strokeWidth="1.5" />
          <path d="M-100,600 C300,400 600,700 900,500 S1300,750 1600,550" fill="none" strokeWidth="1.5" />
        </svg>

        <div className="absolute top-1/3 left-12 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-blue-400 shadow-lg animate-pulse">
          <Activity size={28} />
        </div>
        <div className="absolute bottom-1/4 right-16 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-cyan-400 shadow-lg">
          <Activity size={32} />
        </div>

        <div className="z-10 flex flex-col items-center text-center max-w-lg">
          <div className="mb-6 text-blue-500 drop-shadow-lg p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20">
            <HeartPulse size={80} strokeWidth={2.2} />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
            HealthForecast <span className="text-blue-500">AI</span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 mt-4 font-normal tracking-wide leading-relaxed">
            Clinical Readmission Risk Intelligence & Hospital Workforce Suite.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Card */}
      <div className="w-full md:w-1/2 h-full bg-slate-100 flex justify-center items-center p-6 md:p-12 overflow-y-auto">
        <div className="bg-white/95 backdrop-blur-md w-full max-w-[500px] p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 flex flex-col items-center">
          
          <h2 className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
            Welcome Back 👋
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1 mb-6 text-center">
            Sign in to access your clinical dashboard
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hospital Email Address
              </label>
              <div className={`relative flex items-center bg-slate-50 border rounded-2xl transition-all duration-200 px-4 py-3.5 ${
                errors.email ? "border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10" : "border-slate-200 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10"
              }`}>
                <Mail className="text-slate-400 shrink-0" size={20} />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="name@hospital.org"
                  className="w-full bg-transparent ml-3 text-sm text-slate-900 font-medium outline-none placeholder-slate-400"
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-rose-600 mt-1.5 ml-1">
                  ⚠️ {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Account Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className={`relative flex items-center bg-slate-50 border rounded-2xl transition-all duration-200 px-4 py-3.5 ${
                errors.password ? "border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10" : "border-slate-200 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10"
              }`}>
                <Lock className="text-slate-400 shrink-0" size={20} />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent ml-3 text-sm text-slate-900 font-medium outline-none placeholder-slate-400"
                />
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-rose-600 mt-1.5 ml-1">
                  ⚠️ {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Authenticating JWT...
                </>
              ) : (
                <>
                  Sign In to Portal <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Request Credentials Link */}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <KeyRound size={14} />
              Need an account? Request Hospital Credentials
            </button>
          </div>

          {/* SSO Options */}
          <div className="w-full mt-6 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or sign in with SSO
            </span>
          </div>

          <div className="flex gap-3 mt-5 w-full">
            <button 
              type="button" 
              onClick={() => triggerSSO("Google SSO")}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Globe size={16} className="text-blue-500" />
              Google SSO
            </button>

            <button 
              type="button" 
              onClick={() => triggerSSO("Hospital SSO")}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Building2 size={16} className="text-blue-600" />
              Hospital SSO
            </button>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Reset Account Password</h3>
                  <p className="text-[11px] text-slate-500">Hospital Credential Recovery</p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hospital Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="john.smith@healthforecast.ai"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {resetLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  <span>{resetLoading ? "Dispatching Link..." : "Send Reset Link"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Hospital Credentials Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Request Hospital Credentials</h3>
                  <p className="text-[11px] text-slate-500">Staff Access & Role Authorization Form</p>
                </div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={requestForm.name}
                    onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                    placeholder="Dr. Jane Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Email *</label>
                  <input
                    type="email"
                    required
                    value={requestForm.email}
                    onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                    placeholder="jane.doe@healthforecast.ai"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={requestForm.department}
                    onChange={(e) => setRequestForm({ ...requestForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="Cardiology & ICU">Cardiology & ICU</option>
                    <option value="Hospital Administration">Hospital Administration</option>
                    <option value="Population Health & Research">Population Health & Research</option>
                    <option value="IT & Platform Governance">IT & Platform Governance</option>
                    <option value="Emergency Care">Emergency Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Role</label>
                  <select
                    value={requestForm.requestedRole}
                    onChange={(e) => setRequestForm({ ...requestForm, requestedRole: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="DOCTOR">Doctor (Attending Physician)</option>
                    <option value="HOSPITAL_ADMIN">Hospital Administrator</option>
                    <option value="RESEARCHER">Healthcare Researcher</option>
                    <option value="SYS_ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Justification / Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  placeholder="Describe your clinical role and hospital department requirement..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {requestLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  <span>{requestLoading ? "Submitting Request..." : "Submit Access Request"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enterprise SSO Verification Modal */}
      <SSOModal
        isOpen={isSSOModalOpen}
        onClose={() => setIsSSOModalOpen(false)}
        ssoProvider={ssoProvider}
        onLoginConfirm={handleSSOLoginConfirm}
      />

    </div>
  );
}

export default Login;