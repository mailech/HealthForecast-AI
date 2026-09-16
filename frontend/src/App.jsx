import React, { useState, useEffect } from 'react';
import {
  Activity, Shield, Database, Cpu, UserCheck, Volume2,
  VolumeX, Sparkles, Building2, Stethoscope, Settings, LogOut,
  ChevronDown, Award, CheckCircle2
} from 'lucide-react';
import DoctorView from './components/views/DoctorView';
import AdminView from './components/views/AdminView';
import ResearcherView from './components/views/ResearcherView';
import SysAdminView from './components/views/SysAdminView';
import MilestonesView from './components/views/MilestonesView';
import LoginPage from './components/views/LoginPage';
import { sound } from './utils/audio';

const DEMO_ROLES = [
  {
    id: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    name: 'Dr. Elena Vance, MD',
    email: 'doctor@healthforecast.ai',
    dept: 'Endocrinology & Cardiology',
    initials: 'EV',
    color: 'border-cyan-400 text-cyan-300'
  },
  {
    id: 'hospital_admin',
    label: 'Hospital Admin',
    icon: Building2,
    name: 'Marcus Sterling, MHA',
    email: 'admin@healthforecast.ai',
    dept: 'Executive Operations',
    initials: 'MS',
    color: 'border-purple-400 text-purple-300'
  },
  {
    id: 'healthcare_researcher',
    label: 'Researcher',
    icon: Database,
    name: 'Dr. Aris Thorne, PhD',
    email: 'researcher@healthforecast.ai',
    dept: 'Epidemiology & Biostatistics',
    initials: 'AT',
    color: 'border-blue-400 text-blue-300'
  },
  {
    id: 'system_admin',
    label: 'System Admin',
    icon: Settings,
    name: 'Alex Mercer',
    email: 'sysadmin@healthforecast.ai',
    dept: 'Healthcare IT & DevOps',
    initials: 'AM',
    color: 'border-red-400 text-red-300'
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('doctor');

  // Start with login page for presentation
  useEffect(() => {
    localStorage.removeItem('healthforecast_user');
    localStorage.removeItem('healthforecast_token');
    setIsAuthenticated(false);
  }, []);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    const idx = DEMO_ROLES.findIndex(r => r.id === user.role);
    if (idx !== -1) {
      setCurrentRoleIndex(idx);
      setActiveTab(user.role);
    }
  };

  const handleLogout = () => {
    sound.playClick();
    localStorage.removeItem('healthforecast_user');
    localStorage.removeItem('healthforecast_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleRoleSwitch = (idx) => {
    sound.playClick();
    setCurrentRoleIndex(idx);
    const roleId = DEMO_ROLES[idx].id;
    setActiveTab(roleId);
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: roleId,
        full_name: DEMO_ROLES[idx].name,
        department: DEMO_ROLES[idx].dept,
        avatar_initials: DEMO_ROLES[idx].initials
      });
    }
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  // If user is not authenticated, display the 3D Cyber-Medical Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const currentRole = DEMO_ROLES[currentRoleIndex];

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Cyber Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#060c1d]/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-glow-cyan flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-wider text-white font-mono flex items-center gap-1.5">
                  HEALTHFORECAST<span className="text-cyan-400">AI</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                  3D SPATIAL INTEL
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  INFOSYS INTERNSHIP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hospital Readmission Prediction & Patient Risk Intelligence System (Diabetes 130-US Hospitals)
              </p>
            </div>
          </div>

          {/* Navigation Pill Bar: 4 Roles + Milestones Tracker */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs font-mono">
              {DEMO_ROLES.map((role, idx) => {
                const Icon = role.icon;
                const isCurrent = activeTab === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSwitch(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{role.label}</span>
                  </button>
                );
              })}

              {/* Dedicated Milestones Tab */}
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('milestones');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ml-1 border ${
                  activeTab === 'milestones'
                    ? 'bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 text-emerald-300 border-emerald-500/50 font-bold shadow-glow-emerald'
                    : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400/80 hover:text-emerald-300'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Milestones (Week 1-8)</span>
                <span className="sm:hidden">Milestones</span>
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 transition-all"
              title={isMuted ? 'Unmute Web Audio' : 'Mute Audio Telemetry'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Active User Avatar */}
            <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center font-bold text-xs text-cyan-300 font-mono">
                {currentUser?.avatar_initials || currentRole.initials}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser?.full_name || currentRole.name}
                </div>
                <div className="text-[10px] font-mono text-cyan-400/80">
                  {currentUser?.department || currentRole.dept}
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 text-red-300 hover:text-white text-xs font-semibold transition-all ml-1"
              title="Sign Out to Login Screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {activeTab === 'doctor' && (
          <DoctorView currentUser={currentUser || currentRole} />
        )}
        {activeTab === 'hospital_admin' && (
          <AdminView
            currentUser={currentUser || currentRole}
            onSelectPatientFromWard={(bed) => {
              setCurrentRoleIndex(0);
              setActiveTab('doctor');
            }}
          />
        )}
        {activeTab === 'healthcare_researcher' && (
          <ResearcherView currentUser={currentUser || currentRole} />
        )}
        {activeTab === 'system_admin' && (
          <SysAdminView currentUser={currentUser || currentRole} />
        )}
        {activeTab === 'milestones' && (
          <MilestonesView />
        )}
      </main>

      {/* Futuristic Cyber Footer */}
      <footer className="border-t border-cyan-500/10 bg-[#030611] py-6 px-4 text-center text-xs text-slate-500 font-mono space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-400">HealthForecast AI v2.0 • Real-Time Inference Active</span>
        </div>
        <p>
          Infosys Internship Project • Machine Learning Readmission Forecasting & 3D Spatial Clinical Digital Twin
        </p>
      </footer>
    </div>
  );
}
