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

const STATUS_OPTIONS = [
  'Active',
  'In Progress',
  'Completed',
  'Pending Follow-up',
  'Discontinued',
  'Cancelled',
  'Paused'
];

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'As directed'
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

// Convert ISO date string to YYYY-MM-DD for date input
function toInputDate(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/* =========================================================================
   EDIT TREATMENT MODAL
   ========================================================================= */
function EditTreatmentModal({ open, treatment, patient, doctors, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [form, setForm] = useState({
    status: 'Active',
    recovery_percentage: 0,
    treatment_plan: '',
    doctor_id: '',
    diagnosis: '',
    notes: '',
    start_date: '',
    follow_up_date: '',
    end_date: '',
    medications: []
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
        start_date: toInputDate(treatment.start_date),
        follow_up_date: toInputDate(treatment.follow_up_date),
        end_date: toInputDate(treatment.end_date),
        medications: treatment.medications && Array.isArray(treatment.medications)
          ? treatment.medications.map(m => ({ name: m.name || '', dosage: m.dosage || '', frequency: m.frequency || 'Once daily' }))
          : []
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

  const handleRecoveryChange = (val) => {
    let num = Number(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    setForm(prev => ({ ...prev, recovery_percentage: num }));
  };

  const handleAddMedication = () => {
    setForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: 'Once daily' }]
    }));
  };

  const handleRemoveMedication = (index) => {
    setForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.medications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medications: updated };
    });
  };

  const handleSave = async () => {
    if (!form.treatment_plan.trim()) {
      setSaveErr('Treatment plan is required.');
      return;
    }
    setSaving(true);
    setSaveErr('');

    try {
      const id = treatment._id || treatment.id;
      const cleanMeds = form.medications
        .filter(m => m.name.trim() !== '')
        .map(m => ({
          name: m.name.trim(),
          dosage: m.dosage.trim() || 'As prescribed',
          frequency: m.frequency.trim() || 'As directed'
        }));

      const payload = {
        status: form.status,
        recovery_percentage: Number(form.recovery_percentage),
        treatment_plan: form.treatment_plan.trim(),
        doctor_id: form.doctor_id,
        diagnosis: form.diagnosis.trim() || null,
        notes: form.notes.trim() || null,
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

  const patientName = patient
    ? `${patient.first_name} ${patient.last_name}`
    : treatment.patient_id;

  const sc = STATUS[form.status] || STATUS.Active;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
      
      {/* Dialog Header */}
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EditRoundedIcon sx={{ color: '#1D4ED8', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>Edit Treatment Plan</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                Patient: <strong>{patientName}</strong> ({treatment.patient_id})
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ py: 2.5 }}>
        {saveErr && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.82rem' }}>
            {saveErr}
          </Alert>
        )}

        <Grid container spacing={2.5}>

          {/* Treatment Plan */}
          <Grid item xs={12}>
            <FieldLabel required>Treatment Plan</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Enter detailed treatment plan..."
              value={form.treatment_plan}
              onChange={e => setForm(f => ({ ...f, treatment_plan: e.target.value }))}
              error={!form.treatment_plan.trim()}
              helperText={!form.treatment_plan.trim() ? 'Treatment plan is required' : ''}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
            />
          </Grid>

          {/* Doctor Selection */}
          <Grid item xs={12} sm={6}>
            <FieldLabel>Assigned Doctor</FieldLabel>
            <TextField
              select
              fullWidth
              size="small"
              value={form.doctor_id}
              onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
            >
              {doctors.length === 0 && (
                <MenuItem value={form.doctor_id} sx={{ fontSize: '0.85rem' }}>
                  {form.doctor_id || 'doctor@hospital.com'}
                </MenuItem>
              )}
              {doctors.map(d => (
                <MenuItem key={d.email} value={d.email} sx={{ fontSize: '0.85rem' }}>
                  {d.full_name ? `${d.full_name} (${d.email})` : d.email}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Status Dropdown */}
          <Grid item xs={12} sm={6}>
            <FieldLabel>Treatment Status</FieldLabel>
            <TextField
              select
              fullWidth
              size="small"
              value={form.status}
              onChange={e => handleStatusChange(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
            >
              {STATUS_OPTIONS.map(s => (
                <MenuItem key={s} value={s} sx={{ fontSize: '0.85rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: (STATUS[s] || STATUS.Active).color }} />
                    {s}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Recovery Progress Slider & Numeric Input */}
          <Grid item xs={12}>
            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <FieldLabel>Recovery Progress (%)</FieldLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    type="number"
                    size="small"
                    value={form.recovery_percentage}
                    onChange={e => handleRecoveryChange(e.target.value)}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{
                      width: 80,
                      '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#fff', fontSize: '0.85rem', fontWeight: 700 }
                    }}
                  />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: sc.color }}>%</Typography>
                </Box>
              </Box>
              
              <Slider
                value={Number(form.recovery_percentage)}
                onChange={(_, v) => setForm(f => ({ ...f, recovery_percentage: v }))}
                min={0}
                max={100}
                step={1}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' },
                ]}
                sx={{
                  color: sc.color, mt: 1, px: 1,
                  '& .MuiSlider-markLabel': { fontSize: '0.68rem', color: '#64748B' },
                }}
              />

              {/* Progress Bar Preview */}
              <Box sx={{ mt: 2, pt: 1, borderTop: '1px border-dashed #CBD5E1', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Visual Preview:</Typography>
                <Box sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: `${sc.color}20`, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${form.recovery_percentage}%`, bgcolor: sc.color, borderRadius: 4, transition: 'width 0.3s' }} />
                </Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: sc.color }}>
                  {form.recovery_percentage}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Medications Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalPharmacyRoundedIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
                <FieldLabel>Medications</FieldLabel>
              </Box>
              <Button
                size="small"
                startIcon={<AddRoundedIcon fontSize="small" />}
                onClick={handleAddMedication}
                sx={{ borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', bgcolor: '#F5F3FF', '&:hover': { bgcolor: '#EDE9FE' } }}
              >
                Add Medication
              </Button>
            </Box>

            {form.medications.length === 0 ? (
              <Box sx={{ p: 2, borderRadius: '9px', bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>No medications prescribed yet. Click "+ Add Medication" to add one.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {form.medications.map((m, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#FAFAFA' }}>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          placeholder="Medication Name"
                          label="Name"
                          size="small"
                          fullWidth
                          value={m.name}
                          onChange={e => handleMedicationChange(idx, 'name', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#fff', fontSize: '0.82rem' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          placeholder="e.g. 40 mg"
                          label="Dosage"
                          size="small"
                          fullWidth
                          value={m.dosage}
                          onChange={e => handleMedicationChange(idx, 'dosage', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#fff', fontSize: '0.82rem' } }}
                        />
                      </Grid>
                      <Grid item xs={10} sm={4}>
                        <TextField
                          select
                          label="Frequency"
                          size="small"
                          fullWidth
                          value={m.frequency}
                          onChange={e => handleMedicationChange(idx, 'frequency', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#fff', fontSize: '0.82rem' } }}
                        >
                          {FREQUENCY_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.82rem' }}>{opt}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={2} sm={1} sx={{ textAlign: 'right' }}>
                        <IconButton size="small" onClick={() => handleRemoveMedication(idx)} sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}>
                          <DeleteForeverRoundedIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}
          </Grid>

          {/* Dates Section */}
          <Grid item xs={12} sm={4}>
            <FieldLabel>Treatment Started</FieldLabel>
            <TextField
              type="date"
              fullWidth
              size="small"
              value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel>Follow-up Date</FieldLabel>
            <TextField
              type="date"
              fullWidth
              size="small"
              value={form.follow_up_date}
              onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel>Treatment End Date</FieldLabel>
            <TextField
              type="date"
              fullWidth
              size="small"
              value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
            />
          </Grid>

          {/* Diagnosis */}
          <Grid item xs={12} sm={6}>
            <FieldLabel>Diagnosis (Optional)</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Hypertension"
              value={form.diagnosis}
              onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12} sm={6}>
            <FieldLabel>Doctor Notes (Optional)</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Additional notes..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
            />
          </Grid>

        </Grid>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 3, pb: 2.5, borderTop: '1px solid #F1F5F9', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ borderRadius: '9px', color: '#64748B', fontWeight: 600, fontSize: '0.82rem', px: 2.5 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
          sx={{ borderRadius: '9px', bgcolor: '#1D4ED8', fontWeight: 700, fontSize: '0.82rem', px: 3, '&:hover': { bgcolor: '#1E40AF' } }}
        >
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </DialogActions>

    </Dialog>
  );
}

/* =========================================================================
   SIDE PANEL / DETAIL VIEW DRAWER
   ========================================================================= */
function ViewDrawer({ open, treatment, patient, doctors, onClose, onDelete, onEditClick }) {
  if (!treatment) return null;

  const sc = STATUS[treatment.status] || STATUS.Active;
  const displayRecovery = treatment.recovery_percentage ?? 0;
  const isCompleted = treatment.status === 'Completed';

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480, md: 520 },
          bgcolor: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Fixed Header */}
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MedicalServicesRoundedIcon sx={{ color: '#1D4ED8', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Treatment Details</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{treatment.patient_id}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={onEditClick}
              sx={{ borderRadius: '8px', bgcolor: '#1D4ED8', fontWeight: 700, fontSize: '0.78rem', py: 0.6, px: 1.8, '&:hover': { bgcolor: '#1E40AF' } }}
            >
              Edit Treatment
            </Button>
            <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { bgcolor: '#F1F5F9' } }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Scrollable Content Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>

          {/* Patient Card */}
          <Box sx={{ mb: 2.5, p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: `${sc.color}18`, color: sc.color, width: 44, height: 44, fontWeight: 700, border: `1.5px solid ${sc.border}` }}>
                {patient ? `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}` : treatment.patient_id?.slice(-2).toUpperCase()}
              </Avatar>
              <Box>
                {patient && (
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                    {patient.first_name} {patient.last_name}
                  </Typography>
                )}
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{treatment.patient_id}</Typography>
                {patient?.hospital && (
                  <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', mt: 0.2 }}>{patient.hospital}</Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Status */}
          <Box sx={{ mb: 2.5 }}>
            <FieldLabel>Status</FieldLabel>
            <StatusBadge status={treatment.status} />
          </Box>

          {/* Recovery Progress */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <FieldLabel>Recovery Progress</FieldLabel>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: sc.color }}>
                {displayRecovery}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={displayRecovery}
              sx={{
                height: 9,
                borderRadius: 4,
                bgcolor: `${sc.color}18`,
                '& .MuiLinearProgress-bar': { bgcolor: sc.color, borderRadius: 4 }
              }}
            />
          </Box>

          <Divider sx={{ my: 2, borderColor: '#F1F5F9' }} />

          {/* Treatment Plan */}
          <Box sx={{ mb: 2.5 }}>
            <FieldLabel>Treatment Plan</FieldLabel>
            <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#FEFCE8', border: '1px solid #FEF08A' }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#78350F', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {treatment.treatment_plan || '—'}
              </Typography>
            </Box>
          </Box>

          {/* Diagnosis */}
          {treatment.diagnosis && (
            <Box sx={{ mb: 2.5 }}>
              <FieldLabel>Diagnosis</FieldLabel>
              <Typography sx={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 600 }}>
                {treatment.diagnosis}
              </Typography>
            </Box>
          )}

          {/* Doctor */}
          <Box sx={{ mb: 2.5 }}>
            <FieldLabel>Doctor</FieldLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonRoundedIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
              <Typography sx={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 500 }}>
                {treatment.doctor_id || '—'}
              </Typography>
            </Box>
          </Box>

          {/* Medications */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <LocalPharmacyRoundedIcon sx={{ fontSize: 15, color: '#7C3AED' }} />
              <FieldLabel>Medications</FieldLabel>
            </Box>

            {treatment.medications && treatment.medications.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {treatment.medications.map((m, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.4, borderRadius: '9px', bgcolor: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#5B21B6' }}>
                      {m.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      {m.dosage && (
                        <Chip label={m.dosage} size="small" sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontSize: '0.65rem', height: 20, fontWeight: 600 }} />
                      )}
                      {m.frequency && (
                        <Chip label={m.frequency} size="small" sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontSize: '0.65rem', height: 20, fontWeight: 600 }} />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', italic: true }}>No medications assigned.</Typography>
            )}
          </Box>

          <Divider sx={{ my: 2, borderColor: '#F1F5F9' }} />

          {/* Timeline */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
              <FieldLabel>Timeline</FieldLabel>
            </Box>
            <TimelineRow label="Treatment Started" date={fmt(treatment.start_date)} done={true} />
            <TimelineRow label="Follow-up Date" date={fmt(treatment.follow_up_date)} done={isCompleted || !!treatment.follow_up_date} />
            <TimelineRow label="Treatment End" date={fmt(treatment.end_date)} done={isCompleted} />
          </Box>

          {/* Notes */}
          {treatment.notes && (
            <Box sx={{ p: 1.8, borderRadius: '10px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.5 }}>
                <NoteRoundedIcon sx={{ fontSize: 14, color: '#16A34A' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>Doctor Notes</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.5 }}>{treatment.notes}</Typography>
            </Box>
          )}

        </Box>

        {/* Fixed Footer Action */}
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={onDelete}
            sx={{
              borderRadius: '9px',
              borderColor: '#FECACA',
              color: '#EF4444',
              fontWeight: 600,
              fontSize: '0.82rem',
              '&:hover': { bgcolor: '#FEF2F2', borderColor: '#EF4444' }
            }}
          >
            Delete Treatment
          </Button>
        </Box>

      </Box>
    </Drawer>
  );
}

/* =========================================================================
   MAIN TREATMENTS PAGE
   ========================================================================= */
export default function Treatments() {
  const [allTreatments, setAllTreatments] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTx, setSelectedTx] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/v1/treatments?limit=1000'),
      api.get('/api/v1/patients?limit=500'),
    ])
      .then(([txRes, ptRes]) => {
        const sorted = [...txRes.data].sort((a, b) => {
          const da = new Date(a.created_at || a.start_date || 0);
          const db = new Date(b.created_at || b.start_date || 0);
          return db - da;
        });
        setAllTreatments(sorted);
        const map = {};
        ptRes.data.forEach(p => { map[p.patient_id] = p; });
        setPatientMap(map);
      })
      .catch(() => setError('Failed to load treatments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    api.get('/api/v1/treatments/doctors')
      .then(r => setDoctors(r.data))
      .catch(() => setDoctors([]));
  }, []);

  // Top summary card statistics calculated dynamically
  const totalCount     = allTreatments.length;
  const activeCount    = allTreatments.filter(t => t.status === 'Active' || t.status === 'In Progress').length;
  const completedCount = allTreatments.filter(t => t.status === 'Completed').length;
  const followupCount  = allTreatments.filter(t => t.status === 'Pending Follow-up' || (t.follow_up_date && t.status !== 'Completed')).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allTreatments;
    if (statusFilter !== 'All') list = list.filter(t => t.status === statusFilter);
    if (q) {
      list = list.filter(t => {
        const pt = patientMap[t.patient_id];
        const name = pt ? `${pt.first_name} ${pt.last_name}`.toLowerCase() : '';
        return (
          t.patient_id?.toLowerCase().includes(q) ||
          name.includes(q) ||
          t.treatment_plan?.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [allTreatments, patientMap, search, statusFilter]);

  const isSearching = search.trim() !== '' || statusFilter !== 'All';

  const handleView = (tx) => { setSelectedTx(tx); setDrawerOpen(true); };
  const handleCloseDrawer = () => { setDrawerOpen(false); setSelectedTx(null); };

  const handleOpenEdit = (tx) => {
    if (tx) setSelectedTx(tx);
    setEditModalOpen(true);
  };

  // Called after successful PUT
  const handleSaved = (updated) => {
    const uid = updated._id || updated.id;
    setAllTreatments(prev => prev.map(t => {
      const tid = t._id || t.id;
      return tid === uid ? { ...t, ...updated } : t;
    }));
    setSelectedTx(prev => (prev && ((prev._id || prev.id) === uid) ? { ...prev, ...updated } : prev));
    setSnackbar({ open: true, message: 'Treatment updated successfully', severity: 'success' });
  };

  const handleDeleteClick = () => setDeleteDialog(true);

  const handleDeleteConfirm = async () => {
    if (!selectedTx) return;
    setDeleting(true);
    try {
      const id = selectedTx._id || selectedTx.id;
      await api.delete(`/api/v1/treatments/${id}`);
      setSnackbar({ open: true, message: 'Treatment deleted successfully', severity: 'success' });
      setDeleteDialog(false);
      setDrawerOpen(false);
      setSelectedTx(null);
      loadData();
    } catch (e) {
      setSnackbar({ open: true, message: e.response?.data?.detail || 'Failed to delete treatment.', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  if (error) return <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>Treatments</Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>Patient treatment plans and recovery tracking</Typography>
      </Box>

      {/* Dynamic Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}><SummaryCard label="Total Treatments" value={totalCount} loading={loading} /></Grid>
        <Grid item xs={6} sm={3}><SummaryCard label="Active / In Progress" value={activeCount} color="#10B981" loading={loading} /></Grid>
        <Grid item xs={6} sm={3}><SummaryCard label="Completed" value={completedCount} color="#6366F1" loading={loading} /></Grid>
        <Grid item xs={6} sm={3}><SummaryCard label="Pending Follow-up" value={followupCount} color="#F59E0B" loading={loading} /></Grid>
      </Grid>

      {/* Search & Filter Controls */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search patient name or ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff', fontSize: '0.85rem' } }}
        />
        <TextField
          select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          size="small"
          label="Status"
          sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff', fontSize: '0.85rem' } }}
        >
          {STATUS_FILTER_OPTIONS.map(o => <MenuItem key={o} value={o} sx={{ fontSize: '0.85rem' }}>{o}</MenuItem>)}
        </TextField>
      </Box>

      {/* Main Treatments Table */}
      <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
            {isSearching ? 'Search Results' : 'All Treatments'}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mt: 0.2 }}>
            {`${filtered.length} treatment${filtered.length !== 1 ? 's' : ''} available`}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} sx={{ color: '#3B82F6' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <MedicalServicesRoundedIcon sx={{ fontSize: 40, color: '#CBD5E1' }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>
              {isSearching ? 'No treatments found' : 'No treatments available'}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              {isSearching ? 'Try a different search or filter.' : 'Treatment records will appear here once added.'}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0 0 14px 14px' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['Patient', 'Treatment Plan', 'Status', 'Recovery', 'Start Date', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', py: 1.4, px: 2 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((t, i) => {
                  const pt = patientMap[t.patient_id];
                  const sc = STATUS[t.status] || STATUS.Active;
                  const recovery = t.recovery_percentage ?? 0;
                  const initials = pt
                    ? `${pt.first_name?.[0] || ''}${pt.last_name?.[0] || ''}`
                    : t.patient_id?.slice(-2).toUpperCase();

                  return (
                    <TableRow key={t._id || t.id || i}
                      sx={{ '& td': { border: 'none', borderTop: '1px solid #F8FAFC', py: 1.4, px: 2 }, '&:hover': { bgcolor: '#FAFBFC' } }}>
                      
                      {/* Patient */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: `${sc.color}18`, color: sc.color, fontSize: '0.75rem', fontWeight: 700, border: `1.5px solid ${sc.border}`, flexShrink: 0 }}>
                            {initials}
                          </Avatar>
                          <Box>
                            {pt && <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0F172A', lineHeight: 1.2 }}>{pt.first_name} {pt.last_name}</Typography>}
                            <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>{t.patient_id}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Treatment Plan */}
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Tooltip title={t.treatment_plan || ''} placement="top">
                          <Typography sx={{ fontSize: '0.82rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                            {t.treatment_plan || '—'}
                          </Typography>
                        </Tooltip>
                        {t.diagnosis && <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', mt: 0.2 }}>{t.diagnosis}</Typography>}
                      </TableCell>

                      {/* Status */}
                      <TableCell><StatusBadge status={t.status} /></TableCell>

                      {/* Recovery */}
                      <TableCell sx={{ minWidth: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: `${sc.color}18`, overflow: 'hidden', minWidth: 70 }}>
                            <Box sx={{ height: '100%', width: `${recovery}%`, bgcolor: sc.color, borderRadius: 3, transition: 'width 0.3s' }} />
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: sc.color, minWidth: 35 }}>
                            {recovery}%
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Start Date */}
                      <TableCell>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>{fmt(t.start_date)}</Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.8 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleView(t)}
                              sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', borderRadius: '7px', width: 30, height: 30, '&:hover': { bgcolor: '#DBEAFE' } }}>
                              <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Treatment">
                            <IconButton size="small" onClick={() => { setSelectedTx(t); setEditModalOpen(true); }}
                              sx={{ color: '#10B981', bgcolor: '#ECFDF5', borderRadius: '7px', width: 30, height: 30, '&:hover': { bgcolor: '#D1FAE5' } }}>
                              <EditRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => { setSelectedTx(t); setDeleteDialog(true); }}
                              sx={{ color: '#EF4444', bgcolor: '#FEF2F2', borderRadius: '7px', width: 30, height: 30, '&:hover': { bgcolor: '#FECACA' } }}>
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>

                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Side Panel Drawer */}
      <ViewDrawer
        open={drawerOpen}
        treatment={selectedTx}
        patient={selectedTx ? patientMap[selectedTx.patient_id] : null}
        doctors={doctors}
        onClose={handleCloseDrawer}
        onDelete={handleDeleteClick}
        onEditClick={() => handleOpenEdit(selectedTx)}
      />

      {/* Edit Treatment Modal */}
      <EditTreatmentModal
        open={editModalOpen}
        treatment={selectedTx}
        patient={selectedTx ? patientMap[selectedTx.patient_id] : null}
        doctors={doctors}
        onClose={() => setEditModalOpen(false)}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Delete Treatment?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>
            Are you sure you want to delete the treatment for:{' '}
            <strong>
              {selectedTx ? (patientMap[selectedTx.patient_id]
                ? `${patientMap[selectedTx.patient_id].first_name} ${patientMap[selectedTx.patient_id].last_name} (${selectedTx.patient_id})`
                : selectedTx.patient_id) : ''}
            </strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialog(false)} disabled={deleting}
            sx={{ borderRadius: '8px', color: '#64748B', fontSize: '0.82rem' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeleteConfirm} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            sx={{ borderRadius: '8px', bgcolor: '#EF4444', fontWeight: 700, fontSize: '0.82rem', '&:hover': { bgcolor: '#DC2626' } }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success / Error Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
