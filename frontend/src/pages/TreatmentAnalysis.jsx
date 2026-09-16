import { useState } from 'react'
import { FlaskConical, Pill, CheckCircle2, BarChart } from 'lucide-react'

export default function TreatmentAnalysis() {
  const trials = [
    { arm: 'Group A: Standard Beta Blockers', sampleSize: 1200, hazardRatio: '0.78', pValue: 'p < 0.001', conclusion: 'Statistically Significant Reduction' },
    { arm: 'Group B: Dual SGLT2 + ARNI', sampleSize: 1450, hazardRatio: '0.54', pValue: 'p < 0.0001', conclusion: 'Superior Efficacy' },
    { arm: 'Group C: ACE Inhibitor Alone', sampleSize: 980, hazardRatio: '0.88', pValue: 'p = 0.02', conclusion: 'Moderate Reduction' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
              <FlaskConical className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Researcher Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Comparative Clinical Treatment Analysis</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cohort statistical testing, hazard ratios & p-value validation</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Clinical Comparative Study Arms</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs">
                <th className="py-3 px-4">Treatment Arm</th>
                <th className="py-3 px-4">Sample Size (N)</th>
                <th className="py-3 px-4">Hazard Ratio (HR)</th>
                <th className="py-3 px-4">P-Value</th>
                <th className="py-3 px-4">Statistical Conclusion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trials.map((t, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-900 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    {t.arm}
                  </td>
                  <td className="py-4 px-4 text-gray-700">{t.sampleSize}</td>
                  <td className="py-4 px-4 font-extrabold text-purple-600">{t.hazardRatio}</td>
                  <td className="py-4 px-4 font-semibold text-emerald-600">{t.pValue}</td>
                  <td className="py-4 px-4 font-semibold text-gray-800">{t.conclusion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
