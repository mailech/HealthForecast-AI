import React, { useState } from 'react';
import { BrainCircuit, Sparkles, AlertCircle, CheckCircle, Shield, RefreshCw, Database } from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';
import { healthApi } from '../services/api';

export const AIRiskPredictionPage = () => {
  const [formData, setFormData] = useState({
    time_in_hospital: 4,
    num_lab_procedures: 43,
    num_procedures: 1,
    num_medications: 12,
    number_outpatient: 0,
    number_emergency: 0,
    number_inpatient: 1,
    number_diagnoses: 5
  });

  const [prediction, setPrediction] = useState({
    risk_score: 78.4,
    risk_level: "High",
    confidence: 0.65,
    key_factors: [
      { factor: "High Prior Inpatient Admissions", impact: "High", value: "3 recent inpatient visits" },
      { factor: "Extended Length of Stay", impact: "Moderate", value: "7 days in hospital" }
    ],
    recommendations: [
      "Assign dedicated post-discharge care manager."
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Disclaimer Alert */}
      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-500">Clinical Decision Support Tool</h4>
          <p className="text-xs text-slate-600 mt-1">This prediction is a clinical decision-support aid based on historical data patterns. It is not a substitute for professional medical judgment. Low, Medium, and High labels represent model probability categories, not definitive medical diagnoses.</p>
        </div>
      </div>

      {/* Dataset Context Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 text-sm text-blue-800 shadow-sm">
        <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-900 mb-1">Powered by Real-World Clinical Data (Kaggle / UCI)</p>
          <p className="text-blue-800 leading-relaxed">
            This prototype is powered by a machine learning model trained on the <strong>Diabetes 130-US Hospitals Dataset</strong> (1999-2008), 
            originally hosted on Kaggle and the UCI Machine Learning Repository. The engine evaluates over 100,000 historical clinical encounters 
            using the exact feature inputs below to compute a statistically grounded 30-day readmission risk.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-3">
            <BrainCircuit className="w-4 h-4" />
            <span>RandomForest Model Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Readmission Risk Predictor</h1>
          <p className="text-sm text-slate-500 mt-1">Input patient features to compute the 30-day readmission risk probability.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-slate-200 space-y-6">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">Patient Features</h3>

          <form onSubmit={handlePredict} className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-slate-600 font-medium block mb-1.5">Length of Stay (Days)</label>
                <input
                  type="number"
                  name="time_in_hospital"
                  value={formData.time_in_hospital}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1.5">Num Lab Procedures</label>
                <input
                  type="number"
                  name="num_lab_procedures"
                  value={formData.num_lab_procedures}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-slate-600 font-medium block mb-1.5">Num Procedures</label>
                <input
                  type="number"
                  name="num_procedures"
                  value={formData.num_procedures}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1.5">Num Medications</label>
                <input
                  type="number"
                  name="num_medications"
                  value={formData.num_medications}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="text-slate-600 font-medium block mb-1.5">Outpatient Visits</label>
                <input
                  type="number"
                  name="number_outpatient"
                  value={formData.number_outpatient}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1.5">Emergency Visits</label>
                <input
                  type="number"
                  name="number_emergency"
                  value={formData.number_emergency}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1.5">Inpatient Visits</label>
                <input
                  type="number"
                  name="number_inpatient"
                  value={formData.number_inpatient}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1.5">Number of Diagnoses</label>
              <input
                type="number"
                name="number_diagnoses"
                value={formData.number_diagnoses}
                onChange={handleChange}
                className="w-full p-2.5 rounded bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-blue-600 text-slate-900 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculating Risk Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Clinical Prediction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Risk Score Visual */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">30-Day Readmission Risk</h3>
            <RiskGauge score={prediction.risk_score} size={200} />
            <p className="text-xs text-slate-500">
              Model ROC-AUC Confidence: <span className="text-slate-900 font-semibold">{(prediction.confidence * 100).toFixed(0)}%</span>
            </p>
          </div>

          {/* Key Drivers */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">Primary Risk Drivers</h4>
            <div className="space-y-3 text-sm">
              {prediction.key_factors.map((kf, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-slate-50 border border-slate-200 gap-2">
                  <div>
                    <p className="font-medium text-slate-700">{kf.factor}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{kf.value}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    kf.impact === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    {kf.impact} Impact
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Interventions */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 border-b border-slate-200 pb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Recommended Interventions</span>
            </h4>
            <ul className="space-y-3 text-sm text-slate-600">
              {prediction.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
