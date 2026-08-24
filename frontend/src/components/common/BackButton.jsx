import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

export default function BackButton({ to = '/' }) {
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate(to)}
      whileHover={{ scale: 1.08, x: -2 }}
      whileTap={{ scale: 0.93 }}
      className="fixed top-5 left-5 z-50 w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      title="Back to Home"
    >
      <FiArrowLeft size={18} />
    </motion.button>
  );
}
