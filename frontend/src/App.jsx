import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import HistoryPage from './pages/HistoryPage';
import PatientsPage from './pages/PatientsPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading HealthForecast AI...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="main-content">
        {activePage === 'dashboard' && <DashboardPage setActivePage={setActivePage} />}
        {activePage === 'predict' && <PredictionPage />}
        {activePage === 'history' && <HistoryPage />}
        {activePage === 'patients' && <PatientsPage />}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', background: '#ffffff' }}>
        HealthForecast AI — Infosys Virtual Internship Decision-Support System | Measured ROC-AUC ~0.658, Recall ~0.59 | Not a medical diagnosis
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
