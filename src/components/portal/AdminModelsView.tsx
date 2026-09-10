import React, { useState } from 'react';
import { MOCK_MODEL_METRICS } from '../../data/mockData';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { KPICard } from '../common/KPICard';
import {
  Cpu,
  RefreshCw,
  Rocket,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Layers,
  Award,
  Sparkles,
  Play
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const AdminModelsView: React.FC = () => {
  const [models, setModels] = useState(MOCK_MODEL_METRICS);
  const [activeModelId, setActiveModelId] = useState('xgb-v2.4');
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);
  const [retrainSuccess, setRetrainSuccess] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  const activeModel = models.find(m => m.id === activeModelId) || models[0];

  const handleRetrain = () => {
    setIsRetraining(true);
    setRetrainProgress(15);

    const interval = setInterval(() => {
      setRetrainProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setIsRetraining(false);
          setRetrainSuccess(true);
          setTimeout(() => setRetrainSuccess(false), 4000);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleDeploy = (modelId: string) => {
    setModels(models.map(m => ({
      ...m,
      status: m.id === modelId ? 'Active' : 'Archived'
    })));
    setActiveModelId(modelId);
    setDeploySuccess(`Model ${modelId} successfully deployed to FastAPI inference cluster.`);
    setTimeout(() => setDeploySuccess(null), 3500);
  };

  // Model comparison bar chart
  const comparisonData = models.map(m => ({
    name: m.name,
    Accuracy: Math.round(m.accuracy * 100),
    Recall: Math.round(m.recall * 100),
    Precision: Math.round(m.precision * 100),
    'ROC-AUC': Math.round(m.rocAuc * 100)
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Model Management & ML Registry
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              XGBoost & Random Forest Core
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate inference checkpoints, confusion matrices, and deploy retrained candidate weights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? `Retraining (${retrainProgress}%)...` : 'Retrain Pipeline on Full Dataset'}</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner type="demo" />

      {deploySuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{deploySuccess}</span>
        </div>
      )}

      {retrainSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Model retrained on 101,766 encounters with 5-fold cross-validation. Validation ROC-AUC improved to 0.914!</span>
        </div>
      )}

      {/* Primary Model Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          title="Validation Accuracy"
          value={`${(activeModel.accuracy * 100).toFixed(1)}%`}
          trend={{ value: 'Benchmarked', direction: 'neutral', isPositive: true }}
          subtitle="Test set evaluation"
          icon={<Award className="w-5 h-5" />}
          accentColor="blue"
        />

        <KPICard
          title="Clinical Recall (Sensitivity)"
          value={`${(activeModel.recall * 100).toFixed(1)}%`}
          trend={{ value: 'Catches 88.7% readmits', direction: 'up', isPositive: true }}
          subtitle="Minimizes false negatives"
          icon={<Sparkles className="w-5 h-5" />}
          accentColor="teal"
        />

        <KPICard
          title="Precision (PPV)"
          value={`${(activeModel.precision * 100).toFixed(1)}%`}
          trend={{ value: 'Reliable alert rate', direction: 'neutral', isPositive: true }}
          subtitle="Positive predictive value"
          icon={<Sliders className="w-5 h-5" />}
          accentColor="indigo"
        />

        <KPICard
          title="F1 Composite Score"
          value={`${(activeModel.f1Score * 100).toFixed(1)}%`}
          trend={{ value: 'Balanced metric', direction: 'neutral', isPositive: true }}
          subtitle="Harmonic mean"
          icon={<Layers className="w-5 h-5" />}
          accentColor="amber"
        />

        <KPICard
          title="ROC-AUC Discriminator"
          value={activeModel.rocAuc.toFixed(3)}
          trend={{ value: 'Exceptional (0.912)', direction: 'up', isPositive: true }}
          subtitle="C-statistic on 20k test"
          icon={<Cpu className="w-5 h-5" />}
          accentColor="teal"
        />
      </div>

      {/* Active Model Specification & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Model Specs & Hyperparameters */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{activeModel.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  {activeModel.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Version: {activeModel.version} • Last trained: {activeModel.trainingDate}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
              {activeModel.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Training Dataset:</span>
              <span className="font-bold text-slate-900">Diabetes 130-US Hospitals</span>
              <span className="text-[11px] text-slate-500 block">101,766 encounter records</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Feature Dimension:</span>
              <span className="font-bold text-slate-900">47 Cleaned Features</span>
              <span className="text-[11px] text-slate-500 block">Demographics, labs, medications, ICD-10</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Hyperparameter Specification
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-100 rounded text-slate-700">
                <span className="text-[10px] text-slate-500 block font-sans">max_depth</span>
                <strong>6</strong>
              </div>
              <div className="p-2 bg-slate-100 rounded text-slate-700">
                <span className="text-[10px] text-slate-500 block font-sans">learning_rate</span>
                <strong>0.05</strong>
              </div>
              <div className="p-2 bg-slate-100 rounded text-slate-700">
                <span className="text-[10px] text-slate-500 block font-sans">n_estimators</span>
                <strong>300</strong>
              </div>
              <div className="p-2 bg-slate-100 rounded text-slate-700">
                <span className="text-[10px] text-slate-500 block font-sans">scale_pos_weight</span>
                <strong>2.8</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Confusion Matrix (20,354 Test Records) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900">
                Confusion Matrix (Holdout Test Cohort)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated on 20,354 unseen patient encounters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mt-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                  True Negative (TN)
                </span>
                <span className="text-2xl font-black text-emerald-800 mt-1 block">13,972</span>
                <span className="text-[11px] text-emerald-700">Correctly Non-Readmitted</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider block">
                  False Positive (FP)
                </span>
                <span className="text-2xl font-black text-amber-800 mt-1 block">684</span>
                <span className="text-[11px] text-amber-700">False Alarm Readmission</span>
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
                <span className="text-[10px] font-bold uppercase text-red-800 tracking-wider block">
                  False Negative (FN)
                </span>
                <span className="text-2xl font-black text-red-800 mt-1 block">462</span>
                <span className="text-[11px] text-red-700">Missed Readmissions</span>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-center">
                <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider block">
                  True Positive (TP)
                </span>
                <span className="text-2xl font-black text-sky-800 mt-1 block">3,612</span>
                <span className="text-[11px] text-sky-700">Accurately Flagged Readmits</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Sensitivity: <strong className="text-slate-800">88.7%</strong> • Specificity: <strong className="text-slate-800">95.3%</strong>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Candidate Algorithm Comparison Benchmark
          </h3>
          <p className="text-xs text-slate-500">
            Evaluating performance across tree ensembles and linear baselines
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3 rounded-l-lg">Model Architecture</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Recall</th>
                <th className="p-3">Precision</th>
                <th className="p-3">ROC-AUC</th>
                <th className="p-3">Inference Time</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-lg text-right">Deployment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{m.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">v{m.version} • {m.algorithm}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="p-3 font-bold text-emerald-700">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="p-3 font-semibold text-slate-800">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="p-3 font-extrabold text-sky-700">{m.rocAuc.toFixed(3)}</td>
                  <td className="p-3 text-slate-600 font-mono">{m.inferenceTimeMs} ms</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        m.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'Candidate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {m.status === 'Active' ? (
                      <span className="text-[11px] font-bold text-emerald-600">● Live in Production</span>
                    ) : (
                      <button
                        onClick={() => handleDeploy(m.id)}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Promote to Live
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
