import React, { useState } from "react";
import {
  BrainCircuit,
  FileText,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pill,
  X,
  Sparkles,
  User,
  Activity,
} from "lucide-react";
import SpotlightCard from "../components/SpotlightCard";
import API_BASE_URL from "../services/api";

function Prediction() {
  // Form State for Clinical Parameters
  const [patientData, setPatientData] = useState({
    name: "Rahul Verma",
    age_range: "[60-70)",
    time_in_hospital: 4,
    num_lab_procedures: 45,
    num_medications: 14,
    number_inpatient: 2,
    number_emergency: 1,
    number_diagnoses: 8,
    max_glu_serum: ">200",
    A1Cresult: ">8",
    diabetesMed: "Yes",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  // Modal State for Discharge Care Plan
  const [isCarePlanOpen, setIsCarePlanOpen] = useState(false);

  // Run AI Risk Prediction Procedure
  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/prediction/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientName: patientData.name,
          age_range: patientData.age_range,
          time_in_hospital: Number(patientData.time_in_hospital),
          num_lab_procedures: Number(patientData.num_lab_procedures),
          num_medications: Number(patientData.num_medications),
          number_inpatient: Number(patientData.number_inpatient),
          number_emergency: Number(patientData.number_emergency),
          number_diagnoses: Number(patientData.number_diagnoses),
          max_glu_serum: patientData.max_glu_serum,
          A1Cresult: patientData.A1Cresult,
          diabetesMed: patientData.diabetesMed,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || resJson.message || "Prediction API request failed.");
      }

      const resData = resJson.data;

      const factors = resData.feature_explanations
        ? resData.feature_explanations.map((exp) => ({
            factor: exp.risk_contribution || `${exp.feature_name}: ${exp.value}`,
            impact: exp.importance_weight > 0.18 ? "High" : exp.importance_weight > 0.1 ? "Medium" : "Low",
          }))
        : [];

      setPredictionResult({
        score: resData.score,
        category: resData.level,
        confidence: typeof resData.confidence === "number" ? `${resData.confidence}%` : resData.confidence,
        factors,
        recommendations: resData.recommendations || [],
        algorithm: resData.algorithm,
        model_version: resData.model_version,
      });
    } catch (err) {
      console.error("Prediction request failed:", err);
      setError(err.message || "Failed to connect to ML Prediction Service.");
      setPredictionResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#090D16] min-h-screen font-sans text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="text-emerald-400" size={32} />
            AI Readmission Risk Predictor 🔮
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Input patient clinical parameters to calculate 30-day readmission risk using AI.
          </p>
        </div>

        {predictionResult && (
          <button
            onClick={() => setIsCarePlanOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all text-xs cursor-pointer"
          >
            <Sparkles size={16} /> Generate Discharge Care Plan
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle size={18} className="text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= LEFT: CLINICAL INPUT FORM (5 COLS) ================= */}
        <SpotlightCard className="lg:col-span-5 p-6">
          <h2 className="text-base font-semibold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
            <User size={18} className="text-emerald-400" /> Patient Clinical Parameters
          </h2>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Patient Full Name
              </label>
              <input
                type="text"
                required
                value={patientData.name}
                onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Age Range
                </label>
                <select
                  value={patientData.age_range}
                  onChange={(e) => setPatientData({ ...patientData, age_range: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-white font-mono font-bold"
                >
                  <option value="[0-10)">[0-10) Years</option>
                  <option value="[10-20)">[10-20) Years</option>
                  <option value="[20-30)">[20-30) Years</option>
                  <option value="[30-40)">[30-40) Years</option>
                  <option value="[40-50)">[40-50) Years</option>
                  <option value="[50-60)">[50-60) Years</option>
                  <option value="[60-70)">[60-70) Years</option>
                  <option value="[70-80)">[70-80) Years</option>
                  <option value="[80-90)">[80-90) Years</option>
                  <option value="[90-100)">[90-100) Years</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Length of Stay (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  required
                  value={patientData.time_in_hospital}
                  onChange={(e) => setPatientData({ ...patientData, time_in_hospital: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Lab Procedures Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  required
                  value={patientData.num_lab_procedures}
                  onChange={(e) => setPatientData({ ...patientData, num_lab_procedures: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Distinct Medications Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={patientData.num_medications}
                  onChange={(e) => setPatientData({ ...patientData, num_medications: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Inpatient Stays (Past 12 Mo)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={patientData.number_inpatient}
                  onChange={(e) => setPatientData({ ...patientData, number_inpatient: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Emergency Visits (Past 12 Mo)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={patientData.number_emergency}
                  onChange={(e) => setPatientData({ ...patientData, number_emergency: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Total Diagnoses Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={patientData.number_diagnoses}
                  onChange={(e) => setPatientData({ ...patientData, number_diagnoses: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Max Serum Glucose
                </label>
                <select
                  value={patientData.max_glu_serum}
                  onChange={(e) => setPatientData({ ...patientData, max_glu_serum: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                >
                  <option value="None">None (Not Tested)</option>
                  <option value="Norm">Norm (Normal)</option>
                  <option value=">200">&gt;200 mg/dL</option>
                  <option value=">300">&gt;300 mg/dL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  HbA1c Result
                </label>
                <select
                  value={patientData.A1Cresult}
                  onChange={(e) => setPatientData({ ...patientData, A1Cresult: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                >
                  <option value="None">None (Not Tested)</option>
                  <option value="Norm">Norm (Normal)</option>
                  <option value=">7">&gt;7%</option>
                  <option value=">8">&gt;8%</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Prescribed Diabetes Meds
                </label>
                <select
                  value={patientData.diabetesMed}
                  onChange={(e) => setPatientData({ ...patientData, diabetesMed: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BrainCircuit size={16} />
              {loading ? "Running AI Prediction..." : "Predict Readmission Risk Score"}
            </button>
          </form>
        </SpotlightCard>

        {/* ================= RIGHT: PREDICTION RESULTS (7 COLS) ================= */}
        {predictionResult && (
          <div className="lg:col-span-7 space-y-6">
            
            {/* Score Summary Card */}
            <SpotlightCard className="p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Analysis Report
                  </span>
                  <h3 className="text-xl font-semibold text-white">
                    Prediction Summary: {patientData.name}
                  </h3>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  predictionResult.category === "HIGH" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
                  predictionResult.category === "MEDIUM" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}>
                  {predictionResult.category} RISK
                </span>
              </div>

              {/* Gauge Score Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Score Number Badge */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <span className={`text-5xl font-mono font-bold ${
                    predictionResult.score >= 40 ? "text-rose-400" : predictionResult.score >= 20 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {predictionResult.score}%
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase mt-1 tracking-wider">
                    30-Day Readmission Risk
                  </span>
                </div>

                {/* Model Confidence / Probability */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block">
                      Readmission Probability
                    </span>
                    <span className="text-lg font-mono font-bold text-white">
                      {predictionResult.confidence}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Clinical risk evaluated by {predictionResult.algorithm || "RandomForestClassifier"} model trained on Diabetes 130-US Hospitals Dataset.
                  </p>
                </div>

              </div>

              {/* Top Risk Contributors */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-3">
                  Key Risk Contributors (Random Forest Feature Importance)
                </span>
                <div className="space-y-2 text-xs">
                  {predictionResult.factors.map((f, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-slate-300 font-medium">{f.factor}</span>
                      <span className="font-mono font-bold text-rose-400">{f.impact} Impact</span>
                    </div>
                  ))}
                </div>
              </div>

            </SpotlightCard>

            {/* Recommended Action Card */}
            <div className="bg-rose-950/20 border border-rose-500/30 border-t border-white/10 rounded-2xl p-5 text-xs text-rose-200">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5 text-rose-400">
                <AlertTriangle size={16} /> Recommended Clinical Interventions
              </h4>
              <ul className="list-disc pl-5 space-y-1 font-medium text-rose-300">
                {predictionResult.recommendations && predictionResult.recommendations.length > 0 ? (
                  predictionResult.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))
                ) : (
                  <li>No specific interventions recommended.</li>
                )}
              </ul>
            </div>

          </div>
        )}

      </div>

      {/* ================= DISCHARGE CARE PLAN MODAL ================= */}
      {isCarePlanOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-800 border-t border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="text-emerald-400" size={18} />
                  Discharge Support & Care Plan
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  Patient: {patientData.name} • ID: #PAT-8849
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer size={14} /> Print Plan
                </button>
                <button
                  onClick={() => setIsCarePlanOpen(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              
              {/* Risk Summary Header */}
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">
                    Risk Assessment Level
                  </span>
                  <span className="text-base font-mono font-bold text-white">
                    {predictionResult.category} RISK ({predictionResult.score}% Probability)
                  </span>
                </div>
                <Activity size={24} className="text-emerald-400" />
              </div>

              {/* Recovery Timeline */}
              <div>
                <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5">
                  <Calendar size={16} className="text-emerald-400" /> Post-Discharge Follow-up Timeline
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-mono font-bold text-emerald-400 block mb-0.5">48 Hours</span>
                    <span className="text-[11px] text-slate-400">Telehealth Nurse Consultation & Vitals Check</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-mono font-bold text-emerald-400 block mb-0.5">7 Days</span>
                    <span className="text-[11px] text-slate-400">In-clinic OPD Review & Lab Parameter Check</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-mono font-bold text-emerald-400 block mb-0.5">30 Days</span>
                    <span className="text-[11px] text-slate-400">Final Readmission Prevention Evaluation</span>
                  </div>
                </div>
              </div>

              {/* Medication Adherence Plan */}
              <div>
                <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5">
                  <Pill size={16} className="text-emerald-400" /> Medication & Dosage Guidelines
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Insulin (Glargine)</span>
                      <span className="text-[11px] text-slate-400">Take 10 Units daily before bed</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">Daily</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Enalapril (ACE Inhibitor)</span>
                      <span className="text-[11px] text-slate-400">Take 5mg morning after meals</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">Daily</span>
                  </div>
                </div>
              </div>

              {/* Doctor Approval Signature Area */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Attending Physician
                  </span>
                  <span className="font-bold text-white text-sm">Dr. John Smith, M.D.</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono font-semibold">
                    Approved on: {new Date().toLocaleDateString()}
                  </span>
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 size={14} /> Clinical Approval Certified
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Prediction;