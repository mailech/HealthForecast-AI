import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Users, Activity, LogOut, TrendingUp,
  BedDouble, Building2, Clock, BarChart3, ArrowRight,
  HeartPulse, PieChart, LineChart, FileText, Download, AlertTriangle, ShieldCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'

const HospitalAdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Patients', value: stats.total_patients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+4% this month', to: '/patients' },
    { label: 'Total Admissions', value: stats.total_admissions, icon: Activity, color: 'text-green-600', bg: 'bg-green-50', change: '+2% this month', to: '/reports' },
    { label: 'Total Discharges', value: stats.total_discharges, icon: LogOut, color: 'text-purple-600', bg: 'bg-purple-50', change: '+6% this month', to: '/patient-outcomes' },
    { label: 'Readmission Rate', value: `${stats.readmission_rate}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', change: '-1% vs last month', to: '/readmission-analytics' },
    { label: 'Active Admissions', value: stats.active_admissions, icon: BedDouble, color: 'text-teal-600', bg: 'bg-teal-50', change: 'Current Capacity', to: '/hospital-analytics' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Hospital Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name?.split(' ')[0] || 'Administrator'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Hospital operational performance, resource allocation & quality oversight.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/department-performance"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold text-xs rounded-xl transition-all"
          >
            Department Benchmarks
          </Link>
          <Link
            to="/export"
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Export Operations Report
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map(({ label, value, icon: Icon, color, bg, change, to }) => (
            <Link key={label} to={to} className="card hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${bg} group-hover:scale-105 transition-transform`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">{change}</span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1 font-semibold group-hover:text-gray-700">{label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Executive Administrative Alerts & Compliance Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 flex-shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase rounded-full border border-emerald-500/40">
                Compliance Active
              </span>
              <span className="text-xs text-slate-300">HRRP Penalty Risk Mitigation</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Hospital Readmission Rate (-1.4% below CMS penalty threshold)</h3>
            <p className="text-xs text-slate-300 mt-0.5">Automated ML risk triage reduced estimated 30-day penalty exposure by $42,500 this quarter.</p>
          </div>
        </div>

        <Link
          to="/readmission-analytics"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex-shrink-0 transition-all"
        >
          View Readmission Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operations Performance Progress Bars */}
        <div className="card space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center justify-between">
            <span className="flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-green-600" /> Operational Utilisation</span>
            <Link to="/hospital-analytics" className="text-xs font-bold text-green-600 hover:text-green-700">Detailed Analytics →</Link>
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Bed Occupancy Rate', value: '78%', bar: 78, color: 'bg-green-500', desc: 'Optimal bed turnover capacity' },
              { label: 'Clinical Staff Utilisation', value: '85%', bar: 85, color: 'bg-blue-500', desc: 'Balanced nurse-to-patient ratio' },
              { label: 'Patient Satisfaction Index', value: '94.8%', bar: 95, color: 'bg-purple-500', desc: 'JCAHO benchmark score' },
              { label: 'Average Length of Stay (ALOS)', value: '4.2 days', bar: 52, color: 'bg-orange-500', desc: '-0.4 days improvement vs baseline' },
            ].map(({ label, value, bar, color, desc }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">{label}</span>
                  <span className="font-extrabold text-gray-900">{value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${bar}%` }} />
                </div>
                <p className="text-[11px] text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Management Navigation */}
        <div className="card space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Hospital Admin Modules</h3>
          <div className="space-y-2">
            {[
              { label: 'Hospital Operational Analytics', to: '/hospital-analytics', icon: Building2, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Readmission Analytics Engine', to: '/readmission-analytics', icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Patient Clinical Outcomes Tracking', to: '/patient-outcomes', icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Department Performance Benchmarks', to: '/department-performance', icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Treatment Cost & Efficacy Analytics', to: '/treatment-analytics', icon: LineChart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Healthcare Operational Reports', to: '/reports', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Data & Analytics Export Center', to: '/export', icon: Download, color: 'text-teal-600', bg: 'bg-teal-50' },
            ].map(({ label, to, icon: Icon, color, bg }) => (
              <Link key={label} to={to}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
                  <span className="font-semibold text-gray-800 text-sm">{label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalAdminDashboard
