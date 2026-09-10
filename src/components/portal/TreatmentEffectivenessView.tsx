import React, { useState } from 'react';
import { TREATMENT_OUTCOME_DATA } from '../../data/mockData';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { KPICard } from '../common/KPICard';
import {
  Stethoscope,
  Pill,
  HeartPulse,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Activity,
  ArrowRight
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

export const TreatmentEffectivenessView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Diabetes Management', 'Cardiology', 'Pulmonology', 'Geriatric Care'];

  const filteredTreatments = TREATMENT_OUTCOME_DATA.filter((tx) => {
    if (searchTerm && !tx.treatment.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Treatment Effectiveness & Patient Recovery Analytics
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              Comparative Efficacy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Longitudinal treatment evaluation, recovery scores, and medication response profiles across patient cohorts.
          </p>
        </div>
      </div>

      <DisclaimerBanner type="clinical" />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Protocols Evaluated"
          value="18 Active"
          subtitle="Across 6 specialties"
          icon={<Pill className="w-5 h-5" />}
          accentColor="blue"
        />

        <KPICard
          title="Overall Recovery Rate"
          value="84.2%"
          trend={{ value: '+2.4% vs baseline', direction: 'up', isPositive: true }}
          subtitle="Hospital cohort average"
          icon={<HeartPulse className="w-5 h-5" />}
          accentColor="teal"
        />

        <KPICard
          title="Most Effective Protocol"
          value="GLP-1 + Basal"
          subtitle="92% Success / 6.2d Avg Stay"
          icon={<Sparkles className="w-5 h-5" />}
          accentColor="indigo"
        />

        <KPICard
          title="Avg Recovery Time"
          value="6.4 Days"
          trend={{ value: '-0.8 days shorter', direction: 'down', isPositive: true }}
          subtitle="From admission to discharge"
          icon={<Activity className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Chart: Treatment Comparison by Success Rate vs Readmission Rate */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Comparative Success Rate vs 30-Day Readmission
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side analysis of therapy success percentage against subsequent 30-day readmission risk
            </p>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TREATMENT_OUTCOME_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="treatment" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="successRate" name="Success Rate (%)" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="readmissionRate" name="30d Readmission Rate (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table: Treatment Protocol Roster */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search treatment protocols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-lg">Treatment Protocol</th>
                <th className="p-3">Category</th>
                <th className="p-3">Cohort Size</th>
                <th className="p-3">Success Rate</th>
                <th className="p-3">Readmit Rate</th>
                <th className="p-3">Recovery Score</th>
                <th className="p-3 rounded-r-lg">Avg Stay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTreatments.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{tx.treatment}</span>
                  </td>
                  <td className="p-3 text-slate-600">{tx.category}</td>
                  <td className="p-3 font-mono">{tx.sampleSize} patients</td>
                  <td className="p-3">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {tx.successRate}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold px-2 py-0.5 rounded border ${
                      tx.readmissionRate > 15
                        ? 'text-red-700 bg-red-50 border-red-200'
                        : 'text-slate-700 bg-slate-50 border-slate-200'
                    }`}>
                      {tx.readmissionRate}%
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{tx.recoveryScore} / 100</td>
                  <td className="p-3 text-slate-600">{tx.avgStayDays} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Treatment Recommendation Engine Card */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <h3 className="text-base font-bold text-white">
            AI-Assisted Treatment Optimization Insight
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl mb-4">
          Historical analysis of 101k patient encounters indicates that integrating SGLT2 inhibitor therapy alongside standard Insulin Titration in Diabetic Ketoacidosis cohorts produces a <strong>34% reduction in 30-day bounce-backs</strong> compared to insulin monotherapy.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-teal-400 font-bold block mb-1">Target Patient Phenotype</span>
            <span className="text-slate-300">HbA1c &gt; 9.0% + Congestive Heart Failure comorbidity</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-teal-400 font-bold block mb-1">Suggested Protocol Adjustment</span>
            <span className="text-slate-300">Inpatient transition to SGLT2i with 48-hr eGFR monitoring</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-teal-400 font-bold block mb-1">Expected Outcome</span>
            <span className="text-slate-300">Projected readmission drop from 24.2% to 15.8%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
