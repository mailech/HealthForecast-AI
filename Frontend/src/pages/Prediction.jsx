import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, TextField,
  MenuItem, CircularProgress, Alert, Chip, Divider, Avatar,
  InputAdornment, Autocomplete, Snackbar, Paper, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

// ─── Risk level colors ────────────────────────────────────────────────────────
const RISK_CONFIG = {
  High:   { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: <WarningAmberRoundedIcon /> },
  Medium: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: <WarningAmberRoundedIcon /> },
  Low:    { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: <CheckCircleRoundedIcon /> },
};

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ icon, title, children, action }) {
  return (
    <Card elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', mb: 2.5 }}>
      <Box sx={{
        px: 2.5, py: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #F1F5F9', bgcolor: '#FAFBFD'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ color: '#0F6CBD', display: 'flex' }}>{icon}</Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{title}</Typography>
        </Box>
        {action}
      </Box>
      <CardContent sx={{ p: 2.5 }}>{children}</CardContent>
    </Card>
  );
}

// ─── VitalField ───────────────────────────────────────────────────────────────
function VitalField({ label, value, onChange, unit, type = 'number', min, max, disabled }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>{label}</Typography>
      <TextField
        size="small"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        inputProps={{ min, max, step: type === 'number' ? 'any' : undefined }}
        InputProps={unit ? { endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{unit}</Typography></InputAdornment> } : undefined}
        sx={{ width: '100%', '& .MuiInputBase-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
        placeholder="—"
      />
    </Box>
  );
}

// ─── Condition Toggle ─────────────────────────────────────────────────────────
function ConditionToggle({ label, value, onChange, disabled }) {
  return (
    <Box
      onClick={() => !disabled && onChange(!value)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1, px: 1.8, py: 1.2,
        borderRadius: '10px', border: `2px solid ${value ? '#0F6CBD' : '#E2E8F0'}`,
        bgcolor: value ? '#EFF6FF' : '#FAFBFD', cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s', userSelect: 'none', opacity: disabled ? 0.6 : 1,
      }}
    >
      <Box sx={{ width: 18, height: 18, borderRadius: '5px', border: `2px solid ${value ? '#0F6CBD' : '#CBD5E1'}`,
        bgcolor: value ? '#0F6CBD' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {value && <CheckCircleRoundedIcon sx={{ fontSize: 13, color: '#fff' }} />}
      </Box>
      <Typography sx={{ fontSize: '0.82rem', fontWeight: value ? 700 : 500, color: value ? '#0F6CBD' : '#475569' }}>{label}</Typography>
    </Box>
  );
}

// ─── Add Treatment Modal ─────────────────────────────────────────────────────
function AddTreatmentModal({ open, patient, prediction, onClose, onCreated }) {
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
        patient_id: patient.patient_id,
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
      setErr(e?.response?.data?.detail || 'Failed to create treatment plan. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!patient || !prediction) return null;
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

        {/* Patient & AI Summary Header */}
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Patient</Typography>
            <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{patient.first_name} {patient.last_name} ({patient.patient_id})</Typography>
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
          {/* Treatment Plan */}
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

          {/* Diagnosis */}
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>Diagnosis</Typography>
            <TextField
              size="small" fullWidth
              value={form.diagnosis}
              onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))}
              placeholder="Primary diagnosis..."
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>Treatment Status</Typography>
            <TextField
              select size="small" fullWidth
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
            >
              {['Active', 'In Progress', 'Completed', 'Pending Follow-up', 'Discontinued', 'Cancelled', 'Paused'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Dates */}
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

          {/* Medications section */}
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

          {/* Notes */}
          <Grid item xs={12}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.7 }}>Doctor Notes</Typography>
            <TextField size="small" fullWidth multiline minRows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Clinical notes & instructions..." sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>

          {/* Monitoring parameters */}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Prediction() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const normRole = (role || user?.role || '').toLowerCase().replace(/ /g, '');
  const isDoctor = normRole === 'doctor';

  // Patients list
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Treatment summary
  const [treatments, setTreatments] = useState([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(false);

  // Vitals form
  const [vitals, setVitals] = useState({
    bp_systolic: '', bp_diastolic: '', blood_glucose: '', hba1c: '',
    heart_rate: '', spo2: '', body_temperature: '', bmi: '', cholesterol: ''
  });

  // Conditions
  const [conditions, setConditions] = useState({
    has_diabetes: false, has_hypertension: false, has_heart_disease: false, other: ''
  });

  // Notes
  const [symptomsNotes, setSymptomsNotes] = useState('');

  // Prediction state
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predError, setPredError] = useState('');

  // Download PDF
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Add Treatment Modal State
  const [openAddTreatmentModal, setOpenAddTreatmentModal] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: '' });

  // ─── Load patients ─────────────────────────────────────────────────────────
  useEffect(() => {
    setPatientsLoading(true);
    api.get('/api/v1/patients?limit=500')
      .then(res => {
        console.log("PATIENT API RESPONSE:", res.data);
        let list = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data?.patients)) {
          list = res.data.patients;
        } else if (Array.isArray(res.data?.data)) {
          list = res.data.data;
        } else if (Array.isArray(res.data?.items)) {
          list = res.data.items;
        }
        setPatients(list);
      })
      .catch(err => {
        console.error("PATIENT API ERROR:", err?.response?.status, err?.response?.data || err.message);
        setPatients([]);
      })
      .finally(() => setPatientsLoading(false));
  }, []);

  // ─── On patient select: load treatment ────────────────────────────────────
  const loadPatientData = useCallback(async (patient) => {
    if (!patient) {
      setTreatments([]);
      return;
    }
    const pid = patient.patient_id;
    setTreatmentsLoading(true);
    try {
      const res = await api.get(`/api/v1/treatments/patient/${pid}`);
      setTreatments(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTreatments([]);
    } finally {
      setTreatmentsLoading(false);
    }
  }, []);

  const handlePatientChange = (_, newVal) => {
    setSelectedPatient(newVal);
    setPredictionResult(null);
    setPredError('');
    loadPatientData(newVal);
  };

  // ─── Run Prediction ────────────────────────────────────────────────────────
  const handleRunPrediction = async () => {
    if (!selectedPatient) {
      setPredError('Please select a patient first.');
      return;
    }
    setPredError('');
    setPredicting(true);
    setPredictionResult(null);

    try {
      const payload = {
        patient_id: selectedPatient.patient_id,
        blood_pressure_systolic: vitals.bp_systolic ? parseInt(vitals.bp_systolic) : null,
        blood_pressure_diastolic: vitals.bp_diastolic ? parseInt(vitals.bp_diastolic) : null,
        blood_glucose: vitals.blood_glucose ? parseFloat(vitals.blood_glucose) : null,
        hba1c: vitals.hba1c ? parseFloat(vitals.hba1c) : null,
        heart_rate: vitals.heart_rate ? parseInt(vitals.heart_rate) : null,
        spo2: vitals.spo2 ? parseFloat(vitals.spo2) : null,
        body_temperature: vitals.body_temperature ? parseFloat(vitals.body_temperature) : null,
        bmi: vitals.bmi ? parseFloat(vitals.bmi) : null,
        cholesterol: vitals.cholesterol ? parseFloat(vitals.cholesterol) : null,
        has_diabetes: conditions.has_diabetes || null,
        has_hypertension: conditions.has_hypertension || null,
        has_heart_disease: conditions.has_heart_disease || null,
        other_conditions: conditions.other || null,
        symptoms_notes: symptomsNotes || null,
      };

      console.log('FRONTEND PREDICTION PAYLOAD:', JSON.stringify(payload, null, 2));

      const res = await api.post('/api/v1/prediction/simple-predict', payload);
      setPredictionResult(res.data);
      setSnack({ open: true, msg: 'AI prediction completed and saved to MongoDB.' });
    } catch (err) {
      setPredError(err?.response?.data?.detail || 'Prediction failed. Please try again.');
    } finally {
      setPredicting(false);
    }
  };

  // ─── Download PDF ─────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!predictionResult) return;
    const predId = predictionResult._id || predictionResult.id;
    if (!predId) { setSnack({ open: true, msg: 'Prediction ID not found. Cannot download PDF.' }); return; }
    setDownloadingPDF(true);
    try {
      const res = await api.get(`/api/v1/prediction/${predId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prediction_report_${selectedPatient?.patient_id || 'record'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setSnack({ open: true, msg: 'Failed to download PDF report.' });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleTreatmentCreated = (newTreatment) => {
    setTreatments(prev => [newTreatment, ...prev]);
    setSnack({ open: true, msg: 'Treatment created and saved to MongoDB successfully!' });
  };

  // ─── Derived ──────────────────────────────────────────────────────────────
  const activeMeds = treatments.filter(t => t.status === 'Active' || t.status === 'In Progress')
    .flatMap(t => t.medications || [])
    .filter(m => m.status !== 'Discontinued' && m.status !== 'Cancelled');
  const totalMedCount = activeMeds.length;

  const patientAge = selectedPatient?.date_of_birth
    ? Math.floor((new Date() - new Date(selectedPatient.date_of_birth)) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const rc = predictionResult ? (RISK_CONFIG[predictionResult.risk_level] || RISK_CONFIG.Low) : null;
  const predId = predictionResult ? (predictionResult._id || predictionResult.id) : null;

  const alreadyHasTreatment = predId
    ? treatments.some(t => String(t.prediction_id) === String(predId))
    : false;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#0F6CBD,#18A999)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(15,108,189,.25)' }}>
          <PsychologyRoundedIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A', lineHeight: 1.2 }}>AI Medical Assessment</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>Clinical AI-powered readmission risk prediction</Typography>
        </Box>
      </Box>

      {/* ─── 1. Select Patient ─────────────────────────────────────────── */}
      <SectionCard icon={<PersonRoundedIcon sx={{ fontSize: 20 }} />} title="Select Patient">
        <Autocomplete
          options={Array.isArray(patients) ? patients.filter(Boolean) : []}
          loading={patientsLoading}
          value={selectedPatient}
          onChange={handlePatientChange}
          getOptionLabel={p => {
            if (!p) return '';
            if (typeof p === 'string') return p;
            const fname = p.first_name || p.firstName || '';
            const lname = p.last_name || p.lastName || '';
            const pid = p.patient_id || p.patientId || p.id || '';
            const name = `${fname} ${lname}`.trim();
            return name ? `${name} (${pid})` : (pid || '');
          }}
          isOptionEqualToValue={(a, b) => {
            if (!a || !b) return a === b;
            const idA = a.patient_id || a.patientId || a._id || a.id;
            const idB = b.patient_id || b.patientId || b._id || b.id;
            return Boolean(idA && idB && idA === idB);
          }}
          renderOption={(props, p) => {
            if (!p) return null;
            const fname = p.first_name || p.firstName || '';
            const lname = p.last_name || p.lastName || '';
            const pid = p.patient_id || p.patientId || p.id || '';
            const gender = p.gender || '';
            const hospital = p.hospital || '';
            const initials = `${fname[0] || ''}${lname[0] || ''}`.toUpperCase() || 'P';
            return (
              <Box component="li" {...props} key={pid || props.key} sx={{ gap: 1.5 }}>
                <Avatar sx={{ width: 30, height: 30, bgcolor: '#0F6CBD', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                  {initials}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{fname} {lname}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>{pid} {gender ? `· ${gender}` : ''} {hospital ? `· ${hospital}` : ''}</Typography>
                </Box>
              </Box>
            );
          }}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Search patient by name or ID..."
              size="small"
              InputProps={{
                ...params?.InputProps,
                startAdornment: (
                  <>
                    <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 20, mr: 0.5 }} />
                    {params?.InputProps?.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {patientsLoading ? <CircularProgress size={18} /> : null}
                    {params?.InputProps?.endAdornment}
                  </>
                ),
              }}
              sx={{ '& .MuiInputBase-root': { borderRadius: '12px' } }}
            />
          )}
        />

        {/* Patient info strip */}
        {selectedPatient && (
          <Box sx={{ mt: 2, p: 1.8, borderRadius: '10px', bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#0369A1', fontWeight: 600, textTransform: 'uppercase' }}>Patient</Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{selectedPatient.first_name} {selectedPatient.last_name}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#0369A1', fontWeight: 600, textTransform: 'uppercase' }}>ID</Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{selectedPatient.patient_id}</Typography>
            </Box>
            {patientAge !== null && (
              <Box>
                <Typography sx={{ fontSize: '0.68rem', color: '#0369A1', fontWeight: 600, textTransform: 'uppercase' }}>Age</Typography>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{patientAge} yrs</Typography>
              </Box>
            )}
            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#0369A1', fontWeight: 600, textTransform: 'uppercase' }}>Gender</Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{selectedPatient.gender}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#0369A1', fontWeight: 600, textTransform: 'uppercase' }}>Hospital</Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{selectedPatient.hospital}</Typography>
            </Box>
          </Box>
        )}
      </SectionCard>

      {/* ─── 2. Medical Vitals ─────────────────────────────────────────── */}
      <SectionCard icon={<MonitorHeartRoundedIcon sx={{ fontSize: 20 }} />} title="Medical Vitals">
        <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mb: 2 }}>
          Enter available vitals. Unfilled fields use clinical defaults for the AI model.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={3}>
            <VitalField label="Systolic BP" value={vitals.bp_systolic} onChange={v => setVitals(p => ({...p, bp_systolic: v}))} unit="mmHg" min={60} max={250} />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <VitalField label="Diastolic BP" value={vitals.bp_diastolic} onChange={v => setVitals(p => ({...p, bp_diastolic: v}))} unit="mmHg" min={40} max={150} />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <VitalField label="Blood Glucose" value={vitals.blood_glucose} onChange={v => setVitals(p => ({...p, blood_glucose: v}))} unit="mg/dL" />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <VitalField label="HbA1c" value={vitals.hba1c} onChange={v => setVitals(p => ({...p, hba1c: v}))} unit="%" />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <VitalField label="Heart Rate" value={vitals.heart_rate} onChange={v => setVitals(p => ({...p, heart_rate: v}))} unit="bpm" min={30} max={250} />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <VitalField label="SpO2" value={vitals.spo2} onChange={v => setVitals(p => ({...p, spo2: v}))} unit="%" min={60} max={100} />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <VitalField label="Body Temperature" value={vitals.body_temperature} onChange={v => setVitals(p => ({...p, body_temperature: v}))} unit="°C" />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <VitalField label="BMI" value={vitals.bmi} onChange={v => setVitals(p => ({...p, bmi: v}))} unit="kg/m²" />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <VitalField label="Cholesterol" value={vitals.cholesterol} onChange={v => setVitals(p => ({...p, cholesterol: v}))} unit="mg/dL" />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ─── 3. Medical Conditions ─────────────────────────────────────── */}
      <SectionCard icon={<MedicalServicesRoundedIcon sx={{ fontSize: 20 }} />} title="Medical Conditions">
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <ConditionToggle label="Diabetes" value={conditions.has_diabetes} onChange={v => setConditions(p => ({...p, has_diabetes: v}))} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ConditionToggle label="Hypertension" value={conditions.has_hypertension} onChange={v => setConditions(p => ({...p, has_hypertension: v}))} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ConditionToggle label="Heart Disease" value={conditions.has_heart_disease} onChange={v => setConditions(p => ({...p, has_heart_disease: v}))} />
          </Grid>
        </Grid>
        <TextField
          label="Other Conditions / Diagnoses"
          placeholder="e.g. CKD stage 3, COPD, Anemia..."
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={conditions.other}
          onChange={e => setConditions(p => ({...p, other: e.target.value}))}
          sx={{ '& .MuiInputBase-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
        />
      </SectionCard>

      {/* ─── 4. Current Treatment Summary ──────────────────────────────── */}
      <SectionCard
        icon={<LocalPharmacyRoundedIcon sx={{ fontSize: 20 }} />}
        title="Current Treatment"
        action={
          selectedPatient ? (
            <Button size="small" variant="outlined" onClick={() => navigate('/doctor/treatment')}
              sx={{ fontSize: '0.72rem', fontWeight: 700, borderRadius: '8px' }}>
              View Treatment
            </Button>
          ) : null
        }
      >
        {!selectedPatient ? (
          <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8' }}>Select a patient to view treatment summary.</Typography>
        ) : treatmentsLoading ? (
          <Box sx={{ py: 1 }}><LinearProgress sx={{ borderRadius: 4 }} /></Box>
        ) : treatments.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalPharmacyRoundedIcon sx={{ color: '#CBD5E1', fontSize: 22 }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8' }}>No treatment records found for this patient.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center', px: 2, py: 1, borderRadius: '10px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{totalMedCount}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#065F46', fontWeight: 600, mt: 0.3 }}>Current Medications</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', px: 2, py: 1, borderRadius: '10px', bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F6CBD', lineHeight: 1 }}>{treatments.filter(t => t.status === 'Active').length}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#1D4ED8', fontWeight: 600, mt: 0.3 }}>Active Plans</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              {activeMeds.slice(0, 3).map((m, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0F6CBD', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>{m.name} {m.dosage && `— ${m.dosage}`} {m.frequency && `(${m.frequency})`}</Typography>
                </Box>
              ))}
              {activeMeds.length > 3 && (
                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mt: 0.3 }}>+{activeMeds.length - 3} more medications</Typography>
              )}
            </Box>
          </Box>
        )}
        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mt: 1.5 }}>
          💡 The AI model automatically uses treatment data from MongoDB. Manage medications in the Treatment page.
        </Typography>
      </SectionCard>

      {/* ─── 5. Symptoms / Clinical Notes ──────────────────────────────── */}
      <SectionCard icon={<AssignmentRoundedIcon sx={{ fontSize: 20 }} />} title="Symptoms / Clinical Notes">
        <TextField
          placeholder="Enter relevant symptoms, clinical observations, or notes for the AI assessment..."
          size="small"
          fullWidth
          multiline
          minRows={3}
          value={symptomsNotes}
          onChange={e => setSymptomsNotes(e.target.value)}
          sx={{ '& .MuiInputBase-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
        />
      </SectionCard>

      {/* ─── Error ───────────────────────────────────────────────────────── */}
      {predError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{predError}</Alert>}

      {/* ─── Run AI Prediction Button ─────────────────────────────────── */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        disabled={!selectedPatient || predicting}
        onClick={handleRunPrediction}
        startIcon={predicting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <PsychologyRoundedIcon />}
        sx={{
          py: 1.6, borderRadius: '14px', fontWeight: 800, fontSize: '1rem',
          background: 'linear-gradient(135deg, #0F6CBD 0%, #18A999 100%)',
          boxShadow: '0 4px 16px rgba(15,108,189,0.3)',
          '&:hover': { boxShadow: '0 6px 20px rgba(15,108,189,0.4)', transform: 'translateY(-1px)' },
          transition: 'all 0.2s ease', mb: 3,
        }}
      >
        {predicting ? 'Analyzing Patient Medical Data...' : 'RUN AI PREDICTION'}
      </Button>

      {/* ─── Prediction Result ────────────────────────────────────────── */}
      {predictionResult && rc && (
        <Card elevation={0} sx={{ borderRadius: '16px', border: `2px solid ${rc.border}`, bgcolor: rc.bg, overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, bgcolor: rc.color, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ color: '#fff', display: 'flex' }}>{rc.icon}</Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>AI PREDICTION RESULT</Typography>
            <Chip
              label={predictionResult.risk_level + ' Risk'}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 800, fontSize: '0.72rem', ml: 'auto' }}
            />
          </Box>
          <CardContent sx={{ p: 3 }}>
            {/* Patient info */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Patient Name</Typography>
                <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{predictionResult.patient_name || selectedPatient?.first_name + ' ' + selectedPatient?.last_name}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Patient ID</Typography>
                <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{predictionResult.patient_id}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Prediction Date / Time</Typography>
                <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {predictionResult.prediction_date ? new Date(predictionResult.prediction_date).toLocaleString() : new Date().toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Risk metrics */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', bgcolor: '#fff', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: rc.color, lineHeight: 1 }}>
                    {predictionResult.risk_level}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, mt: 0.5 }}>Risk Level</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', bgcolor: '#fff', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: rc.color, lineHeight: 1 }}>
                    {Math.round((predictionResult.readmission_risk_score || predictionResult.model1_probability || 0) * 100)}%
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, mt: 0.5 }}>Probability</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', bgcolor: '#fff', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                    {predictionResult.model2_prediction || predictionResult.model1_prediction || 'Readmission Forecast'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, mt: 0.5 }}>Actual Model Prediction</Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Clinical interpretation */}
            {predictionResult.clinical_interpretation && (
              <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E2E8F0', mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.5 }}>Clinical Interpretation</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: 1.6 }}>{predictionResult.clinical_interpretation}</Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {predId && (
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewRoundedIcon />}
                  onClick={() => navigate(`/doctor/prediction/result/${predId}`, { state: { prediction: predictionResult } })}
                  sx={{ fontWeight: 700, borderRadius: '10px' }}
                >
                  View Assessment
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={downloadingPDF ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <DownloadRoundedIcon />}
                onClick={handleDownloadPDF}
                disabled={downloadingPDF || !predId}
                sx={{ fontWeight: 700, borderRadius: '10px', bgcolor: '#0F6CBD' }}
              >
                {downloadingPDF ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<HistoryRoundedIcon />}
                onClick={() => navigate('/doctor/predictions')}
                sx={{ fontWeight: 700, borderRadius: '10px' }}
              >
                Prediction History
              </Button>

              {/* ─── ADD TO TREATMENT Button (Doctor Only) ──────────────── */}
              {isDoctor && (
                alreadyHasTreatment ? (
                  <Button
                    variant="contained"
                    startIcon={<MedicalServicesRoundedIcon />}
                    onClick={() => navigate('/doctor/treatment')}
                    sx={{ fontWeight: 800, borderRadius: '10px', bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                  >
                    View Treatment
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<MedicalServicesRoundedIcon />}
                    onClick={() => setOpenAddTreatmentModal(true)}
                    sx={{ fontWeight: 800, borderRadius: '10px', bgcolor: '#D97706', '&:hover': { bgcolor: '#B45309' } }}
                  >
                    ADD TO TREATMENT
                  </Button>
                )
              )}
            </Box>

            {alreadyHasTreatment && (
              <Typography sx={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, mt: 1.5 }}>
                ✓ Treatment already created for this prediction.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Add Treatment Modal ─────────────────────────────────────── */}
      <AddTreatmentModal
        open={openAddTreatmentModal}
        patient={selectedPatient}
        prediction={predictionResult}
        onClose={() => setOpenAddTreatmentModal(false)}
        onCreated={handleTreatmentCreated}
      />

      {/* ─── Snackbar ─────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snack.msg}
      />
    </Box>
  );
}
