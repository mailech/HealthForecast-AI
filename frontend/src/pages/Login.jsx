import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Activity,
  Stethoscope,
  Building2,
  FlaskConical,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react'

const ROLES = [
  { name: 'Doctor', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50', active: 'border-blue-500 bg-blue-50' },
  { name: 'Hospital Administrator', icon: Building2, color: 'text-green-600', bg: 'bg-green-50', active: 'border-green-500 bg-green-50' },
  { name: 'Healthcare Researcher', icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50', active: 'border-purple-500 bg-purple-50' },
  { name: 'System Administrator', icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-50', active: 'border-red-500 bg-red-50' },
]

const getRoleDashboard = (roleName) => {
  switch (roleName) {
    case 'Doctor': return '/dashboard/doctor'
    case 'Hospital Administrator': return '/dashboard/hospital-admin'
    case 'Healthcare Researcher': return '/dashboard/researcher'
    case 'System Administrator': return '/dashboard/admin'
    default: return '/dashboard'
  }
}

const Login = () => {
  const [searchParams] = useSearchParams()
  const [selectedRole, setSelectedRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.get('registered') === '1') setJustRegistered(true)
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedRole) {
      setError('Please select your role before signing in.')
      return
    }

    setLoading(true)
    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      const userRole = result.user?.role?.name
      // Verify the selected role matches actual role
      if (userRole && userRole !== selectedRole) {
        setError(`This account is registered as "${userRole}", not "${selectedRole}". Please select the correct role.`)
        return
      }
      navigate(getRoleDashboard(userRole || selectedRole))
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary-600 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">HealthForecast <span className="text-primary-600">AI</span></span>
        </Link>
        <Link to="/register" className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors">
          New here? Register
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to your HealthForecast AI account</p>
          </div>

          {justRegistered && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Account created successfully! Please sign in below.</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Role selector */}
            <p className="text-sm font-semibold text-gray-700 mb-3">Select your role</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {ROLES.map(({ name, icon: Icon, color, bg, active }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => { setSelectedRole(name); setError('') }}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all text-left ${
                    selectedRole === name
                      ? `${active} border-2`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 leading-tight">{name}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-9"
                    placeholder="you@hospital.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-9 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">Demo credentials (password: Admin@123)</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-medium text-gray-700">Admin</p>
                  <p className="truncate">admin@healthforecast.ai</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-medium text-gray-700">Doctor</p>
                  <p className="truncate">doctor@healthforecast.ai</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
