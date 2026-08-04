import React, { useState } from 'react';
import { BrainCircuit, Sparkles, AlertCircle, CheckCircle, Shield, RefreshCw } from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';
import { healthApi } from '../services/api';

export const AIRiskPredictionPage = () => {
  const [formData, setFormData] = useState({
    age: 72,
    prior_admissions: 3,
    emergency_visits: 2,
    length_of_stay: 7,
    charlson_index: 4,
    lace_index: 13,
    hba1c: 8.6,
    serum_sodium: 132.5,
    creatinine: 2.1,
    polypharmacy_count: 11
  });

  const [prediction, setPrediction] = useState({
    risk_score: 78.4,
    risk_level: "High",
    confidence: 0.91,
    key_factors: [
      { factor: "High Prior Admission Count", impact: "High", value: "3 visits in last 12 mos" },
      { factor: "Elevated LACE Clinical Index", impact: "High", value: "LACE = 13/19" },
      { factor: "Uncontrolled Glycemia (HbA1c)", impact: "High", value: "HbA1c = 8.6%" },
      { factor: "Hyponatremia", impact: "Moderate", value: "Serum Na = 132.5 mEq/L" },
      { factor: "Polypharmacy Regimen", impact: "Moderate", value: "11 active medications" }
    ],
    recommendations: [
      "Assign dedicated post-discharge care navigator & tele-check within 48h",
      "Endocrinology consult & insulin regimen adjustment prior to discharge",
      "Clinical pharmacist medication reconciliation & regimen simplification",
      "Schedule priority outpatient cardiology visit within 7 days"
    ]
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await healthApi.predictRisk(formData);
      setPrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-cyan/20 text-medical-cyan border border-medical-cyan/30 text-xs font-bold uppercase tracking-wider mb-2">
            <BrainCircuit className="w-4 h-4" />
            <span>RandomForest Machine Learning Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Readmission Risk Predictor</h1>
          <p className="text-xs text-slate-400">Input clinical biomarkers and utilization metrics to compute real-time readmission risk probabilities.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Clinical Assessment Inputs</h3>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Patient Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Prior Admissions (12 Mos)</label>
                <input
                  type="number"
                  name="prior_admissions"
                  value={formData.prior_admissions}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Emergency Department Visits</label>
                <input
                  type="number"
                  name="emergency_visits"
                  value={formData.emergency_visits}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Current Length of Stay (Days)</label>
                <input
                  type="number"
                  name="length_of_stay"
                  value={formData.length_of_stay}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Charlson Comorbidity Index (0-12)</label>
                <input
                  type="number"
                  name="charlson_index"
                  value={formData.charlson_index}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">LACE Index Score (0-19)</label>
                <input
                  type="number"
                  name="lace_index"
                  value={formData.lace_index}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">HbA1c (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="hba1c"
                  value={formData.hba1c}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Serum Na+ (mEq/L)</label>
                <input
                  type="number"
                  step="0.1"
                  name="serum_sodium"
                  value={formData.serum_sodium}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  name="creatinine"
                  value={formData.creatinine}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Polypharmacy Medication Count</label>
              <input
                type="number"
                name="polypharmacy_count"
                value={formData.polypharmacy_count}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-medical-cyan to-medical-teal text-slate-950 font-bold text-xs shadow-cyan-glow hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Clinical ML Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Readmission Prediction Model</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Risk Score Visual */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">30-Day Readmission Risk Output</h3>
            <RiskGauge score={prediction.risk_score} size={190} />
            <p className="text-[11px] text-slate-400">
              Confidence Score: <span className="text-medical-cyan font-bold">{(prediction.confidence * 100).toFixed(0)}%</span>
            </p>
          </div>

          {/* Key Drivers (SHAP Analysis) */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Primary Risk Drivers (SHAP Feature Importance)</h4>
            <div className="space-y-2 text-xs">
              {prediction.key_factors.map((kf, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-navy-900/60 border border-slate-800">
                  <div>
                    <p className="font-bold text-slate-200">{kf.factor}</p>
                    <p className="text-[10px] text-slate-400">{kf.value}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    kf.impact === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {kf.impact} Impact
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Interventions */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Recommended Interventions</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {prediction.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
