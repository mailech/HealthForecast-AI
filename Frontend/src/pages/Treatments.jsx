import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Avatar, LinearProgress, TextField, MenuItem, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  IconButton, Drawer, Divider, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Tooltip, Paper, Slider, Chip
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import NoteRoundedIcon from '@mui/icons-material/NoteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  'Active', 'In Progress', 'Completed', 'Pending Follow-up',
  'Discontinued', 'Cancelled', 'Paused'
];

const FREQUENCY_OPTIONS = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 8 hours', 'Every 12 hours', 'As needed', 'As directed'
];

const STATUS = {
  Active:               { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  'In Progress':        { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  Completed:            { color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE' },
  'Pending Follow-up':  { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  Cancelled:            { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
  Discontinued:         { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
  Paused:               { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
};

const STATUS_FILTER_OPTIONS = ['All', ...STATUS_OPTIONS];

// ─── Helper functions ──────────────────────────────────────────────────────────
function toInputDate(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.toISOString().split('T')[0];
  } catch { return ''; }
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

// ─── Sub-components defined OUTSIDE main component (required for React correctness)
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.Active;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.1, py: 0.3, borderRadius: '6px', bgcolor: s.bg, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: s.color }}>{status}</Typography>
    </Box>
  );
}

function SummaryCard({ label, value, color, loading }) {
  return (
    <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {loading
          ? <Box sx={{ height: 28, width: 40, bgcolor: '#F1F5F9', borderRadius: '6px', mb: 0.5 }} />
          : <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: color || '#0F172A', lineHeight: 1 }}>{value}</Typography>
        }
        <Typography sx={{ fontSize: '0.7rem', color: '#64748B', mt: 0.4, fontWeight: 500 }}>{label}</Typography>
      </CardContent>
    </Card>
  );
}

function TimelineRow({ label, date, done }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 0.6 }}>
      {done
        ? <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#10B981', flexShrink: 0 }} />
        : <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 14, color: '#CBD5E1', flexShrink: 0 }} />}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.75rem', color: done ? '#475569' : '#94A3B8', fontWeight: done ? 600 : 400 }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{date}</Typography>
      </Box>
    </Box>
  );
}

function FieldLabel({ children, required }) {
  return (
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.7 }}>
      {children}{required && <Box component="span" sx={{ color: '#EF4444', ml: 0.3 }}>*</Box>}
    </Typography>
  );
}

