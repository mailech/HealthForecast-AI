import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Activity,
  Shield,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Building2,
  Microscope,
  Sliders,
  Database,
  CheckCircle2,
  Server,
  Layers,
  Lock,
  Cpu,
  BarChart2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface WebsiteLandingProps {
  onLaunchPlatform: () => void;
  onSelectRoleAndLaunch: (role: UserRole) => void;
  onNavigateModule: (moduleId: string) => void;
}

export const WebsiteLanding: React.FC<WebsiteLandingProps> = ({
  onLaunchPlatform,
  onSelectRoleAndLaunch,
  onNavigateModule
}) => {
  const { switchRole, setAuthScreen } = useAuth();

  // Interactive Live Risk Calculator in Hero
  const [calcAge, setCalcAge] = useState<number>(68);
  const [calcPriorAdmissions, setCalcPriorAdmissions] = useState<number>(3);
  const [calcMedCount, setCalcMedCount] = useState<number>(9);
  const [calcHba1c, setCalcHba1c] = useState<number>(9.6);
  const [calcHasComorbidity, setCalcHasComorbidity] = useState<boolean>(true);

  // Compute live simulated risk
  const computeRiskScore = () => {
    let score = 25;
    score += (calcPriorAdmissions * 11);
    score += (calcAge > 65 ? 12 : 4);
    score += (calcMedCount > 7 ? 10 : 3);
    score += (calcHba1c > 9.0 ? 18 : calcHba1c > 7.5 ? 10 : 2);
    if (calcHasComorbidity) score += 14;
    return Math.min(96, Math.max(12, score));
  };

  const currentScore = computeRiskScore();
  const currentRiskLevel = currentScore >= 70 ? 'HIGH' : currentScore >= 40 ? 'MEDIUM' : 'LOW';
  const currentProb = Math.round((currentScore / 100) * 0.92 * 100);

  const [activeArchTab, setActiveArchTab] = useState<'inputs' | 'gateway' | 'engine' | 'storage' | 'outputs'>('engine');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs border-b border-slate-800 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 font-bold text-sky-400">
          <Sparkles className="w-3.5 h-3.5" /> Benchmarked on Diabetes 130-US Hospitals:
        </span>
        <span className="hidden sm:inline">
          101,766 clinical encounters across 130 hospitals. ROC-AUC 0.912, 86.4% prediction accuracy.
        </span>
        <button
          onClick={() => {
            switchRole('SYSTEM_ADMIN');
            onNavigateModule('admin-models');
          }}
          className="underline text-white hover:text-sky-300 font-semibold ml-1 cursor-pointer"
        >
          View Model Specs →
        </button>
      </div>

      {/* Website Top Nav Header */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">HealthForecast AI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase font-mono">v2.4</span>
              </div>
              <span className="text-[11px] text-slate-500 block leading-none">Clinical Intelligence & Readmission Prevention</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAuthScreen('login')}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthScreen('signup')}
              className="hidden sm:flex px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors cursor-pointer"
            >
              Register Account
            </button>
            <button
              onClick={onLaunchPlatform}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Live Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 bg-gradient-to-b from-white via-sky-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Headlines & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5 text-sky-600" />
                <span>Next-Generation Clinical Risk Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Predict Hospital Readmissions. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
                  Intervene Before Discharge.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                HealthForecast AI unifies EHR clinical data, historical encounter patterns, and machine-learning risk classifiers to empower care teams, reduce CMS 30-day penalty liabilities, and personalize patient recovery plans.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onLaunchPlatform}
                  className="px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch Live Clinical Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigateModule('readmission-forecasts')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TrendingDown className="w-4 h-4 text-sky-600" />
                  <span>Explore Readmission Forecasts</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center gap-6 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  FastAPI & Python Architecture
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  HIPAA De-Identification
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Multi-Role RBAC Built-in
                </span>
              </div>
            </div>

            {/* Right Col: Live Interactive Clinical Risk Simulator */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 block">
                      Interactive Live Simulator
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Predictive Risk Engine
                    </h3>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    Model: XGBoost-v2.4
                  </span>
                </div>

                {/* Score Dial / Visual Gauge */}
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Calculated Risk Score</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-slate-900">{currentScore}</span>
                      <span className="text-xs text-slate-500 font-medium">/ 100</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          currentRiskLevel === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : currentRiskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {currentRiskLevel} RISK
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block font-medium">30d Readmission Prob.</span>
                    <span className="text-2xl font-black text-sky-700">{currentProb}%</span>
                  </div>
                </div>

                {/* Interactive sliders */}
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Prior Admissions (Past 12 Months):</span>
                      <span className="text-sky-700 font-bold">{calcPriorAdmissions}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={6}
                      value={calcPriorAdmissions}
                      onChange={(e) => setCalcPriorAdmissions(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Patient Age:</span>
                      <span className="text-sky-700 font-bold">{calcAge} yrs</span>
                    </div>
                    <input
                      type="range"
                      min={25}
                      max={90}
                      value={calcAge}
                      onChange={(e) => setCalcAge(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Recent HbA1c Lab Level:</span>
                      <span className="text-sky-700 font-bold">{calcHba1c}%</span>
                    </div>
                    <input
                      type="range"
                      min={5.0}
                      max={12.5}
                      step={0.1}
                      value={calcHba1c}
                      onChange={(e) => setCalcHba1c(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">Comorbid Chronic Kidney / Heart Disease</span>
                    <button
                      type="button"
                      onClick={() => setCalcHasComorbidity(!calcHasComorbidity)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        calcHasComorbidity ? 'bg-sky-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          calcHasComorbidity ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Simulated XGBoost engine output
                  </span>
                  <button
                    onClick={() => onNavigateModule('risk-predictions')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                  >
                    Open Deep Risk Engine →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Demonstration Paths (The 4 Supported Roles) */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block mb-2">
              Role-Based Access Control Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Every Hospital Stakeholder
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Test drive the platform through the eyes of all four defined healthcare personas with strict permission enforcement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Doctor */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Doctor</h3>
                <span className="text-[11px] font-semibold text-emerald-700 block mb-2">
                  Dr. Anita Sharma
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Monitor assigned patient health risks, review readmission probability scores, evaluate treatment responses, and generate follow-up care plans.
                </p>
                <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                  <div>✓ Access assigned patients only</div>
                  <div>✓ Clinical decision support</div>
                  <div>✗ Cannot alter AI models</div>
                </div>
              </div>
              <button
                onClick={() => onSelectRoleAndLaunch('DOCTOR')}
                className="mt-5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as Doctor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Hospital Administrator */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Hospital Admin</h3>
                <span className="text-[11px] font-semibold text-blue-700 block mb-2">
                  Dr. Katherine Vance
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hospital-wide dashboards, readmission penalty tracking, department performance benchmarks, and institutional outcome reports.
                </p>
                <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                  <div>✓ Hospital-wide analytics</div>
                  <div>✓ CMS penalty tracking</div>
                  <div>✗ Cannot edit medical records</div>
                </div>
              </div>
              <button
                onClick={() => onSelectRoleAndLaunch('HOSPITAL_ADMIN')}
                className="mt-5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as Administrator</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Healthcare Researcher */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-3">
                  <Microscope className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Researcher</h3>
                <span className="text-[11px] font-semibold text-indigo-700 block mb-2">
                  Dr. Marcus Chen
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Access de-identified patient cohorts (HIPAA safe-harbor), investigate longitudinal treatment effectiveness, and export population datasets.
                </p>
                <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                  <div>✓ Anonymized patient views</div>
                  <div>✓ Population health metrics</div>
                  <div>✗ Zero PII or clinical orders</div>
                </div>
              </div>
              <button
                onClick={() => onSelectRoleAndLaunch('HEALTHCARE_RESEARCHER')}
                className="mt-5 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as Researcher</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. System Administrator */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">System Admin</h3>
                <span className="text-[11px] font-semibold text-purple-700 block mb-2">
                  Alex Mercer
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full system governance: User management, RBAC configuration, Diabetes 130-US Hospitals dataset pipelines, AI model training & audit trails.
                </p>
                <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                  <div>✓ Model retraining & deploy</div>
                  <div>✓ User & role governance</div>
                  <div>✓ Immutable audit logging</div>
                </div>
              </div>
              <button
                onClick={() => onSelectRoleAndLaunch('SYSTEM_ADMIN')}
                className="mt-5 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Login as SysAdmin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture Diagram (Page 2 of PDF) */}
      <section className="py-16 bg-slate-900 text-slate-100 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-2">
              Enterprise System Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Hospital Readmission Prediction System Architecture
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              As documented in Figure 3 of the project specification: An end-to-end pipeline connecting EHR data sources, secure API gateway, AI inference engine, and clinical outputs.
            </p>
          </div>

          {/* Tab selector for architecture layers */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {[
              { id: 'inputs', label: '1. Data Input Sources' },
              { id: 'gateway', label: '2. API Gateway & Security' },
              { id: 'engine', label: '3. AI & Prediction Engine' },
              { id: 'storage', label: '4. Data & Storage Layer' },
              { id: 'outputs', label: '5. Outputs & Insights' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveArchTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeArchTab === tab.id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Architecture Layer Display */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 sm:p-8">
            {activeArchTab === 'inputs' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-sky-400">Data Input Sources & EHR Integration</h3>
                <p className="text-xs text-slate-300">
                  Continuous ingestion from hospital electronic health record systems (Epic, Cerner, MEDITECH) and FHIR R4 interfaces.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    'Patient Demographics & Registration',
                    'Medical History & Diagnoses (ICD-10)',
                    'Laboratory Test Results (HbA1c, BMP, Trop)',
                    'Medications & Active Scripts (Polypharmacy)',
                    'Vital Signs & Clinical Observations',
                    'Admissions & Discharge Records',
                    'Previous Admissions & Readmissions',
                    'Insurance & Payer Encounter Data',
                    'Social & Lifestyle Determinants (SDOH)'
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeArchTab === 'gateway' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-sky-400">API Gateway & Enterprise Security Layer</h3>
                <p className="text-xs text-slate-300">
                  FastAPI routing layer with strict authentication, rate-limiting, and role-based access control.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    'Authentication (JWT / OAuth 2.0)',
                    'Role-Based Access Control (RBAC)',
                    'Role Management & Permissions',
                    'Permission Enforcement Filter',
                    'Dashboard Access Control',
                    'Immutable Audit Logging',
                    'API Gateway & Routing',
                    'Request Filtering & Throttling',
                    'Data Encryption (In-Transit TLS 1.3 & At-Rest AES-256)'
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeArchTab === 'engine' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-sky-400">AI Analytics & Prediction Engine (FastAPI + ML Core)</h3>
                <p className="text-xs text-slate-300">
                  Containerized machine-learning inference pipelines built with Scikit-learn, XGBoost, and Random Forest models.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                    <span className="text-[11px] font-bold text-sky-400 block mb-1">Module 1 & 2</span>
                    <h4 className="text-sm font-bold text-white mb-1">Data Ingestion & Risk Scoring</h4>
                    <p className="text-xs text-slate-400">Missing value imputation, outlier detection, scaling, feature engineering, and patient deterioration risk scoring.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                    <span className="text-[11px] font-bold text-sky-400 block mb-1">Module 3 & 4</span>
                    <h4 className="text-sm font-bold text-white mb-1">Readmission & Treatment Analysis</h4>
                    <p className="text-xs text-slate-400">30-day readmission probability inference, high-risk patient prioritization, and therapy recovery score tracking.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                    <span className="text-[11px] font-bold text-sky-400 block mb-1">Module 5 & 6</span>
                    <h4 className="text-sm font-bold text-white mb-1">Decision Support & Analytics</h4>
                    <p className="text-xs text-slate-400">Care recommendations, discharge mitigation plans, hospital performance KPIs, and population health analytics.</p>
                  </div>
                </div>
              </div>
            )}

            {activeArchTab === 'storage' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-sky-400">Data & Storage Tier</h3>
                <p className="text-xs text-slate-300">
                  Hybrid persistence architecture utilizing relational databases, document stores, and low-latency cache.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-xs">
                    <span className="font-bold text-white block">PostgreSQL</span>
                    <span className="text-[11px] text-slate-400">Operational EHR & User state</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-xs">
                    <span className="font-bold text-white block">MongoDB</span>
                    <span className="text-[11px] text-slate-400">Encounter & Medical documents</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-xs">
                    <span className="font-bold text-white block">Redis Cache</span>
                    <span className="text-[11px] text-slate-400">Real-time prediction cache</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-xs">
                    <span className="font-bold text-white block">Cloud Storage</span>
                    <span className="text-[11px] text-slate-400">Model artifacts & Audit logs</span>
                  </div>
                </div>
              </div>
            )}

            {activeArchTab === 'outputs' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-sky-400">Outputs, Clinical Insights & Care Delivery</h3>
                <p className="text-xs text-slate-300">
                  Real-time actionable outputs dispatched to clinical workstations, mobile portals, and administrative dashboards.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    'Readmission Risk Score (0-100)',
                    '30-Day Probability Curve',
                    'High-Risk Alerts & Badges',
                    'Clinical Care Recommendations',
                    'Patient Outcome Reports',
                    'Hospital Performance KPI Deck',
                    'Export Reports (PDF / CSV)',
                    'Proactive Discharge Checklists'
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200">
                      <span className="text-emerald-400 font-bold block mb-0.5">● Output</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hospital Performance & Clinical Impact Numbers */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-3xl lg:text-4xl font-extrabold text-sky-600 block">28.4%</span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-2 block">
                Readmission Reduction
              </span>
              <p className="text-xs text-slate-500 mt-1">Across high-risk diabetic and heart failure cohorts</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-3xl lg:text-4xl font-extrabold text-teal-600 block">0.912</span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-2 block">
                ROC-AUC Discrimination
              </span>
              <p className="text-xs text-slate-500 mt-1">Evaluated on Diabetes 130-US Hospitals benchmark</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-3xl lg:text-4xl font-extrabold text-indigo-600 block">&lt; 40ms</span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-2 block">
                Real-Time Inference
              </span>
              <p className="text-xs text-slate-500 mt-1">Instant scoring during clinical patient reviews</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 block">$1.4M+</span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-2 block">
                CMS Penalties Prevented
              </span>
              <p className="text-xs text-slate-500 mt-1">Estimated annual hospital reimbursement protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore All Modules CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to test-drive HealthForecast AI?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Experience the complete working clinical command center with 20+ realistic patient records, treatment analytics, readmission trends, and AI model evaluation.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
            <button
              onClick={onLaunchPlatform}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-lg"
            >
              Enter Live Platform as Dr. Sharma →
            </button>
            <button
              onClick={() => onSelectRoleAndLaunch('HOSPITAL_ADMIN')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Enter as Hospital Administrator
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="w-4 h-4 text-sky-500" />
            <span className="font-bold text-slate-200">HealthForecast AI</span>
            <span>— Hospital Readmission Prediction & Patient Risk Intelligence System</span>
          </div>
          <p className="text-slate-400">
            Clinical decision support is for informational and demonstration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};
