import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiArrowLeft, FiHome, FiActivity } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECTS = {
  Doctor: '/dashboard/doctor',
  'Hospital Admin': '/dashboard/admin',
  Researcher: '/dashboard/researcher',
  'System Admin': '/dashboard/sysadmin',
};

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userRoleKey = user?.role?.toString().toLowerCase().replace(/\s+/g, '_');
  const dashboardPath = user ? (
    userRoleKey === 'doctor' ? '/dashboard/doctor' :
    userRoleKey === 'hospital_admin' ? '/dashboard/admin' :
    userRoleKey === 'researcher' ? '/dashboard/researcher' :
    userRoleKey === 'system_admin' ? '/dashboard/sysadmin' : '/dashboard/doctor'
  ) : '/login';

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden text-zinc-900 dark:text-zinc-100">

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center text-white dark:text-zinc-950 shadow-xs">
            <FiActivity size={18} className="stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            CarePulse AI
          </span>
        </Link>

        {/* Shield illustration */}
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-800 dark:text-zinc-200">
          <FiShield size={36} />
        </div>

        {/* 403 badge */}
        <div>
          <span className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
            Error 403 — Access Restricted
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">
          Restricted Resource
        </h1>

        <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          This workspace view is restricted to authorized roles. Your current credentials do not have permission to view this section.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-bold uppercase tracking-wider"
          >
            <FiArrowLeft size={14} /> Go Back
          </button>
          <Link
            to={dashboardPath}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-bold uppercase tracking-wider"
          >
            <FiHome size={14} />
            {user ? 'Go to Dashboard' : 'Sign In'}
          </Link>
        </div>

        {user && (
          <p className="text-xs text-zinc-400 mt-6">
            Authenticated as <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user.full_name}</span> ({user.role})
          </p>
        )}
      </motion.div>
    </div>
  );
}