// ─── Medication Form Row (defined outside to prevent remount) ──────────────────
function MedicationRow({ med, index, onRemove, onChange, readOnly }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1.5, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 1 }}>
      <Box sx={{ flex: 2, minWidth: 120 }}>
        {readOnly
          ? <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>{med.name || '—'}</Typography>
          : <TextField
              size="small"
              placeholder="Medication name *"
              value={med.name}
              onChange={e => onChange(index, 'name', e.target.value)}
              fullWidth
              sx={{ '& .MuiInputBase-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
            />
        }
      </Box>
      <Box sx={{ flex: 1, minWidth: 90 }}>
        {readOnly
          ? <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>{med.dosage || '—'}</Typography>
          : <TextField
              size="small"
              placeholder="Dosage"
              value={med.dosage}
              onChange={e => onChange(index, 'dosage', e.target.value)}
              fullWidth
              sx={{ '& .MuiInputBase-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
            />
        }
      </Box>
      <Box sx={{ flex: 1.5, minWidth: 130 }}>
        {readOnly
          ? <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>{med.frequency || '—'}</Typography>
          : <TextField
              select
              size="small"
              value={med.frequency || 'Once daily'}
              onChange={e => onChange(index, 'frequency', e.target.value)}
              fullWidth
              sx={{ '& .MuiInputBase-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
            >
              {FREQUENCY_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
        }
      </Box>
      {!readOnly && (
        <IconButton size="small" color="error" onClick={() => onRemove(index)} sx={{ flexShrink: 0 }}>
          <DeleteForeverRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );
}

// ─── Edit Treatment Modal ──────────────────────────────────────────────────────
function EditTreatmentModal({ open, treatment, patient, doctors, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [form, setForm] = useState({
    status: 'Active', recovery_percentage: 0, treatment_plan: '',
    doctor_id: '', diagnosis: '', notes: '', monitoring_parameters: '',
    start_date: '', follow_up_date: '', end_date: '', medications: []
  });

  useEffect(() => {
    if (treatment && open) {
      setForm({
        status: treatment.status || 'Active',
        recovery_percentage: treatment.recovery_percentage ?? 0,
        treatment_plan: treatment.treatment_plan || '',
        doctor_id: treatment.doctor_id || '',
        diagnosis: treatment.diagnosis || '',
        notes: treatment.notes || '',
        monitoring_parameters: treatment.monitoring_parameters || '',
        start_date: toInputDate(treatment.start_date),
        follow_up_date: toInputDate(treatment.follow_up_date),
        end_date: toInputDate(treatment.end_date),
        medications: (treatment.medications || []).map(m => ({
          name: m.name || '', dosage: m.dosage || '', frequency: m.frequency || 'Once daily'
        }))
      });
      setSaveErr('');
    }
  }, [treatment, open]);

  const handleStatusChange = (val) => {
    setForm(prev => {
      const next = { ...prev, status: val };
      if (val === 'Completed') next.recovery_percentage = 100;
      return next;
    });
  };

  const handleAddMedication = () => {
    setForm(prev => ({ ...prev, medications: [...prev.medications, { name: '', dosage: '', frequency: 'Once daily' }] }));
  };

  const handleRemoveMedication = (index) => {
    setForm(prev => ({ ...prev, medications: prev.medications.filter((_, i) => i !== index) }));
  };

  const handleMedicationChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.medications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medications: updated };
    });
  };

  const handleSave = async () => {
    if (!form.treatment_plan.trim()) { setSaveErr('Treatment plan is required.'); return; }
    setSaving(true);
    setSaveErr('');
    try {
      const id = treatment._id || treatment.id;
      const cleanMeds = form.medications
        .filter(m => m.name.trim() !== '')
        .map(m => ({ name: m.name.trim(), dosage: m.dosage.trim() || 'As prescribed', frequency: m.frequency.trim() || 'As directed' }));

      const payload = {
        status: form.status,
        recovery_percentage: Number(form.recovery_percentage),
        treatment_plan: form.treatment_plan.trim(),
        doctor_id: form.doctor_id,
        diagnosis: form.diagnosis.trim() || null,
        notes: form.notes.trim() || null,
        monitoring_parameters: form.monitoring_parameters.trim() || null,
        medications: cleanMeds,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : new Date().toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : new Date(Date.now() + 90 * 86400000).toISOString(),
        follow_up_date: form.follow_up_date ? new Date(form.follow_up_date).toISOString() : null
      };

      const res = await api.put(`/api/v1/treatments/${id}`, payload);
      onSaved(res.data);
      onClose();
    } catch (e) {
      setSaveErr(e.response?.data?.detail || 'Failed to update treatment.');
    } finally {
      setSaving(false);
    }
  };

  if (!treatment) return null;
  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : treatment.patient_id;
  const sc = STATUS[form.status] || STATUS.Active;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MedicalServicesRoundedIcon sx={{ color: '#0F6CBD', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Edit Treatment Plan</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{patientName}</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {saveErr && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{saveErr}</Alert>}
        <Grid container spacing={2.5}>
          {/* Treatment Plan */}
          <Grid item xs={12}>
            <FieldLabel required>Treatment Plan</FieldLabel>
            <TextField
              size="small" fullWidth multiline minRows={2} value={form.treatment_plan}
              onChange={e => setForm(p => ({ ...p, treatment_plan: e.target.value }))}
              placeholder="Describe the treatment plan..."
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}
            />
          </Grid>

          {/* Doctor */}
          <Grid item xs={12} sm={6}>
            <FieldLabel>Assigned Doctor</FieldLabel>
            <TextField select size="small" fullWidth value={form.doctor_id}
              onChange={e => setForm(p => ({ ...p, doctor_id: e.target.value }))}
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}>
              <MenuItem value="">Select Doctor</MenuItem>
              {(doctors || []).map(d => (
                <MenuItem key={d.email} value={d.email}>{d.full_name || d.email}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FieldLabel>Treatment Status</FieldLabel>
            <TextField select size="small" fullWidth value={form.status}
              onChange={e => handleStatusChange(e.target.value)}
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }}>
              {STATUS_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
          </Grid>

          {/* Recovery */}
          <Grid item xs={12}>
            <FieldLabel>Recovery Progress — {form.recovery_percentage}%</FieldLabel>
            <Box sx={{ px: 1 }}>
              <Slider
                value={form.recovery_percentage}
                onChange={(_, val) => setForm(p => ({ ...p, recovery_percentage: val }))}
                min={0} max={100} step={5}
                sx={{ color: sc.color }}
              />
            </Box>
          </Grid>

          {/* Dates */}
          <Grid item xs={12} sm={4}>
            <FieldLabel>Treatment Started</FieldLabel>
            <TextField size="small" fullWidth type="date" value={form.start_date}
              onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel>Follow-up Date</FieldLabel>
            <TextField size="small" fullWidth type="date" value={form.follow_up_date}
              onChange={e => setForm(p => ({ ...p, follow_up_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel>Treatment End Date</FieldLabel>
            <TextField size="small" fullWidth type="date" value={form.end_date}
              onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>

          {/* Diagnosis */}
          <Grid item xs={12}>
            <FieldLabel>Diagnosis</FieldLabel>
            <TextField size="small" fullWidth value={form.diagnosis}
              onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))}
              placeholder="Primary diagnosis..."
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>

          {/* Medications */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <FieldLabel>Medications</FieldLabel>
              <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleAddMedication}
                sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
                Add Medication
              </Button>
            </Box>
            {form.medications.length === 0 ? (
              <Box sx={{ py: 2, textAlign: 'center', color: '#94A3B8', border: '1px dashed #E2E8F0', borderRadius: '10px' }}>
                <Typography sx={{ fontSize: '0.82rem' }}>No medications added yet</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', gap: 1, mb: 0.5, px: 1.5 }}>
                  <Typography sx={{ flex: 2, fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Medication Name</Typography>
                  <Typography sx={{ flex: 1, fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Dosage</Typography>
                  <Typography sx={{ flex: 1.5, fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Frequency</Typography>
                  <Box sx={{ width: 34 }} />
                </Box>
                {form.medications.map((med, index) => (
                  <MedicationRow
                    key={index}
                    med={med}
                    index={index}
                    onRemove={handleRemoveMedication}
                    onChange={handleMedicationChange}
                    readOnly={false}
                  />
                ))}
              </>
            )}
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <FieldLabel>Doctor Notes</FieldLabel>
            <TextField size="small" fullWidth multiline minRows={2} value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Clinical notes, observations..."
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>

          {/* Monitoring */}
          <Grid item xs={12}>
            <FieldLabel>Monitoring Parameters</FieldLabel>
            <TextField size="small" fullWidth value={form.monitoring_parameters}
              onChange={e => setForm(p => ({ ...p, monitoring_parameters: e.target.value }))}
              placeholder="e.g. Blood glucose weekly, BP twice daily..."
              sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
        <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ fontWeight: 700, borderRadius: '10px', minWidth: 100 }}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} variant="contained"
          startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveRoundedIcon />}
          sx={{ fontWeight: 700, borderRadius: '10px', bgcolor: '#0F6CBD', minWidth: 140 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── View Treatment Drawer ─────────────────────────────────────────────────────
function ViewTreatmentDrawer({ open, treatment, patient, onClose }) {
  const [linkedPrediction, setLinkedPrediction] = useState(null);

  useEffect(() => {
    if (treatment?.prediction_id && open) {
      api.get(`/api/v1/prediction/${treatment.prediction_id}`)
        .then(res => setLinkedPrediction(res.data))
        .catch(() => setLinkedPrediction(null));
    } else {
      setLinkedPrediction(null);
    }
  }, [treatment, open]);

  if (!treatment) return null;
  const s = STATUS[treatment.status] || STATUS.Active;
  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : treatment.patient_id;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, borderRadius: '16px 0 0 16px' } }}>
      <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MedicalServicesRoundedIcon sx={{ color: '#0F6CBD', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>Treatment Details</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{patientName}</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}><CloseRoundedIcon /></IconButton>
      </Box>

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        {/* Linked AI Prediction */}
        {treatment.prediction_id && (
          <Box sx={{ mb: 2.5, p: 2, borderRadius: '12px', bgcolor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase', mb: 0.5 }}>
              Linked AI Prediction
            </Typography>
            {linkedPrediction ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: linkedPrediction.risk_level === 'High' ? '#DC2626' : (linkedPrediction.risk_level === 'Medium' ? '#D97706' : '#059669') }}>
                    {linkedPrediction.risk_level} Risk Level
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                    Risk Probability: {Math.round((linkedPrediction.readmission_risk_score || linkedPrediction.model1_probability || 0) * 100)}%
                  </Typography>
                </Box>
                <Chip label={`ID: ${String(treatment.prediction_id).slice(-6)}`} size="small" sx={{ fontSize: '0.68rem', bgcolor: '#E0F2FE', fontWeight: 700 }} />
              </Box>
            ) : (
              <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                Prediction ID: {treatment.prediction_id}
              </Typography>
            )}
          </Box>
        )}

        {/* Status + Plan */}
        <Box sx={{ mb: 2 }}>
          <StatusBadge status={treatment.status} />
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mt: 1 }}>{treatment.treatment_plan}</Typography>
          {treatment.diagnosis && <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.5 }}>Diagnosis: {treatment.diagnosis}</Typography>}
        </Box>

        {/* Recovery */}
        {treatment.recovery_percentage !== undefined && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Recovery Progress</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: s.color }}>{treatment.recovery_percentage}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={treatment.recovery_percentage}
              sx={{ borderRadius: 4, height: 8, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: s.color } }} />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Timeline */}
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1 }}>Timeline</Typography>
        <TimelineRow label="Treatment Started" date={formatDate(treatment.start_date)} done={!!treatment.start_date} />
        <TimelineRow label="Follow-up Date" date={formatDate(treatment.follow_up_date)} done={false} />
        <TimelineRow label="Treatment End" date={formatDate(treatment.end_date)} done={treatment.status === 'Completed'} />

        <Divider sx={{ my: 2 }} />

        {/* Medications */}
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1.5 }}>Medications ({(treatment.medications || []).length})</Typography>
        {(treatment.medications || []).length === 0 ? (
          <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8' }}>No medications recorded.</Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, mb: 0.5, px: 1.5 }}>
            <Typography sx={{ flex: 2, fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Name</Typography>
            <Typography sx={{ flex: 1, fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Dosage</Typography>
            <Typography sx={{ flex: 1.5, fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Frequency</Typography>
          </Box>
        )}
        {(treatment.medications || []).map((m, i) => (
          <MedicationRow key={i} med={m} index={i} onRemove={() => {}} onChange={() => {}} readOnly />
        ))}

        {(treatment.notes || treatment.monitoring_parameters) && (
          <>
            <Divider sx={{ my: 2 }} />
            {treatment.notes && (
              <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.5 }}>Doctor Notes</Typography>
                <Typography sx={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.6 }}>{treatment.notes}</Typography>
              </Box>
            )}
            {treatment.monitoring_parameters && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.5 }}>Monitoring Parameters</Typography>
                <Typography sx={{ fontSize: '0.83rem', color: '#475569' }}>{treatment.monitoring_parameters}</Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Drawer>
  );
}

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────
function DeleteConfirmDialog({ open, onClose, onConfirm, deleting, treatmentName }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, fontSize: '1rem' }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <DeleteForeverRoundedIcon sx={{ color: '#EF4444', fontSize: 20 }} />
        </Box>
        Delete Treatment?
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: '0.875rem', color: '#475569' }}>
          Are you sure you want to permanently delete the treatment plan
          {treatmentName && <><strong> "{treatmentName}"</strong></>}?
          This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={deleting} variant="outlined" sx={{ fontWeight: 700, borderRadius: '10px', flex: 1 }}>Cancel</Button>
        <Button onClick={onConfirm} disabled={deleting} variant="contained" color="error"
          startIcon={deleting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <DeleteForeverRoundedIcon />}
          sx={{ fontWeight: 700, borderRadius: '10px', flex: 1 }}>
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Treatments({ readOnly = false }) {
  const { role } = useAuth();
  const normRole = (role || '').toLowerCase().replace(/ /g, '');
  const canWrite = !readOnly && (normRole === 'doctor' || normRole === 'admin' || normRole === 'sysadmin');

  const [treatments, setTreatments] = useState([]);
  const [patients, setPatients] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snack, setSnack] = useState({ open: false, msg: '' });

  // ─── Load data ─────────────────────────────────────────────────────────────
  const loadData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/api/v1/treatments?limit=200'),
      api.get('/api/v1/patients?limit=500'),
      api.get('/api/v1/treatments/doctors').catch(() => ({ data: [] }))
    ])
      .then(([tRes, pRes, dRes]) => {
        const ts = Array.isArray(tRes.data) ? tRes.data : [];
        setTreatments(ts);
        const pMap = {};
        (Array.isArray(pRes.data) ? pRes.data : []).forEach(p => { pMap[p.patient_id] = p; });
        setPatients(pMap);
        setDoctors(Array.isArray(dRes.data) ? dRes.data : []);
      })
      .catch(() => setError('Failed to load treatment data. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  // ─── Summary counts ────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    total: treatments.length,
    active: treatments.filter(t => t.status === 'Active').length,
    inProgress: treatments.filter(t => t.status === 'In Progress').length,
    completed: treatments.filter(t => t.status === 'Completed').length,
    pending: treatments.filter(t => t.status === 'Pending Follow-up').length,
  }), [treatments]);

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => treatments.filter(t => {
    const patient = patients[t.patient_id] || {};
    const name = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
    const pid = (t.patient_id || '').toLowerCase();
    const plan = (t.treatment_plan || '').toLowerCase();
    const s = searchTerm.toLowerCase();
    const matchesSearch = !s || name.includes(s) || pid.includes(s) || plan.includes(s);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [treatments, patients, searchTerm, statusFilter]);

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/treatments/${id}`);
      setTreatments(prev => prev.filter(t => (t._id || t.id) !== id));
      setSnack({ open: true, msg: 'Treatment deleted successfully.' });
    } catch (e) {
      setSnack({ open: true, msg: e?.response?.data?.detail || 'Failed to delete treatment.' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── Edit saved ──────────────────────────────────────────────────────────
  const handleEditSaved = (updated) => {
    setTreatments(prev => prev.map(t => (t._id || t.id) === (updated._id || updated.id) ? updated : t));
    setSnack({ open: true, msg: 'Treatment updated successfully.' });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#0F172A' }}>Treatments</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
            {readOnly ? 'View all patient treatment plans' : 'Manage and monitor patient treatment plans and medications'}
          </Typography>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} action={
          <Button size="small" onClick={loadData} color="error" sx={{ fontWeight: 700 }}>Retry</Button>
        }>{error}</Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <SummaryCard label="Total Treatments" value={counts.total} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <SummaryCard label="Active" value={counts.active} color="#10B981" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <SummaryCard label="In Progress" value={counts.inProgress} color="#3B82F6" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <SummaryCard label="Completed" value={counts.completed} color="#6366F1" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <SummaryCard label="Pending Follow-up" value={counts.pending} color="#F59E0B" loading={loading} />
        </Grid>
      </Grid>

      {/* Search + Filter */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by patient name, ID, or treatment plan..."
            size="small"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 240 }}
          />
          <TextField
            select size="small" value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }} label="Status">
            {STATUS_FILTER_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </TextField>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, ml: 'auto' }}>
            {filtered.length} Record{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={36} sx={{ color: '#0F6CBD' }} />
            <Typography sx={{ mt: 2, fontSize: '0.85rem', color: '#64748B' }}>Loading treatments...</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <MedicalServicesRoundedIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
            <Typography sx={{ fontWeight: 600, color: '#64748B' }}>No treatment records found.</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8', mt: 0.5 }}>
              {searchTerm || statusFilter !== 'All' ? 'Try adjusting your filters.' : 'No treatments have been created yet.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.72rem', color: '#64748B', border: 'none', py: 1.2 } }}>
                  <TableCell>Patient</TableCell>
                  <TableCell>Treatment Plan</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Medications</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Recovery</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((t, i) => {
                  const patient = patients[t.patient_id];
                  const pName = patient ? `${patient.first_name} ${patient.last_name}` : t.patient_id;
                  const doctor = doctors.find(d => d.email === t.doctor_id);
                  const medCount = (t.medications || []).length;
                  const s = STATUS[t.status] || STATUS.Active;

                  return (
                    <TableRow key={t._id || t.id || i} sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 1.3, fontSize: '0.85rem' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: '#0F6CBD', fontSize: '0.7rem', fontWeight: 700 }}>
                            {pName[0]?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.83rem', color: '#0F172A' }}>{pName}</Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>{t.patient_id}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 180 }}>
                        <Typography sx={{ fontSize: '0.83rem', color: '#0F172A', fontWeight: 600 }} noWrap>{t.treatment_plan}</Typography>
                        {t.diagnosis && <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }} noWrap>{t.diagnosis}</Typography>}
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>
                        {doctor ? (doctor.full_name || doctor.email) : (t.doctor_id || '—')}
                      </TableCell>
                      <TableCell><StatusBadge status={t.status || 'Active'} /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocalPharmacyRoundedIcon sx={{ fontSize: 14, color: '#0F6CBD' }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{medCount}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>{formatDate(t.start_date)}</TableCell>
                      <TableCell sx={{ minWidth: 80 }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: s.color }}>{t.recovery_percentage ?? 0}%</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={t.recovery_percentage ?? 0}
                            sx={{ mt: 0.3, borderRadius: 2, height: 4, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: s.color } }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => setViewTarget(t)} sx={{ color: '#0F6CBD', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
                              <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          {canWrite && (
                            <>
                              <Tooltip title="Edit Treatment">
                                <IconButton size="small" onClick={() => setEditTarget(t)} sx={{ color: '#10B981', bgcolor: '#ECFDF5', '&:hover': { bgcolor: '#D1FAE5' } }}>
                                  <EditRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Treatment">
                                <IconButton size="small" onClick={() => setDeleteTarget(t)} sx={{ color: '#EF4444', bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}>
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* ─── Dialogs ────────────────────────────────────────────────────── */}
      <ViewTreatmentDrawer
        open={Boolean(viewTarget)}
        treatment={viewTarget}
        patient={viewTarget ? patients[viewTarget.patient_id] : null}
        onClose={() => setViewTarget(null)}
      />

      <EditTreatmentModal
        open={Boolean(editTarget)}
        treatment={editTarget}
        patient={editTarget ? patients[editTarget.patient_id] : null}
        doctors={doctors}
        onClose={() => setEditTarget(null)}
        onSaved={handleEditSaved}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
        treatmentName={deleteTarget?.treatment_plan}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snack.msg}
      />
    </Box>
  );
}
