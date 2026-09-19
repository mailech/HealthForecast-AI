import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity, FiShield, FiBarChart2, FiUsers, FiArrowRight,
  FiCpu, FiZap, FiCheck,
  FiLock, FiFileText, FiDatabase, FiUserCheck, FiMenu, FiX,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/* ── Animation Variants ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay, ease: [0.215, 0.61, 0.355, 1.0] },
});

/* ── Platform Capabilities Bar ── */
const capabilityPillars = [
  {
    icon: FiUserCheck,
    title: 'Patient Management',
    desc: 'Centralized patient directory, admission details, and clinical records.',
    route: '/patients',
  },
  {
    icon: FiCpu,
    title: 'Risk Assessment',
    desc: 'Machine learning readmission risk scoring based on clinical parameters.',
    route: '/risk-analyzer',
  },
  {
    icon: FiZap,
    title: 'Clinical Support',
    desc: 'Actionable clinical insights to guide early intervention decisions.',
    route: '/clinical-insights',
  },
  {
    icon: FiBarChart2,
    title: 'Healthcare Analytics',
    desc: 'Interactive operational dashboards and department metrics.',
    route: '/analytics',
  },
];

/* ── Core Features (4 Cards) ── */
const coreFeatures = [
  {
    icon: FiUsers,
    title: 'PATIENT MANAGEMENT',
    desc: 'Create, update, and manage patient records with essential clinical information.',
    tag: 'Records & Directory',
    route: '/patients',
  },
  {
    icon: FiActivity,
    title: 'RISK ASSESSMENT',
    desc: 'Evaluate patient readmission risk using clinical data and machine learning models.',
    tag: 'Predictive Models',
    route: '/risk-analyzer',
  },
  {
    icon: FiZap,
    title: 'CLINICAL INSIGHTS',
    desc: 'Understand patient risk and receive actionable information to support clinical workflows.',
    tag: 'Decision Support',
    route: '/clinical-insights',
  },
  {
    icon: FiBarChart2,
    title: 'HEALTHCARE ANALYTICS',
    desc: 'View patient, prediction, appointment, and operational information through clear dashboards.',
    tag: 'Operational Intelligence',
    route: '/analytics',
  },
];

/* ── 4-Step Process ── */
const howItWorksSteps = [
  {
    step: '01',
    title: 'Add Patient',
    desc: 'Create a patient record with essential demographic and clinical information.',
    icon: FiUserCheck,
  },
  {
    step: '02',
    title: 'Review Patient Data',
    desc: 'Access patient information, appointments, treatments, and clinical details in one place.',
    icon: FiFileText,
  },
  {
    step: '03',
    title: 'Assess Risk',
    desc: 'Use the available clinical information to generate a readmission risk assessment.',
    icon: FiActivity,
  },
  {
    step: '04',
    title: 'Take Action',
    desc: 'Use risk information and clinical insights to support follow-up and healthcare workflows.',
    icon: FiCheck,
  },
];

/* ── Built Around Real Healthcare Workflows (4 Points) ── */
const whyCarePulseItems = [
  {
    step: '01',
    title: 'Connected Patient Management',
    desc: 'Keep essential patient information organized in one place.',
    icon: FiUsers,
  },
  {
    step: '02',
    title: 'Risk-Aware Care',
    desc: 'Use readmission risk assessment to identify patients who may require closer follow-up.',
    icon: FiActivity,
  },
  {
    step: '03',
    title: 'Role-Based Access',
    desc: 'Provide different healthcare roles with appropriate access to platform features and information.',
    icon: FiShield,
  },
  {
    step: '04',
    title: 'Clear Healthcare Analytics',
    desc: 'Understand patient and operational information through focused dashboards and reports.',
    icon: FiBarChart2,
  },
];

