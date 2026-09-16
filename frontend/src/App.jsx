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
import PatientOutcomeAnalyticsPage from './pages/admin/PatientOutcomeAnalyticsPage';
import ReadmissionStatisticsPage from './pages/admin/ReadmissionStatisticsPage';
import HealthcarePerformanceReportsPage from './pages/admin/HealthcarePerformanceReportsPage';
import OperationalAnalyticsPage from './pages/admin/OperationalAnalyticsPage';
import DepartmentPerformancePage from './pages/admin/DepartmentPerformancePage';
import AdminPopulationHealthPage from './pages/admin/AdminPopulationHealthPage';
import HospitalReportsPage from './pages/admin/HospitalReportsPage';
import { ResearcherDashboard } from './pages/researcher/ResearcherDashboard';
import { SysAdminDashboard } from './pages/sysadmin/SysAdminDashboard';
import { DatasetIngestionPage } from './pages/sysadmin/DatasetIngestionPage';
import { AuditLogsPage } from './pages/sysadmin/AuditLogsPage';

import { TreatmentAnalyticsDashboard } from './pages/researcher/TreatmentAnalyticsDashboard';
import AnonymizedPatientDataPage from './pages/researcher/AnonymizedPatientDataPage';
import AggregatedAnalyticsPage from './pages/researcher/AggregatedAnalyticsPage';
import ReadmissionTrendsPage from './pages/researcher/ReadmissionTrendsPage';
import PopulationHealthPage from './pages/researcher/PopulationHealthPage';
import ResearchDatasetPage from './pages/researcher/ResearchDatasetPage';
import AnalyticalReportsPage from './pages/researcher/AnalyticalReportsPage';

import { AIModelManagementPage } from './pages/sysadmin/AIModelManagementPage';

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
              <Route path="/doctor/predict" element={<PredictionPage />} />
              <Route path="/doctor/patients" element={<PatientList />} />
              <Route path="/doctor/encounters/:id" element={<EncounterDetail />} />
              <Route path="/doctor/treatment-effectiveness" element={<TreatmentAnalyticsDashboard />} />
              <Route path="/doctor/patient-outcomes" element={<PatientOutcomeAnalyticsPage />} />
              <Route path="/doctor/healthcare-analytics" element={<HospitalPerformanceDashboard />} />
            </Route>

            {/* Hospital Administrator Routes */}
            <Route element={<ProtectedRoute allowedRoles={["Hospital Administrator"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/patient-outcomes" element={<PatientOutcomeAnalyticsPage />} />
              <Route path="/admin/readmission-statistics" element={<ReadmissionStatisticsPage />} />
              <Route path="/admin/performance-reports" element={<HealthcarePerformanceReportsPage />} />
              <Route path="/admin/operations" element={<OperationalAnalyticsPage />} />
              <Route path="/admin/department-performance" element={<DepartmentPerformancePage />} />
              <Route path="/admin/treatment-effectiveness" element={<TreatmentAnalyticsDashboard />} />
              <Route path="/admin/population-health" element={<AdminPopulationHealthPage />} />
              <Route path="/admin/hospital-performance" element={<HospitalPerformanceDashboard />} />
              <Route path="/admin/reports" element={<HospitalReportsPage />} />
            </Route>

            {/* Healthcare Researcher Routes */}
            <Route element={<ProtectedRoute allowedRoles={["Healthcare Researcher"]} />}>
              <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
              <Route path="/researcher/patients" element={<AnonymizedPatientDataPage />} />
              <Route path="/researcher/analytics" element={<AggregatedAnalyticsPage />} />
              <Route path="/researcher/treatment" element={<TreatmentAnalyticsDashboard />} />
              <Route path="/researcher/readmission-trends" element={<ReadmissionTrendsPage />} />
              <Route path="/researcher/population-health" element={<PopulationHealthPage />} />
              <Route path="/researcher/research-dataset" element={<ResearchDatasetPage />} />
              <Route path="/researcher/reports" element={<AnalyticalReportsPage />} />
            </Route>

            {/* Shared Analytics Route */}
            <Route element={<ProtectedRoute allowedRoles={["Hospital Administrator", "Doctor"]} />}>
              <Route path="/admin/analytics" element={<TreatmentAnalyticsDashboard />} />
            </Route>

            {/* SysAdmin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["System Administrator"]} />}>
              <Route path="/sysadmin/users" element={<SysAdminDashboard />} />
              <Route path="/sysadmin/status" element={<SysAdminDashboard />} />
              <Route path="/sysadmin/dataset" element={<DatasetIngestionPage />} />
              <Route path="/sysadmin/audit" element={<AuditLogsPage />} />
              <Route path="/sysadmin/model" element={<AIModelManagementPage />} />
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
