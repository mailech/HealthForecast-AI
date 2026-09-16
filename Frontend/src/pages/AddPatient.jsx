import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, MenuItem, CircularProgress, Snackbar, Alert, Paper
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const GENDERS = ['Male', 'Female', 'Other'];

export default function AddPatient() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { user, getRoleDashboard } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [apiError, setApiError] = useState('');

  const onSubmit = async (formData) => {
    setLoading(true);
    setApiError('');

    // Sanitize payload for FastAPI Pydantic schema
    const payload = {
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      date_of_birth: formData.date_of_birth || '2000-01-01',
      gender: formData.gender,
      hospital: formData.hospital?.trim() || 'General Hospital',
    };

    // Auto-generate or set patient_id if provided
    if (formData.patient_id && formData.patient_id.trim()) {
      payload.patient_id = formData.patient_id.trim();
    } else {
      payload.patient_id = `PAT-${Date.now().toString().slice(-5)}`;
    }

    // Only include email / phone if non-empty to satisfy EmailStr Pydantic validation
    if (formData.email && formData.email.trim()) {
      payload.email = formData.email.trim();
    }
    if (formData.phone && formData.phone.trim()) {
      payload.phone = formData.phone.trim();
    }

    try {
      const res = await api.post('/api/v1/patients', payload);
      setSnackbar({ open: true, message: 'Patient added successfully!', severity: 'success' });
      reset();
      
      const normRole = (user?.role || '').toLowerCase().replace(/ /g, '');
      const targetPath = normRole === 'doctor' ? '/doctor/patients' : '/admin/patients';
      
      setTimeout(() => {
        navigate(targetPath);
      }, 1200);
    } catch (err) {
      const detail = err.response?.data?.detail;
      let errorMsg = 'Failed to add patient.';
      if (Array.isArray(detail)) {
        errorMsg = detail.map(d => `${d.loc?.join('.') || 'field'}: ${d.msg}`).join(' | ');
      } else if (typeof detail === 'string') {
        errorMsg = detail;
      }
      setApiError(errorMsg);
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', pb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A">Add New Patient</Typography>
          <Typography variant="body2" color="#64748B">Register a patient record into the clinical system</Typography>
        </Box>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)} sx={{ fontWeight: 700 }}>
          Back
        </Button>
      </Box>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {apiError}
        </Alert>
      )}

      <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', p: { xs: 3, sm: 4 } }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Patient ID (Optional - Auto Generated if blank)"
                placeholder="e.g. PAT-10005"
                fullWidth
                size="small"
                {...register('patient_id')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Hospital"
                defaultValue="General Hospital"
                fullWidth
                size="small"
                {...register('hospital', { required: 'Hospital is required' })}
                error={!!errors.hospital}
                helperText={errors.hospital?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                placeholder="John"
                fullWidth
                size="small"
                {...register('first_name', { required: 'First name is required' })}
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                placeholder="Doe"
                fullWidth
                size="small"
                {...register('last_name', { required: 'Last name is required' })}
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                error={!!errors.date_of_birth}
                helperText={errors.date_of_birth?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Gender"
                fullWidth
                size="small"
                defaultValue="Male"
                {...register('gender', { required: 'Gender is required' })}
                error={!!errors.gender}
                helperText={errors.gender?.message}
              >
                {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                placeholder="johndoe@email.com"
                type="email"
                fullWidth
                size="small"
                {...register('email', {
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                placeholder="+1-555-0199"
                fullWidth
                size="small"
                {...register('phone')}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <PersonAddRoundedIcon />}
                sx={{ borderRadius: '10px', px: 3.5, py: 1.1, fontWeight: 700, bgcolor: '#0F6CBD' }}
              >
                Save Patient
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ borderRadius: '10px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
