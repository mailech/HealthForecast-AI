import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiActivity, FiShield, FiBarChart2, FiUsers, FiArrowRight,
  FiCheckCircle, FiCpu, FiTrendingUp, FiHeart, FiZap,
  FiCloud, FiUser, FiHome, FiLock, FiGlobe
} from 'react-icons/fi';

/* ── Animation Variants ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.215, 0.61, 0.355, 1.0] },
});

const floatAnim = (duration = 4, delay = 0) => ({
  animate: {
    y: [0, -10, 0],
    rotate: [0, 1, 0, -1, 0],
    transition: {
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    },
  },
});

/* ── Static Data ── */
const features = [
  {
    icon: FiCpu,
    title: 'AI Readmission Prediction',
    desc: 'Machine learning models trained on 100k+ patient records predict 30-day readmission risk with 94.2% accuracy.',
  },
  {
    icon: FiZap,
    title: 'Real-Time Risk Intelligence',
    desc: 'Continuous patient monitoring with instant automated alerts for high-risk cases across hospital departments.',
  },
  {
    icon: FiBarChart2,
    title: 'Advanced Analytics',
    desc: 'Comprehensive KPI dashboards, department metrics, and trend analysis for data-driven clinical decisions.',
  },
  {
    icon: FiShield,
    title: 'Secure & Compliant',
    desc: 'Built with enterprise-grade protection, HIPAA-compliant standards, and role-based access control.',
  },
];

const stats = [
  { value: '94.2%', label: 'Prediction Accuracy' },
  { value: '30%', label: 'Readmission Reduction' },
  { value: '1,200+', label: 'Patients Monitored' },
  { value: '12', label: 'Departments Covered' },
];

const roles = [
  { role: 'Doctor', desc: 'Patient risk scores, appointments & clinical alerts', emoji: '🩺' },
  { role: 'Hospital Admin', desc: 'Hospital KPIs, department performance & analytics', emoji: '🏥' },
  { role: 'Researcher', desc: 'Population trends, datasets & model insights', emoji: '🔬' },
  { role: 'System Admin', desc: 'User management, audit logs & platform monitoring', emoji: '⚙️' },
];

