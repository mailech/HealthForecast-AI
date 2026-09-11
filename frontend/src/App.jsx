import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/guard/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/auth/Login';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientList } from './pages/doctor/PatientList';
import { EncounterDetail } from './pages/doctor/EncounterDetail';
import { PredictionPage } from './pages/doctor/PredictionPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { HospitalPerformanceDashboard } from './pages/admin/HospitalPerformanceDashboard';
import { ResearcherDashboard } from './pages/researcher/ResearcherDashboard';
import { SysAdminDashboard } from './pages/sysadmin/SysAdminDashboard';
import { DatasetIngestionPage } from './pages/sysadmin/DatasetIngestionPage';
import { AuditLogsPage } from './pages/sysadmin/AuditLogsPage';


const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const DefaultRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role?.name) {
    case 'Doctor':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'Hospital Administrator':
      return <Navigate to="/admin/dashboard" replace />;
    case 'Healthcare Researcher':
      return <Navigate to="/researcher/dashboard" replace />;
    case 'System Administrator':
      return <Navigate to="/sysadmin/users" replace />;
    default:
      return <Navigate to="/doctor/dashboard" replace />;
  }
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Main Layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DefaultRedirect />} />

            {/* Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={["Doctor"]} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/encounters/:id" element={<EncounterDetail />} />
            </Route>

            {/* Shared Patient, Prediction & Treatment Analytics Routes */}
            <Route element={<ProtectedRoute allowedRoles={["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]} />}>
              <Route path="/doctor/patients" element={<PatientList />} />
              <Route path="/doctor/predict" element={<PredictionPage />} />
              <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
              <Route path="/admin/dashboard" element={<HospitalPerformanceDashboard />} />
              <Route path="/admin/hospital-performance" element={<HospitalPerformanceDashboard />} />
              <Route path="/admin/analytics" element={<HospitalPerformanceDashboard />} />
            </Route>

            {/* Researcher Routes */}
            <Route element={<ProtectedRoute allowedRoles={["Healthcare Researcher"]} />}>
              <Route path="/researcher/cohorts" element={<ResearcherDashboard />} />
            </Route>

            {/* SysAdmin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["System Administrator"]} />}>
              <Route path="/sysadmin/users" element={<SysAdminDashboard />} />
              <Route path="/sysadmin/dataset" element={<DatasetIngestionPage />} />
              <Route path="/sysadmin/audit" element={<AuditLogsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
