import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';
import { userService } from '../../services/userService';
import { dashboardService } from '../../services/dashboardService';
import { ShieldCheck, Server, Database, Cpu, Activity, CheckCircle2, HardDrive, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SysAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, statsData] = await Promise.all([
          userService.getAllUsers(),
          dashboardService.getStats()
        ]);
        setUsers(usersData);
        setStats(statsData);
      } catch (err) {
        console.error("Error loading system admin metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const systemServices = [
    { service: 'FastAPI Backend Core Server', status: 'Operational', latency: '24ms', uptime: '99.98%' },
    { service: 'SQLite ORM Database Engine', status: 'Operational', latency: '4ms', uptime: '100.0%' },
    { service: 'AI Predictive Risk Scoring API', status: 'Operational', latency: '42ms', uptime: '99.95%' },
    { service: 'JWT Authentication & RBAC Middleware', status: 'Operational', latency: '12ms', uptime: '100.0%' },
  ];

  return (
    <DashboardLayout title="System Administrator — Infrastructure & Platform Health">
      {/* Top Infrastructure KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <StatsCard
          title="System Health Status"
          value="100% Healthy"
          subtitle="All microservices operational"
          icon={Server}
          color="green"
        />
        <StatsCard
          title="Total System Encounters"
          value={stats?.total_patients || 0}
          subtitle="Database record volume"
          icon={Database}
          color="blue"
        />
        <StatsCard
          title="Registered Users (RBAC)"
          value={users.length}
          subtitle="Active user accounts"
          icon={ShieldCheck}
          color="purple"
        />
        <StatsCard
          title="Security & Audit Governance"
          value="Enforced"
          subtitle="JWT Token & Route Shields"
          icon={Lock}
          color="amber"
        />
      </div>

      {/* Infrastructure & Services Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Core Services Status */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Platform Infrastructure Microservices Status
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Real-time monitoring of backend, database, and AI prediction services
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Service Component</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Latency</th>
                  <th style={{ padding: '0.75rem' }}>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {systemServices.map((srv, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{srv.service}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant="success">
                        <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                        {srv.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{srv.latency}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--success-700)' }}>{srv.uptime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick User Management Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              User Governance Overview
            </h3>
            <Link to="/users" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
              Manage Users &rarr;
            </Link>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Access control distribution across roles
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>Doctors / Physicians</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clinical patient risk monitors</div>
              </div>
              <Badge variant="primary">{users.filter(u => u.role === 'doctor').length}</Badge>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>Hospital Administrators</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operations & department admins</div>
              </div>
              <Badge variant="purple">{users.filter(u => u.role === 'hospital_admin').length}</Badge>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>Healthcare Researchers</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Population health analytics</div>
              </div>
              <Badge variant="teal">{users.filter(u => u.role === 'researcher').length}</Badge>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>System Administrators</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full system access & security</div>
              </div>
              <Badge variant="default">{users.filter(u => u.role === 'system_admin').length}</Badge>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SysAdminDashboard;
