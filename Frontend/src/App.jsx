import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import EditPatient from './pages/EditPatient';
import Prediction from './pages/Prediction';
import Treatments from './pages/Treatments';
import Reports from './pages/Reports';
import Users from './pages/Users';
import { useAuth } from './context/AuthContext';

const DRAWER_WIDTH = 240;

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F8FC' }}>
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
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Box
          sx={{
            flexGrow: 1,
            py: { xs: 2, sm: 2.5, md: 3 },
            px: { xs: 1.5, sm: 2.5, md: 4 },
            maxWidth: 1280,
            width: '100%',
            mx: 'auto',
          }}
        >
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
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><Layout><Patients /></Layout></ProtectedRoute>} />
      <Route path="/patients/add" element={<ProtectedRoute><Layout><AddPatient /></Layout></ProtectedRoute>} />
      <Route path="/patients/edit/:patient_id" element={<ProtectedRoute><Layout><EditPatient /></Layout></ProtectedRoute>} />
      <Route path="/prediction" element={<ProtectedRoute><Layout><Prediction /></Layout></ProtectedRoute>} />
      <Route path="/treatments" element={<ProtectedRoute><Layout><Treatments /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

