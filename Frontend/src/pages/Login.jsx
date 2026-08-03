import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography,
  CircularProgress, Alert, InputAdornment, IconButton,
  Checkbox, FormControlLabel
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('username', data.username);
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
      login(res.data.access_token, userData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
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
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <Box
        className="animate-fadeIn"
        sx={{
          width: '100%',
          maxWidth: 420,
          mx: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            p: { xs: 3, sm: 4 },
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {/* Logo & Branding */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0F6CBD 0%, #18A999 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(15,108,189,0.3)',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LocalHospitalIcon sx={{ color: '#FFFFFF', fontSize: 30 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#1A202C',
                mb: 0.5,
                fontSize: '1.35rem',
              }}
            >
              Health Forecast AI
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                fontWeight: 500,
              }}
            >
              Sign in to your account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: '12px',
                bgcolor: '#FFEBEE',
                color: '#D32F2F',
                '& .MuiAlert-icon': { color: '#D32F2F' },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              label="Email"
              placeholder="Enter your email"
              fullWidth
              {...register('username', { required: 'Email is required' })}
              error={!!errors.username}
              helperText={errors.username?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F9FAFB',
                },
              }}
            />

            <TextField
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: '#9CA3AF' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F9FAFB',
                },
              }}
            />

            {/* Remember Me */}
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  sx={{
                    color: '#D1D5DB',
                    '&.Mui-checked': {
                      color: '#0F6CBD',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  Remember me
                </Typography>
              }
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#0F6CBD',
                py: 1.3,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 6px 20px rgba(15,108,189,0.3)',
                '&:hover': {
                  bgcolor: '#0A4E8A',
                  boxShadow: '0 8px 28px rgba(15,108,189,0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: '#FFFFFF' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              color: '#9CA3AF',
              fontWeight: 500,
            }}
          >
            &copy; {new Date().getFullYear()} Health Forecast AI. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

