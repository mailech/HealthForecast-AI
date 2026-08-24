import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  // =====================================================
  // RESTORE USER SESSION
  // =====================================================

  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem('hf_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();

        setUser(currentUser);

        localStorage.setItem(
          'hf_user',
          JSON.stringify(currentUser)
        );
      } catch (error) {
        console.error(
          'Session restore failed:',
          error
        );

        localStorage.removeItem('hf_token');
        localStorage.removeItem('hf_user');

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  // =====================================================
  // DARK MODE
  // =====================================================

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem(
      'darkMode',
      String(darkMode)
    );
  }, [darkMode]);

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (email, password) => {
    try {
      // Call FastAPI /auth/login
      const response = await authService.login(
        email,
        password
      );

      const token = response?.access_token;

      if (!token) {
        throw new Error(
          'Login successful but access token was not received.'
        );
      }

      // Save JWT token
      localStorage.setItem(
        'hf_token',
        token
      );

      // Get logged-in user details
      const currentUser =
        await authService.getMe();

      setUser(currentUser);

      localStorage.setItem(
        'hf_user',
        JSON.stringify(currentUser)
      );

      return currentUser;

    } catch (error) {
      // If login fails, don't keep invalid token
      localStorage.removeItem('hf_token');
      localStorage.removeItem('hf_user');

      setUser(null);

      // Backend error message
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Login failed. Please check your email and password.';

      throw new Error(
        Array.isArray(message)
          ? message
              .map((item) => item.msg)
              .join(', ')
          : message
      );
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const register = async (data) => {
    try {
      /*
        Backend expects:

        {
          full_name,
          email,
          phone,
          password,
          role
        }
      */

      const newUser =
        await authService.register(data);

      return newUser;

    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Registration failed. Please try again.';

      throw new Error(
        Array.isArray(message)
          ? message
              .map((item) => item.msg)
              .join(', ')
          : message
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    setUser(null);

    localStorage.removeItem('hf_token');
    localStorage.removeItem('hf_user');
  };

  // =====================================================
  // UPDATE USER
  // =====================================================

  const updateUser = (updates) => {
    setUser((previousUser) => {
      if (!previousUser) {
        return previousUser;
      }

      const updatedUser = {
        ...previousUser,
        ...updates,
      };

      localStorage.setItem(
        'hf_user',
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  // =====================================================
  // CONTEXT
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        darkMode,
        setDarkMode,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =======================================================
// useAuth Hook
// =======================================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
};