import React from 'react';
import { FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import RoleBadge from './RoleBadge';

export default function UserProfileCard({ user }) {
  if (!user) return null;
  const initials = (user.full_name || user.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-18 h-18 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 text-xl font-bold shadow-xs mb-3">
          {initials}
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">{user.full_name}</h3>
        <div className="mt-2"><RoleBadge role={user.role} /></div>
        {user.department && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{user.department}</p>}
      </div>
      <div className="mt-5 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <FiMail size={13} className="text-zinc-400" />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <FiPhone size={13} className="text-zinc-400" />
            <span>{user.phone}</span>
          </div>
        )}
        {user.joinDate && (
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <FiCalendar size={13} className="text-zinc-400" />
            <span>Joined {user.joinDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
