import React from 'react';
import { LineChart, CheckCircle2, TrendingUp, Pill, Stethoscope, ShieldCheck, Award } from 'lucide-react';
import { HOSPITAL_ANALYTICS } from '../data/mockData';

export const TreatmentEffectivenessView = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              Treatment Effectiveness & Recovery Monitoring
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PDF Module 4 Requirement
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Comparative analysis of clinical treatment pathways, medication regimens, and patient recovery rates
          </p>
        </div>
      </div>

      {/* Treatment Pathways Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {HOSPITAL_ANALYTICS.treatmentEffectiveness.map((item, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Treatment Pathway #{idx + 1}
                </span>
                <h3 className="text-base font-bold text-slate-100">{item.treatment}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Pill className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Cohort Size</span>
                <span className="font-bold text-slate-200">{item.cohortSize} Patients</span>
              </div>
              <div>
                <span className="text-slate-500 block">Readmission Drop</span>
                <span className="font-extrabold text-emerald-400">{item.readmissionReduction}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Recovery Rate</span>
                <span className="font-bold text-cyan-300">{item.recoveryRate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Proven Clinical Efficacy
              </span>
              <span className="font-mono text-[11px]">p &lt; 0.001</span>
            </div>
          </div>
        ))}
      </div>

      {/* Medication Outcome Comparison Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-cyan-400" />
          Medication Outcome Assessment & Glycemia Control
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Medication Protocol</th>
                <th className="py-3 px-4 text-center">Avg A1C Reduction</th>
                <th className="py-3 px-4 text-center">30-Day Readmission Rate</th>
                <th className="py-3 px-4 text-center">Adverse Event Rate</th>
                <th className="py-3 px-4 text-right">Recommendation Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-900/50">
                <td className="py-3.5 px-4 font-bold text-slate-200">Insulin Titration + Daily Continuous Glucose Monitoring</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">-1.8%</td>
                <td className="py-3.5 px-4 text-center text-cyan-300 font-bold">11.2%</td>
                <td className="py-3.5 px-4 text-center text-slate-400">2.1%</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Tier 1 Recommended</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="py-3.5 px-4 font-bold text-slate-200">Combination Oral Agents (Metformin + SGLT2 Inhibitor)</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">-1.4%</td>
                <td className="py-3.5 px-4 text-center text-cyan-300 font-bold">13.5%</td>
                <td className="py-3.5 px-4 text-center text-slate-400">1.4%</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Tier 1 Recommended</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="py-3.5 px-4 font-bold text-slate-200">Monotherapy Metformin Standard Protocol</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">-0.8%</td>
                <td className="py-3.5 px-4 text-center text-amber-400 font-bold">18.4%</td>
                <td className="py-3.5 px-4 text-center text-slate-400">0.8%</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Standard Baseline</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
