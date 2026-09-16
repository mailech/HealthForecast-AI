import { useState } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, ArrowDownRight, DollarSign, Calendar } from 'lucide-react'

export default function ReadmissionAnalytics() {
  const [timeframe, setTimeframe] = useState('30')

  const causeBreakdown = [
    { cause: 'Medication Non-Adherence', percentage: 34, impact: 'High', color: 'bg-red-500' },
    { cause: 'Lack of Timely Follow-up', percentage: 28, impact: 'High', color: 'bg-orange-500' },
    { cause: 'Uncontrolled Comorbidity', percentage: 22, impact: 'Medium', color: 'bg-amber-500' },
    { cause: 'Post-Discharge Complication', percentage: 11, impact: 'Medium', color: 'bg-blue-500' },
    { cause: 'Social Determinants (SDoH)', percentage: 5, impact: 'Low', color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-green-100 text-green-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-600">Hospital Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Readmission Analytics Engine</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hospital-wide 30-day readmission drivers, penalty risk, and root causes</p>
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="30">30-Day Rate</option>
          <option value="60">60-Day Rate</option>
          <option value="90">90-Day Rate</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-400">Current {timeframe}-Day Readmission Rate</p>
          <h3 className="text-3xl font-extrabold text-orange-600 mt-1">12.8%</h3>
          <p className="text-xs text-emerald-600 mt-2 font-semibold flex items-center">
            <ArrowDownRight className="w-4 h-4 mr-1" /> -1.4% vs National Benchmark (14.2%)
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-400">Preventable Readmissions</p>
          <h3 className="text-3xl font-extrabold text-red-600 mt-1">64.2%</h3>
          <p className="text-xs text-red-500 mt-2 font-semibold">Identified as actionable post-discharge</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-400">Est. Cost Avoided (YTD)</p>
          <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">$380,000</h3>
          <p className="text-xs text-emerald-600 mt-2 font-semibold">Saved via ML risk intervention</p>
        </div>
      </div>

      {/* Root Cause Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-900">Primary Drivers of Readmission</h3>
        <div className="space-y-4">
          {causeBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-sm font-semibold text-gray-800">
                <span>{item.cause}</span>
                <span>{item.percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
