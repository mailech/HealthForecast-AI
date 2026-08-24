import React from 'react';
import { FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import RoleBadge from './RoleBadge';

export default function UserProfileCard({ user }) {
  const initials = user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3">
          {initials}
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user.full_name}</h3>
        <div className="mt-2"><RoleBadge role={user.role} /></div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user.department}</p>
      </div>
      <div className="mt-5 space-y-2.5 border-t border-slate-100 dark:border-slate-700 pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <FiMail size={14} className="text-slate-400" />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <FiPhone size={14} className="text-slate-400" />
            <span>{user.phone}</span>
          </div>
        )}
        {user.joinDate && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <FiCalendar size={14} className="text-slate-400" />
            <span>Joined {user.joinDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
