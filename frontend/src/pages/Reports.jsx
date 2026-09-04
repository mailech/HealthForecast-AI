import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  BarChart3, TrendingUp, Users, Activity, BedDouble,
  LogOut, Calendar, Download, RefreshCw, AlertTriangle
} from 'lucide-react'

const StatCard = ({ label, value, icon: Icon, color, bg, sub }) => (
  <div className="card flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <div className={`p-3 rounded-xl ${bg}`}>
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
  </div>
)

const Bar = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
    </div>
  </div>
)

const Reports = () => {
  const [stats, setStats] = useState(null)
  const [admissions, setAdmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, admissionsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/admissions?limit=100'),
      ])
      setStats(statsRes.data)
      setAdmissions(admissionsRes.data)
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Derived analytics from admissions data
  const deptCounts = admissions.reduce((acc, a) => {
    const dept = a.department || 'Unknown'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})
  const topDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxDept = topDepts[0]?.[1] || 1

  const typeCounts = admissions.reduce((acc, a) => {
    const t = a.admission_type || 'Unknown'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  const readmissions = admissions.filter(a => a.readmission_flag === 'Yes').length
  const discharged = admissions.filter(a => a.discharge_date).length
  const active = admissions.filter(a => !a.discharge_date).length
  const avgLOS = admissions.length
    ? (admissions.reduce((s, a) => s + (a.length_of_stay || 0), 0) / admissions.length).toFixed(1)
    : 0

  const typeColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'admissions', label: 'Admissions' },
    { key: 'readmissions', label: 'Readmissions' },
  ]

  const exportCSV = () => {
    const headers = ['Admission No', 'Patient ID', 'Date', 'Discharge', 'Type', 'Department', 'Diagnosis', 'Readmission']
    const rows = admissions.map(a => [
      a.admission_number, a.patient_id, a.admission_date,
      a.discharge_date || '', a.admission_type || '', a.department || '',
      a.diagnosis || '', a.readmission_flag
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'admissions_report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Analytics & Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Hospital performance metrics and admission analytics.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchData}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 mr-1.5 text-gray-500" /> Refresh
          </button>
          <a
            href="http://localhost:8000/api/predictions/reports/pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4 mr-1.5" /> PDF Forecast Report
          </a>
          <button onClick={exportCSV}
            className="flex items-center px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Patients" value={stats?.total_patients} icon={Users} color="text-blue-600" bg="bg-blue-50" sub="Registered in system" />
            <StatCard label="Total Admissions" value={stats?.total_admissions} icon={Activity} color="text-green-600" bg="bg-green-50" sub={`${active} currently active`} />
            <StatCard label="Total Discharges" value={discharged} icon={LogOut} color="text-purple-600" bg="bg-purple-50" sub={`Avg LOS: ${avgLOS} days`} />
            <StatCard label="Readmission Rate" value={`${stats?.readmission_rate ?? 0}%`} icon={TrendingUp} color="text-orange-600" bg="bg-orange-50" sub={`${readmissions} readmissions`} />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-6">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === t.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top departments */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BedDouble className="w-5 h-5 mr-2 text-primary-600" /> Admissions by Department
                </h3>
                {topDepts.length > 0 ? (
                  <div className="space-y-3">
                    {topDepts.map(([dept, count], i) => (
                      <Bar key={dept} label={dept} value={count} max={maxDept}
                        color={typeColors[i % typeColors.length]} />
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400 text-center py-6">No admission data yet</p>}
              </div>

              {/* Admission types breakdown */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" /> Admission Types
                </h3>
                {Object.keys(typeCounts).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count], i) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${typeColors[i % typeColors.length]}`} />
                          <span className="text-sm text-gray-700">{type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">{count}</span>
                          <span className="text-xs text-gray-400">
                            ({admissions.length ? Math.round((count / admissions.length) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400 text-center py-6">No admission data yet</p>}
              </div>

              {/* Key metrics */}
              <div className="card lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-600" /> Key Performance Indicators
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Admissions', value: active, color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: 'Discharged', value: discharged, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Readmissions', value: readmissions, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Avg Length of Stay', value: `${avgLOS}d`, color: 'text-blue-600', bg: 'bg-blue-50' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Admissions */}
          {activeTab === 'admissions' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Admissions</h3>
                <span className="text-sm text-gray-400">{admissions.length} total records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      {['Admission No', 'Date', 'Department', 'Type', 'Physician', 'Diagnosis', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {admissions.slice(0, 50).map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.admission_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{a.admission_date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{a.department || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{a.admission_type || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{a.attending_physician || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{a.diagnosis || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${a.discharge_date ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {a.discharge_date ? 'Discharged' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {admissions.length === 0 && (
                  <p className="text-center text-gray-400 py-10 text-sm">No admissions recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Readmissions */}
          {activeTab === 'readmissions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard label="Total Readmissions" value={readmissions} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
                <StatCard label="Readmission Rate" value={`${stats?.readmission_rate ?? 0}%`} icon={TrendingUp} color="text-orange-600" bg="bg-orange-50" />
                <StatCard label="Total Admissions" value={admissions.length} icon={Activity} color="text-blue-600" bg="bg-blue-50" />
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Readmission Records
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        {['Admission No', 'Admission Date', 'Discharge Date', 'Department', 'Diagnosis', 'Reason'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {admissions.filter(a => a.readmission_flag === 'Yes').map(a => (
                        <tr key={a.id} className="hover:bg-red-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.admission_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{a.admission_date}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{a.discharge_date || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{a.department || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{a.diagnosis || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{a.readmission_reason || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {readmissions === 0 && (
                    <p className="text-center text-gray-400 py-10 text-sm">No readmissions recorded.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reports
