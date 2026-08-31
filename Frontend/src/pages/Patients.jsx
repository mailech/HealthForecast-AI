import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  IconButton, Tooltip, Grid, MenuItem, Switch, Divider, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Avatar,
  InputAdornment, Stepper, Step, StepLabel, Paper
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MedicalInformationRoundedIcon from '@mui/icons-material/MedicalInformationRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const STEPS = ['Basic Info', 'Medical History', 'Admission'];
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SMOKING = ['Never', 'Former', 'Current'];
const ALCOHOL = ['None', 'Occasional', 'Moderate', 'Heavy'];

const emptyForm = {
  patient_id: '', first_name: '', last_name: '', age: '', gender: '',
  date_of_birth: '', blood_group: '', height: '', weight: '',
  phone: '', email: '', address: '', hospital: '',
  diabetes: false, hypertension: false, heart_disease: false, kidney_disease: false,
  smoking_status: '', alcohol_consumption: '', allergies: '', previous_surgery: '', chronic_disease_notes: '',
  num_previous_admissions: '', admission_date: '', discharge_date: '',
  length_of_stay: '', icu_admission: false, admission_reason: '',
};

function avatarColor(str) {
  const colors = ['#1D4ED8', '#7C3AED', '#0891B2', '#059669', '#DC2626', '#D97706'];
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function FLabel({ children, required }) {
  return (
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}{required && <Box component="span" sx={{ color: '#EF4444', ml: 0.3 }}>*</Box>}
    </Typography>
  );
}

function FField({ name, label, form, onChange, errors, opts = {} }) {
  return (
    <Grid item xs={12} sm={opts.full ? 12 : 6}>
      <FLabel required={opts.required}>{label}</FLabel>
      <TextField
        name={name} value={form[name]} onChange={onChange}
        fullWidth size="small"
        error={!!errors[name]} helperText={errors[name]}
        select={!!opts.options} type={opts.type || 'text'}
        InputLabelProps={opts.type === 'date' ? { shrink: true } : undefined}
        multiline={opts.multiline} rows={opts.multiline ? 2 : undefined}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}
      >
        {opts.options?.map(o => <MenuItem key={o} value={o} sx={{ fontSize: '0.85rem' }}>{o}</MenuItem>)}
      </TextField>
    </Grid>
  );
}

