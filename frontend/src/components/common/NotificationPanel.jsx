import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiAlertCircle, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { NOTIFICATIONS } from '../../data/dummyData';

const icons = {
  critical: <FiAlertCircle className="text-red-500" size={16} />,
  high:     <FiAlertCircle className="text-orange-500" size={16} />,
  info:     <FiInfo className="text-blue-500" size={16} />,
  success:  <FiCheckCircle className="text-green-500" size={16} />,
};

export default function NotificationPanel({ open, onClose }) {
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <FiBell size={16} className="text-blue-600" />
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
              {unread > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{unread}</span>
              )}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <FiX size={16} />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
            {NOTIFICATIONS.map(n => (
              <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                <div className="flex items-start gap-2">
                  {icons[n.type] || icons.info}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center">Mark all as read</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
