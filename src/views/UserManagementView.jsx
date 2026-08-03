import React, { useState } from 'react';
import { UserCog, ShieldCheck, UserPlus, Key, Lock, CheckCircle, Search, Shield } from 'lucide-react';
import { PLATFORM_USERS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const UserManagementView = () => {
  const { currentRoleKey, setAccessMatrixOpen } = useAuth();
  const [users, setUsers] = useState(PLATFORM_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  const isSysAdmin = currentRoleKey === 'SYSADMIN';

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              User & Role Management (RBAC)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              PDF Module 1 Requirement
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            System account creation, role assignments (Doctor, Admin, Researcher, SysAdmin), and access control governance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAccessMatrixOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center space-x-2 transition"
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>View Full Access Matrix</span>
          </button>
        </div>
      </div>

      {/* Security Warning if not SysAdmin */}
      {!isSysAdmin && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-3">
          <Lock className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <span className="font-bold">RBAC Restriction Notice:</span> You are currently viewing this module under the <strong>{currentRoleKey}</strong> role. User account modification requires <strong>System Administrator</strong> privileges. Switch role in top navbar to manage user accounts.
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">Registered Platform Users</h3>
          
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search user name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">User Name & ID</th>
                <th className="py-3 px-4 font-bold">Email</th>
                <th className="py-3 px-4 font-bold">Assigned Role</th>
                <th className="py-3 px-4 font-bold">Department</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50">
                  <td className="py-3.5 px-4 font-bold text-slate-100">
                    <div>{u.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{u.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                      u.role === 'Doctor' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                      u.role === 'Hospital Administrator' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      u.role === 'Healthcare Researcher' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{u.department}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
