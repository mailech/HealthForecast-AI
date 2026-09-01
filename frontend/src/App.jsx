import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientDetails from './pages/PatientDetails';
import DoctorReports from './pages/DoctorReports';
import FollowUpPlanning from './pages/FollowUpPlanning';
import AdminReports from './pages/AdminReports';
import StaffOverview from './pages/StaffOverview';
import ResearcherDashboard from './pages/ResearcherDashboard';
import SystemAdminDashboard from './pages/SystemAdminDashboard';

// Styles
import './styles/index.css';

// Root context landing router redirector
const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />; // goes to role selection landing page
  }

  switch (user.role) {
    case 'doctor':
      return <Navigate to="/doctor-dashboard" replace />;
    case 'hospital_admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'researcher':
      return <Navigate to="/researcher-dashboard" replace />;
    case 'system_admin':
      return <Navigate to="/sysadmin-dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Landing Selection portal starts first */}
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Dashboard Frames */}
          <Route path="/" element={<DashboardLayout />}>
            <Route path="home" element={<HomeRedirect />} />

            {/* Doctor specific pages */}
            <Route 
              path="doctor-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="follow-up-planning" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <FollowUpPlanning />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="doctor-reports" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorReports />
                </ProtectedRoute>
              } 
            />
            {/* STRICT RBAC: Only Doctor and System Admin can access individual medical details */}
            <Route 
              path="patients/:id" 
              element={
                <ProtectedRoute allowedRoles={['doctor', 'system_admin']}>
                  <PatientDetails />
                </ProtectedRoute>
              } 
            />

            {/* Hospital Administrator specific pages */}
            <Route 
              path="admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['hospital_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="staff-overview" 
              element={
                <ProtectedRoute allowedRoles={['hospital_admin']}>
                  <StaffOverview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin-reports" 
              element={
                <ProtectedRoute allowedRoles={['hospital_admin']}>
                  <AdminReports />
                </ProtectedRoute>
              } 
            />

            {/* Researcher specific pages */}
            <Route 
              path="researcher-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <ResearcherDashboard />
                </ProtectedRoute>
              } 
            />

            {/* System Admin specific pages */}
            <Route 
              path="sysadmin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="sysadmin-dashboard/audit-logs" 
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="sysadmin-dashboard/model-control" 
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '12px',
              fontFamily: 'var(--font-family)',
              fontSize: '0.9rem'
            }
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
