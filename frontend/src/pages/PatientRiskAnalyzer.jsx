import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import PredictionForm from '../components/forms/PredictionForm';
import RiskBadge from '../components/common/RiskBadge';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiClock, FiFileText } from 'react-icons/fi';
import { predictionService } from '../services/predictionService';

import { getPatientFullName } from '../utils/patientUtils';

export default function PatientRiskAnalyzer() {
  const [result, setResult] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleResult = (predResult) => {
    setResult(predResult);
    if (predResult?.patient_id) {
      loadHistory(predResult.patient_id);
    }
  };

  const loadHistory = async (patientId) => {
    if (!patientId) return;
    setLoadingHistory(true);
    try {
      const items = await predictionService.getHistory(patientId);
      setHistory(items);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    if (patient?.id) {
      loadHistory(patient.id);
    }
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Patient Risk Analyzer' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Patient Risk Analyzer</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Execute ML-powered readmission risk assessments on validated patient parameters.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Form Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <FiActivity className="text-zinc-700 dark:text-zinc-300" size={16} /> Clinical Parameters Input
          </h2>
          <PredictionForm onResult={handleResult} onPatientSelect={handlePatientSelect} />
        </div>

        {/* Result Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Risk Evaluation Result</h2>
          {!result ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                <FiActivity size={22} />
              </div>
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Not Predicted</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Select a patient and click "Run Prediction" to execute the inference model.
              </p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="text-center py-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Readmission Risk Score
                </p>
                <p className="text-5xl font-black text-zinc-900 dark:text-white mb-2.5 tracking-tight">
                  {result.readmission_risk_score}%
                </p>
                <div className="inline-block">
                  <RiskBadge level={result.risk_category.toLowerCase()} score={result.readmission_risk_score} />
                </div>
              </div>

              {result.probabilities && (
                <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-4 space-y-2 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Probability Distribution
                  </p>
                  {Object.entries(result.probabilities).map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <FiCheckCircle size={13} className="text-zinc-500" /> {label} Risk
                      </span>
                      <span className="font-bold">{value}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <div className="flex items-start gap-2.5">
                  <FiAlertTriangle size={15} className="text-zinc-700 dark:text-zinc-300 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {result.risk_category === 'High'
                      ? 'Immediate clinical review and post-discharge coordination recommended.'
                      : result.risk_category === 'Medium'
                      ? 'Care plan follow-up within 7 days recommended.'
                      : 'Continue standard routine monitoring and discharge protocol.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Patient Prediction History */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <FiClock size={16} className="text-zinc-600 dark:text-zinc-400" />
          Patient Prediction History {selectedPatient ? `(${getPatientFullName(selectedPatient)})` : ''}
        </h2>

        {loadingHistory ? (
          <p className="text-xs text-zinc-400 py-4 text-center">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-zinc-400 py-4 text-center">
            {selectedPatient ? 'No previous predictions found for this patient.' : 'Select a patient to view historical risk assessments.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40">
                <tr>
                  {['Prediction ID', 'Risk Score', 'Category', 'Model Version'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white">#{item.id}</td>
                    <td className="px-4 py-2.5 text-xs font-bold text-zinc-900 dark:text-white">{item.readmission_risk_score}%</td>
                    <td className="px-4 py-2.5">
                      <RiskBadge level={item.risk_category.toLowerCase()} score={item.readmission_risk_score} />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-500">{item.model_version || 'v1.0.0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
