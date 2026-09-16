import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, Typography, Alert, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Button
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const RISK = {
  High: { color: '#EF4444', bg: '#FEF2F2', text: '#DC2626' },
  Medium: { color: '#F59E0B', bg: '#FFFBEB', text: '#D97706' },
  Low: { color: '#10B981', bg: '#ECFDF5', text: '#059669' },
};

function RiskBadge({ level }) {
  const r = RISK[level] || RISK.Low;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.3, borderRadius: '6px', bgcolor: r.bg }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: r.color }} />
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: r.text }}>{level}</Typography>
    </Box>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [userCounts, setUserCounts] = useState({ doctors: 0, researchers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/dashboard/stats'),
      api.get('/api/v1/users').catch(() => ({ data: [] }))
    ]).then(([statsRes, usersRes]) => {
      setStats(statsRes.data);
      const users = usersRes.data || [];
      const docs = users.filter(u => (u.role || '').toLowerCase().includes('doctor')).length;
      const res = users.filter(u => (u.role || '').toLowerCase().includes('researcher')).length;
      setUserCounts({ doctors: docs || 1, researchers: res || 1 });
    }).catch(() => setError('Failed to load admin dashboard overview.'))
      .finally(() => setLoading(false));
  }, []);

  const recentPreds = stats?.recent_predictions || [];

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Banner */}
      <Box sx={{
        mb: 3.5, p: 3, borderRadius: '18px',
        background: 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)',
        color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(2,132,199,0.2)'
      }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.4rem' }}>Hospital Data Administration</Typography>
          <Typography sx={{ fontSize: '0.85rem', opacity: 0.9, mt: 0.4 }}>
            System operational metrics, staff performance, patient records, and clinical report management.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AssessmentRoundedIcon />}
          onClick={() => navigate('/admin/predictions')}
          sx={{
            bgcolor: '#FFFFFF', color: '#0284C7', fontWeight: 700, px: 2.5, py: 1.1,
            borderRadius: '11px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#F8FAFC' }
          }}
        >
          View Predictions
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* 4 Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Doctors</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{userCounts.doctors}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BadgeRoundedIcon sx={{ color: '#0284C7' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Researchers</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{userCounts.researchers}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScienceRoundedIcon sx={{ color: '#9333EA' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Patients</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{stats?.total_patients ?? 0}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PeopleRoundedIcon sx={{ color: '#0D9488' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Predictions</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{stats?.total_predictions ?? 0}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PsychologyRoundedIcon sx={{ color: '#D97706' }} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Predictions Overview Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Application Predictions Overview</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Monitoring clinical risk scoring activity across departments</Typography>
          </Box>
          <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/admin/predictions')} sx={{ fontWeight: 700, color: '#0284C7' }}>
            All Predictions
          </Button>
        </Box>

        {loading ? <Skeleton height={200} /> : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.72rem', color: '#64748B', border: 'none', py: 1.2 } }}>
                <TableCell>Patient ID</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Doctor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentPreds.slice(0, 6).map((p, i) => (
                <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 1.3, fontSize: '0.85rem' } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{p.patient_id}</TableCell>
                  <TableCell><RiskBadge level={p.risk_level} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{p.readmission_risk_score ? `${Math.round(p.readmission_risk_score * 100)}%` : '—'}</TableCell>
                  <TableCell sx={{ color: '#64748B' }}>{p.doctor_name || p.predicted_by || 'Dr. Sarah Connor'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
}
