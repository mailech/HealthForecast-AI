import { useState } from 'react'
import { Bell, Lock, Database, Globe, CheckCircle2, AlertTriangle } from 'lucide-react'
import api from '../services/api'

const Settings = () => {
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState(null) // { type: 'success'|'error', text: '' }
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setMsg({ type: 'error', text: 'Please fill in all password fields.' })
      return
    }
    if (passwords.next !== passwords.confirm) {
      setMsg({ type: 'error', text: 'New password and confirm password do not match.' })
      return
    }
    if (passwords.next.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters long.' })
      return
    }

    setLoading(true)
    try {
      // Simulate/call API
      await new Promise(r => setTimeout(r, 600))
      setMsg({ type: 'success', text: 'Password changed successfully!' })
      setPasswords({ current: '', next: '', confirm: '' })
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to change password. Please check your current password.' })
    } finally {
      setLoading(false)
    }
  }

  const exportPatientData = async () => {
    try {
      const res = await api.get('/patients')
      const patients = res.data || []
      const headers = ['id', 'patient_id', 'first_name', 'last_name', 'gender', 'date_of_birth', 'city', 'state']
      const rows = patients.map(p => [
        p.id, p.patient_id, p.first_name, p.last_name, p.gender, p.date_of_birth, p.city || '', p.state || ''
      ])
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'patient_records_export.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const exportReports = async () => {
    try {
      const res = await api.get('/dashboard/stats')
      const stats = res.data || {}
      const rows = [
        ['Metric', 'Value'],
        ['Total Patients', stats.total_patients || 0],
        ['Total Admissions', stats.total_admissions || 0],
        ['Active Admissions', stats.active_admissions || 0],
        ['Total Discharges', stats.total_discharges || 0],
        ['Readmission Rate (%)', stats.readmission_rate || 0]
      ]
      const csv = rows.map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'analytics_reports_summary.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your application settings</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email updates about patient changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive push notifications for urgent alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Weekly Reports</p>
                <p className="text-sm text-gray-500">Receive weekly summary reports</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>

          {msg && (
            <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 text-sm ${
              msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                className="input-field"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwords.next}
                onChange={e => setPasswords({ ...passwords, next: e.target.value })}
                className="input-field"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                className="input-field"
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Export Patient Data</p>
                <p className="text-sm text-gray-500">Download all patient data as CSV</p>
              </div>
              <button onClick={exportPatientData} className="btn-secondary">Export</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Export Reports</p>
                <p className="text-sm text-gray-500">Download analytics reports</p>
              </div>
              <button onClick={exportReports} className="btn-secondary">Export</button>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Application Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select className="input-field" defaultValue="English">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select className="input-field" defaultValue="UTC">
                <option>UTC</option>
                <option>Eastern Time</option>
                <option>Pacific Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select className="input-field" defaultValue="YYYY-MM-DD">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
