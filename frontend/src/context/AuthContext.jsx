import React, { createContext, useContext, useState, useEffect } from 'react';
import { healthApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('healthforecast_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      full_name: "Dr. Sarah Jenkins",
      email: "doctor@metrohealth.org",
      role: "Doctor",
      hospital_name: "MetroHealth General Hospital"
    };
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (email, password, role = "Doctor") => {
    const res = await healthApi.login({ email, password });
    const userData = { ...res.user, role };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('healthforecast_token', res.access_token);
    localStorage.setItem('healthforecast_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('healthforecast_token');
    localStorage.removeItem('healthforecast_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
