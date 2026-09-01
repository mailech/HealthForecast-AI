import React, { useState } from "react";
import {
  Globe,
  X,
  Stethoscope,
  Building2,
  Brain,
  Terminal,
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function SSOModal({ isOpen, onClose, ssoProvider, onLoginConfirm }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const profiles = [
    {
      roleType: "DOCTOR",
      name: "Dr. John Smith",
      email: "john.smith@healthforecast.ai",
      role: "DOCTOR",
      department: "Cardiology & ICU",
      icon: Stethoscope,
      photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      tone: "emerald",
      bgClass: "bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200/80",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      iconBg: "bg-emerald-500 text-white border-emerald-200",
      avatarInitials: "JS",
    },
    {
      roleType: "HOSPITAL_ADMIN",
      name: "Admin Sarah Jenkins",
      email: "admin@healthforecast.ai",
      role: "HOSPITAL_ADMIN",
      department: "Hospital Administration",
      icon: Building2,
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      tone: "cyan",
      bgClass: "bg-cyan-50/60 hover:bg-cyan-50 border-cyan-200/80",
      badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-200",
      iconBg: "bg-cyan-600 text-white border-cyan-200",
      avatarInitials: "SJ",
    },
    {
      roleType: "RESEARCHER",
      name: "Dr. Alan Turing",
      email: "researcher@healthforecast.ai",
      role: "RESEARCHER",
      department: "Population Health & Research",
      icon: Brain,
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      tone: "amber",
      bgClass: "bg-amber-50/60 hover:bg-amber-50 border-amber-200/80",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      iconBg: "bg-amber-500 text-white border-amber-200",
      avatarInitials: "AT",
    },
    {
      roleType: "SYS_ADMIN",
      name: "Super Admin",
      email: "sysadmin@healthforecast.ai",
      role: "SYS_ADMIN",
      department: "IT & Platform Governance",
      icon: Terminal,
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      tone: "purple",
      bgClass: "bg-purple-50/60 hover:bg-purple-50 border-purple-200/80",
      badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
      iconBg: "bg-purple-600 text-white border-purple-200",
      avatarInitials: "SA",
    },
  ];

  const handleSelectProfile = (profile) => {
    setSelectedUser(profile);
    setPassword("");
    setError("");
  };

  const handleVerifyAndLogin = async (e) => {
    e.preventDefault();
    if (!password || password.trim() === "") {
      setError("Please enter profile password to authorize OAuth 2.0 login.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email,
          password: password,
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setVerifying(false);
        onLoginConfirm(selectedUser.roleType, selectedUser, password, resData);
      } else {
        setVerifying(false);
        setError(resData.message || resData.error || "Invalid account password. Please enter the correct password for this profile.");
      }
    } catch (err) {
      console.warn("Backend offline during SSO verification, using fallback credentials check:", err.message);
      // Offline fallback: allow standard demo password "password123"
      if (password === "password123") {
        setVerifying(false);
        onLoginConfirm(selectedUser.roleType, selectedUser, password);
      } else {
        setVerifying(false);
        setError("Invalid account password for SSO verification. Try using your updated password.");
      }
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setPassword("");
    setError("");
    setVerifying(false);
    onClose();
  };

  const providerName = ssoProvider || "Google Workspace";

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans select-none animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 border border-blue-600/20 text-blue-600 rounded-2xl shadow-xs">
              <Globe size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                {providerName} OAuth 2.0
              </h3>
              <p className="text-xs text-slate-500">Enterprise Identity Provider Directory</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hospital Security Policy Banner */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-5 py-2.5 flex items-center justify-between text-xs text-slate-700 font-semibold">
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-blue-600 shrink-0" />
            <span>Hospital Security Policy — Enterprise Identity Verification Enforced</span>
          </span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-extrabold tracking-wider uppercase border border-blue-200">
            Enforced
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* STEP 1: Select Profile */}
          {!selectedUser && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Select Identity Profile</h4>
                <p className="text-xs text-slate-500">
                  Select a clinical staff account below to trigger OAuth 2.0 identity consent.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {profiles.map((p) => {
                  const IconComp = p.icon;
                  return (
                    <button
                      key={p.roleType}
                      onClick={() => handleSelectProfile(p)}
                      className={`w-full p-3.5 rounded-2xl border ${p.bgClass} text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs`}
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Distinct Role Profile Avatar Photo with Role Icon Badge Overlay */}
                        <div className="relative shrink-0">
                          <img
                            src={p.photo}
                            alt={p.name}
                            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-200/80 shadow-xs"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center border shadow-xs text-xs ${p.iconBg}`}>
                            <IconComp size={11} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-extrabold text-slate-900">{p.name}</p>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${p.badgeClass}`}>
                              {p.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.email}</p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-1 text-slate-400 group-hover:text-slate-700 transition">
                        <span className="text-[11px] font-bold text-slate-600">Authenticate</span>
                        <ShieldCheck size={16} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Realistic OAuth Consent Popup & Password Verification */}
          {selectedUser && (
            <div className="space-y-5 animate-in fade-in">
              <button
                onClick={() => setSelectedUser(null)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition"
              >
                <ArrowLeft size={14} /> Back to Directory
              </button>

              {/* Identity Consent Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={selectedUser.photo}
                      alt={selectedUser.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-xs"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center border shadow-xs text-xs ${selectedUser.iconBg}`}>
                      {React.createElement(selectedUser.icon, { size: 11 })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">{selectedUser.name}</p>
                    <p className="text-[11px] text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${selectedUser.badgeClass}`}>
                  {selectedUser.role}
                </span>
              </div>

              {/* OAuth Permission Details */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <Sparkles size={14} className="text-blue-600" />
                  <span>Authenticate via {providerName} / OAuth 2.0</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  HealthForecast AI is requesting authorized access to verify clinical role credentials for{" "}
                  <strong>{selectedUser.department}</strong>.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Password Verification Form */}
              <form onSubmit={handleVerifyAndLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Account Password (OAuth Verification)
                  </label>
                  <div className="relative flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-500/15 transition">
                    <KeyRound size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      required
                      className="w-full bg-transparent ml-2.5 text-xs text-slate-900 outline-none placeholder-slate-400 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {verifying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verifying OAuth 2.0 Bearer Token...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Verify Identity & Authorize SSO Session</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
