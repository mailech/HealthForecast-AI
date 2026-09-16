import { useState } from 'react'
import { TrendingUp, Calendar, ArrowUpRight, BarChart2 } from 'lucide-react'

export default function ReadmissionTrends() {
  const [range, setRange] = useState('5 Years')

  const trendData = [
    { year: '2022', rate: '16.8%', totalCases: 1420, change: 'Baseline' },
    { year: '2023', rate: '15.2%', totalCases: 1380, change: '-1.6%' },
    { year: '2024', rate: '14.1%', totalCases: 1310, change: '-1.1%' },
    { year: '2025', rate: '13.0%', totalCases: 1240, change: '-1.1%' },
    { year: '2026 (YTD)', rate: '12.4%', totalCases: 610, change: '-0.6%' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Researcher Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Longitudinal Readmission Trends</h1>
          <p className="text-sm text-gray-500 mt-0.5">Multi-year epidemiological trends & seasonal risk patterns</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Historical Readmission Rate Trajectory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs">
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Readmission Rate</th>
                <th className="py-3 px-4">Readmitted Patients</th>
                <th className="py-3 px-4">Annual Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trendData.map((t, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-900">{t.year}</td>
                  <td className="py-4 px-4 font-bold text-purple-600">{t.rate}</td>
                  <td className="py-4 px-4 text-gray-700">{t.totalCases}</td>
                  <td className="py-4 px-4 font-semibold text-emerald-600">{t.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
