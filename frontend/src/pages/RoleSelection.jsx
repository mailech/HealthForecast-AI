import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserMd, FaHospital, FaHeartbeat, FaDatabase, FaUsersCog } from 'react-icons/fa';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="role-selection-container">
      <motion.div 
        className="role-selection-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FaHeartbeat className="role-selection-logo" />
        <h1 className="role-selection-title">HealthForecast AI</h1>
        <p className="role-selection-subtitle">
          Select your department to enter the clinical risk analytics and hospital oversight network
        </p>
      </motion.div>

      <div className="role-cards-grid" style={{ maxWidth: '1000px' }}>
        {/* Doctor */}
        <motion.div 
          className="role-card"
          onClick={() => handleRoleSelect('doctor')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="role-icon-wrapper">
            <FaUserMd />
          </div>
          <h2 className="role-name">Clinical Specialist</h2>
          <p className="role-description">
            Access assigned patient files, run AI readmission assessments, plan discharge actions, and review clinical outcome metrics.
          </p>
        </motion.div>

        {/* Hospital Admin */}
        <motion.div 
          className="role-card"
          onClick={() => handleRoleSelect('hospital_admin')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="role-icon-wrapper">
            <FaHospital />
          </div>
          <h2 className="role-name">Hospital Administrator</h2>
          <p className="role-description">
            Evaluate department performance metrics, monitor staff workloads, review general occupancy, and compile operational summaries.
          </p>
        </motion.div>

        {/* Researcher */}
        <motion.div 
          className="role-card"
          onClick={() => handleRoleSelect('researcher')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="role-icon-wrapper">
            <FaDatabase />
          </div>
          <h2 className="role-name">Healthcare Researcher</h2>
          <p className="role-description">
            Access anonymized patient datasets, study population health metrics, review readmission trends, and export research files.
          </p>
        </motion.div>

        {/* System Admin */}
        <motion.div 
          className="role-card"
          onClick={() => handleRoleSelect('system_admin')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="role-icon-wrapper">
            <FaUsersCog />
          </div>
          <h2 className="role-name">System Administrator</h2>
          <p className="role-description">
            Manage clinician accounts, inspect system audit logs, configure hyperparameters, and trigger AI model retraining cycles.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;
