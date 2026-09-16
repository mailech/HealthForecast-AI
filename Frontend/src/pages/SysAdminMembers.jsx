import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress,
  IconButton, Tooltip, Grid
} from '@mui/material';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import api from '../api/api';

export default function SysAdminMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Deactivate modal
  const [deactivateModal, setDeactivateModal] = useState({ open: false, member: null });
  const [deactivating, setDeactivating] = useState(false);

  // Reset Password modal
  const [resetModal, setResetModal] = useState({ open: false, member: null });
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ open: false, member: null });
  const [deleting, setDeleting] = useState(false);

  // View member detail modal
  const [detailModal, setDetailModal] = useState({ open: false, member: null });

  const loadMembers = () => {
    setLoading(true);
    api.get('/api/v1/users')
      .then(res => setMembers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("SYSADMIN API ERROR:", err);
        setError('Failed to load system members directory.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleToggleStatus = async () => {
    if (!deactivateModal.member) return;
    const memberId = deactivateModal.member._id || deactivateModal.member.id;
    const targetStatus = deactivateModal.member.is_active === false; // Toggle to True if currently False
    
    setDeactivating(true);
    try {
      await api.patch(`/api/v1/users/${memberId}/status`, { is_active: targetStatus });
      setDeactivateModal({ open: false, member: null });
      loadMembers();
    } catch (err) {
      console.error("SYSADMIN API ERROR:", err);
      alert(err.response?.data?.detail || 'Failed to update member status.');
    } finally {
      setDeactivating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal.member || !newPassword) return;
    const memberId = resetModal.member._id || resetModal.member.id;
    setResetting(true);
    try {
      await api.patch(`/api/v1/users/${memberId}/password`, { new_password: newPassword });
      alert('Member password reset successfully. User will be forced to change password on next login.');
      setResetModal({ open: false, member: null });
      setNewPassword('');
    } catch (err) {
      console.error("SYSADMIN API ERROR:", err);
      alert(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteModal.member) return;
    const memberId = deleteModal.member._id || deleteModal.member.id;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/users/${memberId}`);
      setDeleteModal({ open: false, member: null });
      loadMembers();
    } catch (err) {
      console.error("SYSADMIN API ERROR:", err);
      alert(err.response?.data?.detail || 'Failed to delete member.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const nameMatch = (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (m.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let roleMatch = true;
    if (roleFilter !== 'ALL') {
      roleMatch = (m.role || '').toLowerCase() === roleFilter.toLowerCase();
    }

    let statusMatch = true;
    if (statusFilter === 'ACTIVE') statusMatch = m.is_active !== false;
    if (statusFilter === 'INACTIVE') statusMatch = m.is_active === false;

    return nameMatch && roleMatch && statusMatch;
  });

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', pb: 6 }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A' }}>Member Management</Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
            System Administration Directory — Manage member roles, statuses, and credentials
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddRoundedIcon />}
          onClick={() => navigate('/sysadmin/members/add')}
          sx={{
            bgcolor: '#0F6CBD', fontWeight: 700, px: 2.5, py: 1, borderRadius: '11px',
            boxShadow: '0 4px 14px rgba(15,108,189,0.25)',
            '&:hover': { bgcolor: '#0A4E8A' }
          }}
        >
          Add Member
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* Filter and Search Controls */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '18px', border: '1px solid #E2E8F0', mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              placeholder="Search by name or email..."
              fullWidth
              size="small"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Role Filter</InputLabel>
              <Select value={roleFilter} label="Role Filter" onChange={e => setRoleFilter(e.target.value)}>
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="Doctor">Doctor</MenuItem>
                <MenuItem value="Researcher">Researcher</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="SysAdmin">SysAdmin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select value={statusFilter} label="Status Filter" onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Members Directory Table */}
      <Paper elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E2E8F0', p: 3 }}>
        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={36} sx={{ color: '#0F6CBD' }} />
          </Box>
        ) : filteredMembers.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 600, color: '#64748B' }}>No system members match the filters.</Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', border: 'none', py: 1.5 } }}>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.map((m, i) => (
                <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 1.4, fontSize: '0.85rem' } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{m.full_name}</TableCell>
                  <TableCell sx={{ color: '#475569' }}>{m.email}</TableCell>
                  <TableCell>
                    <Chip label={m.role} size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: '#F1F5F9', color: '#334155' }} />
                  </TableCell>
                  <TableCell>
                    {m.is_active !== false ? (
                      <Chip icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />} label="Active" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.68rem' }} />
                    ) : (
                      <Chip icon={<CancelRoundedIcon sx={{ fontSize: '14px !important' }} />} label="Inactive" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.68rem' }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="View Member Details">
                        <IconButton size="small" onClick={() => setDetailModal({ open: true, member: m })} sx={{ color: '#0F6CBD' }}>
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={m.is_active !== false ? "Deactivate Account" : "Activate Account"}>
                        <IconButton
                          size="small"
                          onClick={() => setDeactivateModal({ open: true, member: m })}
                          sx={{ color: m.is_active !== false ? '#EF4444' : '#10B981' }}
                        >
                          {m.is_active !== false ? <CancelRoundedIcon fontSize="small" /> : <CheckCircleRoundedIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton size="small" onClick={() => setResetModal({ open: true, member: m })} sx={{ color: '#9333EA' }}>
                          <LockResetRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Account">
                        <IconButton size="small" onClick={() => setDeleteModal({ open: true, member: m })} sx={{ color: '#DC2626' }}>
                          <DeleteForeverRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Deactivate/Activate Confirmation Modal */}
      <Dialog open={deactivateModal.open} onClose={() => setDeactivateModal({ open: false, member: null })}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {deactivateModal.member?.is_active !== false ? 'Deactivate Member?' : 'Activate Member?'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#475569' }}>
            {deactivateModal.member?.is_active !== false
              ? `Are you sure you want to deactivate ${deactivateModal.member?.full_name} (${deactivateModal.member?.email})? The member will be barred from logging in, but historical prediction records will be preserved.`
              : `Re-activate ${deactivateModal.member?.full_name}? The user will regain system access.`
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeactivateModal({ open: false, member: null })}>Cancel</Button>
          <Button
            variant="contained"
            color={deactivateModal.member?.is_active !== false ? 'error' : 'success'}
            onClick={handleToggleStatus}
            disabled={deactivating}
          >
            {deactivating ? <CircularProgress size={20} /> : (deactivateModal.member?.is_active !== false ? 'Deactivate' : 'Activate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onClose={() => setDeleteModal({ open: false, member: null })}>
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626' }}>Delete Member Account?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#475569' }}>
            Are you sure you want to delete member account <strong>{deleteModal.member?.full_name}</strong> ({deleteModal.member?.email})? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteModal({ open: false, member: null })}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteMember}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetModal.open} onClose={() => setResetModal({ open: false, member: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reset Member Password</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mb: 2 }}>
            Set a temporary password for {resetModal.member?.full_name}. The user will be required to change password on first login.
          </Typography>
          <TextField
            label="Temporary Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResetModal({ open: false, member: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleResetPassword} disabled={resetting || !newPassword}>
            {resetting ? <CircularProgress size={20} /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Member Details Modal */}
      <Dialog open={detailModal.open} onClose={() => setDetailModal({ open: false, member: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Member Profile Details</DialogTitle>
        <DialogContent>
          {detailModal.member && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              <Typography sx={{ fontSize: '0.85rem' }}><strong>Full Name:</strong> {detailModal.member.full_name}</Typography>
              <Typography sx={{ fontSize: '0.85rem' }}><strong>Email:</strong> {detailModal.member.email}</Typography>
              <Typography sx={{ fontSize: '0.85rem' }}><strong>Role:</strong> {detailModal.member.role}</Typography>
              <Typography sx={{ fontSize: '0.85rem' }}><strong>Status:</strong> {detailModal.member.is_active !== false ? 'Active' : 'Inactive'}</Typography>
              <Typography sx={{ fontSize: '0.85rem' }}><strong>Hospital:</strong> {detailModal.member.hospital || 'General Hospital'}</Typography>
              <Typography sx={{ fontSize: '0.85rem' }}><strong>Must Change Password:</strong> {detailModal.member.must_change_password ? 'Yes' : 'No'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailModal({ open: false, member: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
