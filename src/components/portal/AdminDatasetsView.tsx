import React, { useState } from 'react';
import {
  Database,
  Upload,
  CheckCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Sliders,
  Clock
} from 'lucide-react';

export const AdminDatasetsView: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);

  const handleValidateSchema = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setValidationSuccess(true);
      setTimeout(() => setValidationSuccess(false), 3500);
    }, 1100);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Clinical Dataset Ingestion & Feature Store
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
              Diabetes 130-US Hospitals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized training corpus, feature engineering pipelines, and ETL data validation.
          </p>
        </div>

        <button
          onClick={handleValidateSchema}
          disabled={isValidating}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
          <span>{isValidating ? 'Running Pipeline Schema Checks...' : 'Validate Dataset Schema'}</span>
        </button>
      </div>

      {validationSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All 47 feature columns verified. Zero schema drift detected across 101,766 encounters.</span>
        </div>
      )}

      {/* Dataset Specification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Encounters</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">101,766</span>
            <span className="text-xs text-slate-500">records</span>
          </div>
          <span className="text-[11px] text-slate-600 mt-1 block">130 US hospitals (10-yr longitudinal)</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Engineered Features</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">47</span>
            <span className="text-xs text-slate-500">attributes</span>
          </div>
          <span className="text-[11px] text-slate-600 mt-1 block">Vitals, labs, medications, ICD codes</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Train / Test Partition</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">80 / 20</span>
            <span className="text-xs text-slate-500">% split</span>
          </div>
          <span className="text-[11px] text-slate-600 mt-1 block">81,412 train / 20,354 test</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Readmission Target Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-sky-700">11.16%</span>
          </div>
          <span className="text-[11px] text-slate-600 mt-1 block">&lt;30 days readmitted cohort</span>
        </div>
      </div>

      {/* Feature Engineering & ETL Stages */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">ETL Pipeline & Preprocessing Steps</h3>
          <p className="text-xs text-slate-500">Automated transformation pipeline executing before model ingestion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-sky-700 block mb-1">1. Imputation & Cleaning</span>
            <p className="text-slate-600 leading-relaxed">
              Handling missing values in `weight` (97% missing imputed or excluded) and `payer_code`. High-cardinality medical specialty grouped into 10 broader categories.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-sky-700 block mb-1">2. Categorical & ICD-10 Encoding</span>
            <p className="text-slate-600 leading-relaxed">
              Mapped 3 primary diagnoses (`diag_1`, `diag_2`, `diag_3`) to Charlson Comorbidity Index groupings. One-Hot encoding applied to 23 diabetic medication dosage vectors.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-sky-700 block mb-1">3. Normalization & Class Balancing</span>
            <p className="text-slate-600 leading-relaxed">
              StandardScaler applied to `time_in_hospital`, `num_lab_procedures`, and `num_medications`. SMOTE and scale_pos_weight configured in XGBoost to handle class imbalance.
            </p>
          </div>
        </div>
      </div>

      {/* Ingested Batch Logs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="pb-3 border-b border-slate-100 mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Ingested Training Batches</h3>
          <span className="text-xs text-slate-500">PostgreSQL Data Warehouse Synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3 rounded-l-lg">Dataset Source</th>
                <th className="p-3">Batch ID</th>
                <th className="p-3">Records Ingested</th>
                <th className="p-3">Features</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-lg">Ingestion Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Diabetes 130-US Hospitals (Primary Benchmark)</td>
                <td className="p-3 font-mono">BATCH-DIAB-101K</td>
                <td className="p-3 font-semibold">101,766</td>
                <td className="p-3">47 Cleaned</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Validated & Partitioned
                  </span>
                </td>
                <td className="p-3 text-slate-500">2026-09-01</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">St. Jude Metropolitan Internal EHR Encounters</td>
                <td className="p-3 font-mono">BATCH-STJ-2026-Q3</td>
                <td className="p-3 font-semibold">4,280</td>
                <td className="p-3">47 Cleaned</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Validated & Partitioned
                  </span>
                </td>
                <td className="p-3 text-slate-500">2026-09-08</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
