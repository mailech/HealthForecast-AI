import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, Activity, Server, FileText, CheckCircle, Plus, Edit } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { healthApi } from '../services/api';
import { Modal } from '../components/Modal';

export const SystemAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // User Management Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'Doctor',
    hospital_name: 'MetroHealth General Hospital',
    password: ''
  });

  const fetchData = async () => {
    try {
      const [u, l, s] = await Promise.all([
        healthApi.adminGetUsers(),
        healthApi.adminGetLogs(),
        healthApi.adminGetSystemStatus()
      ]);
      setUsers(u);
      setLogs(l);
      setStatus(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        hospital_name: user.hospital_name,
        password: '' // Don't pre-fill password for editing
      });
    } else {
      setEditingUser(null);
      setFormData({
        full_name: '',
        email: '',
        role: 'Doctor',
        hospital_name: 'MetroHealth General Hospital',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await healthApi.adminUpdateUser(editingUser.id, formData);
      } else {
        await healthApi.adminCreateUser(formData);
      }
      setIsModalOpen(false);
      fetchData(); // Refresh the data
    } catch (err) {
      console.error("Failed to save user", err);
      alert("Error saving user. Email might already exist.");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading System Telemetry...</div>;

  const roles = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white text-slate-800 shadow-md border-slate-200 p-6 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div>
          <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Infrastructure Control</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">System Administration Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage platform configuration, user roles, audit trails, and ML model instances.</p>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard title="Total System Users" value={users.length} icon={Users} />
        <KPICard title="Platform Status" value={status?.status === 'online' ? 'Operational' : 'Degraded'} icon={Server} change="99.9% Uptime" changeType="positive" />
        <KPICard title="Database Connectivity" value={status?.database === 'connected' ? 'Connected' : 'Offline'} icon={Database} />
        <KPICard title="Audit Log Entries" value={logs.length} icon={FileText} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ML Model Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900">AI Model & Dataset Status</h3>
          </div>
          {status?.model_metadata ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Model Engine</span>
                <span className="font-bold text-slate-900">{status.model_metadata.model_name} (v{status.model_metadata.model_version})</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Last Training Date</span>
                <span className="text-slate-900 font-mono text-xs">{new Date(status.model_metadata.training_date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Dataset Origin</span>
                <span className="text-slate-900 font-medium">Diabetes 130-US Hospitals (Kaggle/UCI)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-bold mb-1">ROC-AUC Score</p>
                  <p className="text-lg font-extrabold text-blue-900">{(status.model_metadata.metrics.roc_auc * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-bold mb-1">Model Accuracy</p>
                  <p className="text-lg font-extrabold text-emerald-900">{(status.model_metadata.metrics.accuracy * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No model metadata available.</p>
          )}
        </div>

        {/* User Roles */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900">Role & Permission Distribution</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(roles).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-800">{role}</span>
                </div>
                <span className="bg-slate-200 text-slate-700 px-3 py-0.5 rounded-full text-xs font-bold">{count} Users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Platform Users</h3>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>
          <div className="overflow-auto flex-1 max-h-80">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-2.5 px-4 text-blue-600">{u.email}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold">{u.role}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">System Audit Trail</h3>
          </div>
          <div className="overflow-auto flex-1 max-h-80">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-mono text-[10px]">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-slate-900">{l.user_email}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200">{l.action}</span>
                    </td>
                    <td className="py-2.5 px-4 truncate max-w-[120px]">{l.resource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Edit User Account" : "Create New User Account"}>
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
            <select
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Doctor">Doctor</option>
              <option value="Hospital Administrator">Hospital Administrator</option>
              <option value="System Administrator">System Administrator</option>
              <option value="Healthcare Researcher">Healthcare Researcher</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Name</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              value={formData.hospital_name}
              onChange={(e) => setFormData({...formData, hospital_name: e.target.value})}
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              {editingUser ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
