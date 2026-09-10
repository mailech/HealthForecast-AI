import React, { useState } from 'react';
import { Patient } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge } from '../common/RiskBadge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Activity,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  ChevronDown,
  Info,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

interface RiskPredictionsViewProps {
  patients: Patient[];
  selectedPatientId?: string;
  onSelectPatient: (patient: Patient) => void;
}

export const RiskPredictionsView: React.FC<RiskPredictionsViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient
}) => {
  const { isAnonymizedView } = useAuth();

  // Selected patient state
  const initialPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const [currentPatient, setCurrentPatient] = useState<Patient>(initialPatient);
  const [isInferencing, setIsInferencing] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<'xgboost' | 'randomforest'>('xgboost');
  const [inferenceSuccessToast, setInferenceSuccessToast] = useState(false);

  // Switch patient handler
  const handlePatientChange = (patientId: string) => {
    const found = patients.find(p => p.id === patientId);
    if (found) {
      setCurrentPatient(found);
    }
  };

  // Simulated Re-run Inference
  const handleRerunInference = () => {
    setIsInferencing(true);
    setTimeout(() => {
      setIsInferencing(false);
      setInferenceSuccessToast(true);
      setTimeout(() => setInferenceSuccessToast(false), 3000);
    }, 900);
  };

  const displayName = isAnonymizedView()
    ? (currentPatient.anonymizedId || 'PT-ANON-XXXX')
    : currentPatient.name;

  // Transform risk factors for bar chart
  const featureChartData = currentPatient.riskFactors.map(rf => ({
    name: rf.factor.length > 24 ? rf.factor.substring(0, 24) + '...' : rf.factor,
    fullName: rf.factor,
    impact: rf.impactScore,
    category: rf.category
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Patient Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Patient Risk Prediction Engine
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
              FastAPI ML Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-factor hospital readmission inference based on Diabetes 130-US Hospitals feature models.
          </p>
        </div>

        {/* Patient Dropdown & Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative min-w-[240px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Select Patient Dossier</label>
            <select
              value={currentPatient.id}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              {patients.map((p) => {
                const pName = isAnonymizedView() ? (p.anonymizedId || 'PT-ANON') : p.name;
                return (
                  <option key={p.id} value={p.id}>
                    {pName} ({p.id}) — {p.riskLevel} [{p.riskScore}%]
                  </option>
                );
              })}
            </select>
          </div>

          <div className="pt-3 sm:pt-4">
            <button
              onClick={handleRerunInference}
              disabled={isInferencing}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isInferencing ? 'animate-spin' : ''}`} />
              <span>{isInferencing ? 'Running Inference...' : 'Re-Run AI Inference'}</span>
            </button>
          </div>
        </div>
      </div>

      <DisclaimerBanner type="demo" />

      {inferenceSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>Inference completed in 34ms via XGBoost engine. Feature impact weights updated.</span>
        </div>
      )}

      {/* Patient Summary Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
            {isAnonymizedView() ? 'PT' : currentPatient.name.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white">{displayName}</h2>
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">
                {isAnonymizedView() ? 'ANON-ID' : currentPatient.id}
              </span>
              <RiskBadge level={currentPatient.riskLevel} score={currentPatient.riskScore} />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              <span>{currentPatient.age} yrs • {currentPatient.gender}</span>
              <span>•</span>
              <span>Dept: {currentPatient.department}</span>
              <span>•</span>
              <span>Physician: {currentPatient.assignedDoctorName}</span>
              <span>•</span>
              <span>Admitted: {currentPatient.admissionDate} ({currentPatient.lengthOfStay}d stay)</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onSelectPatient(currentPatient)}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 self-start md:self-center cursor-pointer"
        >
          <span>Open Full Dossier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Score Cards & Dial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Risk Score Gauge Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Composite Risk Score
              </span>
              <RiskBadge level={currentPatient.riskLevel} size="sm" />
            </div>

            <div className="my-6 text-center">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {currentPatient.riskScore}
                </span>
                <span className="text-lg font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Stratified: {currentPatient.riskLevel} RISK COHORT
              </p>
            </div>

            {/* Gauge bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentPatient.riskLevel === 'HIGH'
                    ? 'bg-red-500'
                    : currentPatient.riskLevel === 'MEDIUM'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${currentPatient.riskScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 mt-1.5">
              <span>0 (Low)</span>
              <span>40 (Medium)</span>
              <span>70 (High)</span>
              <span>100</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Confidence Score: <strong className="text-slate-800">{currentPatient.confidenceScore}%</strong> based on 101k Diabetes dataset encounters.
          </div>
        </div>

        {/* 30-Day Readmission Probability */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                30-Day Readmission Probability
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">
                Post-Discharge
              </span>
            </div>

            <div className="my-6 text-center">
              <span className="text-5xl font-black text-sky-700 tracking-tight">
                {Math.round(currentPatient.readmissionProbability * 100)}%
              </span>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Likelihood of unscheduled return &lt; 30 days
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Baseline Hospital Avg:</span>
                <span className="font-semibold text-slate-800">14.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">National CMS Benchmark:</span>
                <span className="font-semibold text-slate-800">15.0%</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Patient Variance:</span>
                <span className="font-bold text-red-600">
                  +{Math.round(currentPatient.readmissionProbability * 100 - 15)}% vs Benchmark
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Recommended Action: Schedule 7-day post-discharge care coordination.
          </div>
        </div>

        {/* Model Execution Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Inference Specifications
              </span>
              <Cpu className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">Active Pipeline:</span>
                <span className="font-mono font-bold text-slate-900">{currentPatient.modelVersion}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">Model Architecture:</span>
                <span className="font-semibold text-slate-900">Gradient Boosted Trees (XGBoost)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">Feature Count:</span>
                <span className="font-semibold text-slate-900">47 Engineered Clinical Features</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">Prediction Timestamp:</span>
                <span className="font-semibold text-slate-900">{currentPatient.predictionTimestamp}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Execution Status:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Real-time Validated
            </span>
          </div>
        </div>
      </div>

      {/* Feature Importance / Risk Breakdown Chart (SHAP values style) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                AI Risk Factor Breakdown & Feature Weights
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                SHAP Interpretability
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Relative feature weight contribution towards this patient's predicted readmission score
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Trained on 101,766 clinical encounters
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Chart */}
          <div className="lg:col-span-7 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 40]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={140} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val}% Weight`, 'Feature Impact']}
                />
                <Bar dataKey="impact" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature details list */}
          <div className="lg:col-span-5 space-y-2.5 max-h-64 overflow-y-auto">
            {currentPatient.riskFactors.map((rf, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-0.5">
                  <span>{rf.factor}</span>
                  <span className="text-sky-700">{rf.impactScore}% Weight</span>
                </div>
                <p className="text-slate-600 text-[11px]">{rf.description}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 uppercase">
                  Category: {rf.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Risk Trajectory during Current Stay */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Inpatient Risk Score Trajectory (Day-by-Day)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracking how patient risk fluctuates during inpatient care and treatment administration
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Length of Stay: {currentPatient.lengthOfStay} Days
          </span>
        </div>

        <div className="h-56 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentPatient.historicalRisk}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Calculated Risk Score"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0284c7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
