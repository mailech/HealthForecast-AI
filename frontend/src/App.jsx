import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OtpVerify from './pages/OtpVerify';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PatientRiskAnalyzer from './pages/PatientRiskAnalyzer';
import HospitalAnalytics from './pages/HospitalAnalytics';
import ClinicalRecommendations from './pages/ClinicalRecommendations';
import PatientManagement from './pages/PatientManagement';
import Reports from './pages/Reports';
import Appointments from './pages/Appointments';

import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ResearcherDashboard from './pages/dashboards/ResearcherDashboard';
import SystemAdminDashboard from './pages/dashboards/SystemAdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected — Doctor */}
          <Route path="/dashboard/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          {/* Protected — Hospital Admin */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['hospital_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Protected — Researcher */}
          <Route path="/dashboard/researcher" element={
            <ProtectedRoute allowedRoles={['researcher']}>
              <ResearcherDashboard />
            </ProtectedRoute>
          } />

          {/* Protected — System Admin */}
          <Route path="/dashboard/sysadmin" element={
            <ProtectedRoute allowedRoles={['system_admin']}>
              <SystemAdminDashboard />
            </ProtectedRoute>
          } />

          {/* Protected — Shared */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/risk-analyzer" element={<ProtectedRoute allowedRoles={['doctor']}><PatientRiskAnalyzer /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><HospitalAnalytics /></ProtectedRoute>} />
          <Route path="/clinical-insights" element={<ProtectedRoute allowedRoles={['doctor']}><ClinicalRecommendations /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute allowedRoles={['doctor', 'hospital_admin', 'system_admin']}><PatientManagement /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute allowedRoles={['doctor', 'hospital_admin', 'system_admin']}><Appointments /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
