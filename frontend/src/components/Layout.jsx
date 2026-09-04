import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, UserCog, FileText,
  Settings, LogOut, Menu, X, Activity,
  Stethoscope, Building2, FlaskConical, ShieldCheck,
  BedDouble, ClipboardList, BarChart3, Database
} from 'lucide-react'
import { useState } from 'react'

// Nav items per role
const NAV_BY_ROLE = {
  'Doctor': [
    { name: 'Dashboard', href: '/dashboard/doctor', icon: LayoutDashboard },
    { name: 'Risk Forecast', href: '/risk-prediction', icon: Activity },
    { name: 'Clinical Insights', href: '/clinical-insights', icon: Stethoscope },
    { name: 'Model Validation', href: '/model-validation', icon: BarChart3 },
    { name: 'Patients', href: '/patients', icon: Users },
  ],
  'Hospital Administrator': [
    { name: 'Dashboard', href: '/dashboard/hospital-admin', icon: LayoutDashboard },
    { name: 'Risk Forecast', href: '/risk-prediction', icon: Activity },
    { name: 'Clinical Insights', href: '/clinical-insights', icon: Stethoscope },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Model Validation', href: '/model-validation', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
  ],
  'Healthcare Researcher': [
    { name: 'Dashboard', href: '/dashboard/researcher', icon: LayoutDashboard },
    { name: 'Risk Forecast', href: '/risk-prediction', icon: Activity },
    { name: 'Clinical Insights', href: '/clinical-insights', icon: Stethoscope },
    { name: 'Model Validation', href: '/model-validation', icon: BarChart3 },
    { name: 'Datasets', href: '/dataset', icon: Database },
    { name: 'Reports', href: '/reports', icon: FileText },
  ],
  'System Administrator': [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Risk Forecast', href: '/risk-prediction', icon: Activity },
    { name: 'Clinical Insights', href: '/clinical-insights', icon: Stethoscope },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Model Validation', href: '/model-validation', icon: BarChart3 },
    { name: 'User Management', href: '/users', icon: UserCog },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Dataset', href: '/dataset', icon: Database },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
}

const ROLE_META = {
  'Doctor': { icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Hospital Administrator': { icon: Building2, color: 'text-green-600', bg: 'bg-green-100' },
  'Healthcare Researcher': { icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-100' },
  'System Administrator': { icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-100' },
}

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const roleName = user?.role?.name || 'Doctor'
  const nav = NAV_BY_ROLE[roleName] || NAV_BY_ROLE['Doctor']
  const meta = ROLE_META[roleName] || ROLE_META['Doctor']
  const RoleIcon = meta.icon

  const isActive = (path) =>
    path !== '#' && (location.pathname === path || location.pathname.startsWith(path + '/'))

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">HealthForecast <span className="text-primary-600">AI</span></span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Role badge */}
        <div className={`mx-4 mt-4 mb-2 flex items-center space-x-2 px-3 py-2 rounded-lg ${meta.bg}`}>
          <RoleIcon className={`w-4 h-4 ${meta.color}`} />
          <span className={`text-xs font-semibold ${meta.color}`}>{roleName}</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: profile + logout */}
        <div className="border-t border-gray-100 px-4 py-4 space-y-1">
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-primary-700 font-bold text-sm">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || user?.username}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </Link>
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 mr-3 text-gray-400" /> Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-primary-600 rounded-md">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">HealthForecast AI</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
