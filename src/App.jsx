import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AccessMatrixModal } from './components/AccessMatrixModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PatientDetailModal } from './components/PatientDetailModal';

// Views
import { DashboardView } from './views/DashboardView';
import { PatientManagementView } from './views/PatientManagementView';
import { RiskPredictionView } from './views/RiskPredictionView';
import { TreatmentEffectivenessView } from './views/TreatmentEffectivenessView';
import { ClinicalDecisionSupportView } from './views/ClinicalDecisionSupportView';
import { HealthcareAnalyticsView } from './views/HealthcareAnalyticsView';
import { AIModelManagementView } from './views/AIModelManagementView';
import { UserManagementView } from './views/UserManagementView';

const MainContent = () => {
  const { activeTab } = useAuth();

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'patient-records':
        return <PatientManagementView />;
      case 'risk-prediction':
        return <RiskPredictionView />;
      case 'treatment-effectiveness':
        return <TreatmentEffectivenessView />;
      case 'clinical-decision':
        return <ClinicalDecisionSupportView />;
      case 'healthcare-analytics':
        return <HealthcareAnalyticsView />;
      case 'ai-model':
        return <AIModelManagementView />;
      case 'user-management':
        return <UserManagementView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-6">
        {renderView()}
      </div>
    </main>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <MainContent />
        </div>

        {/* Global Modals & Drawers */}
        <AccessMatrixModal />
        <NotificationDrawer />
        <PatientDetailModal />
      </div>
    </AuthProvider>
  );
}
