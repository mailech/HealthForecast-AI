import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Clock,
  Shield,
  Edit,
  Lock,
  Camera,
  X,
  Save,
  Activity,
  Award,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const profileEditSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(6, "Phone number required"),
  department: z.string().min(2, "Department required"),
  hospital: z.string().min(2, "Hospital required"),
});

const passSchema = z.object({
  current: z.string().min(6, "Current password required"),
  newPass: z.string().min(6, "New password must be at least 6 characters"),
  confirmPass: z.string().min(6, "Confirm password required"),
}).refine((data) => data.newPass === data.confirmPass, {
  message: "New passwords do not match",
  path: ["confirmPass"],
});

function Profile() {
  const [doctor, setDoctor] = useState({
    name: "Dr. Alex Morgan",
    role: "AI Administrator & Chief Medical Officer",
    email: "alex.morgan@healthforecast.ai",
    phone: "+1 (555) 234-5678",
    department: "Cardiology & Health AI",
    hospital: "HealthForecast AI Central Hospital",
    experience: "14 Years",
    lastLogin: "Today at 08:30 AM",
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      department: doctor.department,
      hospital: doctor.hospital,
    },
  });

  const {
    register: registerPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm({
    resolver: zodResolver(passSchema),
    defaultValues: { current: "", newPass: "", confirmPass: "" },
  });

  const onEditSubmit = (data) => {
    setDoctor((prev) => ({ ...prev, ...data }));
    setIsEditModalOpen(false);
    toast.success("Profile credentials updated successfully!");
  };

  const onPassSubmit = (data) => {
    setIsPassModalOpen(false);
    resetPass();
    toast.success("Security password changed successfully!");
  };

  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-6 shadow-md shadow-slate-200/50 border border-slate-200/80">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <User className="text-blue-600" size={30} />
              Doctor Profile & Account 👤
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Manage your personal profile, credentials, and administrative credentials.
            </p>
          </div>

          <button
            onClick={() => {
              resetEdit(doctor);
              setIsEditModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all text-xs md:text-sm cursor-pointer"
          >
            <Edit size={16} /> Edit Profile Details
          </button>
        </div>

        {/* Main Grid Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* HERO PROFILE CARD */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md shadow-slate-200/50 border border-slate-200/80 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

              <div className="relative mt-6 mb-4 z-10">
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl ring-2 ring-blue-500/20"
                />
                <button
                  onClick={() => {
                    resetEdit(doctor);
                    setIsEditModalOpen(true);
                  }}
                  className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md border-2 border-white transition-all cursor-pointer"
                  title="Update Photo"
                >
                  <Camera size={14} />
                </button>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {doctor.name}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full mt-2 border border-blue-100">
                <Shield size={14} /> {doctor.role}
              </span>

              <div className="w-full grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    resetEdit(doctor);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Edit size={14} /> Edit Profile
                </button>

                <button
                  onClick={() => {
                    resetPass();
                    setIsPassModalOpen(true);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                >
                  <Lock size={14} /> Change Pass
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-md shadow-slate-200/50 border border-slate-200/80 grid grid-cols-2 gap-4 text-center">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <Award className="text-blue-600 mx-auto mb-1" size={22} />
                <span className="text-base font-extrabold text-slate-900 block">
                  {doctor.experience}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Clinical Exp
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <Activity className="text-emerald-600 mx-auto mb-1" size={22} />
                <span className="text-base font-extrabold text-slate-900 block">
                  Active
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Status
                </span>
              </div>
            </div>
          </div>

          {/* DETAILED INFO */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-md shadow-slate-200/50 border border-slate-200/80">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Personal & Clinical Credentials
              </h3>
              <span className="text-xs text-slate-400 font-bold">
                ID: #DOC-88492
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Full Name
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {doctor.name}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Email Address
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {doctor.email}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Phone Number
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {doctor.phone}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                  <Briefcase size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Department
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {doctor.department}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Hospital Affiliation
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {doctor.hospital}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Total Experience
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {doctor.experience}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 md:col-span-2">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Last Active Session
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {doctor.lastLogin}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* EDIT PROFILE MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
              
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Edit size={18} className="text-blue-600" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Edit Profile Details
                  </h2>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit(onEditSubmit)} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className={`relative flex items-center bg-slate-50 border rounded-xl transition-all px-3.5 py-2.5 ${
                    editErrors.name ? "border-rose-500" : "border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                  }`}>
                    <User size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      {...registerEdit("name")}
                      className="w-full bg-transparent ml-2.5 text-xs text-slate-800 font-medium outline-none"
                    />
                  </div>
                  {editErrors.name && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      ⚠️ {editErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className={`relative flex items-center bg-slate-50 border rounded-xl transition-all px-3.5 py-2.5 ${
                      editErrors.email ? "border-rose-500" : "border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                    }`}>
                      <Mail size={16} className="text-slate-400 shrink-0" />
                      <input
                        type="email"
                        {...registerEdit("email")}
                        className="w-full bg-transparent ml-2.5 text-xs text-slate-800 font-medium outline-none"
                      />
                    </div>
                    {editErrors.email && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1">
                        ⚠️ {editErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className={`relative flex items-center bg-slate-50 border rounded-xl transition-all px-3.5 py-2.5 ${
                      editErrors.phone ? "border-rose-500" : "border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                    }`}>
                      <Phone size={16} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        {...registerEdit("phone")}
                        className="w-full bg-transparent ml-2.5 text-xs text-slate-800 font-medium outline-none"
                      />
                    </div>
                    {editErrors.phone && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1">
                        ⚠️ {editErrors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Department
                  </label>
                  <div className={`relative flex items-center bg-slate-50 border rounded-xl transition-all px-3.5 py-2.5 ${
                    editErrors.department ? "border-rose-500" : "border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                  }`}>
                    <Briefcase size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      {...registerEdit("department")}
                      className="w-full bg-transparent ml-2.5 text-xs text-slate-800 font-medium outline-none"
                    />
                  </div>
                  {editErrors.department && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      ⚠️ {editErrors.department.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Hospital Affiliation
                  </label>
                  <div className={`relative flex items-center bg-slate-50 border rounded-xl transition-all px-3.5 py-2.5 ${
                    editErrors.hospital ? "border-rose-500" : "border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                  }`}>
                    <Building2 size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      {...registerEdit("hospital")}
                      className="w-full bg-transparent ml-2.5 text-xs text-slate-800 font-medium outline-none"
                    />
                  </div>
                  {editErrors.hospital && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      ⚠️ {editErrors.hospital.message}
                    </p>
                  )}
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 font-bold text-slate-500 hover:text-slate-700 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save size={14} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CHANGE PASSWORD MODAL */}
        {isPassModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
              
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-blue-600" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Change Password
                  </h2>
                </div>
                <button
                  onClick={() => setIsPassModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePassSubmit(onPassSubmit)} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <div className={`relative flex items-center bg-slate-50 border rounded-xl transition-all px-3.5 py-2.5 ${
                    passErrors.current ? "border-rose-500" : "border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                  }`}>
                    <Lock size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="password"
                      {...registerPass("current")}
                      className="w-full bg-transparent ml-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  {passErrors.current && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      ⚠️ {passErrors.current.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className={`relative flex items-center bg-slate-50 border rounded-xl transition-all px-3.5 py-2.5 ${
                    passErrors.newPass ? "border-rose-500" : "border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                  }`}>
                    <Lock size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="password"
                      {...registerPass("newPass")}
                      className="w-full bg-transparent ml-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  {passErrors.newPass && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      ⚠️ {passErrors.newPass.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className={`relative flex items-center bg-slate-50 border rounded-xl transition-all px-3.5 py-2.5 ${
                    passErrors.confirmPass ? "border-rose-500" : "border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                  }`}>
                    <Lock size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="password"
                      {...registerPass("confirmPass")}
                      className="w-full bg-transparent ml-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  {passErrors.confirmPass && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      ⚠️ {passErrors.confirmPass.message}
                    </p>
                  )}
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPassModalOpen(false)}
                    className="px-4 py-2.5 font-bold text-slate-500 hover:text-slate-700 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;