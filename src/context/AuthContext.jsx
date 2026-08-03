import React, { createContext, useContext, useState } from 'react';
import { ROLES, ACCESS_MATRIX } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default to Doctor role for initial state
  const [currentRoleKey, setCurrentRoleKey] = useState('DOCTOR');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accessMatrixOpen, setAccessMatrixOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const currentRole = ROLES[currentRoleKey];

  // Helper to switch active user role
  const switchRole = (roleKey) => {
    if (ROLES[roleKey]) {
      setCurrentRoleKey(roleKey);
    }
  };

  // Helper to check feature permission based on active role
  const canAccessFeature = (featureName) => {
    const item = ACCESS_MATRIX.find(m => m.feature.toLowerCase() === featureName.toLowerCase());
    if (!item) return true;

    const roleMap = {
      DOCTOR: item.doctor,
      ADMIN: item.admin,
      RESEARCHER: item.researcher,
      SYSADMIN: item.sysadmin
    };

    const perm = roleMap[currentRoleKey];
    return perm !== 'No';
  };

  const getFeatureAccessLevel = (featureName) => {
    const item = ACCESS_MATRIX.find(m => m.feature.toLowerCase() === featureName.toLowerCase());
    if (!item) return "Full Access";
    return item[currentRoleKey.toLowerCase()] || "Full Access";
  };

  return (
    <AuthContext.Provider value={{
      currentRoleKey,
      currentRole,
      switchRole,
      activeTab,
      setActiveTab,
      canAccessFeature,
      getFeatureAccessLevel,
      notificationsOpen,
      setNotificationsOpen,
      accessMatrixOpen,
      setAccessMatrixOpen,
      selectedPatient,
      setSelectedPatient
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
