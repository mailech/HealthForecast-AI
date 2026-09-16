import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Alert, Box, CircularProgress
} from '@mui/material';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function ForcePasswordChangeModal({ open, onSuccess }) {
  const { updateProfile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/v1/auth/change-password', {
        new_password: newPassword
      });
      updateProfile({ must_change_password: false });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} maxWidth="xs" fullWidth align="center" paperprops={{ sx: { borderRadius: '20px', p: 1 } }}>
      <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
        <Box sx={{
          width: 54, height: 54, borderRadius: '16px', bgcolor: '#EFF6FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5
        }}>
          <LockResetRoundedIcon sx={{ color: '#0F6CBD', fontSize: 30 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
          Change Temporary Password
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.5 }}>
          Your account was set up with an initial temporary password. Please set a secure password to proceed.
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.2,
              borderRadius: '12px',
              bgcolor: '#0F6CBD',
              fontWeight: 700,
              mt: 1,
              '&:hover': { bgcolor: '#0A4E8A' }
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Update Password & Continue'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
