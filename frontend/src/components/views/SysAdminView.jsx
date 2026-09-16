import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Cpu, Users, Terminal, RefreshCw, CheckCircle,
  Plus, Key, Award, AlertCircle, Play, Sliders
} from 'lucide-react';
import NeuralNetwork3D from '../three/NeuralNetwork3D';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

export default function SysAdminView({ currentUser }) {
  const [activeModel, setActiveModel] = useState('RandomForest');
  const [modelsSummary, setModelsSummary] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'doctor',
    department: 'Endocrinology'
  });

  useEffect(() => {
    fetchSystemData();
  }, [activeModel]);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const authHeaders = { 'x-role': 'system_admin' };
      const [resSummary, resMetrics, resUsers, resLogs] = await Promise.all([
        fetch('/api/models/summary', { headers: authHeaders }),
        fetch(`/api/models/metrics?model_name=${activeModel}`, { headers: authHeaders }),
        fetch('/api/system/users', { headers: authHeaders }),
        fetch('/api/system/audit-logs', { headers: authHeaders })
      ]);

      const dataSummary = await resSummary.json();
      const dataMetrics = await resMetrics.json();
      const dataUsers = await resUsers.json();
      const dataLogs = await resLogs.json();

      setModelsSummary(Array.isArray(dataSummary) ? dataSummary : []);
      setMetrics(dataMetrics && typeof dataMetrics === 'object' ? dataMetrics : {});
      setUsersList(Array.isArray(dataUsers) ? dataUsers : []);
      setAuditLogs(Array.isArray(dataLogs) ? dataLogs : []);
    } catch (e) {
      console.error(e);
      setModelsSummary([]);
      setUsersList([]);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const switchModel = async (modelName) => {
    sound.playClick();
    try {
      const res = await fetch('/api/models/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'system_admin' },
        body: JSON.stringify({ model_name: modelName })
      });
      if (res.ok) {
        setActiveModel(modelName);
        fetchSystemData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerRetrain = async () => {
    setRetraining(true);
    sound.playScan();
    try {
      const res = await fetch('/api/models/retrain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'system_admin' },
        body: JSON.stringify({ n_samples: 3000, test_size: 0.25 })
      });
      const data = await res.json();
      sound.playSuccess();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      fetchSystemData();
    } catch (e) {
      console.error(e);
    } finally {
      setRetraining(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    sound.playClick();
    try {
      const res = await fetch('/api/system/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'system_admin' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowAddUserModal(false);
        setNewUser({ email: '', password: '', full_name: '', role: 'doctor', department: 'Endocrinology' });
        sound.playSuccess();
        fetchSystemData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-300 font-bold text-lg">
            {currentUser?.avatar_initials || 'AM'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                {currentUser?.full_name || 'Alex Mercer'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-red-500/20 border border-red-500/40 text-red-300">
                SYSTEM ADMINISTRATOR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Platform Infrastructure • AI Model Governance & RBAC Security Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerRetrain}
            disabled={retraining}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-glow-cyan transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-black ${retraining ? 'animate-spin' : ''}`} />
            {retraining ? 'Retraining Models...' : 'Retrain AI Models (3k Encounters)'}
          </button>
        </div>
      </div>

      {/* 3D AI Decision Matrix Visualizer */}
      <NeuralNetwork3D activeModel={activeModel} metrics={metrics} />

      {/* AI Model Governance & Switcher */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            AI Model Benchmark & Deployment Switcher
          </h3>
          <span className="text-xs text-cyan-400 font-mono">
            Active in Production: <span className="font-bold underline">{activeModel}</span>
          </span>
        </div>

        {/* 3 Models Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modelsSummary.map((m) => {
            const isCurrent = m.name === activeModel;
            return (
              <div
                key={m.name}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">{m.name}</span>
                  {isCurrent ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => switchModel(m.name)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    >
                      DEPLOY
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">ROC-AUC</span>
                    <div className="text-cyan-300 font-bold">{m.roc_auc}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Accuracy</span>
                    <div className="text-emerald-400 font-bold">{m.accuracy}%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Precision</span>
                    <div className="text-amber-400 font-bold">{m.precision}%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">F1-Score</span>
                    <div className="text-purple-400 font-bold">{m.f1_score}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Importance Rankings & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Top Feature Importance (Diabetes 130-US Hospitals)
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {(metrics.feature_importances || []).slice(0, 8).map((f, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{f.readable_name}</span>
                  <span className="text-cyan-400 font-bold">{(f.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, f.importance * 350)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confusion Matrix & ROC Summary */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Model Validation Confusion Matrix
          </h3>
          <div className="grid grid-cols-2 gap-3 pt-2 text-center font-mono">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <span className="text-xs text-emerald-400">TRUE NEGATIVES (No Readmit)</span>
              <div className="text-2xl font-bold text-white mt-1">
                {metrics?.confusion_matrix ? metrics.confusion_matrix[0][0] : 312}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40">
              <span className="text-xs text-red-400">FALSE POSITIVES</span>
              <div className="text-2xl font-bold text-white mt-1">
                {metrics?.confusion_matrix ? metrics.confusion_matrix[0][1] : 45}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40">
              <span className="text-xs text-amber-400">FALSE NEGATIVES</span>
              <div className="text-2xl font-bold text-white mt-1">
                {metrics?.confusion_matrix ? metrics.confusion_matrix[1][0] : 38}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
              <span className="text-xs text-cyan-400">TRUE POSITIVES (High Risk)</span>
              <div className="text-2xl font-bold text-white mt-1">
                {metrics?.confusion_matrix ? metrics.confusion_matrix[1][1] : 230}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management Table */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Role-Based Access Control (RBAC) Accounts
            </h3>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Add User
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {usersList.map((u) => (
              <div key={u.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{u.full_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{u.email} • {u.department}</div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  u.role === 'doctor' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                  u.role === 'hospital_admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                  u.role === 'healthcare_researcher' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                  'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {u.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Audit Logs */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              System Governance & Security Audit Logs
            </h3>
            <span className="text-xs text-slate-500 font-mono">Immutable Log</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 font-mono text-[11px]">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">[{log.action}]</span>
                    <span className="text-slate-300">{log.user_email}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{log.details}</div>
                </div>
                <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Platform User</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  placeholder="Dr. Sarah Connor, MD"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  placeholder="sconnor@healthforecast.ai"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="doctor">Doctor</option>
                  <option value="hospital_admin">Hospital Administrator</option>
                  <option value="healthcare_researcher">Healthcare Researcher</option>
                  <option value="system_admin">System Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  placeholder="Cardiology / ICU"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black font-bold shadow-glow-cyan"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
