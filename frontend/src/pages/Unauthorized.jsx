import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiArrowLeft, FiHome, FiActivity } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECTS = {
  doctor: '/dashboard/doctor',
  hospital_admin: '/dashboard/admin',
  researcher: '/dashboard/researcher',
  system_admin: '/dashboard/sysadmin',
};

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0"
        style={{ background:'radial-gradient(ellipse at 60% 20%, rgba(239,68,68,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(124,58,237,0.06) 0%, transparent 60%)' }} />
      <motion.div animate={{ scale:[1,1.12,1] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:22, repeat:Infinity, ease:'easeInOut', delay:4 }}
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="text-center max-w-lg relative z-10">

        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <FiActivity className="text-white" size={18} />
          </div>
          <span className="text-lg font-extrabold text-slate-800 tracking-tight">
            HealthForecast <span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* Shield illustration */}
        <motion.div
          initial={{ scale:0, rotate:-10 }} animate={{ scale:1, rotate:0 }}
          transition={{ type:'spring', stiffness:180, damping:14, delay:0.1 }}
          className="relative inline-flex mb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl flex items-center justify-center border border-red-200/60 shadow-lg">
            <FiShield className="text-red-500" size={52} />
          </div>
          {/* Pulse rings */}
          <motion.div animate={{ scale:[1,1.4,1], opacity:[0.4,0,0.4] }} transition={{ duration:2.5, repeat:Infinity }}
            className="absolute inset-0 rounded-3xl border-2 border-red-400/40" />
          <motion.div animate={{ scale:[1,1.6,1], opacity:[0.2,0,0.2] }} transition={{ duration:2.5, repeat:Infinity, delay:0.4 }}
            className="absolute inset-0 rounded-3xl border border-red-400/20" />
        </motion.div>

        {/* 403 badge */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
          <span className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Error 403 — Access Denied
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          You don't have permission
        </motion.h1>

        <motion.p initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="text-slate-500 text-base leading-relaxed mb-8 max-w-sm mx-auto">
          This page is restricted to authorized roles only. Please contact your system administrator if you believe this is an error.
        </motion.p>

        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.97 }}
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center justify-center gap-2 py-3 px-6">
            <FiArrowLeft size={16} /> Go Back
          </motion.button>
          <motion.div whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.97 }}>
            <Link
              to={user ? (ROLE_REDIRECTS[user.role] || '/') : '/login'}
              className="btn-primary flex items-center justify-center gap-2 py-3 px-6">
              <FiHome size={16} />
              {user ? 'Go to Dashboard' : 'Sign In'}
            </Link>
          </motion.div>
        </motion.div>

        {user && (
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
            className="text-xs text-slate-400 mt-6">
            Signed in as <span className="font-semibold text-slate-600">{user.full_name}</span>
            {' '}·{' '}
            <span className="capitalize">{user.role?.replace('_', ' ')}</span>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
