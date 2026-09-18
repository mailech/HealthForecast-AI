import React, { createContext, useContext, useState, useEffect } from 'react';
import { healthApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('healthforecast_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('healthforecast_token');
  });

  const login = async (email, password) => {
    const res = await healthApi.login({ email, password });
    const userData = res.user;
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

  const updateProfile = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('healthforecast_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
