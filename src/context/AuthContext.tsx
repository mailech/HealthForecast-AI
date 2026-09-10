import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Patient, SignupFormData } from '../types';
import { authService, DEFAULT_DEMO_USERS } from '../services/authService';

export type AuthScreenType = 'login' | 'signup' | 'forgot-password' | 'reset-password' | null;

interface AuthContextType {
  currentUser: User;
  role: UserRole;
  isLoggedIn: boolean;
  token: string | null;
  authScreen: AuthScreenType;
  setAuthScreen: (screen: AuthScreenType) => void;
  loginWithCredentials: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  loginWithDemo: (role: UserRole, rememberMe?: boolean) => Promise<User>;
  signupUser: (data: SignupFormData) => Promise<User>;
  requestReset: (email: string) => Promise<{ resetToken: string; expiresAt: string }>;
  resetPassword: (email: string, token: string, newPass: string) => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  logout: () => void;
  canAccessModule: (moduleId: string) => boolean;
  canAccessPatient: (patient: Patient) => boolean;
  canModifyMedicalRecords: (patient?: Patient) => boolean;
  canManageUsers: () => boolean;
  canManageAIModels: () => boolean;
  canExportResearchData: () => boolean;
  canExportHospitalAnalytics: () => boolean;
  isAnonymizedView: () => boolean;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check persisted session on load
  const initialSession = authService.getCurrentSession();
  const [currentUser, setCurrentUser] = useState<User>(
    initialSession ? initialSession.user : DEFAULT_DEMO_USERS[0]
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(initialSession));
  const [token, setToken] = useState<string | null>(initialSession ? initialSession.token : null);
  const [authScreen, setAuthScreen] = useState<AuthScreenType>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Sync session state on load
  useEffect(() => {
    const existing = authService.getCurrentSession();
    if (existing) {
      setCurrentUser(existing.user);
      setToken(existing.token);
      setIsLoggedIn(true);
    }
  }, []);

  const loginWithCredentials = async (email: string, password: string, rememberMe = false): Promise<User> => {
    const session = await authService.login(email, password, rememberMe);
    setCurrentUser(session.user);
    setToken(session.token);
    setIsLoggedIn(true);
    setAuthScreen(null);
    return session.user;
  };

  const loginWithDemo = async (roleToLogin: UserRole, rememberMe = false): Promise<User> => {
    const session = await authService.demoLogin(roleToLogin, rememberMe);
    setCurrentUser(session.user);
    setToken(session.token);
    setIsLoggedIn(true);
    setAuthScreen(null);
    return session.user;
  };

  const signupUser = async (data: SignupFormData): Promise<User> => {
    const result = await authService.signup(data);
    return result.user;
  };

  const requestReset = async (email: string) => {
    return authService.requestPasswordReset(email);
  };

  const resetPassword = async (email: string, resetToken: string, newPass: string) => {
    await authService.resetPassword(email, resetToken, newPass);
  };

  const switchRole = (newRole: UserRole) => {
    const matched = DEFAULT_DEMO_USERS.find((u) => u.role === newRole) || DEFAULT_DEMO_USERS[0];
    const { passwordHash: _, ...safeUser } = matched;
    setCurrentUser(safeUser);
    const session = authService.createSessionForUser(safeUser, true);
    setToken(session.token);
    if (!isLoggedIn) {
      setIsLoggedIn(true);
    }
  };

  const logout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setToken(null);
    setAuthScreen('login');
  };

  // Module level authorization check (Page 6 Matrix)
  const canAccessModule = (moduleId: string): boolean => {
    if (!isLoggedIn) return false;
    return authService.canAccessModule(currentUser.role, moduleId);
  };

  // RBAC rules strictly matching PDF Matrix
  const canAccessPatient = (patient: Patient): boolean => {
    if (currentUser.role === 'DOCTOR') {
      return patient.assignedDoctorId === currentUser.id;
    }
    // Hospital Admin, Healthcare Researcher, System Admin can view all records (researcher views anonymized)
    return true;
  };

  const canModifyMedicalRecords = (patient?: Patient): boolean => {
    if (currentUser.role === 'DOCTOR') {
      return !patient || patient.assignedDoctorId === currentUser.id;
    }
    if (currentUser.role === 'SYSTEM_ADMIN') {
      return true;
    }
    // Hospital Admin and Researcher CANNOT modify patient medical records
    return false;
  };

  const canManageUsers = (): boolean => {
    return currentUser.role === 'SYSTEM_ADMIN';
  };

  const canManageAIModels = (): boolean => {
    return currentUser.role === 'SYSTEM_ADMIN';
  };

  const canExportResearchData = (): boolean => {
    return currentUser.role === 'HEALTHCARE_RESEARCHER' || currentUser.role === 'SYSTEM_ADMIN';
  };

  const canExportHospitalAnalytics = (): boolean => {
    return currentUser.role === 'HOSPITAL_ADMIN' || currentUser.role === 'SYSTEM_ADMIN';
  };

  const isAnonymizedView = (): boolean => {
    return currentUser.role === 'HEALTHCARE_RESEARCHER';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        isLoggedIn,
        token,
        authScreen,
        setAuthScreen,
        loginWithCredentials,
        loginWithDemo,
        signupUser,
        requestReset,
        resetPassword,
        switchRole,
        logout,
        canAccessModule,
        canAccessPatient,
        canModifyMedicalRecords,
        canManageUsers,
        canManageAIModels,
        canExportResearchData,
        canExportHospitalAnalytics,
        isAnonymizedView,
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