function FSwitch({ name, label, form, onChange }) {
  return (
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1.2, borderRadius: '9px', border: `1.5px solid ${form[name] ? '#BFDBFE' : '#E2E8F0'}`, bgcolor: form[name] ? '#EFF6FF' : '#F8FAFC' }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#374151' }}>{label}</Typography>
        <Switch name={name} checked={!!form[name]} onChange={onChange} size="small" color="primary" />
      </Box>
    </Grid>
  );
}

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const navigate = useNavigate();

  const fetchPatients = () => {
    setLoading(true);
    api.get('/api/v1/patients?limit=200')
      .then(res => setPatients(res.data))
      .catch(() => setError('Failed to load patients.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/patients/${deleteId}`);
      setSnackbar({ open: true, message: 'Patient deleted.', severity: 'success' });
      fetchPatients();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete patient.', severity: 'error' });
    } finally { setDeleteId(null); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setStepErrors(se => ({ ...se, [name]: '' }));
  };

  const validateStep = () => {
    const errs = {};
    if (activeStep === 0) {
      ['patient_id', 'first_name', 'last_name', 'gender', 'hospital'].forEach(k => {
        if (!form[k]) errs[k] = 'Required';
      });
    }
    setStepErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep()) setActiveStep(s => s + 1); };
  const handleBack = () => setActiveStep(s => s - 1);
  const openModal = () => { setForm(emptyForm); setActiveStep(0); setStepErrors({}); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSave = async () => {
    if (!validateStep()) return;
    setSaving(true);
    try {
      // Only send fields that PatientCreate schema accepts
      const payload = {
        patient_id: form.patient_id,
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth || '2000-01-01',
        gender: form.gender,
        hospital: form.hospital,
        ...(form.email ? { email: form.email } : {}),
        ...(form.phone ? { phone: form.phone } : {}),
      };
      await api.post('/api/v1/patients', payload);
      setSnackbar({ open: true, message: 'Patient added successfully!', severity: 'success' });
      closeModal();
      fetchPatients();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Failed to add patient.', severity: 'error' });
    } finally { setSaving(false); }
  };

  const filtered = patients.filter(p =>
    p.patient_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.hospital?.toLowerCase().includes(search.toLowerCase())
  );

  const stepIcons = [<PersonRoundedIcon />, <MedicalInformationRoundedIcon />, <LocalHospitalRoundedIcon />];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>Patients</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>Manage and monitor all patient records</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openModal}
          sx={{ bgcolor: '#1D4ED8', borderRadius: '10px', px: 2.5, py: 1, fontWeight: 600, fontSize: '0.82rem', boxShadow: '0 4px 12px rgba(29,78,216,0.25)', '&:hover': { bgcolor: '#1E40AF' } }}>
          Add Patient
        </Button>
      </Box>

      {/* Search + Filter bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by ID, name, hospital..."
          size="small" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 17, color: '#94A3B8' }} /></InputAdornment> }}
          sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem', bgcolor: '#fff' } }}
        />
        <Button variant="outlined" startIcon={<FilterListRoundedIcon />} size="small"
          sx={{ borderRadius: '10px', borderColor: '#E2E8F0', color: '#64748B', fontSize: '0.8rem', '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' } }}>
          Filter
        </Button>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={32} sx={{ color: '#3B82F6' }} /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <PersonRoundedIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
            <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>No patients found</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', mt: 0.5 }}>
              {search ? 'Try a different search term.' : 'Add your first patient to get started.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F1F5F9', py: 1.5, px: 2 } }}>
                  <TableCell>Patient</TableCell>
                  <TableCell>Patient ID</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => {
                  const initials = `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase();
                  const bg = avatarColor(p.patient_id);
                  return (
                    <TableRow key={p.patient_id} sx={{ '& td': { borderBottom: '1px solid #F8FAFC', py: 1.5, px: 2 }, '&:hover': { bgcolor: '#FAFCFF' }, '&:last-child td': { borderBottom: 'none' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: bg, fontSize: '0.75rem', fontWeight: 700 }}>{initials}</Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A' }}>{p.first_name} {p.last_name}</Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{p.date_of_birth || '—'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={p.patient_id} size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, fontSize: '0.72rem', borderRadius: '6px' }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: '#475569' }}>{p.gender || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: '#475569' }}>{p.hospital || '—'}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>{p.email || '—'}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{p.phone || ''}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => navigate(`/patients/edit/${p.patient_id}`)}
                              sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', borderRadius: '7px', '&:hover': { bgcolor: '#DBEAFE' } }}>
                              <EditRoundedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => setDeleteId(p.patient_id)}
                              sx={{ color: '#EF4444', bgcolor: '#FEF2F2', borderRadius: '7px', '&:hover': { bgcolor: '#FEE2E2' } }}>
                              <DeleteRoundedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
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

      {/* Add Patient Modal */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}>
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, bgcolor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#F1F5F9', fontSize: '1rem' }}>Add New Patient</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.2 }}>Step {activeStep + 1} of {STEPS.length} — {STEPS[activeStep]}</Typography>
            </Box>
            <Chip label={STEPS[activeStep]} size="small" sx={{ bgcolor: '#1E293B', color: '#94A3B8', fontWeight: 600, fontSize: '0.72rem' }} />
          </Box>
          <Box sx={{ px: 3, py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEPS.map((label, i) => (
                <Step key={label} completed={i < activeStep}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: completed || active ? '#1D4ED8' : '#E2E8F0', color: completed || active ? '#fff' : '#94A3B8', '& svg': { fontSize: 16 } }}>
                        {stepIcons[i]}
                      </Box>
                    )}
                  >
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: activeStep === i ? 700 : 500, color: activeStep === i ? '#1D4ED8' : '#94A3B8' }}>{label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: '#F8FAFC', minHeight: 360 }}>
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <FField name="patient_id" label="Patient ID" form={form} onChange={handleChange} errors={stepErrors} opts={{ required: true }} />
              <FField name="first_name" label="First Name" form={form} onChange={handleChange} errors={stepErrors} opts={{ required: true }} />
              <FField name="last_name" label="Last Name" form={form} onChange={handleChange} errors={stepErrors} opts={{ required: true }} />
              <FField name="age" label="Age" form={form} onChange={handleChange} errors={stepErrors} opts={{ type: 'number' }} />
              <FField name="gender" label="Gender" form={form} onChange={handleChange} errors={stepErrors} opts={{ options: GENDERS, required: true }} />
              <FField name="date_of_birth" label="Date of Birth" form={form} onChange={handleChange} errors={stepErrors} opts={{ type: 'date' }} />
              <FField name="blood_group" label="Blood Group" form={form} onChange={handleChange} errors={stepErrors} opts={{ options: BLOOD_GROUPS }} />
              <FField name="height" label="Height (cm)" form={form} onChange={handleChange} errors={stepErrors} opts={{ type: 'number' }} />
              <FField name="weight" label="Weight (kg)" form={form} onChange={handleChange} errors={stepErrors} opts={{ type: 'number' }} />
              <FField name="phone" label="Phone" form={form} onChange={handleChange} errors={stepErrors} />
              <FField name="email" label="Email" form={form} onChange={handleChange} errors={stepErrors} />
              <FField name="hospital" label="Hospital" form={form} onChange={handleChange} errors={stepErrors} opts={{ required: true }} />
              <FField name="address" label="Address" form={form} onChange={handleChange} errors={stepErrors} opts={{ full: true }} />
            </Grid>
          )}
          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1D4ED8', mb: 0.5 }}>Medical Conditions</Typography></Grid>
              <FSwitch name="diabetes" label="Diabetes" form={form} onChange={handleChange} />
              <FSwitch name="hypertension" label="Hypertension" form={form} onChange={handleChange} />
              <FSwitch name="heart_disease" label="Heart Disease" form={form} onChange={handleChange} />
              <FSwitch name="kidney_disease" label="Kidney Disease" form={form} onChange={handleChange} />
              <FSwitch name="icu_admission" label="ICU Admission History" form={form} onChange={handleChange} />
              <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
              <Grid item xs={12}><Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1D4ED8', mb: 0.5 }}>Lifestyle & History</Typography></Grid>
              <FField name="smoking_status" label="Smoking Status" form={form} onChange={handleChange} errors={stepErrors} opts={{ options: SMOKING }} />
              <FField name="alcohol_consumption" label="Alcohol Consumption" form={form} onChange={handleChange} errors={stepErrors} opts={{ options: ALCOHOL }} />
              <FField name="allergies" label="Allergies" form={form} onChange={handleChange} errors={stepErrors} opts={{ full: true }} />
              <FField name="previous_surgery" label="Previous Surgery" form={form} onChange={handleChange} errors={stepErrors} opts={{ full: true }} />
              <FField name="chronic_disease_notes" label="Chronic Disease Notes" form={form} onChange={handleChange} errors={stepErrors} opts={{ full: true, multiline: true }} />
            </Grid>
          )}
          {activeStep === 2 && (
            <Grid container spacing={2}>
              <FField name="num_previous_admissions" label="Previous Admissions" form={form} onChange={handleChange} errors={stepErrors} opts={{ type: 'number' }} />
              <FField name="length_of_stay" label="Length of Stay (days)" form={form} onChange={handleChange} errors={stepErrors} opts={{ type: 'number' }} />
              <FField name="admission_date" label="Admission Date" form={form} onChange={handleChange} errors={stepErrors} opts={{ type: 'date' }} />
              <FField name="discharge_date" label="Discharge Date" form={form} onChange={handleChange} errors={stepErrors} opts={{ type: 'date' }} />
              <FField name="admission_reason" label="Admission Reason" form={form} onChange={handleChange} errors={stepErrors} opts={{ full: true }} />
            </Grid>
          )}
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#fff', gap: 1 }}>
          <Button onClick={closeModal} sx={{ color: '#64748B', fontSize: '0.82rem' }}>Cancel</Button>
          <Box sx={{ flex: 1 }} />
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack} sx={{ borderRadius: '9px', px: 2.5, fontSize: '0.82rem', borderColor: '#E2E8F0', color: '#475569' }}>Back</Button>
          )}
          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#1D4ED8', borderRadius: '9px', px: 3, fontWeight: 600, fontSize: '0.82rem' }}>Next</Button>
          ) : (
            <Button variant="contained" onClick={handleSave} disabled={saving}
              sx={{ bgcolor: '#1D4ED8', borderRadius: '9px', px: 3.5, fontWeight: 600, fontSize: '0.82rem', boxShadow: '0 4px 12px rgba(29,78,216,0.25)' }}>
              {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Patient'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: '14px', maxWidth: 380 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>Delete Patient</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
            Are you sure you want to delete patient <strong>{deleteId}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: '#64748B', fontSize: '0.82rem' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#EF4444', borderRadius: '9px', fontSize: '0.82rem', '&:hover': { bgcolor: '#DC2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ borderRadius: '10px' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
