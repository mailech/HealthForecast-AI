import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography,
  CircularProgress, Alert, InputAdornment, IconButton,
  Paper, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const DEMO_CREDENTIALS = {
  Doctor: { email: 'doctor@hospital.com', pass: 'Password123' },
  Researcher: { email: 'researcher@hospital.com', pass: 'Password123' },
  Admin: { email: 'admin@hospital.com', pass: 'Password123' },
  SysAdmin: { email: 'sysadmin@hospital.com', pass: 'Password123' },
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      username: DEMO_CREDENTIALS.Doctor.email,
      password: DEMO_CREDENTIALS.Doctor.pass,
    }
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleChange = (event, newRole) => {
    if (newRole) {
      setSelectedRole(newRole);
      const creds = DEMO_CREDENTIALS[newRole];
      if (creds) {
        setValue('username', creds.email);
        setValue('password', creds.pass);
      }
    }
  };

  const isRoleMatch = (selected, userRole) => {
    const normSel = (selected || '').toLowerCase().replace(/ /g, '');
    const normUser = (userRole || '').toLowerCase().replace(/ /g, '');
    if (normSel === normUser) return true;
    if (normSel === 'doctor' && normUser === 'doctor') return true;
    if (normSel === 'researcher' && (normUser === 'researcher' || normUser === 'healthcareresearcher')) return true;
    if (normSel === 'admin' && (normUser === 'admin' || normUser === 'hospitaladministrator' || normUser === 'hospitaladmin')) return true;
    if (normSel === 'sysadmin' && (normUser === 'sysadmin' || normUser === 'systemadministrator')) return true;
    return false;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('username', data.username.trim());
      params.append('password', data.password);

      const res = await api.post('/api/v1/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const rawUser = res.data.user || {};
      const userData = {
        ...rawUser,
        id: rawUser._id || rawUser.id || '',
        email: rawUser.email || data.username,
      };

      // Validate selected role against authenticated user's actual role
      if (!isRoleMatch(selectedRole, userData.role)) {
        setError('This account does not have access to the selected role.');
        setLoading(false);
        return;
      }

      login(res.data.access_token, userData);

      // Redirect strictly based on authenticated user's actual backend role
      const normRole = (userData.role || '').toLowerCase().replace(/ /g, '');
      if (normRole === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (normRole === 'researcher' || normRole === 'healthcareresearcher') {
        navigate('/researcher/dashboard');
      } else if (normRole === 'admin' || normRole === 'hospitaladministrator' || normRole === 'hospitaladmin') {
        navigate('/admin/dashboard');
      } else if (normRole === 'sysadmin' || normRole === 'systemadministrator') {
        navigate('/sysadmin/dashboard');
      } else {
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      const serverDetail = err.response?.data?.detail;
      if (!err.response || err.response.status === 502 || err.response.status === 503 || err.response.status === 504) {
        setError('Unable to connect to authentication server.');
      } else if (err.response.status === 401) {
        setError(serverDetail || 'Invalid email or password.');
      } else if (err.response.status === 403) {
        setError(serverDetail || 'This account does not have access to the selected role.');
      } else if (err.response.status === 422) {
        setError(serverDetail || 'Invalid login request format.');
      } else {
        setError(serverDetail || 'Unable to connect to authentication server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0F6CBD 0%, #18A999 50%, #0F6CBD 100%)',
        py: 4
      }}
    >
      {/* Decorative Elements */}
      <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

      {/* Main Login Card */}
      <Box className="animate-fadeIn" sx={{ width: '100%', maxWidth: 460, mx: 2, zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            p: { xs: 3, sm: 4 },
            boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.4)',
          }}
        >
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 58, height: 58, borderRadius: '18px',
                background: 'linear-gradient(135deg, #0F6CBD 0%, #18A999 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(15,108,189,0.35)', mx: 'auto', mb: 1.5,
              }}
            >
              <LocalHospitalIcon sx={{ color: '#FFFFFF', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.45rem', mb: 0.5 }}>
              Health Forecast AI
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
              Clinical Decision Support & Risk Intelligence System
            </Typography>
          </Box>

          {/* Role Selection UI Selector */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Role for Login:
            </Typography>
            <ToggleButtonGroup
              value={selectedRole}
              exclusive
              onChange={handleRoleChange}
              fullWidth
              sx={{
                bgcolor: '#F1F5F9',
                p: 0.5,
                borderRadius: '12px',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '9px !important',
                  py: 0.8,
                  px: 1,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#64748B',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: '#FFFFFF',
                    color: '#0F6CBD',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }
                }
              }}
            >
              <ToggleButton value="Doctor">
                <MedicalServicesRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} /> Doctor
              </ToggleButton>
              <ToggleButton value="Researcher">
                <ScienceRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} /> Researcher
              </ToggleButton>
              <ToggleButton value="Admin">
                <AdminPanelSettingsRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} /> Admin
              </ToggleButton>
              <ToggleButton value="SysAdmin">
                <SecurityRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} /> SysAdmin
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            <TextField
              label="Email Address"
              placeholder="enter email"
              fullWidth
              {...register('username', { required: 'Email is required' })}
              error={!!errors.username}
              helperText={errors.username?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC' } }}
            />

            <TextField
              label="Password"
              placeholder="enter password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC' } }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#0F6CBD',
                py: 1.3,
                mt: 1,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 6px 20px rgba(15,108,189,0.3)',
                '&:hover': {
                  bgcolor: '#0A4E8A',
                  boxShadow: '0 8px 28px rgba(15,108,189,0.4)',
                },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#FFFFFF' }} /> : `Sign In as ${selectedRole}`}
            </Button>
          </Box>

          {/* Footer note */}
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#94A3B8', fontWeight: 500 }}>
            &copy; {new Date().getFullYear()} Health Forecast AI • Protected System Access
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
