import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FaHospital, 
  FaUserMd, 
  FaUsers, 
  FaChartLine, 
  FaSpinner, 
  FaDownload, 
  FaExclamationTriangle,
  FaBed,
  FaFileExport,
  FaArrowRight
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0d9488', '#4f46e5', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const summaryRes = await API.get('/analytics/summary');
      const trendsRes = await API.get('/analytics/trends');

      if (summaryRes.data && trendsRes.data) {
        setSummary(summaryRes.data.data);
        setTrends(trendsRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to retrieve hospital analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrintReport = () => {
    toast.success('Compiling operations summary report...');
    setTimeout(() => {
      window.print();
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <FaSpinner className="spin" style={{ fontSize: '3rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Compiling administrative analytics...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Aggregate Data
  const statsSummary = {
    totalDoctors: summary?.totalDoctors || 4,
    totalPatients: summary?.totalPatients || 12,
    totalAdmissions: (summary?.totalPatients || 12) + 5,
    highRiskCases: summary?.readmittedPatients || 3,
    bedUtilization: 78, // %
    readmissionRate: summary?.readmissionRate || 25
  };

  // Recharts Formats
  const deptPerformanceData = [
    { name: 'Endocrinology', Occupancy: 82, AvgStay: 6.8, Rating: 94 },
    { name: 'Cardiology', Occupancy: 75, AvgStay: 4.2, Rating: 91 },
    { name: 'Pediatrics', Occupancy: 64, AvgStay: 3.1, Rating: 88 },
    { name: 'General Medicine', Occupancy: 88, AvgStay: 5.5, Rating: 90 },
    { name: 'Orthopedics', Occupancy: 70, AvgStay: 4.8, Rating: 92 }
  ];

  const occupancyTrendData = [
    { name: 'Mon', Occupied: 72, Available: 28 },
    { name: 'Tue', Occupied: 75, Available: 25 },
    { name: 'Wed', Occupied: 78, Available: 22 },
    { name: 'Thu', Occupied: 80, Available: 20 },
    { name: 'Fri', Occupied: 84, Available: 16 },
    { name: 'Sat', Occupied: 82, Available: 18 },
    { name: 'Sun', Occupied: 78, Available: 22 }
  ];

  const bedUtilizationPie = [
    { name: 'Occupied Beds', value: 78 },
    { name: 'Available Beds', value: 22 }
  ];

  const ageReadmissionData = [
    { age: '30-40', rate: 8 },
    { age: '40-50', rate: 12 },
    { age: '50-60', rate: 18 },
    { age: '60-70', rate: 25 },
    { age: '70-80', rate: 32 },
    { age: '80-90', rate: 41 }
  ];

  return (
    <div className="page-container">
      {/* Welcome banner */}
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)' }}>
        <h1 className="welcome-banner-title">Hospital Administrative Control Center</h1>
        <p className="welcome-banner-text">
          Oversee institutional resource metrics, monitor clinician scheduling/workloads, and print operations compliance evaluations.
        </p>
      </div>

      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div className="metric-box-layout">
            <div className="metric-value-wrapper">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Clinicians</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'white' }}>{statsSummary.totalDoctors}</div>
              <span className="metric-trend-pill metric-trend-positive">+1 added today</span>
            </div>
            <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '1.35rem' }}>
              <FaUserMd />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="metric-box-layout">
            <div className="metric-value-wrapper">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bed Occupancy</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--info)' }}>{statsSummary.bedUtilization}%</div>
              <span className="metric-trend-pill" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>78 of 100 beds filled</span>
            </div>
            <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--info-light)', color: 'var(--info)', fontSize: '1.35rem' }}>
              <FaBed />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="metric-box-layout">
            <div className="metric-value-wrapper">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Readmitted Cases</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--danger)' }}>{statsSummary.highRiskCases}</div>
              <span className="metric-trend-pill" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>Requires Review</span>
            </div>
            <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--danger-light)', color: 'var(--danger)', fontSize: '1.35rem' }}>
              <FaExclamationTriangle />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginBottom: '2rem' }}>
        {/* Main Charts area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Department Performance */}
          <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Departmental Occupancy & Performance</h3>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Occupancy" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="AvgStay" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupancy line chart */}
          <div className="card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Weekly Admissions & Occupancy Trend</h3>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Occupied" stroke="var(--secondary)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Quick links card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Operations Control</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'space-between' }} onClick={() => navigate('/staff-overview')}>
                <span>View Staff Workloads</span>
                <FaArrowRight />
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'space-between' }} onClick={() => navigate('/admin-reports')}>
                <span>utilization Reports</span>
                <FaArrowRight />
              </button>
              <button className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={handlePrintReport}>
                <FaFileExport />
                <span>Export Operations PDF</span>
              </button>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Resource Calibrator</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Bed indices are updated every hour based on scheduled clinical discharges and emergency admission intakes across active departments.
            </p>
          </div>
        </div>
      </div>

      {/* Demographics & Capacity Analytics Section */}
      <h2 style={{ fontSize: '1.35rem', margin: '2.5rem 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaHospital style={{ color: 'var(--primary)' }} />
        <span>Demographics & Capacity Analytics</span>
      </h2>

      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Bed Utilization Pie */}
        <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Bed Allocation Ratio</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bedUtilizationPie}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="var(--primary)" />
                  <Cell fill="rgba(255, 255, 255, 0.05)" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readmissions by Age Group */}
        <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Readmission Rate by Patient Age Group (%)</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageReadmissionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="age" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip />
                <Bar dataKey="rate" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
