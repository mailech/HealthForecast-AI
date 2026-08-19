import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Eye, EyeOff } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { username: 'doctor1', password: 'doctor123', role: 'Doctor' },
  { username: 'admin1', password: 'admin123', role: 'Hospital Admin' },
  { username: 'researcher1', password: 'research123', role: 'Researcher' },
  { username: 'sysadmin', password: 'sysadmin123', role: 'System Admin' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (account) => {
    setUsername(account.username);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <Heart className="w-16 h-16 text-blue-300 mb-6" />
          <h1 className="text-4xl font-bold mb-4">HealthForecast AI</h1>
          <p className="text-blue-200 text-lg mb-6">
            Hospital Readmission Prediction & Patient Risk Intelligence System
          </p>
          <ul className="space-y-3 text-blue-100">
            <li>• AI-powered readmission forecasting</li>
            <li>• Patient risk scoring & categorization</li>
            <li>• Clinical decision support</li>
            <li>• Role-based healthcare analytics</li>
          </ul>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-500 mb-8">Access your healthcare dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-3">Demo accounts (click to fill):</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => quickLogin(acc)}
                  className="text-left px-3 py-2 text-xs bg-gray-50 border rounded-lg hover:bg-gray-100"
                >
                  <span className="font-medium">{acc.role}</span>
                  <br />
                  <span className="text-gray-500">{acc.username}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
