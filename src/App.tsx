import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { authService } from './services/authService';
import { MOCK_PATIENTS } from './data/mockData';
import { Patient, UserRole } from './types';

// Layout
import { AppHeader } from './components/layout/AppHeader';
import { AppSidebar } from './components/layout/AppSidebar';

// Website view
import { WebsiteLanding } from './components/website/WebsiteLanding';

// Authentication & Profile views
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { AccessDeniedView } from './components/auth/AccessDeniedView';

// Role-tailored dashboards
import { DoctorDashboard } from './components/portal/DoctorDashboard';
import { HospitalAdminDashboard } from './components/portal/HospitalAdminDashboard';
import { ResearcherDashboard } from './components/portal/ResearcherDashboard';
import { AdminDashboard } from './components/portal/AdminDashboard';

// Clinical Portal views
import { DashboardView } from './components/portal/DashboardView';
import { PatientsView } from './components/portal/PatientsView';
import { RiskPredictionsView } from './components/portal/RiskPredictionsView';
import { ReadmissionForecastsView } from './components/portal/ReadmissionForecastsView';
import { TreatmentEffectivenessView } from './components/portal/TreatmentEffectivenessView';
import { ClinicalDecisionSupportView } from './components/portal/ClinicalDecisionSupportView';
import { HealthcareAnalyticsView } from './components/portal/HealthcareAnalyticsView';
import { ReportsView } from './components/portal/ReportsView';
import { NotificationsView } from './components/portal/NotificationsView';
import { SettingsView } from './components/portal/SettingsView';

// SysAdmin views
import { AdminUsersView } from './components/portal/AdminUsersView';
import { AdminRolesView } from './components/portal/AdminRolesView';
import { AdminDatasetsView } from './components/portal/AdminDatasetsView';
import { AdminModelsView } from './components/portal/AdminModelsView';
import { AdminAuditView } from './components/portal/AdminAuditView';

// Modals
import { PatientDetailModal } from './components/portal/PatientDetailModal';
import { AddPatientModal } from './components/portal/AddPatientModal';

