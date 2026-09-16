import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, Button, MenuItem,
  Alert, CircularProgress, Grid
} from '@mui/material';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import api from '../api/api';

export default function SysAdminAddMember() {
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Doctor');
  const [initialPassword, setInitialPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || !initialPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (initialPassword !== confirmPassword) {
      setError('Initial Password and Confirm Password do not match.');
      return;
    }
    if (initialPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/v1/users', {
        full_name: fullName.trim(),
        email: email.trim(),
        role: role,
        password: initialPassword,
        hospital: 'General Hospital',
        is_active: true,
        must_change_password: true
      });

      setSuccessMsg('Member created successfully.');
      setTimeout(() => {
        navigate('/sysadmin/members');
      }, 1500);
    } catch (err) {
      console.error("SYSADMIN API ERROR:", err);
      setError(err.response?.data?.detail || 'Failed to create member. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', pb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A' }}>
            ADD NEW MEMBER
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
            Create a new Doctor, Researcher, or Admin account with temporary credentials
          </Typography>
        </Box>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/sysadmin/members')} sx={{ fontWeight: 700 }}>
          Back to Directory
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{successMsg}</Alert>}

      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '20px', border: '1px solid #E2E8F0' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', mb: 0.8 }}>Full Name</Typography>
              <TextField
                placeholder="Dr. Kumar"
                fullWidth
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', mb: 0.8 }}>Email Address</Typography>
              <TextField
                placeholder="kumar@hospital.com"
                type="email"
                fullWidth
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', mb: 0.8 }}>Role</Typography>
              <TextField
                select
                fullWidth
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <MenuItem value="Doctor">Doctor</MenuItem>
                <MenuItem value="Researcher">Researcher</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', mb: 0.8 }}>Initial Password</Typography>
              <TextField
                placeholder="Enter temporary password"
                type="password"
                fullWidth
                value={initialPassword}
                onChange={e => setInitialPassword(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', mb: 0.8 }}>Confirm Password</Typography>
              <TextField
                placeholder="Confirm temporary password"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/sysadmin/members')}
                sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <PersonAddRoundedIcon />}
                sx={{ borderRadius: '10px', px: 3, fontWeight: 700, bgcolor: '#0F6CBD' }}
              >
                Create Member
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
