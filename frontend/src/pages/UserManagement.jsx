import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { AlertTriangle, CheckCircle2, RefreshCw, UserPlus, Users } from 'lucide-react';

const initialForm = {
  full_name: '',
  username: '',
  email: '',
  password: '',
  role: 'doctor',
  department: '',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await authAPI.listUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await authAPI.register(form);
      setForm(initialForm);
      setMessage('User registered successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'User registration failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500">Hospital administration for staff accounts and role assignment</p>
        </div>
        <button onClick={loadUsers} className="btn-secondary flex items-center gap-2 text-sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-1">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-600" /> Register New User
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Temporary Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="doctor">Doctor</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full text-sm disabled:opacity-50">
              {saving ? 'Registering...' : 'Register User'}
            </button>
          </form>
        </div>

        <div className="card xl:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" /> Staff Directory
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Username</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50">
                    <td className="py-3 pr-4 font-medium">{u.full_name}</td>
                    <td className="py-3 pr-4 text-gray-600">{u.username}</td>
                    <td className="py-3 pr-4 text-gray-600">{u.email}</td>
                    <td className="py-3 pr-4 capitalize font-semibold text-primary-700">
                      {u.role.replace('_', ' ')}
                    </td>
                    <td className="py-3 pr-4">{u.department || '-'}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center text-gray-500 py-8 text-sm">No users found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
