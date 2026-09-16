import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, Typography, Alert, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Button, Chip
} from '@mui/material';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function SysAdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/v1/users')
      .then(res => setMembers(res.data || []))
      .catch((err) => {
        console.error("SYSADMIN API ERROR:", err);
        setError('Failed to load system member records.');
      })
      .finally(() => setLoading(false));
  }, []);

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.is_active !== false).length;
  const inactiveMembers = members.filter(m => m.is_active === false).length;
  const doctorCount = members.filter(m => (m.role || '').toLowerCase().includes('doctor')).length;
  const researcherCount = members.filter(m => (m.role || '').toLowerCase().includes('researcher')).length;
  const adminCount = members.filter(m => (m.role || '').toLowerCase().includes('admin') && !(m.role || '').toLowerCase().includes('sys')).length;

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Banner */}
      <Box sx={{
        mb: 3.5, p: 3, borderRadius: '18px',
        background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
        color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(15,23,42,0.25)'
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SecurityRoundedIcon sx={{ color: '#38BDF8', fontSize: 26 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.4rem' }}>System Administration Control Center</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.85rem', opacity: 0.85 }}>
            Manage system members, grant role authorizations, configure security policies, and audit system events.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddRoundedIcon />}
          onClick={() => navigate('/sysadmin/members/add')}
          sx={{
            bgcolor: '#38BDF8', color: '#0F172A', fontWeight: 800, px: 2.5, py: 1.1,
            borderRadius: '11px', boxShadow: '0 4px 14px rgba(56,189,248,0.3)',
            '&:hover': { bgcolor: '#0284C7', color: '#fff' }
          }}
        >
          Add New Member
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* 6 Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Members</Typography>
            {loading ? <Skeleton height={32} /> : <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A', mt: 0.5 }}>{totalMembers}</Typography>}
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active</Typography>
            {loading ? <Skeleton height={32} /> : <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: '#10B981', mt: 0.5 }}>{activeMembers}</Typography>}
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Inactive</Typography>
            {loading ? <Skeleton height={32} /> : <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: '#EF4444', mt: 0.5 }}>{inactiveMembers}</Typography>}
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Doctors</Typography>
            {loading ? <Skeleton height={32} /> : <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F6CBD', mt: 0.5 }}>{doctorCount}</Typography>}
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Researchers</Typography>
            {loading ? <Skeleton height={32} /> : <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: '#9333EA', mt: 0.5 }}>{researcherCount}</Typography>}
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Admins</Typography>
            {loading ? <Skeleton height={32} /> : <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: '#0D9488', mt: 0.5 }}>{adminCount}</Typography>}
          </Card>
        </Grid>
      </Grid>

      {/* Quick Navigation Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate('/sysadmin/members')}
            sx={{
              p: 2.5, borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer',
              transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
              <ManageAccountsRoundedIcon sx={{ color: '#0F6CBD' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>Member Management</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.3 }}>View, edit, activate, deactivate, or reset member passwords.</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate('/sysadmin/roles')}
            sx={{
              p: 2.5, borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer',
              transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
              <SecurityRoundedIcon sx={{ color: '#9333EA' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>Role Management</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.3 }}>Inspect permission matrix for Doctor, Researcher, Admin, SysAdmin.</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate('/sysadmin/system-config')}
            sx={{
              p: 2.5, borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer',
              transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
              <SettingsRoundedIcon sx={{ color: '#0D9488' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>System Configuration</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.3 }}>Configure system parameters and database connectivity settings.</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate('/sysadmin/logs')}
            sx={{
              p: 2.5, borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer',
              transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
              <FormatListNumberedRoundedIcon sx={{ color: '#D97706' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>Audit Logs</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.3 }}>Review security access, login events, and member modifications.</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* System Members Summary Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>System Members Overview</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>System accounts registered across all four roles</Typography>
          </Box>
          <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/sysadmin/members')} sx={{ fontWeight: 700, color: '#0F172A' }}>
            Full Member Directory
          </Button>
        </Box>

        {loading ? <Skeleton height={180} /> : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.72rem', color: '#64748B', border: 'none', py: 1.2 } }}>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.slice(0, 6).map((m, i) => (
                <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 1.3, fontSize: '0.85rem' } }}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
}
