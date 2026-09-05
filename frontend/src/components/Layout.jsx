import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import {
  Activity, Users, AlertTriangle, TrendingUp, Brain, Settings, LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Activity, label: 'Dashboard', roles: ['doctor', 'hospital_admin', 'researcher', 'system_admin'] },
  { to: '/patients', icon: Users, label: 'Patients', roles: ['doctor', 'hospital_admin', 'researcher', 'system_admin'] },
  { to: '/risk-prediction', icon: AlertTriangle, label: 'Risk Prediction', roles: ['doctor', 'hospital_admin', 'researcher', 'system_admin'] },
  { to: '/forecasting', icon: TrendingUp, label: 'Readmission Forecast', roles: ['doctor', 'hospital_admin', 'researcher', 'system_admin'] },
  { to: '/clinical-insights', icon: Brain, label: 'Clinical Insights', roles: ['doctor', 'hospital_admin', 'researcher', 'system_admin'] },
  { to: '/models', icon: Settings, label: 'Model Management', roles: ['system_admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="HealthForecast AI" className="w-8 h-8 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold">HealthForecast AI</h1>
              <p className="text-xs text-blue-200">Patient Risk Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-700">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-blue-300">{ROLE_LABELS[user?.role]}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-200 hover:bg-primary-800 rounded-lg"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
