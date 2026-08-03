import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, MenuItem, CircularProgress, Snackbar, Alert
} from '@mui/material';
import api from '../api/api';

const GENDERS = ['Male', 'Female', 'Other'];

export default function EditPatient() {
  const { patient_id } = useParams();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    api.get(`/api/v1/patients/${patient_id}`)
      .then(res => reset(res.data))
      .catch(() => setSnackbar({ open: true, message: 'Failed to load patient.', severity: 'error' }))
      .finally(() => setFetching(false));
  }, [patient_id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/api/v1/patients/${patient_id}`, data);
      setSnackbar({ open: true, message: 'Patient updated successfully!', severity: 'success' });
      setTimeout(() => navigate('/patients'), 1200);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Update failed.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 760, px: { xs: 2, sm: 0 }, pt: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight={700} color="#1565C0" mb={3}>Edit Patient — {patient_id}</Typography>
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(15,108,189,0.08)', width: '100%', mx: 'auto' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                {[
                  ['first_name', 'First Name'],
                  ['last_name', 'Last Name'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['hospital', 'Hospital'],
                ].map(([name, label]) => (
                  <Grid item xs={12} sm={6} key={name}>
                    <TextField label={label} fullWidth size="small"
                      {...register(name, { required: `${label} is required` })}
                      error={!!errors[name]} helperText={errors[name]?.message} />
                  </Grid>
                ))}
                <Grid item xs={12} sm={6}>
                  <TextField label="Date of Birth" type="date" fullWidth size="small"
                    InputLabelProps={{ shrink: true }}
                    {...register('date_of_birth', { required: 'Date of birth is required' })}
                    error={!!errors.date_of_birth} helperText={errors.date_of_birth?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select label="Gender" fullWidth size="small" defaultValue=""
                    {...register('gender', { required: 'Gender is required' })}
                    error={!!errors.gender} helperText={errors.gender?.message}>
                    {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                <Button type="submit" variant="contained" disabled={loading}
                  sx={{ bgcolor: '#1565C0', borderRadius: 2, px: 4, py: 1.2 }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Patient'}
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
