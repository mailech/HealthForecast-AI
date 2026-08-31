import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, TextField,
  MenuItem, CircularProgress, Alert, Chip, Divider, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Snackbar
} from '@mui/material';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

// Categorical Constants
const RACES = ['Caucasian', 'AfricanAmerican', 'Hispanic', 'Asian', 'Other', 'Unknown'];
const GENDERS = ['Female', 'Male'];
const AGE_BRACKETS = ['[0-10)', '[10-20)', '[20-30)', '[30-40)', '[40-50)', '[50-60)', '[60-70)', '[70-80)', '[80-90)', '[90-100)'];

const ADMISSION_TYPES = [
  { id: 1, label: '1 - Emergency' },
  { id: 2, label: '2 - Urgent' },
  { id: 3, label: '3 - Elective' },
  { id: 4, label: '4 - Newborn' },
  { id: 5, label: '5 - Trauma Center' },
  { id: 6, label: '6 - Not Available' },
  { id: 7, label: '7 - Emergency Room' },
  { id: 8, label: '8 - Not Mapped' },
];

const DISCHARGE_DISPOSITIONS = [
  { id: 1, label: '1 - Discharged to Home' },
  { id: 2, label: '2 - Transferred to Short Term Hospital' },
  { id: 3, label: '3 - Transferred to SNF' },
  { id: 6, label: '6 - Home Health Service' },
  { id: 11, label: '11 - Expired' },
  { id: 18, label: '18 - Hospice / Home' },
];

const ADMISSION_SOURCES = [
  { id: 7, label: '7 - Emergency Room' },
  { id: 1, label: '1 - Physician Referral' },
  { id: 2, label: '2 - Clinic Referral' },
  { id: 3, label: '3 - HMO Referral' },
  { id: 4, label: '4 - Transfer from Hospital' },
  { id: 5, label: '5 - Transfer from SNF' },
  { id: 9, label: '9 - Internal' },
  { id: 17, label: '17 - Other' },
];

const MEDICAL_SPECIALTIES = [
  'InternalMedicine', 'Cardiology', 'Surgery-General',
  'Emergency/Trauma', 'Family/GeneralPractice', 'Pediatrics',
  'Nephrology', 'Orthopedics', 'Other', 'Unknown'
];

const MED_NAMES = [
  "metformin", "repaglinide", "nateglinide", "chlorpropamide", "glimepiride",
  "acetohexamide", "glipizide", "glyburide", "tolbutamide", "pioglitazone",
  "rosiglitazone", "acarbose", "miglitol", "troglitazone", "tolazamide",
  "examide", "citoglipton", "insulin", "glyburide-metformin",
  "glipizide-metformin", "glimepiride-pioglitazone",
  "metformin-rosiglitazone", "metformin-pioglitazone"
];

const MED_STATUS_OPTIONS = ['No', 'Steady', 'Up', 'Down'];

const RISK_STYLES = {
  High:   { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
  Medium: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
  Low:    { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
};

function ageToBracket(dob) {
  if (!dob) return '[50-60)';
  try {
    const birth = new Date(dob);
    const age = Math.floor((new Date() - birth) / (365.25 * 24 * 3600 * 1000));
    if (age < 10) return '[0-10)';
    if (age < 20) return '[10-20)';
    if (age < 30) return '[20-30)';
    if (age < 40) return '[30-40)';
    if (age < 50) return '[40-50)';
    if (age < 60) return '[50-60)';
    if (age < 70) return '[60-70)';
    if (age < 80) return '[70-80)';
    if (age < 90) return '[80-90)';
    return '[90-100)';
  } catch {
    return '[50-60)';
  }
}

function RiskBadge({ level }) {
  const r = RISK_STYLES[level] || RISK_STYLES.Low;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: '6px', bgcolor: r.bg, border: `1px solid ${r.border}` }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: r.color }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: r.text }}>{level}</Typography>
    </Box>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 0.5, borderBottom: '1px solid #F1F5F9' }}>
      {icon}
      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>{title}</Typography>
    </Box>
  );
}

/* =========================================================================
   CREATE TREATMENT DIALOG (Integrates with prediction result)
   ========================================================================= */
