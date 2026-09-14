import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Module-based Page Imports
import { LoginPage } from './pages/auth/LoginPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';

import { DoctorDashboard } from './pages/dashboard/DoctorDashboard';
import { RiskIntelligencePage } from './pages/analytics/RiskIntelligencePage';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { HospitalPerformancePage } from './pages/analytics/HospitalPerformancePage';
import { ResearcherDashboard } from './pages/dashboard/ResearcherDashboard';
import { PopulationTrendsPage } from './pages/analytics/PopulationTrendsPage';
import { SysAdminDashboard } from './pages/dashboard/SysAdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';

import { PatientsListPage } from './pages/patients/PatientsListPage';
import { PatientDetailPage } from './pages/patients/PatientDetailPage';

const roleDashboards = {
  doctor: '/dashboard/doctor',
  hospital_admin: '/dashboard/admin',
  researcher: '/dashboard/researcher',
  system_admin: '/dashboard/sysadmin',
};

// Root route component that redirects authenticated users to their dashboard, or to /login
function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>HealthForecast AI</div>
          <div style={{ fontSize: '0.875rem' }}>Loading application...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleDashboards[user.role] || '/dashboard/doctor'} replace />;
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root Route redirects directly to role dashboard if logged in, else to /login */}
          <Route path="/" element={<RootRoute />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Role-Protected Dashboard Routes */}
          {/* Doctor Module */}
          <Route element={<ProtectedRoute allowedRoles={['doctor', 'system_admin']} />}>
            <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            <Route path="/analytics/risk" element={<RiskIntelligencePage />} />
          </Route>

          {/* Hospital Admin Module */}
          <Route element={<ProtectedRoute allowedRoles={['hospital_admin', 'system_admin']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/analytics/performance" element={<HospitalPerformancePage />} />
          </Route>

          {/* Researcher Module */}
          <Route element={<ProtectedRoute allowedRoles={['researcher', 'system_admin']} />}>
            <Route path="/dashboard/researcher" element={<ResearcherDashboard />} />
            <Route path="/analytics/trends" element={<PopulationTrendsPage />} />
          </Route>

          {/* System Admin Module */}
          <Route element={<ProtectedRoute allowedRoles={['system_admin']} />}>
            <Route path="/dashboard/sysadmin" element={<SysAdminDashboard />} />
            <Route path="/users" element={<UserManagementPage />} />
          </Route>

          {/* Patient Directory & Detail Routes */}
          <Route element={<ProtectedRoute allowedRoles={['doctor', 'hospital_admin', 'researcher', 'system_admin']} />}>
            <Route path="/patients" element={<PatientsListPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['doctor', 'hospital_admin', 'system_admin']} />}>
            <Route path="/patients/:id" element={<PatientDetailPage />} />
          </Route>

          {/* Catch-all redirect to Root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
