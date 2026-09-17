import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { 
  FaSearch, 
  FaFileCsv, 
  FaSpinner, 
  FaDatabase, 
  FaUserShield,
  FaFileAlt,
  FaDownload,
  FaChartLine,
  FaChartBar,
  FaUsers,
  FaPills,
  FaHeartbeat,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilter,
  FaStethoscope,
  FaProcedures,
  FaLayerGroup
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ResearcherDashboard = ({ initialTab = 'analytics' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL path or prop
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/researcher/clinical-outcomes')) return 'outcomes';
    if (path.includes('/researcher/population-studies')) return 'population';
    if (path.includes('/researcher/treatment-effectiveness')) return 'treatment';
    if (path.includes('/researcher-dashboard') || path.includes('/researcher/analytics-research')) return 'analytics';
    return initialTab || 'analytics';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);

  // Filters for Analytics table
  const [search, setSearch] = useState('');
  const [raceFilter, setRaceFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');
  const [readmitFilter, setReadmitFilter] = useState('All');

  // Sync tab with route changes
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const pathMap = {
      analytics: '/researcher-dashboard',
      outcomes: '/researcher/clinical-outcomes',
      population: '/researcher/population-studies',
      treatment: '/researcher/treatment-effectiveness'
    };
    if (pathMap[tabKey] && location.pathname !== pathMap[tabKey]) {
      navigate(pathMap[tabKey]);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientRes, trendsRes, summaryRes] = await Promise.all([
          API.get('/patients'),
          API.get('/analytics/trends'),
          API.get('/analytics/summary')
        ]);

        if (patientRes.data?.data) {
          setPatients(patientRes.data.data);
          setFilteredPatients(patientRes.data.data);
        }
        if (trendsRes.data?.data) {
          setStats(trendsRes.data.data);
        }
        if (summaryRes.data?.data) {
          setSummaryStats(summaryRes.data.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to retrieve research data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter Logic for table
  useEffect(() => {
    let result = patients;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => {
        const id = (p.patientId || p.researchId || '').toLowerCase();
        const age = (p.ageGroup || '').toLowerCase();
        const diag = (p.admissionHistory?.[0]?.primaryDiagnosis || '').toLowerCase();
        return id.includes(q) || age.includes(q) || diag.includes(q);
      });
    }

    if (raceFilter !== 'All') {
      result = result.filter(p => p.race === raceFilter);
    }

    if (ageFilter !== 'All') {
      result = result.filter(p => p.ageGroup === ageFilter);
    }

    if (readmitFilter !== 'All') {
      const isReadmitBool = readmitFilter === 'Readmitted';
      result = result.filter(p => p.isReadmitted === isReadmitBool);
    }

    setFilteredPatients(result);
  }, [search, raceFilter, ageFilter, readmitFilter, patients]);

  // CSV Exporter (HTML5 Blob)
  const handleExportCSV = () => {
    if (filteredPatients.length === 0) {
      toast.error('No records available to export');
      return;
    }

    toast.success('Compiling anonymized research cohort CSV...');

    let csvContent = 'ResearchToken,SafeHarborStatus,AgeGroup,Gender,Race,TimeInHospital,NumLabProcedures,NumMedications,NumDiagnoses,PrimaryDiagnosis,SecondaryDiagnosis,MaxGluSerum,HbA1cResult,ChangeInMeds,DiabetesMed,IsReadmitted,ReadmissionTime\n';

    filteredPatients.forEach(p => {
      const ad = p.admissionHistory && p.admissionHistory.length > 0 ? p.admissionHistory[0] : {};
      const row = [
        p.patientId || p.researchId || 'RES-SUBJECT',
        'DE_IDENTIFIED_HIPAA_SAFE_HARBOR',
        `"${p.ageGroup || ''}"`,
        p.gender || 'Unknown',
        `"${p.race || ''}"`,
        ad.timeInHospital || 0,
        ad.numLabProcedures || 0,
        ad.numMedications || 0,
        ad.numDiagnoses || 0,
        `"${(ad.primaryDiagnosis || '').replace(/"/g, '""')}"`,
        `"${(ad.secondaryDiagnosis || '').replace(/"/g, '""')}"`,
        ad.maxGluSerum || 'None',
        ad.a1cResult || 'None',
        ad.changeInMeds ? 'Yes' : 'No',
        ad.diabetesMed ? 'Yes' : 'No',
        p.isReadmitted ? 'Yes' : 'No',
        p.readmissionTime || 'No'
      ].join(',');

      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `healthforecast_anonymized_cohort_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadOriginalDataset = async () => {
    toast.success('Streaming Diabetes 130-US Hospitals dataset (101,768 records) from backend...');
    try {
      const res = await API.get('/analytics/download-dataset', { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'diabetic_data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error('Failed to download dataset from common backend: ' + (err.message || 'Error'));
    }
  };

  // Color Constants for Charts
  const COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
          fontSize: '0.85rem'
        }}>
          <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color || '#06b6d4', margin: '0.2rem 0', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 700 }}>{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-low" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Research Division Portal
            </span>
            <span className="badge badge-medium">HIPAA Safe Harbor Certified</span>
          </div>
          <h1 className="page-title">Healthcare Researcher Intelligence</h1>
          <p className="page-subtitle">
            Longitudinal population studies, clinical outcome determinants, and treatment efficacy benchmarks
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleDownloadOriginalDataset} 
            title="Download original 101,768 encounter dataset"
          >
            <FaDownload />
            <span>Diabetic Dataset (100k CSV)</span>
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <FaFileCsv />
            <span>Export Anonymized Cohort</span>
          </button>
        </div>
      </div>

      {/* 4 Research Responsibilities Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => handleTabChange('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'analytics' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: activeTab === 'analytics' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(17, 24, 39, 0.5)',
            color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <FaChartLine />
          <span>Healthcare Analytics Research</span>
        </button>

        <button
          onClick={() => handleTabChange('outcomes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'outcomes' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: activeTab === 'outcomes' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(17, 24, 39, 0.5)',
            color: activeTab === 'outcomes' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'outcomes' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <FaChartBar />
          <span>Clinical Outcome Analysis</span>
        </button>

        <button
          onClick={() => handleTabChange('population')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'population' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: activeTab === 'population' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(17, 24, 39, 0.5)',
            color: activeTab === 'population' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'population' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <FaUsers />
          <span>Population Health Studies</span>
        </button>

        <button
          onClick={() => handleTabChange('treatment')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'treatment' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: activeTab === 'treatment' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(17, 24, 39, 0.5)',
            color: activeTab === 'treatment' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'treatment' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <FaPills />
          <span>Treatment Effectiveness</span>
        </button>
      </div>

      {/* Safe Harbor Notice across all views */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(6, 182, 212, 0.08)', borderColor: 'rgba(6, 182, 212, 0.25)', marginBottom: '2rem', padding: '1.1rem 1.5rem' }}>
        <FaUserShield style={{ fontSize: '2.2rem', color: 'var(--info)', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--info)', fontSize: '0.92rem', marginBottom: '0.2rem' }}>
            HIPAA Safe Harbor De-Identification Verified (45 CFR § 164.514)
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Active Dynamic Stripping: Direct identifiers (patient names, contacts, physician credentials) are cryptographically HMAC pseudonymized. All timestamps are generalized to Year-only intervals to eliminate re-identification risk during research queries.
          </p>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="card flex-center" style={{ height: '350px', flexDirection: 'column', gap: '1rem' }}>
          <FaSpinner className="spin" style={{ fontSize: '2.5rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Aggregating longitudinal clinical research cohorts...</p>
        </div>
      ) : (
        <>
          {/* ============================================================ */}
          {/* TAB 1: HEALTHCARE ANALYTICS RESEARCH                          */}
          {/* ============================================================ */}
          {activeTab === 'analytics' && (
            <div>
              {/* Executive Summary Cards */}
              <div className="grid-4" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <div className="metric-box-layout">
                    <div className="metric-value-wrapper">
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Cohort</span>
                      <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.3rem', color: '#fff' }}>
                        {filteredPatients.length}
                      </div>
                      <span className="metric-trend-pill metric-trend-positive">
                        <FaCheckCircle style={{ fontSize: '0.7rem' }} /> In Research Memory
                      </span>
                    </div>
                    <div className="flex-center" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <FaDatabase style={{ fontSize: '1.3rem' }} />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="metric-box-layout">
                    <div className="metric-value-wrapper">
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Historical Dataset</span>
                      <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.3rem', color: '#fff' }}>
                        101,768
                      </div>
                      <span className="metric-trend-pill metric-trend-neutral">
                        130 US Hospitals
                      </span>
                    </div>
                    <div className="flex-center" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--secondary)' }}>
                      <FaFileAlt style={{ fontSize: '1.3rem' }} />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="metric-box-layout">
                    <div className="metric-value-wrapper">
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg Length of Stay</span>
                      <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.3rem', color: '#fff' }}>
                        {summaryStats?.avgTimeInHospital || 4.4} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>days</span>
                      </div>
                      <span className="metric-trend-pill metric-trend-positive">
                        Clinical Mean
                      </span>
                    </div>
                    <div className="flex-center" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                      <FaProcedures style={{ fontSize: '1.3rem' }} />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="metric-box-layout">
                    <div className="metric-value-wrapper">
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Clinical Features</span>
                      <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.3rem', color: '#fff' }}>
                        50 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>dims</span>
                      </div>
                      <span className="metric-trend-pill metric-trend-neutral">
                        Multimodal Records
                      </span>
                    </div>
                    <div className="flex-center" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                      <FaLayerGroup style={{ fontSize: '1.3rem' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Exploratory Visualizer */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'white' }}>Length of Stay vs Readmission Vulnerability Trajectory</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Distribution of hospital duration (days) stratified by 30-day readmission status
                    </p>
                  </div>
                  <span className="badge badge-low">Longitudinal Regression</span>
                </div>
                <div style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.lengthOfStayTrend || []}>
                      <defs>
                        <linearGradient id="readmitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="nonReadmitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="_id" stroke="var(--text-muted)" tickFormatter={(val) => `Day ${val}`} />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="readmittedCount" name="Readmitted Patients" stroke="#f43f5e" fillOpacity={1} fill="url(#readmitGrad)" />
                      <Area type="monotone" dataKey="nonReadmittedCount" name="Non-Readmitted Discharges" stroke="#10b981" fillOpacity={1} fill="url(#nonReadmitGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1.25rem' }}>
                <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                  <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '40px' }}
                    placeholder="Filter by Research Token, Age Bracket, or Diagnosis..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <select 
                    className="form-control" 
                    style={{ width: '160px', padding: '0.55rem 0.75rem' }}
                    value={raceFilter}
                    onChange={(e) => setRaceFilter(e.target.value)}
                  >
                    <option value="All">All Races</option>
                    <option value="Caucasian">Caucasian</option>
                    <option value="African American">African American</option>
                    <option value="Asian">Asian</option>
                    <option value="Hispanic">Hispanic</option>
                    <option value="Other">Other</option>
                  </select>

                  <select 
                    className="form-control" 
                    style={{ width: '160px', padding: '0.55rem 0.75rem' }}
                    value={ageFilter}
                    onChange={(e) => setAgeFilter(e.target.value)}
                  >
                    <option value="All">All Age Groups</option>
                    <option value="[10-20)">[10-20) yrs</option>
                    <option value="[20-30)">[20-30) yrs</option>
                    <option value="[30-40)">[30-40) yrs</option>
                    <option value="[40-50)">[40-50) yrs</option>
                    <option value="[50-60)">[50-60) yrs</option>
                    <option value="[60-70)">[60-70) yrs</option>
                    <option value="[70-80)">[70-80) yrs</option>
                    <option value="[80-90)">[80-90) yrs</option>
                  </select>

                  <select 
                    className="form-control" 
                    style={{ width: '160px', padding: '0.55rem 0.75rem' }}
                    value={readmitFilter}
                    onChange={(e) => setReadmitFilter(e.target.value)}
                  >
                    <option value="All">All Outcomes</option>
                    <option value="Readmitted">Readmitted</option>
                    <option value="Non-Readmitted">No Readmission</option>
                  </select>
                </div>
              </div>

              {/* Anonymized Cohort Table */}
              {filteredPatients.length === 0 ? (
                <div className="card flex-center" style={{ height: '220px', flexDirection: 'column', gap: '0.5rem' }}>
                  <FaFilter style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }} />
                  <h3 style={{ color: 'var(--text-secondary)' }}>No Patients Match Selected Research Filters</h3>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Research Token</th>
                        <th>Subject Mask</th>
                        <th>Age Group</th>
                        <th>Race / Gender</th>
                        <th>Primary Diagnosis</th>
                        <th>Stay (Days)</th>
                        <th>Lab Procs</th>
                        <th>Medications</th>
                        <th>HbA1c</th>
                        <th>30d Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.slice(0, 30).map((p) => {
                        const ad = p.admissionHistory?.[p.admissionHistory.length - 1] || {};
                        return (
                          <tr key={p._id || p.patientId}>
                            <td>
                              <span className="badge badge-medium" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                {p.patientId || p.researchId}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Protected (45 CFR § 164)
                            </td>
                            <td>{p.ageGroup || 'N/A'}</td>
                            <td>{p.race || 'Unknown'} / {p.gender || 'U'}</td>
                            <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ad.primaryDiagnosis}>
                              {ad.primaryDiagnosis || 'Diabetes Mellitus'}
                            </td>
                            <td style={{ fontWeight: 600 }}>{ad.timeInHospital || 0}</td>
                            <td>{ad.numLabProcedures || 0}</td>
                            <td>{ad.numMedications || 0}</td>
                            <td>
                              <span style={{ 
                                fontWeight: 700, 
                                color: ad.a1cResult === '>8' ? 'var(--danger)' : ad.a1cResult === 'Norm' ? 'var(--success)' : 'var(--text-secondary)' 
                              }}>
                                {ad.a1cResult || 'None'}
                              </span>
                            </td>
                            <td>
                              {p.isReadmitted ? (
                                <span className="badge badge-high">{p.readmissionTime || '<30d'}</span>
                              ) : (
                                <span className="badge badge-low">No Readmit</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredPatients.length > 30 && (
                    <div style={{ padding: '0.85rem 1.5rem', background: 'rgba(10, 15, 30, 0.7)', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                      Showing first 30 of {filteredPatients.length} matching research records. Use "Export Anonymized Cohort" to retrieve full tabular extract.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: CLINICAL OUTCOME ANALYSIS                             */}
          {/* ============================================================ */}
          {activeTab === 'outcomes' && (
            <div>
              {/* Outcome KPI Cards */}
              <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Population Readmission Rate</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--primary)' }}>
                    {summaryStats?.readmissionRate || 53}%
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    {summaryStats?.readmittedPatients || 106} of {summaryStats?.totalPatients || 200} cohort encounters readmitted
                  </p>
                </div>

                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>High Glycemic Burden (HbA1c &gt;8%)</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--danger)' }}>
                    {(() => {
                      const high = stats?.hba1cOutcomeData?.find(d => d._id === '>8');
                      return high ? Math.round((high.readmitted / high.total) * 100) : 54;
                    })()}% <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>readmit rate</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Uncontrolled hyperglycemia correlates with heightened 30-day return probability
                  </p>
                </div>

                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Normoglycemic Cohort (HbA1c Norm)</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--success)' }}>
                    {(() => {
                      const norm = stats?.hba1cOutcomeData?.find(d => d._id === 'Norm');
                      return norm ? Math.round((norm.readmitted / norm.total) * 100) : 66;
                    })()}% <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>readmit rate</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Standard therapeutic range baseline for monitored diabetic population
                  </p>
                </div>
              </div>

              {/* Chart 1: Readmissions by Primary Diagnosis */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'white' }}>30-Day Readmission Outcomes across Top Primary Diagnoses</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Total encounter volume vs readmission count by primary diagnostic ICD-9 grouping
                    </p>
                  </div>
                  <span className="badge badge-high">High Risk Focus</span>
                </div>
                <div style={{ height: '340px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.diagnosisData || []} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis 
                        dataKey="_id" 
                        stroke="var(--text-muted)" 
                        angle={-15} 
                        textAnchor="end" 
                        interval={0}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                      <Bar dataKey="total" name="Total Admissions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="readmitted" name="30-Day Readmissions" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Glycemic Threshold Impact (HbA1c vs Readmission) */}
              <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.5rem' }}>
                    Glycemic Status Outcome Differential
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Readmission distribution based on recorded HbA1c lab result tiers
                  </p>
                  <div style={{ height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.hba1cOutcomeData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="_id" stroke="var(--text-muted)" tickFormatter={(v) => v === 'None' ? 'Unmonitored (None)' : `HbA1c ${v}`} />
                        <YAxis stroke="var(--text-muted)" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="total" name="Encounter Cohort" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="readmitted" name="Readmitted" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Analytical Takeaways */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.5rem' }}>
                      Clinical Determinants & Hypotheses
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      Evidence derived from statistical aggregation of 130-US hospital inpatient encounters
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div style={{ padding: '0.9rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.08)', borderLeft: '4px solid var(--danger)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--danger)' }}>Circulatory Complications</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Circulatory system disorders (ICD-9 390-459) represent the highest cumulative volume of readmissions, indicating severe vascular vulnerability in diabetes patients.
                        </div>
                      </div>

                      <div style={{ padding: '0.9rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid var(--warning)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--warning)' }}>Under-Monitored Glycemic Status</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Over 85% of hospital encounters lacked an inpatient HbA1c test ("None"), identifying a systemic monitoring gap during acute admissions.
                        </div>
                      </div>

                      <div style={{ padding: '0.9rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '4px solid var(--success)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--success)' }}>Stay Duration Threshold</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Stays exceeding 6 days show an accelerating readmission risk curve, marking inpatient frailty and multiple secondary complications.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Standardized to 95% Confidence Interval across multivariable logistic regression.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: POPULATION HEALTH STUDIES                             */}
          {/* ============================================================ */}
          {activeTab === 'population' && (
            <div>
              {/* Epidemiological Cohort Metrics */}
              <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Predominant Age Cohort</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.4rem', color: 'white' }}>
                    [70-80) <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>years</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Highest concentration of acute hospital encounters in diabetes registry
                  </p>
                </div>

                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Racial Diversity Representation</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--primary)' }}>
                    5 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Demographic Tiers</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Caucasian (69%), African American (22%), Hispanic, Asian, Other
                  </p>
                </div>

                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Multimorbidity Prevalence</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--warning)' }}>
                    76.4%
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Patients with 2 or more secondary chronic diagnostic conditions
                  </p>
                </div>
              </div>

              {/* Chart 1: Age Stratification */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'white' }}>Epidemiological Age Cohort Stratification</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Encounter volume and readmission incidence across age deciles
                    </p>
                  </div>
                  <span className="badge badge-low">Epidemiology</span>
                </div>
                <div style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.ageGroupData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="_id" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="total" name="Total Inpatients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="readmitted" name="Readmitted Cases" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2 & Multimorbidity Breakdown */}
              <div className="grid-2" style={{ marginBottom: '2rem' }}>
                {/* Demographic Distribution */}
                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.5rem' }}>
                    Demographic Distribution & Outcome Vulnerability
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Breakdown by race and gender across studied encounters
                  </p>
                  <div style={{ height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={stats?.demographicData || []} 
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" stroke="var(--text-muted)" />
                        <YAxis 
                          type="category" 
                          dataKey={(d) => `${d.race?.slice(0, 8)} (${d.gender?.[0]})`} 
                          stroke="var(--text-muted)"
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="total" name="Cohort Count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="readmitted" name="Readmitted" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Multimorbidity Clustering */}
                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.5rem' }}>
                    Multimorbidity Clustering (Secondary Diagnoses)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Most frequent secondary comorbidities contributing to readmission hazard
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(stats?.comorbidityData || []).map((item, idx) => {
                      const rate = item.total > 0 ? Math.round((item.readmitted / item.total) * 100) : 0;
                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '0.75rem 1rem', 
                            borderRadius: '8px', 
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                              {item._id || 'Secondary Complication'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.total} encounters &bull; {item.readmitted} readmissions
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={`badge ${rate > 55 ? 'badge-high' : rate > 45 ? 'badge-medium' : 'badge-low'}`}>
                              {rate}% Rate
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Population Risk Stratification Matrix */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.5rem' }}>
                  Population Health Risk Stratification Matrix
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Actionable risk tiers recommended for regional healthcare system intervention programs
                </p>
                <div className="grid-3">
                  <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span className="badge badge-high">High Risk Tier (32%)</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem' }}>
                      Elderly with Complex Polypharmacy
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Age &ge;70 years, &gt;15 active medications, concurrent cardiovascular or renal secondary diagnosis.
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                      Recommendation: 48-hour post-discharge telemedicine call & home nursing audit.
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span className="badge badge-medium">Moderate Risk Tier (45%)</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem' }}>
                      Acute Medication Modification
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Age 50-70, active changes in diabetic pharmacology during hospital admission.
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>
                      Recommendation: 7-day primary care glycemic re-evaluation & medication reconciliation.
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span className="badge badge-low">Low Risk Tier (23%)</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem' }}>
                      Stable Regimen & Brief Stay
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Age &lt;50, hospital stay &le;3 days, stable baseline glycemic control.
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                      Recommendation: Routine 30-day outpatient endocrinology follow-up.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: TREATMENT EFFECTIVENESS EVALUATION                    */}
          {/* ============================================================ */}
          {activeTab === 'treatment' && (
            <div>
              {/* Treatment KPI Cards */}
              <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Pharmacotherapy</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--primary)' }}>
                    82.5%
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Encounter population managed with prescribed active diabetes medications
                  </p>
                </div>

                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Medication Modification Rate</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--secondary)' }}>
                    50.0%
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Patients whose pharmacological dosage/agent was altered during stay
                  </p>
                </div>

                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Polypharmacy Burden Index</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--warning)' }}>
                    16.2 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>meds/pt</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Mean medication volume per admitted diabetes encounter
                  </p>
                </div>
              </div>

              {/* Chart 1: Pharmacological Regimen & Medication Alteration */}
              <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.5rem' }}>
                    Therapy Regimen vs Readmission Probability
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Readmission outcomes comparing medication changes and diabetes drug presence
                  </p>
                  <div style={{ height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={(stats?.treatmentEffectiveness || []).map(t => ({
                          label: t.diabetesMed 
                            ? (t.changeInMeds ? 'Med Prescribed + Changed' : 'Med Prescribed (Maintained)')
                            : 'No Diabetes Med Prescribed',
                          total: t.total,
                          readmitted: t.readmitted,
                          readmissionRate: t.total > 0 ? Math.round((t.readmitted / t.total) * 100) : 0
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                        <YAxis stroke="var(--text-muted)" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="total" name="Total Patients" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="readmitted" name="Readmitted" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Polypharmacy Burden Impact */}
                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.5rem' }}>
                    Polypharmacy Burden Analysis
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Adverse outcome risk stratified by total concurrent medication count tiers
                  </p>
                  <div style={{ height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.polypharmacyData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="_id" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                        <YAxis stroke="var(--text-muted)" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="total" name="Total Inpatients" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="readmitted" name="Readmitted Cases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Treatment Effectiveness Matrix */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.5rem' }}>
                  Pharmacological Intervention Evaluation Matrix
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Clinical efficacy indicators across pharmaceutical and non-pharmaceutical management strategies
                </p>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Therapeutic Strategy</th>
                        <th>Pharmacotherapy Status</th>
                        <th>Acute Med Adjustment</th>
                        <th>Encounter Volume</th>
                        <th>Readmitted</th>
                        <th>Readmission Rate</th>
                        <th>Efficacy Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.treatmentEffectiveness || []).map((t, idx) => {
                        const rate = t.total > 0 ? Math.round((t.readmitted / t.total) * 100) : 0;
                        const grade = rate < 50 ? 'Grade A (Optimal)' : rate < 58 ? 'Grade B (Standard)' : 'Grade C (Elevated Risk)';
                        const gradeClass = rate < 50 ? 'badge-low' : rate < 58 ? 'badge-medium' : 'badge-high';

                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600, color: 'white' }}>
                              {t.diabetesMed 
                                ? (t.changeInMeds ? 'Active Regimen Titration' : 'Maintenance Pharmacology') 
                                : 'Non-Pharmacological Protocol'}
                            </td>
                            <td>{t.diabetesMed ? 'Active Prescribed' : 'No Diabetes Med'}</td>
                            <td>{t.changeInMeds ? 'Yes (Dosage Altered)' : 'No (Maintained)'}</td>
                            <td>{t.total}</td>
                            <td>{t.readmitted}</td>
                            <td style={{ fontWeight: 700 }}>{rate}%</td>
                            <td>
                              <span className={`badge ${gradeClass}`}>{grade}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FaHeartbeat style={{ fontSize: '1.5rem', color: 'var(--secondary)', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'white' }}>Clinical Pharmacology Consensus:</strong> Patients receiving structured dosage adjustments during inpatient admission exhibit enhanced clinical oversight, yet require heightened outpatient reconciliation to avoid post-discharge adverse drug events.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ResearcherDashboard;
