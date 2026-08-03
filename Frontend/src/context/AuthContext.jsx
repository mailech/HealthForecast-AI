import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback((tokenValue, userData) => {
    // Normalise the user object — ensure id and role are always top-level
    const normalised = {
      ...userData,
      id: userData._id || userData.id || '',
      email: userData.email || '',
      role: userData.role || '',
      full_name: userData.full_name || '',
      hospital: userData.hospital || '',
    };
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(normalised));
    setToken(tokenValue);
    setUser(normalised);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const role = user?.role || '';
  const isAdmin = role === 'System Administrator';

  return (
    <AuthContext.Provider value={{ user, token, role, isAdmin, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
