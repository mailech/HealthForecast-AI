import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, MenuItem, CircularProgress, Snackbar, Alert
} from '@mui/material';
import api from '../api/api';

const GENDERS = ['Male', 'Female', 'Other'];

export default function AddPatient() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/api/v1/patients', data);
      setSnackbar({ open: true, message: 'Patient added successfully!', severity: 'success' });
      setTimeout(() => navigate('/patients'), 1200);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Failed to add patient.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, opts = {}) => (
    <Grid item xs={12} sm={6}>
      <TextField
        label={label}
        fullWidth
        size="small"
        {...register(name, { required: `${label} is required`, ...opts })}
        error={!!errors[name]}
        helperText={errors[name]?.message}
        {...(opts.select ? { select: true, defaultValue: '' } : {})}
      >
        {opts.select && GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
      </TextField>
    </Grid>
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 760, px: { xs: 2, sm: 0 }, pt: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight={700} color="#1565C0" mb={3}>Add Patient</Typography>
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(15,108,189,0.08)', width: '100%', mx: 'auto' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                {field('patient_id', 'Patient ID')}
                {field('first_name', 'First Name')}
                {field('last_name', 'Last Name')}
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
                    defaultValue=""
                    {...register('gender', { required: 'Gender is required' })}
                    error={!!errors.gender}
                    helperText={errors.gender?.message}
                  >
                    {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </TextField>
                </Grid>
                {field('email', 'Email', { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                {field('phone', 'Phone')}
                {field('hospital', 'Hospital')}
              </Grid>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                <Button type="submit" variant="contained" disabled={loading}
                  sx={{ bgcolor: '#1565C0', borderRadius: 2, px: 4, py: 1.2 }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Patient'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/patients')}>Cancel</Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
