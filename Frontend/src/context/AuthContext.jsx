import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback((tokenValue, userData) => {
    // Standardize role name
    let r = userData.role || '';
    const norm = r.toLowerCase().replace(/ /g, '');
    if (norm === 'doctor') r = 'Doctor';
    else if (norm === 'researcher' || norm === 'healthcareresearcher') r = 'Researcher';
    else if (norm === 'admin' || norm === 'hospitaladministrator' || norm === 'hospitaladmin') r = 'Admin';
    else if (norm === 'sysadmin' || norm === 'systemadministrator') r = 'SysAdmin';

    const normalised = {
      ...userData,
      id: userData._id || userData.id || '',
      email: userData.email || '',
      role: r,
      full_name: userData.full_name || '',
      hospital: userData.hospital || 'General Hospital',
      must_change_password: !!userData.must_change_password,
      profile_picture: userData.profile_picture || null,
    };
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(normalised));
    setToken(tokenValue);
    setUser(normalised);
  }, []);

  const updateProfile = useCallback((updatedUserData) => {
    setUser(prev => {
      const normalised = {
        ...prev,
        ...updatedUserData,
        id: updatedUserData._id || updatedUserData.id || prev?.id || '',
        email: updatedUserData.email || prev?.email || '',
        role: updatedUserData.role || prev?.role || '',
        full_name: updatedUserData.full_name !== undefined ? updatedUserData.full_name : (prev?.full_name || ''),
        hospital: updatedUserData.hospital !== undefined ? updatedUserData.hospital : (prev?.hospital || ''),
        must_change_password: updatedUserData.must_change_password !== undefined ? updatedUserData.must_change_password : (prev?.must_change_password || false),
        profile_picture: updatedUserData.profile_picture !== undefined ? updatedUserData.profile_picture : (prev?.profile_picture || null),
      };
      localStorage.setItem('user', JSON.stringify(normalised));
      return normalised;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const role = user?.role || '';
  const getRoleDashboard = useCallback(() => {
    const norm = (role || '').toLowerCase().replace(/ /g, '');
    if (norm === 'doctor') return '/doctor/dashboard';
    if (norm === 'researcher') return '/researcher/dashboard';
    if (norm === 'admin') return '/admin/dashboard';
    if (norm === 'sysadmin') return '/sysadmin/dashboard';
    return '/doctor/dashboard';
  }, [role]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role,
      login,
      logout,
      updateProfile,
      getRoleDashboard,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
