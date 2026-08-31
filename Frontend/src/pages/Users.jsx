import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box, Typography, Button, CircularProgress, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Chip, IconButton, Tooltip,
  Card, CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const ROLES = ['Doctor', 'Hospital Administrator', 'Healthcare Researcher', 'System Administrator'];

function UserForm({ initial, onSave, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initial || {} });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        {[['email', 'Email'], ['full_name', 'Full Name'], ['hospital', 'Hospital']].map(([name, label]) => (
          <Grid item xs={12} sm={6} key={name}>
            <TextField label={label} fullWidth size="small"
              {...register(name, { required: `${label} is required` })}
              error={!!errors[name]} helperText={errors[name]?.message} />
          </Grid>
        ))}
        <Grid item xs={12} sm={6}>
          <TextField select label="Role" fullWidth size="small" defaultValue={initial?.role || ''}
            {...register('role', { required: 'Role is required' })}
            error={!!errors.role} helperText={errors.role?.message}>
            {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
        </Grid>
        {!initial && (
          <Grid item xs={12} sm={6}>
            <TextField label="Password" type="password" fullWidth size="small"
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password} helperText={errors.password?.message} />
          </Grid>
        )}
      </Grid>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#1565C0' }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : initial ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState({ open: false, mode: 'create', user: null });
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { isAdmin } = useAuth();

  const fetchUsers = () => {
    setLoading(true);
    api.get('/api/v1/users?limit=100')
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users. Admin access required.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  // Block non-admins immediately — backend will also return 403
  if (!isAdmin) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 2 }}>
        <LockIcon sx={{ fontSize: 64, color: '#D32F2F', opacity: 0.4 }} />
        <Typography variant="h6" fontWeight={700} color="#D32F2F">Access Denied</Typography>
        <Typography variant="body2" color="text.secondary">Only System Administrators can manage users.</Typography>
      </Box>
    );
  }

  const handleSave = async (data) => {
    try {
      if (dialog.mode === 'create') {
        await api.post('/api/v1/users', data);
        setSnackbar({ open: true, message: 'User created successfully.', severity: 'success' });
      } else {
        await api.put(`/api/v1/users/${dialog.user.id}`, data);
        setSnackbar({ open: true, message: 'User updated successfully.', severity: 'success' });
      }
      setDialog({ open: false, mode: 'create', user: null });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Operation failed.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/users/${deleteId}`);
      setSnackbar({ open: true, message: 'User deleted.', severity: 'success' });
      fetchUsers();
    } catch {
      setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 180 },
    { field: 'full_name', headerName: 'Full Name', flex: 1, minWidth: 140 },
    { field: 'role', headerName: 'Role', flex: 1, minWidth: 160,
      renderCell: (p) => <Chip label={p.value} size="small" color="primary" variant="outlined" /> },
    { field: 'hospital', headerName: 'Hospital', flex: 1, minWidth: 140 },
    { field: 'is_active', headerName: 'Active', width: 80,
      renderCell: (p) => <Chip label={p.value ? 'Yes' : 'No'} size="small" color={p.value ? 'success' : 'default'} /> },
    {
      field: 'actions', headerName: 'Actions', width: 110, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" color="info" onClick={() => setDialog({ open: true, mode: 'edit', user: p.row })}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteId(p.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="#1565C0">Users Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, mode: 'create', user: null })}
          sx={{ bgcolor: '#1565C0', borderRadius: 2 }}>
          Add User
        </Button>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ height: 500 }}>
              <DataGrid
                rows={users}
                columns={columns}
                getRowId={(row) => row.id || row._id || row.email}
                pageSizeOptions={[10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
                sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#E3F2FD', fontWeight: 700 } }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, mode: 'create', user: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.mode === 'create' ? 'Create User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          <UserForm initial={dialog.user} onSave={handleSave} onClose={() => setDialog({ open: false, mode: 'create', user: null })} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
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
