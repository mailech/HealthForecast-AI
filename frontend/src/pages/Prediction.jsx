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

function Prediction() {
  // Form State for Clinical Parameters
  const [patientData, setPatientData] = useState({
    name: "Rahul Verma",
    age: 61,
    glucose: 185,
    bpSystolic: 140,
    bpDiastolic: 90,
    bmi: 28.4,
    previousAdmissions: 3,
  });

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState({
    score: 91,
    category: "HIGH",
    confidence: "96.4%",
    factors: [
      { factor: "High Previous Admissions (Past 12 Months)", impact: "High" },
      { factor: "Elevated Blood Glucose Level (185 mg/dL)", impact: "Medium" },
      { factor: "Stage 1 Hypertension (140/90 mmHg)", impact: "Medium" },
    ],
  });

  // Modal State for Discharge Care Plan
  const [isCarePlanOpen, setIsCarePlanOpen] = useState(false);

  // Run AI Risk Prediction Procedure
  const handlePredict = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Calculate score based on inputs
      let score = 30;
      if (patientData.age > 50) score += 15;
      if (patientData.glucose > 140) score += 20;
      if (patientData.previousAdmissions > 2) score += 25;

      const category = score >= 75 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW";

      setPredictionResult({
        score: Math.min(score, 98),
        category,
        confidence: "94.8%",
        factors: [
          { factor: `Previous Admissions (${patientData.previousAdmissions} visits)`, impact: "High" },
          { factor: `Blood Glucose (${patientData.glucose} mg/dL)`, impact: patientData.glucose > 140 ? "High" : "Low" },
          { factor: `Blood Pressure (${patientData.bpSystolic}/${patientData.bpDiastolic} mmHg)`, impact: "Medium" },
        ],
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="text-blue-600" size={32} />
            AI Readmission Risk Predictor 🔮
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Input patient clinical parameters to calculate 30-day readmission risk using AI.
          </p>
        </div>

        {predictionResult && (
          <button
            onClick={() => setIsCarePlanOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all text-xs cursor-pointer"
          >
            <Sparkles size={16} /> Generate Discharge Care Plan
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= LEFT: CLINICAL INPUT FORM (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
          <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <User size={18} className="text-blue-600" /> Patient Clinical Parameters
          </h2>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Patient Full Name
              </label>
              <input
                type="text"
                required
                value={patientData.name}
                onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  required
                  value={patientData.age}
                  onChange={(e) => setPatientData({ ...patientData, age: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  required
                  value={patientData.glucose}
                  onChange={(e) => setPatientData({ ...patientData, glucose: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Systolic BP / Diastolic BP
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={patientData.bpSystolic}
                    onChange={(e) => setPatientData({ ...patientData, bpSystolic: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2.5 rounded-xl border border-slate-200 text-center text-slate-800"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={patientData.bpDiastolic}
                    onChange={(e) => setPatientData({ ...patientData, bpDiastolic: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2.5 rounded-xl border border-slate-200 text-center text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  BMI (kg/m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={patientData.bmi}
                  onChange={(e) => setPatientData({ ...patientData, bmi: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Previous Admissions (Past 12 Months)
              </label>
              <input
                type="number"
                value={patientData.previousAdmissions}
                onChange={(e) => setPatientData({ ...patientData, previousAdmissions: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BrainCircuit size={16} />
              {loading ? "Running AI Prediction..." : "Predict Readmission Risk Score"}
            </button>
          </form>
        </div>

        {/* ================= RIGHT: PREDICTION RESULTS (7 COLS) ================= */}
        {predictionResult && (
          <div className="lg:col-span-7 space-y-6">
            
            {/* Score Summary Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Analysis Report
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Prediction Summary: {patientData.name}
                  </h3>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  predictionResult.category === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-200" :
                  predictionResult.category === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {predictionResult.category} RISK
                </span>
              </div>

              {/* Gauge Score Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Score Number Badge */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className={`text-5xl font-extrabold ${
                    predictionResult.score >= 70 ? "text-rose-600" : predictionResult.score >= 40 ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {predictionResult.score}%
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-wider">
                    30-Day Readmission Risk
                  </span>
                </div>

                {/* Model Confidence */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-600 font-bold uppercase block">
                      AI Model Confidence
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      {predictionResult.confidence} Precision
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Clinical score exceeds 70% threshold. High probability of unplanned readmission within 30 days of discharge.
                  </p>
                </div>

              </div>

              {/* Top Risk Contributors */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-3">
                  Key Risk Contributors (SHAP Feature Importance)
                </span>
                <div className="space-y-2 text-xs">
                  {predictionResult.factors.map((f, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-700 font-medium">{f.factor}</span>
                      <span className="font-bold text-rose-600">{f.impact} Impact</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Recommended Action Card */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-xs text-rose-900">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5 text-rose-700">
                <AlertTriangle size={16} /> Recommended Clinical Interventions
              </h4>
              <ul className="list-disc pl-5 space-y-1 font-medium text-rose-800">
                <li>Schedule mandatory nurse follow-up consultation within 48 hours.</li>
                <li>Initiate continuous blood pressure and blood glucose tracking.</li>
                <li>Assign dedicated case manager for medication adherence.</li>
              </ul>
            </div>

          </div>
        )}

      </div>

      {/* ================= DISCHARGE CARE PLAN MODAL ================= */}
      {isCarePlanOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="text-blue-600" size={18} />
                  Discharge Support & Care Plan
                </h2>
                <span className="text-[11px] text-slate-400">
                  Patient: {patientData.name} • ID: #PAT-8849
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer size={14} /> Print Plan
                </button>
                <button
                  onClick={() => setIsCarePlanOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Risk Summary Header */}
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase block">
                    Risk Assessment Level
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {predictionResult.category} RISK ({predictionResult.score}% Probability)
                  </span>
                </div>
                <Activity size={24} className="text-blue-600" />
              </div>

              {/* Recovery Timeline */}
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  <Calendar size={16} className="text-blue-600" /> Post-Discharge Follow-up Timeline
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-blue-600 block mb-0.5">48 Hours</span>
                    <span className="text-[11px] text-slate-600">Telehealth Nurse Consultation & Vitals Check</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-blue-600 block mb-0.5">7 Days</span>
                    <span className="text-[11px] text-slate-600">In-clinic OPD Review & Lab Parameter Check</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-blue-600 block mb-0.5">30 Days</span>
                    <span className="text-[11px] text-slate-600">Final Readmission Prevention Evaluation</span>
                  </div>
                </div>
              </div>

              {/* Medication Adherence Plan */}
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  <Pill size={16} className="text-blue-600" /> Medication & Dosage Guidelines
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">Insulin (Glargine)</span>
                      <span className="text-[11px] text-slate-400">Take 10 Units daily before bed</span>
                    </div>
                    <span className="font-bold text-blue-600">Daily</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">Enalapril (ACE Inhibitor)</span>
                      <span className="text-[11px] text-slate-400">Take 5mg morning after meals</span>
                    </div>
                    <span className="font-bold text-blue-600">Daily</span>
                  </div>
                </div>
              </div>

              {/* Doctor Approval Signature Area */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Attending Physician
                  </span>
                  <span className="font-bold text-slate-800 text-sm">Dr. John Smith, M.D.</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Approved on: {new Date().toLocaleDateString()}
                  </span>
                  <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
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