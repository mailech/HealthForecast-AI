import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout = ({ children, title = "Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar title={title} onMenuToggle={() => setSidebarOpen(prev => !prev)} />
      <main className="dashboard-main" style={{
        marginLeft: '260px',
        marginTop: '64px',
        padding: '2rem',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {children}
      </main>
    </div>
  );
};
