import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, BrainCircuit, ShieldAlert, ArrowRight, CheckCircle, BarChart3, Stethoscope, Award, Users } from 'lucide-react';
import { Footer } from '../components/Footer';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="glass-nav sticky top-0 z-50 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-cyan to-medical-teal flex items-center justify-center shadow-cyan-glow">
            <Activity className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">HealthForecast AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-medical-cyan to-medical-teal text-slate-950 shadow-cyan-glow hover:opacity-90 transition-opacity"
          >
            Launch System
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 space-y-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-medical-cyan/10 border border-medical-cyan/30 text-medical-cyan text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              <span>Next-Gen Readmission Intelligence</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Predict Hospital Readmission <span className="bg-gradient-to-r from-medical-cyan via-medical-teal to-emerald-400 bg-clip-text text-transparent">Before Discharge</span>
            </h1>
            
            <p className="text-slate-400 text-base lg:text-lg leading-relaxed">
              Empowering clinical teams with machine learning risk scoring, LACE index automation, and personalized post-discharge intervention workflows.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/predict"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-medical-cyan to-medical-teal text-slate-950 font-bold text-sm shadow-cyan-glow hover:scale-105 transition-all"
              >
                <span>Try AI Risk Predictor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-card text-white font-semibold text-sm hover:bg-slate-800/80 transition-all border border-slate-700"
              >
                <span>Explore Executive Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="glass-card p-6 lg:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-200">Patient Readmission Risk Assessment</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-medical-cyan/20 text-medical-cyan font-bold">LIVE ML SCORE</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-navy-900/80 border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">Eleanor Vance (Age 72)</p>
                  <p className="text-[11px] text-slate-400">Cardiology • Congestive Heart Failure</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-rose-400">78.4%</p>
                  <p className="text-[10px] text-rose-500 font-bold uppercase">High Risk</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 space-y-2">
                <p className="text-[11px] font-bold text-slate-300">Top Risk Factors (SHAP Analysis):</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <span className="p-2 rounded bg-slate-800/80 text-slate-300">• 3 Admissions in last 12 mos</span>
                  <span className="p-2 rounded bg-slate-800/80 text-slate-300">• LACE Index: 13 / 19</span>
                  <span className="p-2 rounded bg-slate-800/80 text-slate-300">• HbA1c: 8.6%</span>
                  <span className="p-2 rounded bg-slate-800/80 text-slate-300">• Polypharmacy (11 Rx)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
            <h3 className="text-3xl font-extrabold text-medical-cyan">34.2%</h3>
            <p className="text-xs text-slate-400 mt-1">Reduction in 30-Day Readmissions</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
            <h3 className="text-3xl font-extrabold text-medical-teal">$1.9M</h3>
            <p className="text-xs text-slate-400 mt-1">Annual Hospital Penalty Savings</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
            <h3 className="text-3xl font-extrabold text-emerald-400">91.4%</h3>
            <p className="text-xs text-slate-400 mt-1">RandomForest Model ROC-AUC Accuracy</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
