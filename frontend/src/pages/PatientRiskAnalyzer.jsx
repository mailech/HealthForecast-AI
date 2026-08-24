import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import PredictionForm from '../components/forms/PredictionForm';
import RiskBadge from '../components/common/RiskBadge';
import { FiActivity, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export default function PatientRiskAnalyzer() {
  const [result, setResult] = useState(null);

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Patient Risk Analyzer' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Patient Risk Analyzer</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Run AI-powered readmission risk predictions for individual patients</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <FiActivity className="text-blue-600" size={18} /> Patient Data Input
          </h2>
          <PredictionForm onResult={setResult} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Prediction Result</h2>
          {!result ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <FiActivity size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Fill in patient data and run prediction</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Readmission Risk Score</p>
                <p className="text-6xl font-extrabold text-blue-600 mb-3">{result.readmission_risk_score}%</p>
                <RiskBadge level={result.risk_category.toLowerCase()} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Risk Factors</p>
                {Object.entries(result.probabilities || {}).map(([label, value]) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <FiCheckCircle size={14} className="text-blue-500 flex-shrink-0" /> {label}: {value}%
                  </div>
                ))}
              </div>
              <div className={`rounded-xl p-4 ${result.level === 'critical' || result.level === 'high' ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'}`}>
                <div className="flex items-start gap-2">
                  <FiAlertTriangle size={16} className={result.level === 'critical' || result.level === 'high' ? 'text-red-500 mt-0.5' : 'text-green-600 mt-0.5'} />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {result.risk_category === 'High'
                      ? 'Immediate clinical review recommended'
                      : 'Continue standard monitoring protocol'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
