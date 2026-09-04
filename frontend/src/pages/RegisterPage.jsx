import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import {
  Activity,
  Stethoscope,
  Building2,
  FlaskConical,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'

const ROLES = [
  {
    name: 'Doctor',
    icon: Stethoscope,
    color: 'border-blue-400 bg-blue-50',
    activeColor: 'border-blue-600 bg-blue-100 ring-2 ring-blue-400',
    iconColor: 'text-blue-600',
    description: 'Patient care & medical records',
  },
  {
    name: 'Hospital Administrator',
    icon: Building2,
    color: 'border-green-400 bg-green-50',
    activeColor: 'border-green-600 bg-green-100 ring-2 ring-green-400',
    iconColor: 'text-green-600',
    description: 'Operations & analytics',
  },
  {
    name: 'Healthcare Researcher',
    icon: FlaskConical,
    color: 'border-purple-400 bg-purple-50',
    activeColor: 'border-purple-600 bg-purple-100 ring-2 ring-purple-400',
    iconColor: 'text-purple-600',
    description: 'Data & research reports',
  },
  {
    name: 'System Administrator',
    icon: ShieldCheck,
    color: 'border-red-400 bg-red-50',
    activeColor: 'border-red-600 bg-red-100 ring-2 ring-red-400',
    iconColor: 'text-red-600',
    description: 'Full system management',
  },
]

const RegisterPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '')
  const [step, setStep] = useState(searchParams.get('role') ? 2 : 1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  })

  const handleRoleSelect = (roleName) => {
    setSelectedRole(roleName)
    setStep(2)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register-by-role', {
        full_name: form.full_name,
        username: form.username,
        email: form.email,
        password: form.password,
        role_name: selectedRole,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login?registered=1'), 2000)
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Please make sure the backend is running.')
      } else {
        const detail = err.response?.data?.detail
        if (Array.isArray(detail)) {
          setError(detail.map(d => d.msg).join(', '))
        } else {
          setError(detail || `Error ${err.response.status}: Registration failed.`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const activeRole = ROLES.find((r) => r.name === selectedRole)

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
        <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors">
          Already have an account? Sign In
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8 space-x-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`h-1 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>

          {success ? (
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
              <p className="text-gray-500 mb-1">Your account has been created successfully.</p>
              <p className="text-sm text-gray-400">Redirecting you to login…</p>
            </div>
          ) : step === 1 ? (
            /* ── Step 1: Choose Role ── */
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">Choose your role</h2>
              <p className="text-gray-500 text-center mb-8 text-sm">Select the role that best describes your position.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES.map(({ name, icon: Icon, color, iconColor, description }) => (
                  <button
                    key={name}
                    onClick={() => handleRoleSelect(name)}
                    className={`flex items-start space-x-4 p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${color}`}
                  >
                    <div className="mt-0.5">
                      <Icon className={`w-7 h-7 ${iconColor}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
              </p>
            </div>
          ) : (
            /* ── Step 2: Fill Details ── */
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Change role
              </button>

              {/* Selected role badge */}
              {activeRole && (
                <div className={`flex items-center space-x-3 p-3 rounded-xl border-2 mb-6 ${activeRole.activeColor}`}>
                  <activeRole.icon className={`w-6 h-6 ${activeRole.iconColor}`} />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Registering as</p>
                    <p className={`font-bold ${activeRole.iconColor}`}>{selectedRole}</p>
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create your account</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="full_name"
                        required
                        value={form.full_name}
                        onChange={handleChange}
                        placeholder="Dr. John Smith"
                        className="input-field pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="username"
                        required
                        value={form.username}
                        onChange={handleChange}
                        placeholder="johnsmith"
                        className="input-field pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@hospital.com"
                      className="input-field pl-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        className="input-field pl-9 pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirm_password"
                        required
                        value={form.confirm_password}
                        onChange={handleChange}
                        placeholder="Repeat password"
                        className="input-field pl-9 pr-10"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
