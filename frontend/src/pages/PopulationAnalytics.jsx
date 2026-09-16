import { useState } from 'react'
import { Globe, Users, Database, PieChart, Activity } from 'lucide-react'

export default function PopulationAnalytics() {
  const [selectedCohort, setSelectedCohort] = useState('All Cohorts')

  const demographics = [
    { group: 'Age 18 - 45', count: '1,240', readmissionRisk: '8.2%', topComorbidity: 'Hypertension' },
    { group: 'Age 46 - 65', count: '3,150', readmissionRisk: '14.5%', topComorbidity: 'Type 2 Diabetes' },
    { group: 'Age 65+', count: '4,890', readmissionRisk: '22.8%', topComorbidity: 'Congestive Heart Failure' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
              <Globe className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Researcher Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Population Health Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Demographic risk profiling, age/gender distributions & comorbidity correlation</p>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Demographic Cohort Risk Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs">
                <th className="py-3 px-4">Demographic Bracket</th>
                <th className="py-3 px-4">Sample Size</th>
                <th className="py-3 px-4">Readmission Risk</th>
                <th className="py-3 px-4">Primary Comorbidity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {demographics.map((d, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    {d.group}
                  </td>
                  <td className="py-4 px-4 text-gray-700">{d.count}</td>
                  <td className="py-4 px-4 font-bold text-red-600">{d.readmissionRisk}</td>
                  <td className="py-4 px-4 text-gray-600">{d.topComorbidity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