function CreateTreatmentDialog({ open, patient, result, user, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    treatment_plan: '',
    diagnosis: '',
    notes: '',
    medication_name: '',
    medication_dosage: '40 mg',
    medication_frequency: 'Once daily'
  });

  useEffect(() => {
    if (result && open) {
      setForm({
        treatment_plan: `Readmission prevention plan based on AI Risk Assessment (${result.risk_level}).`,
        diagnosis: result.features_used?.diag_1 || '250.01',
        notes: result.clinical_interpretation || '',
        medication_name: 'Metformin',
        medication_dosage: '500 mg',
        medication_frequency: 'Once daily'
      });
      setErr('');
    }
  }, [result, open]);

  const handleSave = async () => {
    if (!form.treatment_plan.trim()) { setErr('Treatment plan is required.'); return; }
    setSaving(true); setErr('');
    try {
      const now = new Date();
      const followUp = new Date(now), endDate = new Date(now);
      const rl = result?.risk_level || 'Low';
      if (rl === 'High')   { followUp.setDate(followUp.getDate() + 7);  endDate.setDate(endDate.getDate() + 90); }
      if (rl === 'Medium') { followUp.setDate(followUp.getDate() + 14); endDate.setDate(endDate.getDate() + 60); }
      if (rl === 'Low')    { followUp.setDate(followUp.getDate() + 30); endDate.setDate(endDate.getDate() + 30); }
      
      const medications = form.medication_name.trim()
        ? [{ name: form.medication_name.trim(), dosage: form.medication_dosage.trim() || 'As prescribed', frequency: form.medication_frequency.trim() || 'Once daily' }]
        : [];

      await api.post('/api/v1/treatments', {
        patient_id: patient.patient_id,
        doctor_id: user?.email || 'doctor@hospital.com',
        treatment_plan: form.treatment_plan.trim(),
        diagnosis: form.diagnosis.trim() || null,
        notes: form.notes.trim() || null,
        medications,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        follow_up_date: followUp.toISOString(),
        status: 'Active',
        recovery_percentage: 0,
      });
      onCreated(); onClose();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Failed to create treatment.');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MedicalServicesRoundedIcon sx={{ color: '#1D4ED8', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Create Treatment Plan</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{patient?.first_name} {patient?.last_name} ({patient?.patient_id})</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {err && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: '0.8rem' }}>{err}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Treatment Plan *" multiline rows={3} value={form.treatment_plan} onChange={e => setForm(f => ({ ...f, treatment_plan: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }} />
          <TextField label="Primary Diagnosis" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }} />
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medication (optional)</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={4}><TextField label="Name" value={form.medication_name} onChange={e => setForm(f => ({ ...f, medication_name: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.82rem' } }} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Dosage" value={form.medication_dosage} onChange={e => setForm(f => ({ ...f, medication_dosage: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.82rem' } }} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Frequency" value={form.medication_frequency} onChange={e => setForm(f => ({ ...f, medication_frequency: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.82rem' } }} /></Grid>
            </Grid>
          </Box>
          <TextField label="Doctor Notes" multiline rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={saving} sx={{ borderRadius: '8px', color: '#64748B', fontSize: '0.82rem' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <MedicalServicesRoundedIcon />} sx={{ borderRadius: '8px', bgcolor: '#1D4ED8', fontWeight: 700, fontSize: '0.82rem', '&:hover': { bgcolor: '#1E40AF' } }}>
          {saving ? 'Creating...' : 'Create Treatment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* =========================================================================
   MAIN PREDICTION COMPONENT
   ========================================================================= */
export default function Prediction() {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  
  // Full Trained Model Feature Form State
  const [form, setForm] = useState({
    race: 'Caucasian',
    gender: 'Female',
    age: '[50-60)',
    admission_type_id: 1,
    discharge_disposition_id: 1,
    admission_source_id: 7,
    time_in_hospital: 3,
    num_lab_procedures: 40,
    num_procedures: 1,
    num_medications: 15,
    number_outpatient: 0,
    number_emergency: 0,
    number_inpatient: 0,
    diag_1: '250.01',
    diag_2: '401',
    diag_3: '272',
    number_diagnoses: 9,
    medical_specialty: 'InternalMedicine',
    change: 'No',
    diabetesMed: 'Yes',
    medications: MED_NAMES.reduce((acc, m) => {
      acc[m] = (m === 'metformin' || m === 'insulin') ? 'Steady' : 'No';
      return acc;
    }, {})
  });

  const [submitting, setSubmitting] = useState(false);
  const [predResult, setPredResult] = useState(null);
  const [predError, setPredError] = useState('');
  
  // Prediction History State
  const [predictionsHistory, setPredictionsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Delete Prediction Dialog State
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletePredId, setDeletePredId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Treatment Integration State
  const [txDialog, setTxDialog] = useState(false);
  const [existingTx, setExistingTx] = useState(null);
  const [checkingTx, setCheckingTx] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Load patients and initial prediction history
  const loadPredictionsHistory = useCallback(() => {
    setLoadingHistory(true);
    api.get('/api/v1/prediction?limit=500')
      .then(res => setPredictionsHistory(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPredictionsHistory([]))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    setLoadingPatients(true);
    api.get('/api/v1/patients?limit=500')
      .then(res => setPatients(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false));

    loadPredictionsHistory();
  }, [loadPredictionsHistory]);

  const checkExistingTreatment = useCallback(async (patientId) => {
    if (!patientId) return;
    setCheckingTx(true);
    try {
      const res = await api.get(`/api/v1/treatments/patient/${patientId}`);
      setExistingTx(res.data?.length > 0 ? res.data[0] : null);
    } catch { setExistingTx(null); }
    finally { setCheckingTx(false); }
  }, []);

  const handlePatientSelect = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    setPredResult(null); setPredError(''); setExistingTx(null);
    const p = Array.isArray(patients) ? patients.find(pt => pt.patient_id === id) : null;
    setPatient(p || null);
    if (p) {
      setForm(f => ({
        ...f,
        gender: p.gender === 'Male' ? 'Male' : 'Female',
        age: ageToBracket(p.date_of_birth),
      }));
      checkExistingTreatment(id);
    }
  };

  const handleFieldChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleMedStatusChange = (medName, value) => {
    setForm(f => ({
      ...f,
      medications: {
        ...f.medications,
        [medName]: value
      }
    }));
  };

  const handleRunPrediction = async () => {
    if (!selectedPatientId) {
      setPredError('Please select or enter a Patient ID.');
      return;
    }
    setSubmitting(true);
    setPredError('');
    setPredResult(null);

    const payload = {
      patient_id: selectedPatientId,
      race: form.race,
      gender: form.gender,
      age: form.age,
      admission_type_id: Number(form.admission_type_id),
      discharge_disposition_id: Number(form.discharge_disposition_id),
      admission_source_id: Number(form.admission_source_id),
      time_in_hospital: Number(form.time_in_hospital),
      num_lab_procedures: Number(form.num_lab_procedures),
      num_procedures: Number(form.num_procedures),
      num_medications: Number(form.num_medications),
      number_outpatient: Number(form.number_outpatient),
      number_emergency: Number(form.number_emergency),
      number_inpatient: Number(form.number_inpatient),
      diag_1: form.diag_1 || '250.01',
      diag_2: form.diag_2 || '401',
      diag_3: form.diag_3 || '272',
      number_diagnoses: Number(form.number_diagnoses),
      medical_specialty: form.medical_specialty,
      change: form.change,
      diabetesMed: form.diabetesMed,
      medications: form.medications
    };

    try {
      // 1. Run inference via backend trained model
      const res = await api.post('/api/v1/prediction/predict', payload);
      const predictionOutput = res.data;

      // 2. Persist prediction analysis to database
      const savePayload = {
        patient_id: selectedPatientId,
        model1_probability: predictionOutput.model1_probability,
        model1_prediction: predictionOutput.model1_prediction,
        model2_probability: predictionOutput.model2_probability,
        model2_prediction: predictionOutput.model2_prediction,
        readmission_risk_score: predictionOutput.readmission_risk_score,
        risk_level: predictionOutput.risk_level,
        clinical_interpretation: predictionOutput.clinical_interpretation,
        notes: predictionOutput.notes,
        features_used: payload
      };

      const savedRes = await api.post('/api/v1/prediction', savePayload);
      
      setPredResult({ ...predictionOutput, ...savedRes.data, features_used: payload });
      setSnackbar({ open: true, message: 'AI Assessment completed and saved to history.', severity: 'success' });
      
      // Refresh history list
      loadPredictionsHistory();
      checkExistingTreatment(selectedPatientId);
    } catch (e) {
      setPredError(e.response?.data?.detail || 'Failed to run prediction analysis.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePredictionClick = (id) => {
    setDeletePredId(id);
    setDeleteDialog(true);
  };

  const handleDeletePredictionConfirm = async () => {
    if (!deletePredId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/prediction/${deletePredId}`);
      setSnackbar({ open: true, message: 'Prediction record deleted successfully', severity: 'success' });
      setDeleteDialog(false);
      setDeletePredId(null);
      loadPredictionsHistory();
    } catch (e) {
      setSnackbar({ open: true, message: e.response?.data?.detail || 'Failed to delete prediction.', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  // Recent predictions displays ONLY latest 10 (sorted newest first)
  const recentPredictions = useMemo(() => {
    return predictionsHistory.slice(0, 10);
  }, [predictionsHistory]);

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return predictionsHistory;
    const q = historySearch.trim().toLowerCase();
    return predictionsHistory.filter(p =>
      p.patient_id?.toLowerCase().includes(q) ||
      p.risk_level?.toLowerCase().includes(q) ||
      p.model1_prediction?.toLowerCase().includes(q)
    );
  }, [predictionsHistory, historySearch]);

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', pb: 4 }}>
      
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
          AI Readmission Risk Assessment
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>
          Evaluate patient readmission risk and clinical indicators using trained machine learning models
        </Typography>
      </Box>

      {/* Main Grid: Input Form + Assessment Results */}
      <Grid container spacing={3}>

        {/* Left Column: Model Feature Inputs */}
        <Grid item xs={12} lg={8}>
          
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              
              {/* Patient Selection Banner */}
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 3 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                  Select Target Patient
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Select Target Patient"
                      value={selectedPatientId}
                      onChange={handlePatientSelect}
                      disabled={loadingPatients}
                      SelectProps={{ displayEmpty: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff', fontSize: '0.88rem' }
                      }}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                        Select Target Patient
                      </MenuItem>
                      {patients.map(pt => (
                        <MenuItem key={pt.patient_id} value={pt.patient_id} sx={{ fontSize: '0.85rem' }}>
                          {pt.first_name} {pt.last_name} ({pt.patient_id})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Patient ID"
                      placeholder="e.g. PAT-10001"
                      value={selectedPatientId}
                      onChange={e => {
                        const id = e.target.value;
                        setSelectedPatientId(id);
                        setPatient(null);
                        setPredResult(null);
                        setPredError('');
                        setExistingTx(null);
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff', fontSize: '0.88rem' } }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {predError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '0.85rem' }}>
                  {predError}
                </Alert>
              )}

              {/* Form Section 1: Patient Information */}
              <Box sx={{ mb: 3 }}>
                <SectionTitle icon={<PersonRoundedIcon sx={{ fontSize: 18, color: '#1D4ED8' }} />} title="1. Patient Demographics & Specialty" />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField select label="Race" fullWidth size="small" value={form.race} onChange={e => handleFieldChange('race', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}>
                      {RACES.map(r => <MenuItem key={r} value={r} sx={{ fontSize: '0.85rem' }}>{r}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField select label="Gender" fullWidth size="small" value={form.gender} onChange={e => handleFieldChange('gender', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}>
                      {GENDERS.map(g => <MenuItem key={g} value={g} sx={{ fontSize: '0.85rem' }}>{g}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField select label="Age Bracket" fullWidth size="small" value={form.age} onChange={e => handleFieldChange('age', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}>
                      {AGE_BRACKETS.map(a => <MenuItem key={a} value={a} sx={{ fontSize: '0.85rem' }}>{a}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField select label="Medical Specialty" fullWidth size="small" value={form.medical_specialty} onChange={e => handleFieldChange('medical_specialty', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}>
                      {MEDICAL_SPECIALTIES.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.85rem' }}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>

              {/* Form Section 2: Admission & Hospitalization History */}
              <Box sx={{ mb: 3 }}>
                <SectionTitle icon={<LocalHospitalRoundedIcon sx={{ fontSize: 18, color: '#0891B2' }} />} title="2. Admission & Hospitalization History" />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField select label="Admission Type" fullWidth size="small" value={form.admission_type_id} onChange={e => handleFieldChange('admission_type_id', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}>
                      {ADMISSION_TYPES.map(at => <MenuItem key={at.id} value={at.id} sx={{ fontSize: '0.85rem' }}>{at.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField select label="Admission Source" fullWidth size="small" value={form.admission_source_id} onChange={e => handleFieldChange('admission_source_id', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}>
                      {ADMISSION_SOURCES.map(as => <MenuItem key={as.id} value={as.id} sx={{ fontSize: '0.85rem' }}>{as.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField select label="Discharge Disposition" fullWidth size="small" value={form.discharge_disposition_id} onChange={e => handleFieldChange('discharge_disposition_id', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}>
                      {DISCHARGE_DISPOSITIONS.map(dd => <MenuItem key={dd.id} value={dd.id} sx={{ fontSize: '0.85rem' }}>{dd.label}</MenuItem>)}
                    </TextField>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField label="Days in Hospital" type="number" fullWidth size="small" value={form.time_in_hospital} onChange={e => handleFieldChange('time_in_hospital', e.target.value)} inputProps={{ min: 1, max: 14 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label="Outpatient Visits" type="number" fullWidth size="small" value={form.number_outpatient} onChange={e => handleFieldChange('number_outpatient', e.target.value)} inputProps={{ min: 0 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label="Emergency Visits" type="number" fullWidth size="small" value={form.number_emergency} onChange={e => handleFieldChange('number_emergency', e.target.value)} inputProps={{ min: 0 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label="Inpatient Visits" type="number" fullWidth size="small" value={form.number_inpatient} onChange={e => handleFieldChange('number_inpatient', e.target.value)} inputProps={{ min: 0 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                </Grid>
              </Box>

              {/* Form Section 3: Clinical & Diagnosis Information */}
              <Box sx={{ mb: 3 }}>
                <SectionTitle icon={<AssignmentRoundedIcon sx={{ fontSize: 18, color: '#7C3AED' }} />} title="3. Diagnosis & Procedure Metrics" />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Primary Diagnosis (ICD-9)" fullWidth size="small" value={form.diag_1} onChange={e => handleFieldChange('diag_1', e.target.value)} placeholder="e.g. 250.01" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Secondary Diagnosis (ICD-9)" fullWidth size="small" value={form.diag_2} onChange={e => handleFieldChange('diag_2', e.target.value)} placeholder="e.g. 401" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Tertiary Diagnosis (ICD-9)" fullWidth size="small" value={form.diag_3} onChange={e => handleFieldChange('diag_3', e.target.value)} placeholder="e.g. 272" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField label="Lab Procedures" type="number" fullWidth size="small" value={form.num_lab_procedures} onChange={e => handleFieldChange('num_lab_procedures', e.target.value)} inputProps={{ min: 1 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label="Procedures" type="number" fullWidth size="small" value={form.num_procedures} onChange={e => handleFieldChange('num_procedures', e.target.value)} inputProps={{ min: 0 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label="Total Medications" type="number" fullWidth size="small" value={form.num_medications} onChange={e => handleFieldChange('num_medications', e.target.value)} inputProps={{ min: 1 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label="Number of Diagnoses" type="number" fullWidth size="small" value={form.number_diagnoses} onChange={e => handleFieldChange('number_diagnoses', e.target.value)} inputProps={{ min: 1, max: 16 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }} />
                  </Grid>
                </Grid>
              </Box>

              {/* Form Section 4: Medication Features Grid */}
              <Box sx={{ mb: 3 }}>
                <SectionTitle icon={<LocalPharmacyRoundedIcon sx={{ fontSize: 18, color: '#059669' }} />} title="4. Medication Features & Status (23 Medications)" />
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField select label="Medication Change During Visit?" fullWidth size="small" value={form.change} onChange={e => handleFieldChange('change', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}>
                      <MenuItem value="No" sx={{ fontSize: '0.85rem' }}>No Change</MenuItem>
                      <MenuItem value="Ch" sx={{ fontSize: '0.85rem' }}>Ch (Medication Changed)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select label="On Diabetes Medication?" fullWidth size="small" value={form.diabetesMed} onChange={e => handleFieldChange('diabetesMed', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}>
                      <MenuItem value="Yes" sx={{ fontSize: '0.85rem' }}>Yes</MenuItem>
                      <MenuItem value="No" sx={{ fontSize: '0.85rem' }}>No</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#FAFAFA' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                    Specific Medication Dosage Status (No / Steady / Up / Down)
                  </Typography>
                  
                  <Grid container spacing={1.5}>
                    {MED_NAMES.map(med => (
                      <Grid item xs={12} sm={6} md={4} key={med}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderRadius: '8px', bgcolor: '#fff', border: '1px solid #E2E8F0' }}>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>
                            {med}
                          </Typography>
                          <TextField
                            select
                            size="small"
                            value={form.medications[med] || 'No'}
                            onChange={e => handleMedStatusChange(med, e.target.value)}
                            sx={{
                              width: 100,
                              '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }
                            }}
                          >
                            {MED_STATUS_OPTIONS.map(opt => (
                              <MenuItem key={opt} value={opt} sx={{ fontSize: '0.78rem' }}>{opt}</MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

              </Box>

              {/* Action Button */}
              <Box sx={{ pt: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleRunPrediction}
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <PsychologyRoundedIcon />}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#1D4ED8',
                    py: 1.4,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(29,78,216,0.3)',
                    '&:hover': { bgcolor: '#1E40AF' }
                  }}
                >
                  {submitting ? 'Evaluating Trained ML Pipeline...' : 'Run AI Readmission Assessment'}
                </Button>
              </Box>

            </CardContent>
          </Card>

        </Grid>

        {/* Right Column: Prediction Results Output */}
        <Grid item xs={12} lg={4}>

          {/* Inference Output Card */}
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                  AI Risk Prediction Result
                </Typography>
                {predResult && <RiskBadge level={predResult.risk_level} />}
              </Box>

              {!predResult && !submitting && (
                <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
                  <PsychologyRoundedIcon sx={{ fontSize: 48, color: '#CBD5E1' }} />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>
                    No prediction available
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', maxWidth: 260 }}>
                    Review the patient information and click "Run AI Readmission Assessment".
                  </Typography>
                </Box>
              )}

              {submitting && (
                <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={36} sx={{ color: '#1D4ED8' }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                    Running preprocessors & models...
                  </Typography>
                </Box>
              )}

              {predResult && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  
                  {/* Model 1 Box */}
                  <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                      Model 1 — Patient Risk Prediction (&lt; 30 days)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: predResult.model1_probability >= 0.5 ? '#DC2626' : '#059669' }}>
                        {(predResult.model1_probability * 100).toFixed(2)}%
                      </Typography>
                      <Chip
                        label={predResult.model1_prediction}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          bgcolor: predResult.model1_probability >= 0.5 ? '#FEF2F2' : '#ECFDF5',
                          color: predResult.model1_probability >= 0.5 ? '#DC2626' : '#059669',
                          border: `1px solid ${predResult.model1_probability >= 0.5 ? '#FECACA' : '#A7F3D0'}`
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Model 2 Box */}
                  <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                      Model 2 — Hospital Readmission Prediction
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: predResult.model2_probability >= 0.5 ? '#D97706' : '#059669' }}>
                        {(predResult.model2_probability * 100).toFixed(2)}%
                      </Typography>
                      <Chip
                        label={predResult.model2_prediction}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          bgcolor: predResult.model2_probability >= 0.5 ? '#FFFBEB' : '#ECFDF5',
                          color: predResult.model2_probability >= 0.5 ? '#D97706' : '#059669',
                          border: `1px solid ${predResult.model2_probability >= 0.5 ? '#FDE68A' : '#A7F3D0'}`
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Clinical Interpretation Banner */}
                  <Box sx={{
                    p: 2, borderRadius: '12px',
                    bgcolor: (RISK_STYLES[predResult.risk_level] || RISK_STYLES.Low).bg,
                    border: `1px solid ${(RISK_STYLES[predResult.risk_level] || RISK_STYLES.Low).border}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <WarningAmberRoundedIcon sx={{ fontSize: 16, color: (RISK_STYLES[predResult.risk_level] || RISK_STYLES.Low).text }} />
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: (RISK_STYLES[predResult.risk_level] || RISK_STYLES.Low).text, textTransform: 'uppercase' }}>
                        Clinical Interpretation
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                      {predResult.clinical_interpretation}
                    </Typography>
                  </Box>

                  {/* Treatment Plan Action */}
                  <Box sx={{ pt: 1, borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {checkingTx ? (
                      <CircularProgress size={20} sx={{ mx: 'auto', my: 1 }} />
                    ) : existingTx ? (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<OpenInNewRoundedIcon />}
                        onClick={() => navigate('/treatments')}
                        sx={{ borderRadius: '10px', bgcolor: '#10B981', fontWeight: 700, fontSize: '0.82rem', py: 1, '&:hover': { bgcolor: '#059669' } }}
                      >
                        View Existing Treatment
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<MedicalServicesRoundedIcon />}
                        onClick={() => setTxDialog(true)}
                        sx={{ borderRadius: '10px', bgcolor: '#1D4ED8', fontWeight: 700, fontSize: '0.82rem', py: 1, '&:hover': { bgcolor: '#1E40AF' } }}
                      >
                        Create Treatment Plan
                      </Button>
                    )}
                  </Box>

                </Box>
              )}

            </CardContent>
          </Card>

        </Grid>

      </Grid>

      {/* Bottom Section: Recent Predictions History (Latest 10) */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryRoundedIcon sx={{ color: '#1D4ED8', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                Recent Predictions (Latest 10)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setHistoryModalOpen(true)}
              sx={{ borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, borderColor: '#E2E8F0', color: '#475569' }}
            >
              View All ({predictionsHistory.length})
            </Button>
          </Box>

          {loadingHistory ? (
            <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>
          ) : recentPredictions.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', color: '#94A3B8' }}>
              <Typography sx={{ fontSize: '0.85rem' }}>No prediction history stored yet.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    {['Patient ID', 'Model 1 (Risk)', 'Model 2 (Readmission)', 'Risk Level', 'Date', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', py: 1.2, px: 2 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPredictions.map((row, idx) => {
                    const rowId = row._id || row.id || idx;
                    const m1Score = row.model1_probability !== undefined ? (row.model1_probability * 100).toFixed(1) + '%' : '—';
                    const m2Score = row.model2_probability !== undefined ? (row.model2_probability * 100).toFixed(1) + '%' : '—';
                    const dt = row.prediction_date ? new Date(row.prediction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

                    return (
                      <TableRow key={rowId} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                        <TableCell sx={{ py: 1.2, px: 2 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>{row.patient_id}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.2, px: 2 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>{m1Score}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.2, px: 2 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>{m2Score}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.2, px: 2 }}>
                          <RiskBadge level={row.risk_level || 'Low'} />
                        </TableCell>
                        <TableCell sx={{ py: 1.2, px: 2 }}>
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>{dt}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.2, px: 2 }}>
                          <Tooltip title="Delete Record">
                            <IconButton size="small" onClick={() => handleDeletePredictionClick(rowId)} sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Complete Prediction History Dialog */}
      <Dialog open={historyModalOpen} onClose={() => setHistoryModalOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #F1F5F9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <HistoryRoundedIcon sx={{ color: '#1D4ED8', fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                Complete Prediction History ({predictionsHistory.length})
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setHistoryModalOpen(false)} sx={{ color: '#94A3B8' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Filter history by Patient ID or Risk..."
            value={historySearch}
            onChange={e => setHistorySearch(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}
          />

          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400, borderRadius: '10px', border: '1px solid #F1F5F9' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['Patient ID', 'Model 1 (Risk)', 'Model 2 (Readmission)', 'Risk Level', 'Date', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', py: 1.2 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.map((row, idx) => {
                  const rowId = row._id || row.id || idx;
                  const m1Score = row.model1_probability !== undefined ? (row.model1_probability * 100).toFixed(1) + '%' : '—';
                  const m2Score = row.model2_probability !== undefined ? (row.model2_probability * 100).toFixed(1) + '%' : '—';
                  const dt = row.prediction_date ? new Date(row.prediction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

                  return (
                    <TableRow key={rowId} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                      <TableCell><Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>{row.patient_id}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>{m1Score}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>{m2Score}</Typography></TableCell>
                      <TableCell><RiskBadge level={row.risk_level || 'Low'} /></TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>{dt}</Typography></TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleDeletePredictionClick(rowId)} sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={() => setHistoryModalOpen(false)} sx={{ borderRadius: '8px', color: '#64748B' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Delete Prediction Record?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>
            Are you sure you want to delete this prediction record from the database history? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialog(false)} disabled={deleting} sx={{ borderRadius: '8px', color: '#64748B', fontSize: '0.82rem' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeletePredictionConfirm} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            sx={{ borderRadius: '8px', bgcolor: '#EF4444', fontWeight: 700, fontSize: '0.82rem', '&:hover': { bgcolor: '#DC2626' } }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Treatment Dialog */}
      <CreateTreatmentDialog
        open={txDialog}
        patient={patient || { patient_id: selectedPatientId, first_name: '', last_name: '' }}
        result={predResult}
        user={null}
        onClose={() => setTxDialog(false)}
        onCreated={() => {
          setSnackbar({ open: true, message: 'Treatment plan created successfully.', severity: 'success' });
          checkExistingTreatment(selectedPatientId);
        }}
      />

      {/* Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
