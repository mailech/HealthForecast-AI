import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Users, Activity, AlertTriangle, TrendingUp,
  BedDouble, Plus, ArrowRight, Clock, Stethoscope, Sparkles, LineChart
} from 'lucide-react'
import RiskPredictorModal from '../../components/RiskPredictorModal'

const DoctorDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [highRiskList, setHighRiskList] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false)
  const [selectedPatientForModal, setSelectedPatientForModal] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/predictions/high-risk-list?limit=5')
    ])
      .then(([statsRes, riskRes]) => {
        setStats(statsRes.data)
        setHighRiskList(riskRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openCalculator = (patient = null) => {
    setSelectedPatientForModal(patient)
    setIsRiskModalOpen(true)
  }

  const cards = stats ? [
    { label: 'Total Patients', value: stats.total_patients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Admissions', value: stats.active_admissions, icon: BedDouble, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Total Admissions', value: stats.total_admissions, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Readmission Rate', value: `${stats.readmission_rate}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Doctor Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.full_name?.split(' ')[0] || 'Doctor'}</h1>
          <p className="text-gray-500 text-sm mt-1">Here is your patient risk triage & clinical decision dashboard.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openCalculator()}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-md text-sm flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" /> AI Risk Calculator
          </button>
          <Link to="/patients" className="btn-primary flex items-center text-sm">
            <Plus className="w-4 h-4 mr-1" /> New Patient
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon className={`w-7 h-7 ${color}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* High-Risk Patient Triage Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> High-Risk Readmission Triage
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Patients prioritized by ML calculated 30-day readmission risk score</p>
          </div>
          <Link to="/model-validation" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            <LineChart className="w-4 h-4" /> View Model Accuracy
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-3">Patient</th>
                <th className="p-3">Patient ID</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Primary Risk Factor</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {highRiskList.map((item) => (
                <tr key={item.patient_id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 font-semibold text-gray-900">{item.patient_name}</td>
                  <td className="p-3 font-mono text-xs text-gray-500">{item.patient_nbr}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                      item.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-gray-900">{item.risk_score} / 100</td>
                  <td className="p-3 text-xs text-gray-600">
                    {item.risk_factors[0]?.factor || 'Glycemic Spike / Length of Stay'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openCalculator(item)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Run Simulation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Workflows</h3>
          <div className="space-y-2">
            {[
              { label: 'Interactive Risk Calculator', action: () => openCalculator(), icon: Sparkles, color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: 'Model Validation & Analytics', to: '/model-validation', icon: LineChart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Patient Directory', to: '/patients', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map(({ label, to, action, icon: Icon, color, bg }) => (
              to ? (
                <Link key={label} to={to}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
                    <span className="font-medium text-gray-800">{label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </Link>
              ) : (
                <button key={label} onClick={action}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group text-left">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
                    <span className="font-medium text-gray-800">{label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              )
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { text: 'Patient PAT001 risk re-evaluated (Score: 78.5 High)', time: '10 mins ago', dot: 'bg-red-500' },
              { text: 'Model RandomForest evaluation completed (Accuracy: 91.5%)', time: '1 hour ago', dot: 'bg-teal-500' },
              { text: 'Patient PAT002 discharged — follow-up scheduled', time: '3 hours ago', dot: 'bg-green-500' },
              { text: 'Discharge planning alert sent for PAT003', time: '5 hours ago', dot: 'bg-purple-500' },
            ].map(({ text, time, dot }, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${dot}`} />
                <div>
                  <p className="text-sm text-gray-800">{text}</p>
                  <p className="text-xs text-gray-400 flex items-center mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />{time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RiskPredictorModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        patient={selectedPatientForModal}
      />
    </div>
  )
}

export default DoctorDashboard
