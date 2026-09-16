import { useState } from 'react'
import { LineChart, Pill, DollarSign, Activity, TrendingUp } from 'lucide-react'

export default function TreatmentAnalytics() {
  const treatments = [
    { category: 'Cardiovascular Regimens', avgCost: '$2,450', readmissionPrevention: '84.2%', ROI: '3.4x' },
    { category: 'Diabetic Care Protocols', avgCost: '$1,120', readmissionPrevention: '78.5%', ROI: '2.8x' },
    { category: 'Respiratory Therapies', avgCost: '$1,890', readmissionPrevention: '72.1%', ROI: '2.1x' },
    { category: 'Post-Op Antibiotic Care', avgCost: '$950', readmissionPrevention: '91.0%', ROI: '4.5x' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-green-100 text-green-600 rounded-lg">
              <LineChart className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-600">Hospital Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Treatment Cost & Efficacy Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Financial ROI vs. clinical readmission prevention across therapeutic categories</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Therapeutic Category Return on Investment</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs">
                <th className="py-3 px-4">Therapeutic Category</th>
                <th className="py-3 px-4">Avg Treatment Cost</th>
                <th className="py-3 px-4">Readmission Prevention</th>
                <th className="py-3 px-4">Cost-Benefit ROI Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {treatments.map((t, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-900 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-green-600" />
                    {t.category}
                  </td>
                  <td className="py-4 px-4 text-gray-700">{t.avgCost}</td>
                  <td className="py-4 px-4 font-bold text-emerald-600">{t.readmissionPrevention}</td>
                  <td className="py-4 px-4 font-extrabold text-primary-600">{t.ROI}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
