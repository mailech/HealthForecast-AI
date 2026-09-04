import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { FlaskConical, TrendingUp, BarChart3, Users, Database, Download, Clock } from 'lucide-react'

const ResearcherDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const insights = [
    { label: 'Readmission Rate', value: stats ? `${stats.readmission_rate}%` : '—', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Dataset Records', value: stats ? stats.total_admissions : '—', icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Patients', value: stats ? stats.total_patients : '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Discharged Cases', value: stats ? stats.total_discharges : '—', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <FlaskConical className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-purple-600 uppercase tracking-wide">Research Portal</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name?.split(' ')[0] || 'Researcher'}</h1>
        <p className="text-gray-500 text-sm mt-1">Anonymised data insights and readmission analytics.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {insights.map(({ label, value, icon: Icon, color, bg }) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readmission trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" /> Readmission Trends
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Diabetes-related', pct: 68, color: 'bg-orange-500' },
              { label: 'Cardiovascular', pct: 52, color: 'bg-red-500' },
              { label: 'Respiratory', pct: 38, color: 'bg-blue-500' },
              { label: 'Renal', pct: 29, color: 'bg-purple-500' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-900">{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Datasets & Exports */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-purple-600" /> Available Datasets
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Diabetes 130-US Hospitals', records: '101,766 records', updated: '2024-01-01' },
              { name: 'Readmission Risk Factors', records: '45,230 records', updated: '2024-03-15' },
              { name: 'Patient Outcomes', records: '28,450 records', updated: '2024-06-01' },
            ].map(({ name, records, updated }) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400 flex items-center mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />{records} · Updated {updated}
                  </p>
                </div>
                <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResearcherDashboard
