import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import ForcePasswordChangeModal from './components/ForcePasswordChangeModal';
import Login from './pages/Login';

// Dashboards
import DoctorDashboard from './pages/DoctorDashboard';
import ResearcherDashboard from './pages/ResearcherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SysAdminDashboard from './pages/SysAdminDashboard';

// Features
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import EditPatient from './pages/EditPatient';
import Prediction from './pages/Prediction';
import PredictionResult from './pages/PredictionResult';
import PredictionHistory from './pages/PredictionHistory';
import Treatments from './pages/Treatments';
import Reports from './pages/Reports';

// SysAdmin
import SysAdminMembers from './pages/SysAdminMembers';
import SysAdminAddMember from './pages/SysAdminAddMember';
import SysAdminAuditLogs from './pages/SysAdminAuditLogs';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Logs from './pages/Logs';

import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

const DRAWER_WIDTH = 230;

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: { md: `${DRAWER_WIDTH}px` },
          minWidth: 0,
        }}
      >
        <Toolbar sx={{ minHeight: '60px !important' }} />
        <Box sx={{
          flexGrow: 1,
          py: { xs: 2, sm: 2.5, md: 3 },
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: 1320,
          width: '100%',
          mx: 'auto',
        }}>
          <Box className="animate-fadeIn">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </Box>
        </Box>
        <Footer />
      </Box>

      {/* Force Password Change Modal */}
      {user?.must_change_password && (
        <ForcePasswordChangeModal open={true} />
      )}
    </Box>
  );
}

