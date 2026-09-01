import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  FaSearch, 
  FaFileCsv, 
  FaSpinner, 
  FaDatabase, 
  FaUserShield,
  FaFileAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ResearcherDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [raceFilter, setRaceFilter] = useState('All');
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    try {
      const patientRes = await API.get('/patients');
      const statsRes = await API.get('/analytics/trends');

      if (patientRes.data && statsRes.data) {
        setPatients(patientRes.data.data);
        setFilteredPatients(patientRes.data.data);
        setStats(statsRes.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to retrieve research data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = patients;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.patientId.toLowerCase().includes(q) ||
        p.ageGroup.toLowerCase().includes(q) ||
        (p.admissionHistory && p.admissionHistory[0]?.primaryDiagnosis.toLowerCase().includes(q))
      );
    }

    if (raceFilter !== 'All') {
      result = result.filter(p => p.race === raceFilter);
    }

    setFilteredPatients(result);
  }, [search, raceFilter, patients]);

  // CSV Exporter (HTML5 Blob technique)
  const handleExportCSV = () => {
    if (filteredPatients.length === 0) {
      toast.error('No records available to export');
      return;
    }

    toast.success('Compiling anonymized CSV dataset...');

    // Header row
    let csvContent = 'PatientID,AgeGroup,Gender,Race,TimeInHospital,NumLabProcedures,NumMedications,NumDiagnoses,PrimaryDiagnosis,SecondaryDiagnosis,MaxGluSerum,HbA1cResult,ChangeInMeds,DiabetesMed,IsReadmitted,ReadmissionTime\n';

    // Loop records
    filteredPatients.forEach(p => {
      const ad = p.admissionHistory && p.admissionHistory.length > 0 ? p.admissionHistory[0] : {};
      
      const row = [
        p.patientId,
        p.ageGroup,
        p.gender,
        p.race,
        ad.timeInHospital || 0,
        ad.numLabProcedures || 0,
        ad.numMedications || 0,
        ad.numDiagnoses || 0,
        `"${ad.primaryDiagnosis || ''}"`,
        `"${ad.secondaryDiagnosis || ''}"`,
        ad.maxGluSerum || 'None',
        ad.a1cResult || 'None',
        ad.changeInMeds ? 'Yes' : 'No',
        ad.diabetesMed ? 'Yes' : 'No',
        p.isReadmitted ? 'Yes' : 'No',
        p.readmissionTime || 'No'
      ].join(',');

      csvContent += row + '\n';
    });

    // Download triggers
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `anonymized_diabetes_readmissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Population Research Hub</h1>
          <p className="page-subtitle">Access HIPAA-compliant anonymized clinical trial datasets and analytics</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV}>
          <FaFileCsv />
          <span>Export CSV Dataset</span>
        </button>
      </div>

      {/* Info Warning Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--info-light)', borderColor: 'rgba(6, 182, 212, 0.15)', marginBottom: '1.5rem', padding: '1rem' }}>
        <FaUserShield style={{ fontSize: '1.75rem', color: 'var(--info)' }} />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong>Compliance Notice:</strong> Personally Identifiable Information (PII) such as Patient Names, Contact details, and Specific Visit dates have been cryptographically stripped or generalized to safeguard patient privacy in accordance with HIPAA standards.
        </p>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card flex-center" style={{ gap: '1.25rem', justifyContent: 'flex-start' }}>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FaDatabase style={{ fontSize: '1.5rem' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Available Encodings</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{filteredPatients.length} Patients</div>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '36px' }}
            placeholder="Search dataset by Patient ID, Age, or Diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select 
            className="form-control" 
            style={{ width: '180px', padding: '0.5rem' }}
            value={raceFilter}
            onChange={(e) => setRaceFilter(e.target.value)}
          >
            <option value="All">All Races</option>
            <option value="Caucasian">Caucasian</option>
            <option value="African American">African American</option>
            <option value="Asian">Asian</option>
            <option value="Hispanic">Hispanic</option>
          </select>
        </div>
      </div>

      {/* Anonymized Table */}
      {loading ? (
        <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '1rem' }}>
          <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          <p>Filtering anonymized clinical repository...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="card flex-center" style={{ height: '200px', flexDirection: 'column', gap: '0.5rem' }}>
          <FaFileAlt style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>No Population Cohorts Selected</h3>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>System Key</th>
                <th>Name / Ident</th>
                <th>Age Cohort</th>
                <th>Race</th>
                <th>Latest Primary Diagnosis</th>
                <th>Lab Procedures</th>
                <th>Medications</th>
                <th>Time Admitted (Days)</th>
                <th>Readmitted Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => {
                const latestAd = p.admissionHistory && p.admissionHistory.length > 0
                  ? p.admissionHistory[p.admissionHistory.length - 1]
                  : null;

                return (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{p.patientId}</td>
                    <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Anonymized Profile</td>
                    <td>{p.ageGroup} y/o</td>
                    <td>{p.race}</td>
                    <td>{latestAd ? latestAd.primaryDiagnosis : 'N/A'}</td>
                    <td>{latestAd ? latestAd.numLabProcedures : 0}</td>
                    <td>{latestAd ? latestAd.numMedications : 0}</td>
                    <td>{latestAd ? latestAd.timeInHospital : 0} days</td>
                    <td>
                      {p.isReadmitted ? (
                        <span className="badge badge-high">{p.readmissionTime}</span>
                      ) : (
                        <span className="badge badge-low">No Readmit</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

export default ResearcherDashboard;
