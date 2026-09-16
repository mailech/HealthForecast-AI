import { useState } from 'react'
import { PieChart, Building2, Users, Award, TrendingUp, AlertCircle } from 'lucide-react'

export default function DepartmentPerformance() {
  const departments = [
    { name: 'Cardiology', patients: 450, readmissionRate: '11.2%', score: '94 / 100', status: 'Top Performer' },
    { name: 'Neurology', patients: 320, readmissionRate: '12.5%', score: '91 / 100', status: 'Top Performer' },
    { name: 'Pulmonology', patients: 290, readmissionRate: '15.8%', score: '82 / 100', status: 'Needs Review' },
    { name: 'General Surgery', patients: 510, readmissionRate: '10.4%', score: '96 / 100', status: 'Excellent' },
    { name: 'Internal Medicine', patients: 680, readmissionRate: '14.1%', score: '86 / 100', status: 'Stable' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-green-100 text-green-600 rounded-lg">
              <PieChart className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-600">Hospital Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Department Performance Benchmarking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Comparative analysis of clinical quality, readmission rates & patient turnover</p>
        </div>
      </div>

      {/* Department Scorecard Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Department Benchmarks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs">
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Monthly Patients</th>
                <th className="py-3 px-4">30-Day Readmission</th>
                <th className="py-3 px-4">Quality Score</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {departments.map((d, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-green-600" />
                    {d.name}
                  </td>
                  <td className="py-4 px-4 text-gray-700">{d.patients}</td>
                  <td className="py-4 px-4 font-bold text-orange-600">{d.readmissionRate}</td>
                  <td className="py-4 px-4 font-extrabold text-primary-600">{d.score}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      d.status.includes('Top') || d.status === 'Excellent'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
