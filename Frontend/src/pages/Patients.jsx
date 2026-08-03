import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  IconButton, Tooltip, Grid, MenuItem, Switch, FormControlLabel,
  Stepper, Step, StepLabel, Divider, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const STEPS = ['Basic Information', 'Medical History', 'Admission History'];
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SMOKING = ['Never', 'Former', 'Current'];
const ALCOHOL = ['None', 'Occasional', 'Moderate', 'Heavy'];

const emptyForm = {
  // Step 1
  patient_id: '', first_name: '', last_name: '', age: '', gender: '',
  date_of_birth: '', blood_group: '', height: '', weight: '',
  phone: '', email: '', address: '', hospital: '',
  // Step 2
  diabetes: false, hypertension: false, heart_disease: false, kidney_disease: false,
  smoking_status: '', alcohol_consumption: '', allergies: '', previous_surgery: '', chronic_disease_notes: '',
  // Step 3
  num_previous_admissions: '', admission_date: '', discharge_date: '',
  length_of_stay: '', icu_admission: false, admission_reason: '',
};

function FieldLabel({ children }) {
  return (
    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.7rem' }}>
      {children}
    </Typography>
  );
}

function StepIcon({ step, active, completed }) {
  const icons = [<PersonIcon />, <MedicalInformationIcon />, <LocalHospitalIcon />];
  return (
    <Box sx={{
      width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: completed ? '#1565C0' : active ? '#1565C0' : '#E3F2FD',
      color: completed || active ? '#fff' : '#1565C0',
      transition: 'all 0.3s',
      '& svg': { fontSize: 18 }
    }}>
      {icons[step]}
    </Box>
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
      setSnackbar({ open: true, message: 'Patient deleted successfully.', severity: 'success' });
      fetchPatients();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete patient.', severity: 'error' });
    } finally {
      setDeleteId(null);
    }
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
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        num_previous_admissions: form.num_previous_admissions ? Number(form.num_previous_admissions) : undefined,
        length_of_stay: form.length_of_stay ? Number(form.length_of_stay) : undefined,
      };
      await api.post('/api/v1/patients', payload);
      setSnackbar({ open: true, message: 'Patient added successfully!', severity: 'success' });
      closeModal();
      fetchPatients();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Failed to add patient.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = patients.filter(p =>
    p.patient_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'patient_id', headerName: 'Patient ID', flex: 1, minWidth: 120 },
    { field: 'first_name', headerName: 'First Name', flex: 1, minWidth: 110 },
    { field: 'last_name', headerName: 'Last Name', flex: 1, minWidth: 110 },
    { field: 'gender', headerName: 'Gender', width: 90 },
    { field: 'hospital', headerName: 'Hospital', flex: 1, minWidth: 130 },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 160 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 120 },
    {
      field: 'actions', headerName: 'Actions', width: 140, sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" color="primary" onClick={() => navigate(`/patients/${params.row.patient_id}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" color="info" onClick={() => navigate(`/patients/edit/${params.row.patient_id}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteId(params.row.patient_id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const tf = (name, label, opts = {}) => (
    <Grid item xs={12} sm={opts.full ? 12 : 6} key={name}>
      <FieldLabel>{label}</FieldLabel>
      <TextField
        name={name}
        value={form[name]}
        onChange={handleChange}
        fullWidth
        size="small"
        error={!!stepErrors[name]}
        helperText={stepErrors[name]}
        select={!!opts.options}
        type={opts.type || 'text'}
        InputLabelProps={opts.type === 'date' ? { shrink: true } : undefined}
        multiline={opts.multiline}
        rows={opts.multiline ? 2 : undefined}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
      >
        {opts.options?.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
      </TextField>
    </Grid>
  );

  const sw = (name, label) => (
    <Grid item xs={12} sm={6} key={name}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: form[name] ? '#EFF6FF' : '#FAFAFA' }}>
        <Typography variant="body2" fontWeight={600} color="#374151">{label}</Typography>
        <Switch
          name={name}
          checked={!!form[name]}
          onChange={handleChange}
          color="primary"
          size="small"
        />
      </Box>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1565C0">Patients</Typography>
          <Typography variant="body2" color="text.secondary">Manage and monitor all patient records</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openModal}
          sx={{ bgcolor: '#1565C0', borderRadius: 2, px: 3, py: 1, fontWeight: 600, boxShadow: '0 4px 14px rgba(21,101,192,0.3)' }}>
          Add Patient
        </Button>
      </Box>

      <TextField
        placeholder="Search by ID, name..."
        size="small"
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2, width: { xs: '100%', sm: 320 }, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', py: 1, px: 1 }}>
          <DataGrid
            autoHeight
            rows={filtered}
            columns={columns}
            getRowId={(row) => row.patient_id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            disableColumnMenu
            rowHeight={52}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': { bgcolor: '#E3F2FD', fontWeight: 700, color: '#1A202C' },
              '& .MuiDataGrid-cell': { py: 1.2 },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #F0F2F5' },
              '& .MuiDataGrid-virtualScroller': { bgcolor: '#FFFFFF' },
            }}
          />
        </Box>
      )}

      {/* Multi-Step Add Patient Modal */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
        <DialogTitle sx={{ bgcolor: '#1565C0', color: '#fff', py: 2.5, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Add New Patient</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Step {activeStep + 1} of {STEPS.length}</Typography>
            </Box>
            <Chip label={STEPS[activeStep]} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }} />
          </Box>
        </DialogTitle>

        <Box sx={{ px: 3, pt: 2.5, bgcolor: '#F8FAFF' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label, i) => (
              <Step key={label} completed={i < activeStep}>
                <StepLabel StepIconComponent={({ active, completed }) => <StepIcon step={i} active={active} completed={completed} />}>
                  <Typography variant="caption" fontWeight={activeStep === i ? 700 : 500} color={activeStep === i ? '#1565C0' : '#6B7280'}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Divider />

        <DialogContent sx={{ p: 3, bgcolor: '#F8FAFF', minHeight: 380 }}>
          {activeStep === 0 && (
            <Grid container spacing={2}>
              {tf('patient_id', 'Patient ID *')}
              {tf('first_name', 'First Name *')}
              {tf('last_name', 'Last Name *')}
              {tf('age', 'Age', { type: 'number' })}
              {tf('gender', 'Gender *', { options: GENDERS })}
              {tf('date_of_birth', 'Date of Birth', { type: 'date' })}
              {tf('blood_group', 'Blood Group', { options: BLOOD_GROUPS })}
              {tf('height', 'Height (cm)', { type: 'number' })}
              {tf('weight', 'Weight (kg)', { type: 'number' })}
              {tf('phone', 'Phone')}
              {tf('email', 'Email')}
              {tf('hospital', 'Hospital *')}
              {tf('address', 'Address', { full: true })}
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={700} color="#1565C0" mb={1}>Conditions</Typography>
              </Grid>
              {sw('diabetes', 'Diabetes')}
              {sw('hypertension', 'Hypertension')}
              {sw('heart_disease', 'Heart Disease')}
              {sw('kidney_disease', 'Kidney Disease')}
              {sw('icu_admission', 'ICU Admission History')}
              <Grid item xs={12}><Divider /></Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={700} color="#1565C0" mb={1}>Lifestyle & History</Typography>
              </Grid>
              {tf('smoking_status', 'Smoking Status', { options: SMOKING })}
              {tf('alcohol_consumption', 'Alcohol Consumption', { options: ALCOHOL })}
              {tf('allergies', 'Allergies', { full: true })}
              {tf('previous_surgery', 'Previous Surgery', { full: true })}
              {tf('chronic_disease_notes', 'Chronic Disease Notes', { full: true, multiline: true })}
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={2}>
              {tf('num_previous_admissions', 'Previous Admissions', { type: 'number' })}
              {tf('length_of_stay', 'Length of Stay (days)', { type: 'number' })}
              {tf('admission_date', 'Admission Date', { type: 'date' })}
              {tf('discharge_date', 'Discharge Date', { type: 'date' })}
              {tf('admission_reason', 'Admission Reason', { full: true })}
            </Grid>
          )}
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#fff', gap: 1 }}>
          <Button onClick={closeModal} sx={{ color: '#6B7280' }}>Cancel</Button>
          <Box sx={{ flex: 1 }} />
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack} sx={{ borderRadius: '10px', px: 3 }}>Back</Button>
          )}
          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext}
              sx={{ bgcolor: '#1565C0', borderRadius: '10px', px: 3, fontWeight: 600 }}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSave} disabled={saving}
              sx={{ bgcolor: '#1565C0', borderRadius: '10px', px: 4, fontWeight: 600, boxShadow: '0 4px 14px rgba(21,101,192,0.3)' }}>
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Patient'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete patient <strong>{deleteId}</strong>?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
