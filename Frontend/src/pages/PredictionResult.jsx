import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  Divider, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, TextField, IconButton
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const RISK_STYLES = {
  High: { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', badge: '#EF4444' },
  Moderate: { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', badge: '#F59E0B' },
  Medium: { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', badge: '#F59E0B' },
  Low: { bg: '#ECFDF5', border: '#A7F3D0', color: '#059669', badge: '#10B981' },
};

function AddTreatmentModal({ open, patientId, patientName, prediction, onClose, onCreated }) {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const ninetyDaysStr = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    treatment_plan: '',
    status: 'Active',
    diagnosis: '',
    notes: '',
    monitoring_parameters: '',
    start_date: todayStr,
    follow_up_date: '',
    end_date: ninetyDaysStr,
    medications: []
  });

  useEffect(() => {
    if (open) {
      setForm({
        treatment_plan: '',
        status: 'Active',
        diagnosis: '',
        notes: '',
        monitoring_parameters: '',
        start_date: new Date().toISOString().split('T')[0],
        follow_up_date: '',
        end_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        medications: []
      });
      setErr('');
    }
  }, [open]);

  const handleAddMed = () => {
    setForm(p => ({ ...p, medications: [...p.medications, { name: '', dosage: '', frequency: 'Once daily' }] }));
  };

  const handleRemoveMed = (index) => {
    setForm(p => ({ ...p, medications: p.medications.filter((_, i) => i !== index) }));
  };

  const handleMedChange = (index, field, value) => {
    setForm(p => {
      const updated = [...p.medications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...p, medications: updated };
    });
  };

  const handleCreate = async () => {
    if (!form.treatment_plan.trim()) {
      setErr('Please enter a treatment plan.');
      return;
    }
    setCreating(true);
    setErr('');
    try {
      const predId = prediction._id || prediction.id;
      const cleanMeds = form.medications
        .filter(m => m.name.trim() !== '')
        .map(m => ({ name: m.name.trim(), dosage: m.dosage.trim() || 'As prescribed', frequency: m.frequency.trim() || 'As directed' }));

      const payload = {
        patient_id: patientId,
        prediction_id: predId,
        doctor_id: user?.email || 'Dr. Doctor',
        treatment_plan: form.treatment_plan.trim(),
        medications: cleanMeds,
        status: form.status,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : new Date().toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : new Date(Date.now() + 90 * 86400000).toISOString(),
        follow_up_date: form.follow_up_date ? new Date(form.follow_up_date).toISOString() : null,
        diagnosis: form.diagnosis.trim() || null,
        notes: form.notes.trim() || null,
        monitoring_parameters: form.monitoring_parameters.trim() || null,
      };

      const res = await api.post('/api/v1/treatments', payload);
      onCreated(res.data);
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Failed to create treatment plan.');
    } finally {
      setCreating(false);
    }
  };

  if (!prediction) return null;
  const riskProb = Math.round((prediction.readmission_risk_score || prediction.model1_probability || 0) * 100);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MedicalServicesRoundedIcon sx={{ color: '#0F6CBD', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>ADD TREATMENT PLAN</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Create treatment plan based on AI Risk Assessment</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {err && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{err}</Alert>}

        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Patient</Typography>
            <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{patientName} ({patientId})</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>AI Assessment</Typography>
            <Chip
              label={`${prediction.risk_level} Risk — ${riskProb}% Probability`}
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: prediction.risk_level === 'High' ? '#FEF2F2' : '#EFF6FF', color: prediction.risk_level === 'High' ? '#DC2626' : '#0F6CBD' }}
            />
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>
              Treatment Plan <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              size="small" fullWidth multiline minRows={2}
              value={form.treatment_plan}
              onChange={e => setForm(p => ({ ...p, treatment_plan: e.target.value }))}
              placeholder="Enter comprehensive treatment plan guidelines..."
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>Diagnosis</Typography>
            <TextField size="small" fullWidth value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} placeholder="Primary diagnosis..." sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>Treatment Status</Typography>
            <TextField select size="small" fullWidth value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}>
              {['Active', 'In Progress', 'Completed', 'Pending Follow-up', 'Discontinued', 'Cancelled', 'Paused'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>Start Date</Typography>
            <TextField type="date" size="small" fullWidth value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>Follow-up Date</Typography>
            <TextField type="date" size="small" fullWidth value={form.follow_up_date} onChange={e => setForm(p => ({ ...p, follow_up_date: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>End Date</Typography>
            <TextField type="date" size="small" fullWidth value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Medications</Typography>
              <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleAddMed} sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
                + Add Medication
              </Button>
            </Box>
            {form.medications.length === 0 ? (
              <Box sx={{ py: 2, textAlign: 'center', color: '#94A3B8', border: '1px dashed #CBD5E1', borderRadius: '10px' }}>
                <Typography sx={{ fontSize: '0.8rem' }}>No medications added to this plan yet.</Typography>
              </Box>
            ) : (
              form.medications.map((m, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <TextField size="small" placeholder="Medication Name" value={m.name} onChange={e => handleMedChange(idx, 'name', e.target.value)} sx={{ flex: 2, '& .MuiInputBase-root': { borderRadius: '8px' } }} />
                  <TextField size="small" placeholder="Dosage (e.g. 500mg)" value={m.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { borderRadius: '8px' } }} />
                  <TextField select size="small" value={m.frequency} onChange={e => handleMedChange(idx, 'frequency', e.target.value)} sx={{ flex: 1.5, '& .MuiInputBase-root': { borderRadius: '8px' } }}>
                    {['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 8 hours', 'Every 12 hours', 'As needed', 'As directed'].map(o => (
                      <MenuItem key={o} value={o}>{o}</MenuItem>
                    ))}
                  </TextField>
                  <IconButton size="small" color="error" onClick={() => handleRemoveMed(idx)}>
                    <CloseRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ))
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>Doctor Notes</Typography>
            <TextField size="small" fullWidth multiline minRows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Clinical notes & instructions..." sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>Monitoring Parameters</Typography>
            <TextField size="small" fullWidth value={form.monitoring_parameters} onChange={e => setForm(p => ({ ...p, monitoring_parameters: e.target.value }))} placeholder="e.g. Blood pressure daily, Blood glucose weekly..." sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ fontWeight: 700, borderRadius: '10px' }}>Cancel</Button>
        <Button onClick={handleCreate} disabled={creating} variant="contained" startIcon={creating ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AddRoundedIcon />} sx={{ fontWeight: 700, borderRadius: '10px', bgcolor: '#0F6CBD' }}>
          {creating ? 'Creating...' : 'Create Treatment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PredictionResult() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const normRole = (role || user?.role || '').toLowerCase().replace(/ /g, '');
  const isDoctor = normRole === 'doctor';
  const historyPath = (normRole === 'researcher' || normRole === 'healthcareresearcher')
    ? '/researcher/predictions'
    : ((normRole === 'admin' || normRole === 'hospitaladministrator' || normRole === 'hospitaladmin')
      ? '/admin/predictions'
      : '/doctor/predictions');
  
  const [prediction, setPrediction] = useState(location.state?.prediction || null);
  const [loading, setLoading] = useState(!location.state?.prediction);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Treatment linking state
  const [hasTreatment, setHasTreatment] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  useEffect(() => {
    if (!prediction && id) {
      setLoading(true);
      api.get(`/api/v1/prediction/${id}`)
        .then(res => setPrediction(res.data))
        .catch(() => setError('Failed to load prediction details.'))
        .finally(() => setLoading(false));
    }
  }, [id, prediction]);

  const predId = prediction?._id || prediction?.id || id;

  useEffect(() => {
    if (predId) {
      api.get(`/api/v1/treatments/prediction/${predId}`)
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setHasTreatment(true);
          }
        })
        .catch(() => {});
    }
  }, [predId]);

  const handleDownloadPDF = async () => {
    if (!predId) return;
    setDownloading(true);
    try {
      const res = await api.get(`/api/v1/prediction/${predId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prediction_report_${prediction?.patient_id || 'result'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ color: '#0F6CBD' }} />
        <Typography sx={{ mt: 2, fontWeight: 600, color: '#64748B' }}>Loading Prediction Result...</Typography>
      </Box>
    );
  }

  if (error || !prediction) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>{error || 'Prediction result not found.'}</Alert>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  const riskLevel = prediction.risk_level || 'Low';
  const riskStyle = RISK_STYLES[riskLevel] || RISK_STYLES.Low;
  
  const rawProb = prediction.model1_probability ?? prediction.readmission_risk_score ?? 0;
  const probPercent = typeof rawProb === 'number' ? `${Math.round(rawProb * 100)}%` : String(rawProb);

  const features = prediction.features_used || {};
  const dateStr = prediction.prediction_date
    ? new Date(prediction.prediction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 6 }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)} sx={{ fontWeight: 700, color: '#64748B' }}>
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<HistoryRoundedIcon />}
            onClick={() => navigate(historyPath)}
            sx={{ borderRadius: '10px', fontWeight: 700, borderColor: '#CBD5E1', color: '#334155' }}
          >
            Prediction History
          </Button>
          <Button
            variant="contained"
            startIcon={downloading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <DownloadRoundedIcon />}
            onClick={handleDownloadPDF}
            disabled={downloading}
            sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#0F6CBD' }}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      {/* Main Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px', border: '1px solid #E2E8F0', p: { xs: 3, sm: 4 },
          bgcolor: '#FFFFFF', boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
        }}
      >
        {/* Header */}
        <Box sx={{ borderBottom: '2px solid #F1F5F9', pb: 2.5, mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PsychologyRoundedIcon sx={{ color: '#0F6CBD', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#0F172A' }}>
                AI HEALTH PREDICTION RESULT
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                Clinical Readmission Risk Assessment
              </Typography>
            </Box>
          </Box>
          <Chip label="CONFIDENTIAL MEDICAL REPORT" size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }} />
        </Box>

        {/* 1. Patient Information */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonRoundedIcon sx={{ color: '#0F6CBD', fontSize: 20 }} /> PATIENT INFORMATION
          </Typography>
          <Grid container spacing={2} sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '14px', border: '1px solid #F1F5F9' }}>
            <Grid item xs={12} sm={3}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Patient Name</Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                {prediction.patient_name || 'Patient'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Patient ID</Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                {prediction.patient_id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Prediction Date</Typography>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                {dateStr}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Attending Doctor</Typography>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                {prediction.doctor_name || prediction.predicted_by || 'Dr. Doctor'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* 2. AI Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonitorHeartRoundedIcon sx={{ color: '#0F6CBD', fontSize: 20 }} /> AI PREDICTION SUMMARY
          </Typography>
          <Box
            sx={{
              p: 3, borderRadius: '16px', bgcolor: riskStyle.bg, border: `1.5px solid ${riskStyle.border}`,
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 3
            }}
          >
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: riskStyle.color, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                Readmission Risk Level
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: riskStyle.color, lineHeight: 1.1 }}>
                  {riskLevel.toUpperCase()} RISK
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: '#475569', mt: 1 }}>
                {prediction.clinical_interpretation || prediction.notes || 'Patient demonstrates characteristic indicators evaluated by ML pipeline.'}
              </Typography>
            </Box>

            <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, bgcolor: '#FFFFFF', p: 2.5, borderRadius: '14px', border: `1px solid ${riskStyle.border}` }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Calculated Probability
              </Typography>
              <Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: riskStyle.color, lineHeight: 1 }}>
                {probPercent}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 3. Input Health Data */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentRoundedIcon sx={{ color: '#0F6CBD', fontSize: 20 }} /> INPUT HEALTH DATA
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Age', val: features.age || '—' },
              { label: 'Gender', val: features.gender || '—' },
              { label: 'Blood Pressure', val: features.blood_pressure_systolic ? `${features.blood_pressure_systolic}/${features.blood_pressure_diastolic || 80} mmHg` : '—' },
              { label: 'Heart Rate', val: features.heart_rate ? `${features.heart_rate} bpm` : '—' },
              { label: 'Temperature', val: features.body_temperature ? `${features.body_temperature} °C` : '—' },
              { label: 'SpO2', val: features.spo2 ? `${features.spo2}%` : '—' },
              { label: 'Blood Glucose', val: features.blood_glucose ? `${features.blood_glucose} mg/dL` : '—' },
              { label: 'HbA1c', val: features.hba1c ? `${features.hba1c}%` : '—' },
            ].map(({ label, val }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Box sx={{ p: 1.8, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', mt: 0.2 }}>{val}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 4. AI Model Information */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedicalServicesRoundedIcon sx={{ color: '#0F6CBD', fontSize: 20 }} /> AI MODEL INFORMATION
          </Typography>
          <Grid container spacing={2} sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '14px', border: '1px solid #F1F5F9' }}>
            <Grid item xs={12} sm={4}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Model Name</Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>HealthForecast ML Pipeline</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Model Version</Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>v2.4.0 (Dual-Model Ensemble)</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Prediction ID</Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{String(predId)}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 2 }} />
        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center' }}>
          DISCLAIMER: This AI-generated prediction is intended strictly for clinical decision support and should not replace professional medical judgment.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: '10px', fontWeight: 700 }}>
            Back
          </Button>
          <Button variant="outlined" startIcon={<HistoryRoundedIcon />} onClick={() => navigate(historyPath)} sx={{ borderRadius: '10px', fontWeight: 700 }}>
            Prediction History
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownloadPDF}
            sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#0F6CBD' }}
          >
            Download PDF Report
          </Button>

          {isDoctor && (
            hasTreatment ? (
              <Button
                variant="contained"
                startIcon={<MedicalServicesRoundedIcon />}
                onClick={() => navigate('/doctor/treatment')}
                sx={{ borderRadius: '10px', fontWeight: 800, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
              >
                View Treatment
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<MedicalServicesRoundedIcon />}
                onClick={() => setOpenAddModal(true)}
                sx={{ borderRadius: '10px', fontWeight: 800, bgcolor: '#D97706', '&:hover': { bgcolor: '#B45309' } }}
              >
                ADD TO TREATMENT
              </Button>
            )
          )}
        </Box>
      </Paper>

      {/* Add Treatment Modal */}
      <AddTreatmentModal
        open={openAddModal}
        patientId={prediction.patient_id}
        patientName={prediction.patient_name || prediction.patient_id}
        prediction={prediction}
        onClose={() => setOpenAddModal(false)}
        onCreated={() => setHasTreatment(true)}
      />
    </Box>
  );
}