function MainAppContent() {
  const {
    role,
    isLoggedIn,
    switchRole,
    authScreen,
    setAuthScreen,
    isProfileModalOpen,
    closeProfileModal,
    canAccessModule
  } = useAuth();

  // State: default to Website presentation mode as requested
  const [isWebsiteMode, setIsWebsiteMode] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [selectedPatientIdForPrediction, setSelectedPatientIdForPrediction] = useState<string | undefined>(undefined);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [prefilledEmail, setPrefilledEmail] = useState<string>('');

  // Synchronize URL hash with view and protect direct URL access
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!hash) return;

      if (hash === 'login') {
        setAuthScreen('login');
        return;
      }
      if (hash === 'signup') {
        setAuthScreen('signup');
        return;
      }
      if (hash === 'forgot-password') {
        setAuthScreen('forgot-password');
        return;
      }
      if (hash === 'website' || hash === 'overview') {
        setIsWebsiteMode(true);
        setAuthScreen(null);
        return;
      }

      // Any other hash is a portal route
      if (!isLoggedIn) {
        // Direct URL access without active authentication is protected
        setAuthScreen('login');
        window.location.hash = 'login';
        return;
      }

      // Logged in user navigating to portal route
      setIsWebsiteMode(false);
      setAuthScreen(null);
      setCurrentView(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    if (window.location.hash) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isLoggedIn, setAuthScreen]);

  // Sync hash when view changes
  useEffect(() => {
    if (authScreen) {
      window.location.hash = authScreen;
    } else if (isWebsiteMode) {
      window.location.hash = 'website';
    } else if (currentView) {
      window.location.hash = currentView;
    }
  }, [authScreen, isWebsiteMode, currentView]);

  // Handle adding patient
  const handleAddPatient = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
  };

  // Switch to risk engine with specific patient
  const handleSelectForPrediction = (patientId: string) => {
    setSelectedPatientIdForPrediction(patientId);
    setCurrentView('risk-predictions');
    setIsWebsiteMode(false);
  };

  // Open modal from notification / patient click
  const handleSelectPatientById = (patientId: string) => {
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      setSelectedPatientForDetail(found);
    }
  };

  // Launch platform with specific role
  const handleSelectRoleAndLaunch = (newRole: UserRole) => {
    switchRole(newRole);
    setIsWebsiteMode(false);
    setCurrentView(authService.getDefaultDashboardForRole(newRole));
  };

  // Render dedicated Auth screens if user requested login/signup/forgot-password
  if (authScreen === 'login') {
    return (
      <LoginPage
        initialEmail={prefilledEmail}
        onSuccessRedirect={(userRole) => {
          setAuthScreen(null);
          setIsWebsiteMode(false);
          const target = userRole || role;
          setCurrentView(authService.getDefaultDashboardForRole(target));
        }}
        onNavigateToSignup={() => setAuthScreen('signup')}
        onNavigateToForgot={() => setAuthScreen('forgot-password')}
        onReturnToWebsite={() => {
          setAuthScreen(null);
          setIsWebsiteMode(true);
        }}
      />
    );
  }

  if (authScreen === 'signup') {
    return (
      <SignupPage
        onNavigateToLogin={(email) => {
          if (email) setPrefilledEmail(email);
          setAuthScreen('login');
        }}
        onReturnToWebsite={() => {
          setAuthScreen(null);
          setIsWebsiteMode(true);
        }}
      />
    );
  }

  if (authScreen === 'forgot-password') {
    return (
      <ForgotPasswordModal
        onReturnToLogin={(email) => {
          if (email) setPrefilledEmail(email);
          setAuthScreen('login');
        }}
        onReturnToWebsite={() => {
          setAuthScreen(null);
          setIsWebsiteMode(true);
        }}
      />
    );
  }

  // Render active portal view
  const renderPortalView = () => {
    // RBAC Barrier check using Page 6 specification matrix
    if (!canAccessModule(currentView)) {
      let requiredRole: UserRole = 'SYSTEM_ADMIN';
      if (currentView === 'doctor-dashboard' || currentView === 'clinical-decision-support') {
        requiredRole = 'DOCTOR';
      } else if (currentView === 'hospital-dashboard') {
        requiredRole = 'HOSPITAL_ADMIN';
      } else if (currentView === 'researcher-dashboard') {
        requiredRole = 'HEALTHCARE_RESEARCHER';
      }

      return (
        <AccessDeniedView
          targetModule={currentView}
          requiredRole={requiredRole}
          onSwitchRole={(r) => {
            switchRole(r);
          }}
          onGoBack={() => setCurrentView(authService.getDefaultDashboardForRole(role))}
        />
      );
    }

    // Role-tailored dashboards
    if (
      currentView === 'dashboard' ||
      currentView === 'doctor-dashboard' ||
      currentView === 'hospital-dashboard' ||
      currentView === 'researcher-dashboard' ||
      currentView === 'admin-dashboard'
    ) {
      if (role === 'DOCTOR') {
        return (
          <DoctorDashboard
            patients={patients}
            onSelectPatient={setSelectedPatientForDetail}
            onNavigate={setCurrentView}
          />
        );
      }
      if (role === 'HOSPITAL_ADMIN') {
        return (
          <HospitalAdminDashboard
            patients={patients}
            onNavigate={setCurrentView}
          />
        );
      }
      if (role === 'HEALTHCARE_RESEARCHER') {
        return (
          <ResearcherDashboard
            patients={patients}
            onNavigate={setCurrentView}
          />
        );
      }
      return <AdminDashboard onNavigate={setCurrentView} />;
    }

    switch (currentView) {
      case 'general-dashboard':
        return (
          <DashboardView
            patients={patients}
            onSelectPatient={setSelectedPatientForDetail}
            onNavigate={setCurrentView}
          />
        );
      case 'patients':
        return (
          <PatientsView
            patients={patients}
            onSelectPatient={setSelectedPatientForDetail}
            onOpenAddPatient={() => setIsAddPatientOpen(true)}
            onSelectForPrediction={handleSelectForPrediction}
          />
        );
      case 'risk-predictions':
        return (
          <RiskPredictionsView
            patients={patients}
            selectedPatientId={selectedPatientIdForPrediction}
            onSelectPatient={setSelectedPatientForDetail}
          />
        );
      case 'readmission-forecasts':
        return <ReadmissionForecastsView />;
      case 'treatment-effectiveness':
        return <TreatmentEffectivenessView />;
      case 'clinical-decision-support':
        return (
          <ClinicalDecisionSupportView
            patients={patients}
            selectedPatientId={selectedPatientIdForPrediction}
            onSelectPatient={setSelectedPatientForDetail}
          />
        );
      case 'healthcare-analytics':
        return <HealthcareAnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView onSelectPatientById={handleSelectPatientById} />;
      case 'settings':
        return <SettingsView />;

      // Admin views
      case 'admin-users':
        return <AdminUsersView />;
      case 'admin-roles':
        return <AdminRolesView />;
      case 'admin-datasets':
        return <AdminDatasetsView />;
      case 'admin-models':
        return <AdminModelsView />;
      case 'admin-audit':
        return <AdminAuditView />;

      default:
        return (
          <DashboardView
            patients={patients}
            onSelectPatient={setSelectedPatientForDetail}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Header */}
      <AppHeader
        currentView={currentView}
        onNavigate={setCurrentView}
        isWebsiteMode={isWebsiteMode}
        onToggleWebsiteMode={setIsWebsiteMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectPatientById={handleSelectPatientById}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Body */}
      {isWebsiteMode ? (
        <WebsiteLanding
          onLaunchPlatform={() => setIsWebsiteMode(false)}
          onSelectRoleAndLaunch={handleSelectRoleAndLaunch}
          onNavigateModule={(moduleId) => {
            setCurrentView(moduleId);
            setIsWebsiteMode(false);
          }}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <AppSidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {renderPortalView()}
            </div>
          </main>
        </div>
      )}

      {/* Patient Detail Dossier Modal */}
      <PatientDetailModal
        patient={selectedPatientForDetail}
        isOpen={Boolean(selectedPatientForDetail)}
        onClose={() => setSelectedPatientForDetail(null)}
        onSelectForPrediction={handleSelectForPrediction}
      />

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onAddPatient={handleAddPatient}
      />

      {/* User Profile & Credentials Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
