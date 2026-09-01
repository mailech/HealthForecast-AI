import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-center" style={{ 
      minHeight: '100vh', 
      flexDirection: 'column', 
      background: 'var(--bg-app)', 
      padding: '2rem', 
      textAlign: 'center' 
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="card"
        style={{ maxWidth: '500px', width: '100%', padding: '3rem 2rem' }}
      >
        <FaShieldAlt style={{ fontSize: '4.5rem', color: 'var(--danger)', marginBottom: '1.5rem' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Access Forbidden (403)
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
          You do not have the credentials or role permissions required to inspect this directory or perform clinical actions on this route.
        </p>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', height: '44px' }}
          onClick={() => navigate('/')}
        >
          <FaArrowLeft />
          <span>Return to Dashboard</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
