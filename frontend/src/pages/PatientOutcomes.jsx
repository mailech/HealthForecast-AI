import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HeartPulse, CheckCircle2, AlertCircle, TrendingUp, Users,
  Download, Eye, X, Filter, Activity, Award, ShieldCheck, ArrowUpRight
} from 'lucide-react'

export default function PatientOutcomes() {
  const [timeHorizon, setTimeHorizon] = useState('30 Days')
  const [activeTab, setActiveTab] = useState('All')
  const [selectedOutcome, setSelectedOutcome] = useState(null)

  const outcomes = [
    { title: 'Full Recovery Rate', rate: '86.4%', trend: '+3.2%', status: 'Optimal', iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: '30-Day Readmission-Free', rate: '87.2%', trend: '+1.8%', status: 'Above Average', iconColor: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'In-Hospital Mortality Rate', rate: '1.4%', trend: '-0.3%', status: 'Low Risk', iconColor: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Patient Satisfaction Index', rate: '94.8%', trend: '+2.5%', status: 'Excellent', iconColor: 'text-amber-600', bgColor: 'bg-amber-50' },
  ]

  const qualityIndicators = [
    { name: 'Discharge Medication Reconciliation Accuracy', value: 98.4, target: 95, status: 'Exceeds Target', color: 'bg-emerald-500' },
    { name: '7-Day Post-Discharge Tele-Health Follow-up Rate', value: 89.2, target: 85, status: 'Optimal', color: 'bg-blue-500' },
    { name: 'Hospital-Acquired Condition (HAC) Free Rate', value: 99.1, target: 98, status: 'Exceeds Target', color: 'bg-indigo-500' },
    { name: 'Post-Operative Complication Prevention Index', value: 94.6, target: 92, status: 'Above Average', color: 'bg-purple-500' },
  ]

  const patientOutcomeRecords = [
    { id: 1, name: 'Robert Chen', patient_nbr: 'PAT-8801', dept: 'Cardiology', diagnosis: 'Heart Failure (HFrEF)', recoveryScore: 92, status: 'Optimal Recovery', readmissionRisk: 'Low (12.4%)', dischargePlan: 'ARNI + SGLT2 Titrated', followUpDate: 'Sep 22, 2026' },
    { id: 2, name: 'Maria Garcia', patient_nbr: 'PAT-8802', dept: 'Endocrinology', diagnosis: 'Type 2 Diabetes / Hyperglycemia', recoveryScore: 84, status: 'Optimal Recovery', readmissionRisk: 'Medium (28.5%)', dischargePlan: 'Metformin + GLP-1 Therapy', followUpDate: 'Sep 25, 2026' },
    { id: 3, name: 'Eleanor Vance', patient_nbr: 'PAT-8804', dept: 'Internal Medicine', diagnosis: 'Pneumonia / Extended Stay', recoveryScore: 68, status: 'Readmission Watch', readmissionRisk: 'High (64.2%)', dischargePlan: '72hr Home Health Visit', followUpDate: 'Sep 18, 2026' },
    { id: 4, name: 'James Wilson', patient_nbr: 'PAT-8803', dept: 'Pulmonology', diagnosis: 'COPD Acute Exacerbation', recoveryScore: 76, status: 'Readmission Watch', readmissionRisk: 'Medium (42.0%)', dischargePlan: 'Dual Bronchodilator Nebulizer', followUpDate: 'Sep 20, 2026' },
    { id: 5, name: 'David Miller', patient_nbr: 'PAT-8805', dept: 'Nephrology', diagnosis: 'Hypertension / Renal Care', recoveryScore: 95, status: 'Optimal Recovery', readmissionRisk: 'Low (8.5%)', dischargePlan: 'Ambulatory BP Log Monitoring', followUpDate: 'Oct 02, 2026' },
  ]

  const filteredRecords = patientOutcomeRecords.filter(r => {
    if (activeTab === 'Optimal') return r.status === 'Optimal Recovery'
    if (activeTab === 'Watch') return r.status === 'Readmission Watch'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 bg-green-100 text-green-600 rounded-lg">
              <HeartPulse className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-600">Hospital Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Clinical Outcomes Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Post-discharge recovery, survival metrics & quality of care indicators</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white shadow-xs focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="30 Days">Last 30 Days</option>
            <option value="90 Days">Last 90 Days</option>
            <option value="YTD">Year to Date (YTD)</option>
          </select>

          <Link
            to="/export"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Export Outcomes Report
          </Link>
        </div>
      </div>

      {/* Outcome KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {outcomes.map((o, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-gray-400">{o.title}</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${o.bgColor} ${o.iconColor}`}>
                {o.status}
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900">{o.rate}</h3>
            <p className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> {o.trend} performance ({timeHorizon})
            </p>
          </div>
        ))}
      </div>

      {/* Quality of Care Performance Benchmarks */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" /> Clinical Quality & Safety Performance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Hospital accreditation standards vs current operational metrics</p>
          </div>
          <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            JCAHO / CMS Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qualityIndicators.map((qi, idx) => (
            <div key={idx} className="space-y-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-800">{qi.name}</span>
                <span className="text-green-700 font-extrabold text-sm">{qi.value}% <span className="text-gray-400 font-normal text-xs">(Target: {qi.target}%)</span></span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${qi.color}`} style={{ width: `${qi.value}%` }} />
              </div>
              <div className="flex justify-between items-center text-[11px] text-gray-500">
                <span className="font-semibold text-emerald-600">{qi.status}</span>
                <span>+{ (qi.value - qi.target).toFixed(1) }% above target</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Clinical Outcome Register */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" /> Patient Recovery & Readmission Register
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Individual post-discharge tracking across hospital departments</p>
          </div>

          <div className="flex items-center space-x-2">
            {['All', 'Optimal', 'Watch'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-green-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'All' ? 'All Cohorts' : tab === 'Optimal' ? 'Optimal Recovery' : 'Readmission Watch'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Recovery Score</th>
                <th className="py-3 px-4">Readmission Risk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{r.name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-green-700 font-semibold">{r.patient_nbr}</td>
                  <td className="py-3.5 px-4 text-gray-600">{r.dept}</td>
                  <td className="py-3.5 px-4">
                    <span className={`font-extrabold ${r.recoveryScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {r.recoveryScore} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-xs text-gray-700">{r.readmissionRisk}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      r.status === 'Optimal Recovery'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOutcome(r)}
                      className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Outcome
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outcome Detail Modal */}
      {selectedOutcome && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Clinical Outcome: {selectedOutcome.name}</h3>
              </div>
              <button onClick={() => setSelectedOutcome(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-green-800 uppercase">Recovery Performance Index</span>
                  <span className="font-extrabold text-green-900 text-xl">{selectedOutcome.recoveryScore} / 100</span>
                </div>
                <p className="text-xs text-green-700 font-medium">
                  Primary Diagnosis: <strong>{selectedOutcome.diagnosis}</strong> ({selectedOutcome.dept})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">Readmission Risk</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{selectedOutcome.readmissionRisk}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">Next Follow-up</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{selectedOutcome.followUpDate}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-400">Post-Discharge Care Plan</p>
                <p className="text-sm text-gray-800 font-semibold bg-gray-50 p-3 rounded-xl border border-gray-100 mt-1">
                  {selectedOutcome.dischargePlan}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedOutcome(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50"
              >
                Close
              </button>
              <Link
                to={`/patients/${selectedOutcome.id}`}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Open Patient Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