/* ── Updated: Exactly 4 Items ── */
const checks = [
  'HIPAA-compliant architecture',
  'Real-time risk stratification',
  'Role-based access control',
  'Explainable AI predictions',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">

      {/* ── Subtle Background Glow Shapes ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-blue-300/25 rounded-full blur-[120px]" />
        <div className="absolute top-[10%] right-[-5%] w-[450px] h-[450px] bg-purple-300/25 rounded-full blur-[120px]" />
        <div className="absolute top-[35%] left-[25%] w-[350px] h-[350px] bg-indigo-200/20 rounded-full blur-[100px]" />
      </div>

      {/* ── Sticky Glass Navbar ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/70 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <FiActivity size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              HealthForecast <span className="text-blue-600">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors rounded-xl"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all flex items-center gap-2"
              >
                <span>Get Started</span>
                <FiArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column */}
          <motion.div {...fadeUp(0)} className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              <FiZap size={14} className="text-blue-600" />
              <span>AI-Powered Healthcare Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.12] tracking-tight">
              AI-Powered Insights for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Smarter Healthcare
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              HealthForecast AI empowers clinicians with intelligent risk scoring, real-time alerts, and data-driven insights — reducing hospital readmissions by up to 30%.
            </p>

            {/* Premium Dual Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/register"
                  className="px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center gap-2 group"
                >
                  <span>Start Free Trial</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/login"
                  className="px-7 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  View Demo Dashboard
                </Link>
              </motion.div>
            </div>

            {/* Checklist (Now only 4 items) */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 pt-6 border-t border-slate-200/80 text-sm font-medium text-slate-600">
              {checks.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <FiCheckCircle className="text-blue-600 flex-shrink-0" size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: AI Hospital Command Center Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-6 relative flex justify-center items-center w-full min-h-[480px] sm:min-h-[540px]"
          >
            {/* Ambient Multi-Layer Glowing Backdrop */}
            <div className="absolute w-80 h-80 sm:w-[420px] sm:h-[420px] bg-gradient-to-tr from-blue-400/25 via-indigo-400/20 to-purple-400/25 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute w-64 h-64 bg-cyan-300/20 rounded-full blur-[80px] -translate-x-12 translate-y-8 -z-10" />

            {/* Main Command Center Wrapper */}
            <div className="relative w-full max-w-xl p-2">

              {/* 3D Glassmorphism Hospital Command Center Window */}
              <motion.div 
                {...floatAnim(5, 0)}
                className="w-full bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(30,58,138,0.12)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none" />

                {/* Command Window Top Control Bar */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/30">
                      <FiHome size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Command Center</p>
                      <h4 className="text-xs font-black text-slate-800">HealthForecast Neural Hub</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Feed
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-extrabold flex items-center gap-1 border border-purple-200/60">
                      <FiCloud size={11} /> Cloud Sync
                    </span>
                  </div>
                </div>

                {/* Central Canvas */}
                <div className="grid grid-cols-12 gap-4 items-center my-2 relative">
                  
                  {/* Left Box */}
                  <div className="col-span-6 bg-slate-900/95 text-white rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-indigo-600/10 to-purple-600/20" />
                    
                    <svg className="w-full h-32 absolute inset-0 opacity-40 pointer-events-none" viewBox="0 0 200 120">
                      <line x1="30" y1="30" x2="100" y2="60" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="2 2" />
                      <line x1="170" y1="20" x2="100" y2="60" stroke="#C084FC" strokeWidth="1.5" strokeDasharray="2 2" />
                      <line x1="40" y1="90" x2="100" y2="60" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 2" />
                      <line x1="160" y1="100" x2="100" y2="60" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="2 2" />
                      <circle cx="30" cy="30" r="4" fill="#60A5FA" />
                      <circle cx="170" cy="20" r="4" fill="#C084FC" />
                      <circle cx="40" cy="90" r="4" fill="#38BDF8" />
                      <circle cx="160" cy="100" r="4" fill="#818CF8" />
                    </svg>

                    <div className="relative z-10 my-1">
                      <svg className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.7)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
                        <circle cx="12" cy="12" r="2" fill="#818CF8" />
                      </svg>
                    </div>

                    <p className="text-[11px] font-black tracking-wider text-indigo-200 mt-1 z-10">AI PREDICTION CORE</p>
                    <p className="text-[9px] font-semibold text-slate-400 z-10">Deep Learning Active</p>
                  </div>

                  {/* Right Box */}
                  <div className="col-span-6 space-y-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase">Patient Risk Index</p>
                        <p className="text-xs font-black text-slate-900">Low Readmission</p>
                      </div>
                      <span className="text-xs font-black text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md">88.4%</span>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 p-3 rounded-xl border border-indigo-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase">ML Trend Graph</span>
                        <FiTrendingUp className="text-indigo-600" size={12} />
                      </div>
                      <svg className="w-full h-9 text-indigo-600 fill-none" viewBox="0 0 120 30">
                        <path d="M0 25 Q30 5, 60 18 T120 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M0 25 Q30 5, 60 18 T120 8 L120 30 L0 30 Z" fill="rgba(99, 102, 241, 0.15)" />
                      </svg>
                    </div>

                  </div>
                </div>

                {/* ECG Heartbeat Pulse Track Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-extrabold mb-1.5">
                    <span className="flex items-center gap-1 text-slate-700">
                      <FiHeart className="text-rose-500 animate-pulse" size={13} /> Continuous Heartbeat Monitoring
                    </span>
                    <span className="text-blue-600">72 BPM</span>
                  </div>
                  <div className="h-9 w-full bg-slate-900 rounded-xl px-2 flex items-center overflow-hidden">
                    <svg className="w-full h-7 stroke-emerald-400 fill-none" viewBox="0 0 280 30">
                      <path 
                        d="M0 15 L50 15 L60 5 L68 25 L76 2 L84 20 L90 15 L160 15 L170 5 L178 25 L186 2 L194 20 L200 15 L280 15" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

              </motion.div>

              {/* Floating Glass Badges */}
              <motion.div
                {...floatAnim(4.2, 0.1)}
                className="absolute -top-5 -right-3 sm:-right-5 bg-white/90 backdrop-blur-xl border border-white/90 px-3.5 py-2.5 rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FiUser size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase">Clinician AI</p>
                  <p className="text-xs font-black text-slate-800">Doctor Portal</p>
                </div>
              </motion.div>

              <motion.div
                {...floatAnim(3.8, 0.4)}
                className="absolute top-8 -left-4 sm:-left-7 bg-white/90 backdrop-blur-xl border border-white/90 px-3 py-2 rounded-2xl shadow-xl shadow-blue-500/10 flex items-center gap-2 z-20"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <FiShield size={16} />
                </div>
                <div className="pr-1">
                  <p className="text-xs font-extrabold text-slate-800">HIPAA Protected</p>
                  <p className="text-[9px] font-extrabold text-purple-600">Encrypted Nodes</p>
                </div>
              </motion.div>

              <motion.div
                {...floatAnim(4.6, 0.7)}
                className="absolute -bottom-5 -left-3 sm:-left-5 bg-white/90 backdrop-blur-xl border border-white/90 px-4 py-3 rounded-2xl shadow-xl shadow-rose-500/10 flex items-center gap-3 z-20"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-rose-500/20">
                  +
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase">Genomic AI</p>
                  <p className="text-xs font-black text-slate-800">DNA Risk Score</p>
                </div>
              </motion.div>

              <motion.div
                {...floatAnim(5.1, 1)}
                className="absolute -bottom-6 right-4 bg-slate-900/90 text-white backdrop-blur-xl border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 z-20"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                <div>
                  <p className="text-[8px] font-extrabold text-slate-400 uppercase">Hospital Analytics</p>
                  <p className="text-xs font-bold text-indigo-200">12 Wards Connected</p>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ── KPI Statistics Bar ── */}
      <section className="py-14 bg-white border-y border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeUp(idx * 0.08)}
                className="text-center md:text-left space-y-1"
              >
                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                  {item.value}
                </p>
                <p className="text-sm font-bold text-slate-800">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <motion.div {...fadeUp()} className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase">Core Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Modern Clinical Workflows
          </h2>
          <p className="text-slate-600 text-base">
            Everything you need to predict outcomes, streamline department interventions, and elevate patient care standards.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              {...fadeUp(idx * 0.1)}
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <feature.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Multi-Role Platform ── */}
      <section className="py-20 bg-slate-100/60 border-t border-slate-200/70 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-indigo-600 uppercase">Multi-Role Platform</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Every Healthcare Professional
            </h2>
            <p className="text-slate-600 text-base">
              Tailored dashboards and tools for each role in your hospital ecosystem.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.08)}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{r.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-1">{r.role}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          {...fadeUp()}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-10 sm:p-14 text-center text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Transform Patient Care?
            </h2>
            <p className="text-blue-100 text-base leading-relaxed">
              Join healthcare professionals using HealthForecast AI to predict readmissions, reduce costs, and improve patient outcomes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-7 py-3.5 text-base font-semibold text-blue-700 bg-white rounded-xl shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                <span>Create Free Account</span>
                <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Modern Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FiActivity size={18} />
            </div>
            <span className="font-bold text-white text-base">HealthForecast AI</span>
          </div>

          <p className="text-xs text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} HealthForecast AI. Enterprise Healthcare Intelligence. All rights reserved.
          </p>

          <div className="flex gap-6 text-xs font-semibold">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}