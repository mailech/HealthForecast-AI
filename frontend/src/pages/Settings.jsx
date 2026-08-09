import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  BrainCircuit,
  Bell,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  Lock,
  Smartphone,
  LogOut,
  Save,
  Phone,
  MapPin,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRole } from "../context/RoleContext";

const passSchema = z.object({
  currentPass: z.string().min(6, "Current password required"),
  newPass: z.string().min(6, "New password must be at least 6 characters"),
  confirmPass: z.string().min(6, "Confirm password required"),
}).refine((data) => data.newPass === data.confirmPass, {
  message: "New passwords do not match",
  path: ["confirmPass"],
});

function Settings() {
  const { role } = useRole();
  const [hospitalInfo, setHospitalInfo] = useState({
    name: "HealthForecast AI Central Hospital",
    address: "123 Medical Enclave, Health City, AP 530001",
    phone: "+91 (800) 555-0199",
  });

  const [predictionThreshold, setPredictionThreshold] = useState(80);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    dashboard: true,
  });

  const [theme, setTheme] = useState("light");
  const [twoFactor, setTwoFactor] = useState(true);

  const {
    register: registerPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm({
    resolver: zodResolver(passSchema),
    defaultValues: { currentPass: "", newPass: "", confirmPass: "" },
  });

  const handleSaveAll = (e) => {
    e.preventDefault();
    toast.success("System & Security Settings Saved");
  };

  const onPasswordSubmit = (data) => {
    toast.success("Password Updated Successfully");
    resetPass();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            System Settings & Security Configuration
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage hospital profile parameters, ML prediction thresholds, and security credentials.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all self-start sm:self-auto"
        >
          <Save size={16} /> Save All Settings
        </button>
      </div>

      {/* Hospital Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Building2 size={18} className="text-blue-600" /> Hospital Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name</label>
            <input
              type="text"
              value={hospitalInfo.name}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
            <input
              type="text"
              value={hospitalInfo.phone}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Threshold & Notification Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Risk Threshold Threshold */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BrainCircuit size={18} className="text-blue-600" /> Readmission Risk Sensitivity Threshold
          </h2>
          <p className="text-xs text-slate-500">
            Set the global cutoff percentage for flagging High Readmission Risk patients.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Threshold Limit</span>
              <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                {predictionThreshold}% Score
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="95"
              value={predictionThreshold}
              onChange={(e) => setPredictionThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Security & Password */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Lock size={18} className="text-blue-600" /> Security & 2FA Governance
          </h2>

          <form onSubmit={handlePassSubmit(onPasswordSubmit)} className="space-y-3">
            <div>
              <input
                type="password"
                placeholder="Current Password"
                {...registerPass("currentPass")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
              {passErrors.currentPass && <p className="text-[11px] text-rose-500 font-bold mt-1">{passErrors.currentPass.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  {...registerPass("newPass")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none"
                />
                {passErrors.newPass && <p className="text-[11px] text-rose-500 font-bold mt-1">{passErrors.newPass.message}</p>}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  {...registerPass("confirmPass")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none"
                />
                {passErrors.confirmPass && <p className="text-[11px] text-rose-500 font-bold mt-1">{passErrors.confirmPass.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>

      {/* AI Model Retraining Section (Restricted to SYS_ADMIN) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BrainCircuit size={18} className="text-purple-600" /> AI Model Pipeline Retraining & Calibration
          </h2>
          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-200">
            SYS_ADMIN EXCLUSIVE
          </span>
        </div>

        {role === "SYS_ADMIN" ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-500">
              Trigger background XGBoost model retraining pipeline with updated clinical EHR datasets and hyperparameter optimization.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => toast.success("AI Model Retraining Initiated!", { description: "Training pipeline running on 10,000+ EHR records." })}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <BrainCircuit size={16} /> Retrain Predictive Model (v2.4 &rarr; v2.5)
              </button>
              <span className="text-xs text-slate-400 font-semibold">Last Trained: August 5, 2026 • Accuracy: 94.2%</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">AI Retraining Locked</p>
              <p className="text-[11px] text-slate-500">
                Only System Administrators (<span className="font-semibold text-purple-600">SYS_ADMIN</span>) are authorized to trigger AI model retraining and hyperparameter calibration.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default Settings;