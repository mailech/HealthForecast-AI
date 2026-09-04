import { Link } from 'react-router-dom'
import {
  Activity,
  Stethoscope,
  Building2,
  FlaskConical,
  ShieldCheck,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
  Heart
} from 'lucide-react'

const roles = [
  {
    title: 'Doctor',
    description: 'Manage patients, view medical histories, monitor admissions and treatments.',
    icon: Stethoscope,
    color: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50 text-blue-600',
    border: 'border-blue-200 hover:border-blue-400',
  },
  {
    title: 'Hospital Administrator',
    description: 'Oversee hospital operations, analytics, discharge reports and staff activity.',
    icon: Building2,
    color: 'from-green-500 to-green-600',
    light: 'bg-green-50 text-green-600',
    border: 'border-green-200 hover:border-green-400',
  },
  {
    title: 'Healthcare Researcher',
    description: 'Access anonymised datasets, readmission trends and research-grade reports.',
    icon: FlaskConical,
    color: 'from-purple-500 to-purple-600',
    light: 'bg-purple-50 text-purple-600',
    border: 'border-purple-200 hover:border-purple-400',
  },
  {
    title: 'System Administrator',
    description: 'Full system access — user management, roles, audit logs and configuration.',
    icon: ShieldCheck,
    color: 'from-red-500 to-red-600',
    light: 'bg-red-50 text-red-600',
    border: 'border-red-200 hover:border-red-400',
  },
]

const features = [
  { icon: TrendingUp, title: 'Readmission Prediction', desc: 'AI-powered risk scoring for 30-day hospital readmissions.' },
  { icon: Users, title: 'Patient Management', desc: 'Comprehensive patient profiles with full medical histories.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time hospital KPIs, trends and discharge analytics.' },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Granular permissions ensuring data privacy and compliance.' },
]

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary-600 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">HealthForecast <span className="text-primary-600">AI</span></span>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            <span>Hospital Readmission Prediction System</span>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Smarter Care, <br />
            <span className="text-primary-600">Fewer Readmissions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            HealthForecast AI helps hospitals predict and prevent patient readmissions using intelligent risk scoring, real-time analytics and role-tailored workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
            >
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/login"
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">One platform for clinicians, administrators and researchers — each with the right tools.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
                <div className="p-2 bg-primary-50 rounded-lg w-fit mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for every role</h2>
            <p className="text-gray-500">Choose your role to get started with the right access level.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map(({ title, description, icon: Icon, color, light, border }) => (
              <Link
                key={title}
                to={`/register?role=${encodeURIComponent(title)}`}
                className={`group bg-white rounded-xl border-2 ${border} p-6 flex flex-col items-start transition-all hover:shadow-lg`}
              >
                <div className={`p-3 rounded-xl ${light} mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 flex-1">{description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                  Register as {title} <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">HealthForecast AI</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} HealthForecast AI. All rights reserved.</p>
          <div className="flex space-x-4 text-sm">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
