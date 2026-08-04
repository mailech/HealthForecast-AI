import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
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

const AppLayout = () => {
  const location = useLocation();
  const isStandalonePage = location.pathname === '/' || location.pathname === '/login';
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (isStandalonePage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col justify-between">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 min-w-0 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientManagementPage />} />
            <Route path="/predict" element={<AIRiskPredictionPage />} />
            <Route path="/treatment" element={<TreatmentEffectivenessPage />} />
            <Route path="/analytics" element={<HealthcareAnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      <Footer />

      {/* Global Quick Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Quick Patient Search"
      >
        <div className="space-y-4">
          <input
            type="text"
            autoFocus
            placeholder="Type patient code (e.g., HF-8041) or diagnosis..."
            className="w-full p-3 rounded-xl bg-navy-900 border border-slate-700 text-white text-xs"
          />
          <p className="text-[11px] text-slate-400">Press ESC to close</p>
        </div>
      </Modal>
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
