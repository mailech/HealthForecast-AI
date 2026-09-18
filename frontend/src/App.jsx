import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider, usePatients } from './context/PatientContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Modal } from './components/Modal';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientManagementPage } from './pages/PatientManagementPage';
import { AIRiskPredictionPage } from './pages/AIRiskPredictionPage';
import { TreatmentEffectivenessPage } from './pages/TreatmentEffectivenessPage';
import { HealthcareAnalyticsPage } from './pages/HealthcareAnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

import { SystemAdminDashboard } from './pages/SystemAdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'System Administrator') {
    return <SystemAdminDashboard />;
  }
  return <DashboardPage />;
};

const GlobalSearch = ({ isOpen, onClose }) => {
  const { patients } = usePatients();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = query.trim() ? patients.filter(p => 
    (p.patient_code && p.patient_code.toLowerCase().includes(query.toLowerCase())) || 
    (p.first_name && p.first_name.toLowerCase().includes(query.toLowerCase())) || 
    (p.last_name && p.last_name.toLowerCase().includes(query.toLowerCase())) ||
    (p.primary_diagnosis && p.primary_diagnosis.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 5) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Patient Search">
      <div className="space-y-4">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type patient code (e.g., HF-8041), name, or diagnosis..."
          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
        {query.trim() !== '' && (
          <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(p => (
              <button 
                key={p.id}
                onClick={() => {
                  onClose();
                  setQuery('');
                  navigate('/patients');
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{p.patient_code} - {p.first_name} {p.last_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.primary_diagnosis}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                  p.risk_level === 'High' ? 'bg-red-50 text-red-600' :
                  p.risk_level === 'Medium' ? 'bg-orange-50 text-orange-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {p.risk_level} Risk
                </div>
              </button>
            )) : (
              <p className="text-center text-sm text-slate-500 py-4">No patients found.</p>
            )}
          </div>
        )}
        <p className="text-[11px] text-slate-500 text-center">Press ESC to close</p>
      </div>
    </Modal>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const isStandalonePage = location.pathname === '/' || location.pathname === '/login';
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  if (isStandalonePage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 min-w-0 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute allowedRoles={['Doctor', 'Hospital Administrator']}><PatientManagementPage /></ProtectedRoute>} />
            <Route path="/predict" element={<ProtectedRoute allowedRoles={['Doctor', 'Healthcare Researcher']}><AIRiskPredictionPage /></ProtectedRoute>} />
            <Route path="/treatment" element={<ProtectedRoute allowedRoles={['Doctor', 'Hospital Administrator']}><TreatmentEffectivenessPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={['Doctor', 'Hospital Administrator']}><HealthcareAnalyticsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['Doctor', 'Hospital Administrator', 'Healthcare Researcher']}><ReportsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      <Footer />

      {/* Global Quick Search Modal */}
      {user?.role !== 'Healthcare Researcher' && (
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </PatientProvider>
    </AuthProvider>
  );
}
