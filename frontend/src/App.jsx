import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import RiskPrediction from './pages/RiskPrediction';
import Forecasting from './pages/Forecasting';
import ClinicalInsights from './pages/ClinicalInsights';
import ModelManagement from './pages/ModelManagement';
import TreatmentEffectiveness from './pages/TreatmentEffectiveness';
import UserManagement from './pages/UserManagement';

const ROLE_HOME = {
  doctor: '/patients',
  hospital_admin: '/',
  researcher: '/',
  system_admin: '/models',
};

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route
          path="patients"
          element={<ProtectedRoute allowedRoles={['doctor', 'researcher']}><Patients /></ProtectedRoute>}
        />
        <Route
          path="treatments"
          element={<ProtectedRoute allowedRoles={['doctor', 'researcher']}><TreatmentEffectiveness /></ProtectedRoute>}
        />
        <Route
          path="risk-prediction"
          element={<ProtectedRoute allowedRoles={['doctor', 'researcher']}><RiskPrediction /></ProtectedRoute>}
        />
        <Route
          path="forecasting"
          element={<ProtectedRoute allowedRoles={['doctor', 'researcher']}><Forecasting /></ProtectedRoute>}
        />
        <Route
          path="clinical-insights"
          element={<ProtectedRoute allowedRoles={['doctor']}><ClinicalInsights /></ProtectedRoute>}
        />
        <Route
          path="users"
          element={<ProtectedRoute allowedRoles={['hospital_admin']}><UserManagement /></ProtectedRoute>}
        />
        <Route
          path="models"
          element={<ProtectedRoute allowedRoles={['system_admin']}><ModelManagement /></ProtectedRoute>}
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}