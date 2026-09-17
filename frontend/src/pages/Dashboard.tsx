import { useQuery } from 'react-query'
import api from '../lib/api'
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp 
} from 'lucide-react'

export default function Dashboard() {
  const { data: summary } = useQuery('dashboard-summary', () =>
    api.get('/analytics/dashboard/summary').then(res => res.data.summary)
  )

  const stats = [
    { name: 'Total Patients', value: summary?.total_patients || 0, icon: Users, color: 'bg-blue-500' },
    { name: 'Active Patients', value: summary?.active_patients || 0, icon: Users, color: 'bg-green-500' },
    { name: 'Admissions Today', value: summary?.admissions_today || 0, icon: Activity, color: 'bg-purple-500' },
    { name: 'High Risk Patients', value: summary?.high_risk_patients || 0, icon: AlertTriangle, color: 'bg-red-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <TrendingUp className="w-5 h-5 mr-3 text-green-500" />
              <span>System operational - All services running normally</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Activity className="w-5 h-5 mr-3 text-blue-500" />
              <span>AI models updated - Risk prediction v1.0.0 deployed</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-3 text-purple-500" />
              <span>New patient registrations processed</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium">Add New Patient</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium">Generate Risk Prediction</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium">View Analytics Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
