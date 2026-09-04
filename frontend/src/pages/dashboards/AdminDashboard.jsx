import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  ShieldCheck, Users, Activity, TrendingUp,
  UserCog, Settings, FileText, Database,
  ArrowRight, Clock, AlertTriangle
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/users'),
    ])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data)
        setUsers(usersRes.data.slice(0, 5))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const roleBadge = (roleName) => {
    const map = {
      'System Administrator': 'bg-red-100 text-red-700',
      'Doctor': 'bg-blue-100 text-blue-700',
      'Hospital Administrator': 'bg-green-100 text-green-700',
      'Healthcare Researcher': 'bg-purple-100 text-purple-700',
    }
    return map[roleName] || 'bg-gray-100 text-gray-700'
  }

  const cards = stats ? [
    { label: 'Total Patients', value: stats.total_patients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Admissions', value: stats.total_admissions, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Readmission Rate', value: `${stats.readmission_rate}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'System Users', value: users.length, icon: UserCog, color: 'text-red-600', bg: 'bg-red-50' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600 uppercase tracking-wide">System Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name?.split(' ')[0] || 'Admin'}</h1>
          <p className="text-gray-500 text-sm mt-1">Full system overview and management.</p>
        </div>
        <Link to="/users" className="btn-primary flex items-center text-sm">
          <UserCog className="w-4 h-4 mr-1" /> Manage Users
        </Link>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserCog className="w-5 h-5 mr-2 text-red-600" /> System Users
            </h3>
            <Link to="/users" className="text-sm text-primary-600 hover:underline flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                      {u.full_name?.charAt(0) || u.username?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.full_name || u.username}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleBadge(u.role?.name)}`}>
                    {u.role?.name || '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No users found</p>
          )}
        </div>

        {/* Admin quick links */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-red-600" /> System Management
          </h3>
          <div className="space-y-2">
            {[
              { label: 'User Management', to: '/users', icon: UserCog, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Patient Records', to: '/patients', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Audit Logs', to: '/settings', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'System Settings', to: '/settings', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100' },
              { label: 'Dataset Integration', to: '/settings', icon: Database, color: 'text-green-600', bg: 'bg-green-50' },
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

      {/* System alerts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" /> System Alerts
        </h3>
        <div className="space-y-3">
          {[
            { text: 'Database backup completed successfully', time: '1 hour ago', type: 'success' },
            { text: '3 new user registrations pending approval', time: '2 hours ago', type: 'warning' },
            { text: 'System health check passed', time: '4 hours ago', type: 'success' },
          ].map(({ text, time, type }, i) => (
            <div key={i} className={`flex items-start space-x-3 p-3 rounded-lg ${type === 'success' ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${type === 'success' ? 'bg-green-500' : 'bg-orange-500'}`} />
              <div className="flex-1">
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
  )
}

export default AdminDashboard
