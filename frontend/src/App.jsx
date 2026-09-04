import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public pages
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import RegisterPage from './pages/RegisterPage'
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'

// Layout + protection
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Role dashboards
import DoctorDashboard from './pages/dashboards/DoctorDashboard'
import HospitalAdminDashboard from './pages/dashboards/HospitalAdminDashboard'
import ResearcherDashboard from './pages/dashboards/ResearcherDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'

// Shared pages
import PatientList from './pages/PatientList'
import PatientDetails from './pages/PatientDetails'
import UserManagement from './pages/UserManagement'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import Dataset from './pages/Dataset'
import ModelValidation from './pages/ModelValidation'
import RiskPredictionDashboard from './pages/RiskPredictionDashboard'
import ClinicalInsights from './pages/ClinicalInsights'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />

          {/* ── Protected (inside Layout) ── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Role-specific dashboards */}
            <Route
              path="dashboard/doctor"
              element={
                <ProtectedRoute requiredRoles={['Doctor', 'System Administrator']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/hospital-admin"
              element={
                <ProtectedRoute requiredRoles={['Hospital Administrator', 'System Administrator']}>
                  <HospitalAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/researcher"
              element={
                <ProtectedRoute requiredRoles={['Healthcare Researcher', 'System Administrator']}>
                  <ResearcherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/admin"
              element={
                <ProtectedRoute requiredRoles={['System Administrator']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback /dashboard → role redirect handled by ProtectedRoute */}
            <Route path="dashboard" element={<RoleDashboardRedirect />} />

            {/* Shared protected pages */}
            <Route path="model-validation" element={<ModelValidation />} />
            <Route path="risk-prediction" element={<RiskPredictionDashboard />} />
            <Route path="clinical-insights" element={<ClinicalInsights />} />
            <Route
              path="patients"
              element={
                <ProtectedRoute requiredRoles={['Doctor', 'Hospital Administrator', 'System Administrator']}>
                  <PatientList />
                </ProtectedRoute>
              }
            />
            <Route
              path="patients/:id"
              element={
                <ProtectedRoute requiredRoles={['Doctor', 'Hospital Administrator', 'System Administrator']}>
                  <PatientDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRoles={['System Administrator']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="dataset" element={<Dataset />} />
          </Route>

          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

// Redirects /dashboard to the correct role dashboard
function RoleDashboardRedirect() {
  const { user } = useAuth()
  const role = user?.role?.name
  const map = {
    'Doctor': '/dashboard/doctor',
    'Hospital Administrator': '/dashboard/hospital-admin',
    'Healthcare Researcher': '/dashboard/researcher',
    'System Administrator': '/dashboard/admin',
  }
  return <Navigate to={map[role] || '/dashboard/doctor'} replace />
}

export default App