export default function Landing() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRoleKey = user?.role?.toString().toLowerCase().replace(/\s+/g, '_');
  const dashboardPath = user ? (
    userRoleKey === 'doctor' ? '/dashboard/doctor' :
    userRoleKey === 'hospital_admin' ? '/dashboard/admin' :
    userRoleKey === 'researcher' ? '/dashboard/researcher' :
    userRoleKey === 'system_admin' ? '/dashboard/sysadmin' : '/dashboard/doctor'
  ) : '/login';

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="top" className="min-h-screen bg-[#F4F8FF] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors duration-200">

      {/* ── Translucent Healthcare Navbar ── */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 text-white shadow-md transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to={user ? dashboardPath : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <FiActivity size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                CarePulse <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-blue-300/80 tracking-wider uppercase mt-0.5">
                Healthcare Management Platform
              </span>
            </div>
          </Link>

          {/* Center Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-200">
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); scrollToSection('top'); }}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#about"
              onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              About
            </a>
          </nav>

          {/* Right Action Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Link
                to={dashboardPath}
                className="btn-primary"
              >
                <span>Go to Dashboard</span>
                <FiArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-semibold text-slate-200 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  <span>Get Started</span>
                  <FiArrowRight size={15} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-200 hover:bg-white/10 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-800 bg-slate-900 px-6 py-4 space-y-3 text-slate-200"
            >
              <a
                href="#top"
                onClick={(e) => { e.preventDefault(); scrollToSection('top'); }}
                className="block py-2 text-sm font-semibold hover:text-blue-400"
              >
                Home
              </a>
              <a
                href="#features"
                onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
                className="block py-2 text-sm font-semibold hover:text-blue-400"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}
                className="block py-2 text-sm font-semibold hover:text-blue-400"
              >
                How It Works
              </a>
              <a
                href="#about"
                onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
                className="block py-2 text-sm font-semibold hover:text-blue-400"
              >
                About
              </a>
              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                {user ? (
                  <Link
                    to={dashboardPath}
                    className="btn-primary w-full text-center"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn-secondary w-full text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary w-full text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Full-Screen Clinical Healthcare Hero Section ── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        
        {/* Background Image with Deep Navy & Royal Blue Translucent Healthcare Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000')`
          }}
        >
          {/* Deep Navy / Royal Blue Translucent Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(8, 25, 55, 0.76) 0%, rgba(20, 45, 95, 0.82) 100%)'
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Hero Centered Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-20 w-full text-center flex flex-col items-center justify-center">
          <motion.div {...fadeUp(0)} className="flex flex-col items-center space-y-6 max-w-3xl">
            
            {/* Small Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>HEALTHCARE MANAGEMENT PLATFORM</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight">
              Intelligent Healthcare, <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Simplified.
              </span>
            </h1>

            {/* Short Supporting Description */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto">
              Manage patients, assess risk, and streamline clinical workflows in one secure platform.
            </p>

            {/* Compact Healthcare Feature Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 pt-5 border-t border-white/15 text-xs font-semibold text-slate-200 w-full max-w-2xl">
              <div className="flex items-center gap-1.5">
                <span className="text-blue-400 font-bold text-sm">•</span>
                <span>Patient Risk Assessment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-400 font-bold text-sm">•</span>
                <span>Secure Patient Management</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-400 font-bold text-sm">•</span>
                <span>Clinical Insights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-400 font-bold text-sm">•</span>
                <span>Healthcare Analytics</span>
              </div>
            </div>

          </motion.div>
        </div>

      </section>

      {/* ── Feature Capabilities Bar ── */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilityPillars.map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeUp(idx * 0.08)}
              >
                <Link
                  to={item.route}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <item.icon size={19} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative z-10 scroll-mt-20">
        <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-blue-700 dark:text-blue-300 uppercase bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-3.5 py-1.5 rounded-full">
            Core Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Everything You Need to Manage Healthcare
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            CarePulse AI brings essential patient and clinical workflows together in one connected workspace.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
          {coreFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              {...fadeUp(idx * 0.1)}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden"
            >
              <Link to={feature.route} className="p-7 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-xs">
                      <feature.icon size={22} />
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  <span>View module</span>
                  <FiArrowRight className="ml-1.5 group-hover:translate-x-1.5 transition-transform" size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800 relative z-10 scroll-mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest text-indigo-700 dark:text-indigo-300 uppercase bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 px-3 py-1 rounded-full">
              Clinical Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How CarePulse AI Works
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              A simple workflow for managing patient information and turning clinical data into useful insights.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7 relative">
            {howItWorksSteps.map((step, idx) => (
              <motion.div
                key={idx}
                {...fadeUp(idx * 0.1)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-7 shadow-sm relative group hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <step.icon size={20} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6 relative z-10 scroll-mt-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <motion.div {...fadeUp(0)} className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold tracking-widest text-blue-700 dark:text-blue-300 uppercase bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-3.5 py-1.5 rounded-full">
              About CarePulse AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              About CarePulse AI
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              <p>
                CarePulse AI is a healthcare management platform designed to simplify patient-focused workflows and provide healthcare teams with useful clinical information.
              </p>
              <p>
                The platform combines patient management, risk assessment, clinical insights, appointment management, and healthcare analytics in a single workspace.
              </p>
            </div>
            
            <div className="pt-2 flex items-center gap-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900">
                <FiShield className="text-blue-600 dark:text-blue-400" size={18} />
                <span>Enterprise Clinical Security</span>
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900">
                <FiActivity className="text-blue-600 dark:text-blue-400" size={18} />
                <span>Role-Based Workflows</span>
              </span>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="lg:col-span-6">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-8 sm:p-10 rounded-3xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-xl font-bold text-white mb-4">Unified Clinical Intelligence</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Designed to connect doctors, hospital administrators, researchers, and system managers in one intuitive operational environment.
              </p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div className="space-y-1">
                  <p className="text-xs text-blue-300 uppercase font-bold">Patient Records</p>
                  <p className="text-sm font-semibold text-white">Centralized Intake</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-blue-300 uppercase font-bold">Risk Scoring</p>
                  <p className="text-sm font-semibold text-white">Machine Learning</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-blue-300 uppercase font-bold">Clinical Care</p>
                  <p className="text-sm font-semibold text-white">Decision Support</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-blue-300 uppercase font-bold">Analytics</p>
                  <p className="text-sm font-semibold text-white">Real-Time Dashboards</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Why CarePulse AI Section ── */}
      <section id="why-carepulse" className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800 relative z-10 scroll-mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest text-purple-700 dark:text-purple-300 uppercase bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 px-3 py-1 rounded-full">
              Workflow Integration
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Built Around Real Healthcare Workflows
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              Designed to streamline everyday clinical operations and empower healthcare teams.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
            {whyCarePulseItems.map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeUp(idx * 0.08)}
                className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <item.icon size={19} />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call To Action Section ── */}
      <section className="py-20 max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          {...fadeUp()}
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-10 sm:p-14 text-center text-white border border-slate-800 shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              One Workspace for Better Healthcare Management
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Manage patients, appointments, risk assessments, clinical insights, and analytics from one connected platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to={user ? dashboardPath : "/register"}
                className="px-8 py-3.5 text-base font-bold text-slate-900 bg-white hover:bg-slate-50 rounded-xl shadow-md transition-all flex items-center gap-2 group"
              >
                <span>{user ? 'Go to Dashboard' : 'Get Started'}</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Professional Healthcare Footer ── */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800 text-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Main Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
            
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                  <FiActivity size={18} />
                </div>
                <span className="font-extrabold text-white text-xl">CarePulse AI</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Healthcare management and clinical intelligence in one connected platform.
              </p>
              <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                <FiShield className="text-blue-400" size={14} />
                <span>Enterprise Clinical Security</span>
              </div>
            </div>

            {/* Product Column */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">PRODUCT</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-white transition-colors">Patient Management</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-white transition-colors">Risk Assessment</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-white transition-colors">Clinical Insights</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-white transition-colors">Healthcare Analytics</a></li>
              </ul>
            </div>

            {/* Workflow Column */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">WORKFLOW</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} className="hover:text-white transition-colors">How It Works</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Appointments</Link></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-white transition-colors">Reports</a></li>
                <li><Link to={user ? dashboardPath : "/login"} className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Company / Account Column */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">COMPANY & ACCOUNT</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="hover:text-white transition-colors">About</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-white transition-colors">Features</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; 2026 CarePulse AI. All rights reserved.</p>
            <p className="font-medium text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Secure Healthcare Management</span>
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}