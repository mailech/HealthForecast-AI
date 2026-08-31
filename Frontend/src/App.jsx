import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import EditPatient from './pages/EditPatient';
import Prediction from './pages/Prediction';
import Treatments from './pages/Treatments';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import { useAuth } from './context/AuthContext';

const DRAWER_WIDTH = 220;

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7FB' }}>
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
          <Box className="animate-fadeIn">{children}</Box>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

      {/* Dashboard: All roles */}
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

      {/* Patients List: All roles */}
      <Route path="/patients" element={<ProtectedRoute><Layout><Patients /></Layout></ProtectedRoute>} />

      {/* Add Patient: Doctor, Hospital Admin, System Admin (Researcher blocked) */}
      <Route path="/patients/add" element={
        <RoleRoute allowedRoles={['Doctor', 'Hospital Administrator', 'System Administrator']}>
          <Layout><AddPatient /></Layout>
        </RoleRoute>
      } />

      {/* Edit Patient: Doctor, Hospital Admin, System Admin (Researcher blocked) */}
      <Route path="/patients/edit/:patient_id" element={
        <RoleRoute allowedRoles={['Doctor', 'Hospital Administrator', 'System Administrator']}>
          <Layout><EditPatient /></Layout>
        </RoleRoute>
      } />

      {/* Prediction: Doctor, Healthcare Researcher, System Admin (Hospital Admin blocked) */}
      <Route path="/prediction" element={
        <RoleRoute allowedRoles={['Doctor', 'Healthcare Researcher', 'System Administrator']}>
          <Layout><Prediction /></Layout>
        </RoleRoute>
      } />

      {/* Treatments: Doctor, Hospital Admin, System Admin (Researcher blocked) */}
      <Route path="/treatments" element={
        <RoleRoute allowedRoles={['Doctor', 'Hospital Administrator', 'System Administrator']}>
          <Layout><Treatments /></Layout>
        </RoleRoute>
      } />

      {/* Reports: All roles */}
      <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />

      {/* User Management: System Admin ONLY */}
      <Route path="/users" element={
        <RoleRoute allowedRoles={['System Administrator']}>
          <Layout><Users /></Layout>
        </RoleRoute>
      } />

      {/* System Settings: System Admin ONLY */}
      <Route path="/settings" element={
        <RoleRoute allowedRoles={['System Administrator']}>
          <Layout><Settings /></Layout>
        </RoleRoute>
      } />

      {/* System Logs: System Admin ONLY */}
      <Route path="/logs" element={
        <RoleRoute allowedRoles={['System Administrator']}>
          <Layout><Logs /></Layout>
        </RoleRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