function RootRedirect() {
  const { user, getRoleDashboard } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleDashboard()} replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <RootRedirect /> : <Login />} />

      {/* Root Path: Redirects strictly based on authenticated role */}
      <Route path="/" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />

      {/* =========================================================
         DOCTOR ROUTES
         ========================================================= */}
      <Route path="/doctor/dashboard" element={
        <RoleRoute allowedRoles={['Doctor']}>
          <Layout><DoctorDashboard /></Layout>
        </RoleRoute>
      } />
      <Route path="/doctor/patients" element={
        <RoleRoute allowedRoles={['Doctor']}>
          <Layout><Patients /></Layout>
        </RoleRoute>
      } />
      <Route path="/doctor/patients/add" element={
        <RoleRoute allowedRoles={['Doctor']}>
          <Layout><AddPatient /></Layout>
        </RoleRoute>
      } />
      <Route path="/doctor/history" element={
        <RoleRoute allowedRoles={['Doctor']}>
          <Layout><Patients /></Layout>
        </RoleRoute>
      } />
      <Route path="/doctor/treatment" element={
        <RoleRoute allowedRoles={['Doctor']}>
          <Layout><Treatments /></Layout>
        </RoleRoute>
      } />
      <Route path="/doctor/prediction" element={
        <RoleRoute allowedRoles={['Doctor']}>
          <Layout><Prediction /></Layout>
        </RoleRoute>
      } />
      <Route path="/doctor/prediction/result/:id" element={
        <RoleRoute allowedRoles={['Doctor', 'Researcher', 'Admin', 'SysAdmin']}>
          <Layout><PredictionResult /></Layout>
        </RoleRoute>
      } />
      <Route path="/doctor/predictions" element={
        <RoleRoute allowedRoles={['Doctor', 'Researcher', 'Admin', 'SysAdmin']}>
          <Layout><PredictionHistory /></Layout>
        </RoleRoute>
      } />
      <Route path="/doctor/patients/:patient_id/predictions" element={
        <RoleRoute allowedRoles={['Doctor', 'Researcher', 'Admin', 'SysAdmin']}>
          <Layout><PredictionHistory /></Layout>
        </RoleRoute>
      } />
      <Route path="/doctor/reports" element={
        <RoleRoute allowedRoles={['Doctor']}>
          <Layout><Reports /></Layout>
        </RoleRoute>
      } />

      {/* =========================================================
         RESEARCHER ROUTES
         ========================================================= */}
      <Route path="/researcher/dashboard" element={
        <RoleRoute allowedRoles={['Researcher']}>
          <Layout><ResearcherDashboard /></Layout>
        </RoleRoute>
      } />
      <Route path="/researcher/patients" element={
        <RoleRoute allowedRoles={['Researcher']}>
          <Layout><Patients readOnly /></Layout>
        </RoleRoute>
      } />
      <Route path="/researcher/predictions" element={
        <RoleRoute allowedRoles={['Researcher']}>
          <Layout><PredictionHistory /></Layout>
        </RoleRoute>
      } />

      {/* =========================================================
         HOSPITAL ADMIN ROUTES
         ========================================================= */}
      <Route path="/admin/dashboard" element={
        <RoleRoute allowedRoles={['Admin']}>
          <Layout><AdminDashboard /></Layout>
        </RoleRoute>
      } />
      <Route path="/admin/patients" element={
        <RoleRoute allowedRoles={['Admin']}>
          <Layout><Patients /></Layout>
        </RoleRoute>
      } />
      <Route path="/admin/patients/add" element={
        <RoleRoute allowedRoles={['Admin']}>
          <Layout><AddPatient /></Layout>
        </RoleRoute>
      } />
      <Route path="/admin/patients/edit/:patient_id" element={
        <RoleRoute allowedRoles={['Admin', 'Doctor', 'SysAdmin']}>
          <Layout><EditPatient /></Layout>
        </RoleRoute>
      } />
      <Route path="/admin/predictions" element={
        <RoleRoute allowedRoles={['Admin']}>
          <Layout><PredictionHistory /></Layout>
        </RoleRoute>
      } />

      {/* =========================================================
         SYSADMIN ROUTES
         ========================================================= */}
      <Route path="/sysadmin/dashboard" element={
        <RoleRoute allowedRoles={['SysAdmin']}>
          <Layout><SysAdminDashboard /></Layout>
        </RoleRoute>
      } />
      <Route path="/sysadmin/members" element={
        <RoleRoute allowedRoles={['SysAdmin']}>
          <Layout><SysAdminMembers /></Layout>
        </RoleRoute>
      } />
      <Route path="/sysadmin/members/add" element={
        <RoleRoute allowedRoles={['SysAdmin']}>
          <Layout><SysAdminAddMember /></Layout>
        </RoleRoute>
      } />
      <Route path="/sysadmin/roles" element={
        <RoleRoute allowedRoles={['SysAdmin']}>
          <Layout><Users /></Layout>
        </RoleRoute>
      } />
      <Route path="/sysadmin/system-config" element={
        <RoleRoute allowedRoles={['SysAdmin']}>
          <Layout><Settings /></Layout>
        </RoleRoute>
      } />
      <Route path="/sysadmin/config" element={
        <RoleRoute allowedRoles={['SysAdmin']}>
          <Layout><Settings /></Layout>
        </RoleRoute>
      } />
      <Route path="/sysadmin/logs" element={
        <RoleRoute allowedRoles={['SysAdmin']}>
          <Layout><SysAdminAuditLogs /></Layout>
        </RoleRoute>
      } />

      {/* Legacy Route Fallbacks */}
      <Route path="/patients" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />
      <Route path="/patients/add" element={
        <RoleRoute allowedRoles={['Doctor', 'Admin', 'SysAdmin']}>
          <Layout><AddPatient /></Layout>
        </RoleRoute>
      } />
      <Route path="/patients/edit/:patient_id" element={
        <RoleRoute allowedRoles={['Doctor', 'Admin', 'SysAdmin']}>
          <Layout><EditPatient /></Layout>
        </RoleRoute>
      } />
      <Route path="/prediction" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />
      <Route path="/treatments" element={<RoleRoute allowedRoles={['Doctor', 'SysAdmin']}><Layout><Treatments /></Layout></RoleRoute>} />
      <Route path="/reports" element={<RoleRoute allowedRoles={['Doctor', 'SysAdmin']}><Layout><Reports /></Layout></RoleRoute>} />
      <Route path="/users" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
