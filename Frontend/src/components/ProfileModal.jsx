import { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, Avatar, IconButton, Alert, CircularProgress
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function ProfileModal({ open, onClose }) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user && open) {
      setFullName(user.full_name || '');
      setProfilePic(user.profile_picture || null);
      setError('');
      setSuccessMsg('');
    }
  }, [user, open]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Doctor name cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        full_name: fullName.trim(),
        profile_picture: profilePic,
      };

      const res = await api.put('/api/v1/auth/me', payload);
      updateProfile(res.data);

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          p: 0.5,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonRoundedIcon sx={{ color: '#1D4ED8', fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
              Doctor Profile
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: '0.8rem' }}>
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: '8px', fontSize: '0.8rem' }}>
            {successMsg}
          </Alert>
        )}

        {/* Profile Picture Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profilePic || undefined}
              sx={{
                width: 90,
                height: 90,
                bgcolor: '#1D4ED8',
                fontSize: '2rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(29,78,216,0.25)',
                border: '3px solid #fff',
              }}
            >
              {!profilePic && (user.full_name?.charAt(0) || user.email?.charAt(0))?.toUpperCase()}
            </Avatar>

            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: '#1D4ED8',
                color: '#fff',
                border: '2px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#1E40AF' },
              }}
            >
              <PhotoCameraRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Box>

          <Button
            size="small"
            startIcon={<PhotoCameraRoundedIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ mt: 1.5, fontSize: '0.78rem', fontWeight: 600, color: '#1D4ED8', borderRadius: '8px' }}
          >
            Change Profile Picture
          </Button>
        </Box>

        {/* Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Doctor Display Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            size="small"
            placeholder="e.g. Dr. Sarah Connor"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.88rem' } }}
          />

          <TextField
            label="Email Address"
            value={user.email || ''}
            disabled
            fullWidth
            size="small"
            helperText="Read-only"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.88rem', bgcolor: '#F8FAFC' } }}
          />

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label="Role"
              value={user.role || ''}
              disabled
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.88rem', bgcolor: '#F8FAFC' } }}
            />
            {user.hospital && (
              <TextField
                label="Hospital / Unit"
                value={user.hospital || ''}
                disabled
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.88rem', bgcolor: '#F8FAFC' } }}
              />
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, borderTop: '1px solid #F1F5F9', gap: 1 }}>
        <Button onClick={onClose} disabled={saving} sx={{ borderRadius: '9px', color: '#64748B', fontSize: '0.82rem' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
          sx={{
            borderRadius: '9px',
            bgcolor: '#1D4ED8',
            fontWeight: 700,
            fontSize: '0.82rem',
            px: 3,
            '&:hover': { bgcolor: '#1E40AF' },
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
