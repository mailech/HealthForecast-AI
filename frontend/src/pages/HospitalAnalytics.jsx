import { useState } from 'react'
import { Building2, BedDouble, Users, TrendingUp, DollarSign, Activity } from 'lucide-react'

export default function HospitalAnalytics() {
  const [period, setPeriod] = useState('This Month')

  const deptStats = [
    { name: 'Cardiology', occupancy: '92%', avgStay: '4.2 Days', readmissions: '14.2%', revenueImpact: '$145,000' },
    { name: 'ICU / Critical Care', occupancy: '96%', avgStay: '7.8 Days', readmissions: '19.8%', revenueImpact: '$280,000' },
    { name: 'General Medicine', occupancy: '84%', avgStay: '3.5 Days', readmissions: '11.5%', revenueImpact: '$98,000' },
    { name: 'Emergency Dept', occupancy: '89%', avgStay: '1.2 Days', readmissions: '16.4%', revenueImpact: '$112,000' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-green-100 text-green-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-600">Hospital Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Operational Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Capacity metrics, bed occupancy, average length of stay (ALOS) & financial overview</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="This Month">This Month</option>
          <option value="Last Quarter">Last Quarter</option>
          <option value="Year to Date">Year to Date</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-400">Total Bed Occupancy</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">88.4%</h3>
          <p className="text-xs text-green-600 mt-2 font-semibold">+2.1% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-400">Average Length of Stay</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">4.2 Days</h3>
          <p className="text-xs text-emerald-600 mt-2 font-semibold">-0.4 days improvement</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-400">Readmission Penalty Risk</p>
          <h3 className="text-3xl font-extrabold text-red-600 mt-1">$42,500</h3>
          <p className="text-xs text-red-500 mt-2 font-semibold">HRRP estimated penalty limit</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-400">Monthly Discharges</p>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-1">1,420</h3>
          <p className="text-xs text-gray-500 mt-2 font-semibold">94.2% successful home discharge</p>
        </div>
      </div>

      {/* Department Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Department Operational Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Occupancy Rate</th>
                <th className="py-3 px-4">Average Stay (ALOS)</th>
                <th className="py-3 px-4">Readmission Rate</th>
                <th className="py-3 px-4">Est. Financial Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deptStats.map((d, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-900">{d.name}</td>
                  <td className="py-4 px-4 font-semibold text-gray-700">{d.occupancy}</td>
                  <td className="py-4 px-4 text-gray-600">{d.avgStay}</td>
                  <td className="py-4 px-4 font-bold text-orange-600">{d.readmissions}</td>
                  <td className="py-4 px-4 font-semibold text-red-600">{d.revenueImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
