import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaSearch, 
  FaUserPlus, 
  FaBrain, 
  FaEye, 
  FaFilter, 
  FaSpinner, 
  FaTimes, 
  FaCheckCircle,
  FaFileAlt,
  FaUserInjured,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaClock
} from 'react-icons/fa';
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
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

const COLORS = ['#0d9488', '#0ea5e9', '#6366f1', '#f59e0b', '#ef4444'];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictingId, setPredictingId] = useState(null);
  
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchPatients = async () => {
    try {
      const res = await API.get('/patients');
      if (res.data && res.data.success) {
        setPatients(res.data.data);
        setFilteredPatients(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = patients;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        p => 
          p.firstName.toLowerCase().includes(q) || 
          p.lastName.toLowerCase().includes(q) || 
          p.patientId.toLowerCase().includes(q)
      );
    }

    if (riskFilter !== 'All') {
      result = result.filter(p => {
        const isHigh = p.isReadmitted;
        if (riskFilter === 'High') return isHigh;
        if (riskFilter === 'Low') return !isHigh && p.readmissionTime === 'No';
        if (riskFilter === 'Medium') return !isHigh && p.readmissionTime === 'No';
        return true;
      });
    }

    setFilteredPatients(result);
  }, [search, riskFilter, patients]);

  // Run AI Risk Prediction
  const handleRunPrediction = async (patientId) => {
    setPredictingId(patientId);
    try {
      const res = await API.post(`/predictions/run/${patientId}`);
      if (res.data && res.data.success) {
        setPredictionResult(res.data.data);
        toast.success('AI Readmission Prediction run successfully!');
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.message || 'AI prediction model error');
    } finally {
      setPredictingId(null);
    }
  };

  // Add Patient Form Submit
  const onAddPatientSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        ageGroup: data.ageGroup,
        gender: data.gender,
        race: data.race,
        medicalHistory: {
          allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()) : [],
          chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(s => s.trim()) : []
        },
        admissionHistory: [
          {
            admissionSource: 'Emergency Room',
            timeInHospital: Number(data.timeInHospital),
            numLabProcedures: Number(data.numLabProcedures),
            numMedications: Number(data.numMedications),
            numDiagnoses: Number(data.numDiagnoses),
            primaryDiagnosis: data.primaryDiagnosis,
            secondaryDiagnosis: data.secondaryDiagnosis,
            maxGluSerum: data.maxGluSerum,
            a1cResult: data.a1cResult,
            changeInMeds: data.changeInMeds === 'true',
            diabetesMed: data.diabetesMed === 'true',
            dischargeDisposition: 'Discharged to Home'
          }
        ]
      };

      const res = await API.post('/patients', payload);
      if (res.data && res.data.success) {
        toast.success('Patient record registered successfully!');
        setShowAddModal(false);
        reset();
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (patient) => {
    if (patient.isReadmitted) {
      return <span className="badge badge-high">High Risk</span>;
    }
    if (patient.admissionHistory && patient.admissionHistory[0]?.timeInHospital > 4) {
      return <span className="badge badge-medium">Medium Risk</span>;
    }
    return <span className="badge badge-low">Low Risk</span>;
  };

  // Summary Metrics Calculations
  const statsSummary = {
    total: patients.length,
    highRisk: patients.filter(p => p.isReadmitted).length,
    followUps: Math.round(patients.length * 0.4),
    appointments: Math.round(patients.length * 0.6)
  };

  // Chart data: Distribution of risk
  const riskDistributionData = [
    { name: 'Low Risk', value: patients.filter(p => !p.isReadmitted && p.readmissionTime === 'No').length || 3 },
    { name: 'Medium Risk', value: patients.filter(p => !p.isReadmitted && p.admissionHistory?.[0]?.timeInHospital > 4).length || 2 },
    { name: 'High Risk', value: patients.filter(p => p.isReadmitted).length || 2 }
  ];

  // Added Data Visualizations
  const monthlyTrendsData = [
    { month: 'Jan', rate: 22 },
    { month: 'Feb', rate: 19 },
    { month: 'Mar', rate: 24 },
    { month: 'Apr', rate: 18 },
    { month: 'May', rate: 15 },
    { month: 'Jun', rate: 14 }
  ];

  const diagnosisRecoveryData = [
    { name: 'Diabetes', Recovered: 84, Readmitted: 16 },
    { name: 'Hypertension', Recovered: 91, Readmitted: 9 },
    { name: 'Heart Failure', Recovered: 70, Readmitted: 30 },
    { name: 'COPD', Recovered: 76, Readmitted: 24 }
  ];

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h1 className="welcome-banner-title">Welcome back, {user?.name}</h1>
        <p className="welcome-banner-text">
          Review patient readmission vulnerabilities, register new admissions, and configure customized transitional care follow-up plans.
        </p>
      </div>

      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div className="metric-box-layout">
            <div className="metric-value-wrapper">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Patients</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'white' }}>{statsSummary.total}</div>
              <span className="metric-trend-pill metric-trend-positive">+4% this week</span>
            </div>
            <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '1.35rem' }}>
              <FaUserInjured />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="metric-box-layout">
            <div className="metric-value-wrapper">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>High Risk</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--danger)' }}>{statsSummary.highRisk}</div>
              <span className="metric-trend-pill" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>Critical Attention</span>
            </div>
            <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--danger-light)', color: 'var(--danger)', fontSize: '1.35rem' }}>
              <FaExclamationTriangle />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="metric-box-layout">
            <div className="metric-value-wrapper">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Follow-ups</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--warning)' }}>{statsSummary.followUps}</div>
              <span className="metric-trend-pill" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>Pending review</span>
            </div>
            <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--warning-light)', color: 'var(--warning)', fontSize: '1.35rem' }}>
              <FaCalendarCheck />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="metric-box-layout">
            <div className="metric-value-wrapper">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Appts</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--info)' }}>{statsSummary.appointments}</div>
              <span className="metric-trend-pill" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>Scheduled today</span>
            </div>
            <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--info-light)', color: 'var(--info)', fontSize: '1.35rem' }}>
              <FaClock />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginBottom: '2rem' }}>
        {/* Patient Table Area */}
        <div>
          <div className="page-header" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Active Clinical Cases</h2>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <FaUserPlus />
              <span>Log Admission</span>
            </button>
          </div>

          {/* Search/Filter */}
          <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px', borderRadius: '8px' }}
                placeholder="Search patient registry by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="form-control" 
              style={{ width: '160px', padding: '0.5rem', borderRadius: '8px' }}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}>
              <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="card flex-center" style={{ height: '200px', flexDirection: 'column', gap: '0.5rem' }}>
              <FaFileAlt style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No matching patient profiles found</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Latest Diagnosis</th>
                    <th>Risk Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => {
                    const latestAd = p.admissionHistory && p.admissionHistory.length > 0
                      ? p.admissionHistory[p.admissionHistory.length - 1]
                      : null;

                    return (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.patientId}</td>
                        <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                        <td>{p.ageGroup} y/o</td>
                        <td>{latestAd ? latestAd.primaryDiagnosis : 'None logged'}</td>
                        <td>{getRiskBadge(p)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px' }}
                              onClick={() => navigate(`/patients/${p._id}`)}
                            >
                              <FaEye />
                              <span>Timeline</span>
                            </button>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px' }}
                              disabled={predictingId === p._id}
                              onClick={() => handleRunPrediction(p._id)}
                            >
                              {predictingId === p._id ? (
                                <FaSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <FaBrain />
                              )}
                              <span>AI Run</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Sidebar - Action tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Control Center</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/follow-up-planning')}>
                <FaCalendarCheck style={{ color: 'var(--warning)' }} />
                <span>View Follow-up Plans</span>
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/doctor-reports')}>
                <FaFileAlt style={{ color: 'var(--primary)' }} />
                <span>Generate Clinical Reports</span>
              </button>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>System Integrity</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Risk scores are computed in real-time by correlating HbA1c metrics and patient histories against the calibrated MLOps parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Analytics Visualization Section */}
      <h2 style={{ fontSize: '1.35rem', margin: '2.5rem 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaBrain style={{ color: 'var(--primary)' }} />
        <span>Clinical Risk & Recovery Analytics</span>
      </h2>

      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {/* Chart 1: Pie Chart Risk Split */}
        <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Cohort Risk Grade Split</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Area Chart Monthly Trends */}
        <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Monthly Readmission Trends</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendsData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Stacked Bar Chart Recovery by Diagnosis */}
        <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recovery Statistics by Diagnosis</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnosisRecoveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Recovered" fill="var(--success)" stackId="a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Readmitted" fill="var(--danger)" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          overflowY: 'auto', padding: '2rem 1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: 'white', position: 'relative' }}>
            <button style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setShowAddModal(false)}>
              <FaTimes />
            </button>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Log Patient Admission</h2>

            <form onSubmit={handleSubmit(onAddPatientSubmit)}>
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '1rem', color: 'var(--primary)' }}>1. Demographics</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-control" {...register('firstName', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-control" {...register('lastName', { required: 'Required' })} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Age Group</label>
                  <select className="form-control" {...register('ageGroup', { required: 'Required' })}>
                    <option value="50-60">50-60</option>
                    <option value="60-70">60-70</option>
                    <option value="70-80">70-80</option>
                    <option value="80-90">80-90</option>
                    <option value="30-40">30-40</option>
                    <option value="40-50">40-50</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" {...register('gender', { required: 'Required' })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Race</label>
                  <select className="form-control" {...register('race', { required: 'Required' })}>
                    <option value="Caucasian">Caucasian</option>
                    <option value="African American">African American</option>
                    <option value="Asian">Asian</option>
                    <option value="Hispanic">Hispanic</option>
                  </select>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '1rem', marginTop: '1rem', color: 'var(--primary)' }}>2. Admission Encounter Specs</h3>
              <div className="grid-4">
                <div className="form-group">
                  <label className="form-label">Stay Length (Days)</label>
                  <input type="number" className="form-control" defaultValue={3} {...register('timeInHospital', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lab Procedures</label>
                  <input type="number" className="form-control" defaultValue={25} {...register('numLabProcedures', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Medications Count</label>
                  <input type="number" className="form-control" defaultValue={10} {...register('numMedications', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Diagnoses Count</label>
                  <input type="number" className="form-control" defaultValue={2} {...register('numDiagnoses', { required: 'Required' })} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Primary Diagnosis</label>
                  <input type="text" className="form-control" defaultValue="Diabetes" {...register('primaryDiagnosis', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Secondary Diagnosis</label>
                  <input type="text" className="form-control" defaultValue="Hypertension" {...register('secondaryDiagnosis')} />
                </div>
              </div>

              <div className="grid-4">
                <div className="form-group">
                  <label className="form-label">Max Glucose</label>
                  <select className="form-control" defaultValue="None" {...register('maxGluSerum')}>
                    <option value="None">None</option>
                    <option value="Norm">Norm</option>
                    <option value=">200">&gt;200</option>
                    <option value=">300">&gt;300</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">HbA1c Result</label>
                  <select className="form-control" defaultValue="None" {...register('a1cResult')}>
                    <option value="None">None</option>
                    <option value="Norm">Norm</option>
                    <option value=">7">&gt;7</option>
                    <option value=">8">&gt;8</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Change meds</label>
                  <select className="form-control" defaultValue="false" {...register('changeInMeds')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Diabetes meds</label>
                  <select className="form-control" defaultValue="true" {...register('diabetesMed')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Allergies (comma-separated)</label>
                  <input type="text" className="form-control" placeholder="e.g. Penicillin" {...register('allergies')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Chronic Conditions</label>
                  <input type="text" className="form-control" placeholder="e.g. Asthma" {...register('chronicConditions')} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Prediction Result Modal */}
      {predictionResult && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'white', position: 'relative', padding: '2rem' }}>
            <button style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setPredictionResult(null)}>
              <FaTimes />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <FaCheckCircle style={{ color: 'var(--primary)', fontSize: '3.5rem', marginBottom: '0.5rem' }} />
              <h2 style={{ fontFamily: 'var(--font-display)' }}>Clinical Assessment Run</h2>
              <p style={{ color: 'var(--text-secondary)' }}>AI readmission prediction complete</p>
            </div>

            <div className="card" style={{ background: 'var(--primary-light)', borderColor: 'rgba(13, 148, 136, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Readmission Probability</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{predictionResult.readmissionProbability}%</div>
              </div>
              <span className={`badge badge-${predictionResult.riskCategory.toLowerCase()}`} style={{ fontSize: '0.95rem', padding: '0.4rem 1.1rem' }}>
                {predictionResult.riskCategory} Risk
              </span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem' }}>Vulnerability Triggers:</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                {predictionResult.keyContributors.map((c, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>{c.details}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem' }}>Automated Guidelines:</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                {predictionResult.recommendations.map((r, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>{r}</li>
                ))}
              </ul>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setPredictionResult(null)}>
              Acknowledge Assessment
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;
