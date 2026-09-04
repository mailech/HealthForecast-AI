import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Users, Activity, LogOut, TrendingUp,
  BedDouble, Building2, Clock, BarChart3, ArrowRight
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
    { label: 'Total Patients', value: stats.total_patients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+4% this month' },
    { label: 'Total Admissions', value: stats.total_admissions, icon: Activity, color: 'text-green-600', bg: 'bg-green-50', change: '+2% this month' },
    { label: 'Total Discharges', value: stats.total_discharges, icon: LogOut, color: 'text-purple-600', bg: 'bg-purple-50', change: '+6% this month' },
    { label: 'Readmission Rate', value: `${stats.readmission_rate}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', change: '-1% vs last month' },
    { label: 'Active Admissions', value: stats.active_admissions, icon: BedDouble, color: 'text-teal-600', bg: 'bg-teal-50', change: 'Current' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 uppercase tracking-wide">Hospital Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name?.split(' ')[0] || 'Administrator'}</h1>
          <p className="text-gray-500 text-sm mt-1">Hospital operations overview.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map(({ label, value, icon: Icon, color, bg, change }) => (
            <div key={label} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <span className="text-xs text-gray-400">{change}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operations */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" /> Operations
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Bed Occupancy Rate', value: '78%', bar: 78, color: 'bg-green-500' },
              { label: 'Staff Utilisation', value: '85%', bar: 85, color: 'bg-blue-500' },
              { label: 'Patient Satisfaction', value: '92%', bar: 92, color: 'bg-purple-500' },
              { label: 'Average Length of Stay', value: '5.2 days', bar: 52, color: 'bg-orange-500' },
            ].map(({ label, value, bar, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${bar}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Management</h3>
          <div className="space-y-2">
            {[
              { label: 'Patient Records', to: '/patients', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Admission Reports', to: '/patients', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Discharge Analytics', to: '/patients', icon: LogOut, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(({ label, to, icon: Icon, color, bg }) => (
              <Link key={label} to={to}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
                  <span className="font-medium text-gray-800">{label}</span>
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
