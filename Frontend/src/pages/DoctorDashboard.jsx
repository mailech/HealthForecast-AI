import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Alert,
  Avatar, Skeleton, Table, TableBody, TableCell, TableHead, TableRow,
  Button, TextField, InputAdornment, Chip
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
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

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/api/v1/dashboard/stats')
      .then(res => {
        console.log("DOCTOR DASHBOARD STATS API RESPONSE:", res.data);
        setStats(res.data);
      })
      .catch(err => {
        console.error("DOCTOR DASHBOARD STATS API ERROR:", err?.response?.status, err?.response?.data || err.message);
        setError('Failed to load doctor dashboard stats.');
      })
      .finally(() => setLoading(false));
  }, []);

  const recentPreds = stats?.recent_predictions || [];
  const filteredPreds = recentPreds.filter(p =>
    (p.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Header Banner */}
      <Box sx={{
        mb: 3.5, p: 3, borderRadius: '18px',
        background: 'linear-gradient(135deg, #0F6CBD 0%, #18A999 100%)',
        color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(15,108,189,0.2)'
      }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.4rem' }}>Doctor Clinical Dashboard</Typography>
          <Typography sx={{ fontSize: '0.85rem', opacity: 0.9, mt: 0.4 }}>
            Evaluate patient metrics, create readmission risk predictions, and review clinical histories.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => navigate('/doctor/prediction')}
          sx={{
            bgcolor: '#FFFFFF', color: '#0F6CBD', fontWeight: 700, px: 2.5, py: 1.1,
            borderRadius: '11px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#F8FAFC', transform: 'translateY(-1px)' }
          }}
        >
          New AI Prediction
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* 4 Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Patients</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{stats?.total_patients ?? 0}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PeopleRoundedIcon sx={{ color: '#0F6CBD' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Predictions Made</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{stats?.total_predictions ?? 0}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PsychologyRoundedIcon sx={{ color: '#9333EA' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>High Risk Cases</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626' }}>{stats?.high_risk_count ?? 0}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WarningAmberRoundedIcon sx={{ color: '#EF4444' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Quick Action</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F6CBD', mt: 0.5, cursor: 'pointer' }} onClick={() => navigate('/doctor/prediction')}>
                  Run Assessment &rarr;
                </Typography>
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AddRoundedIcon sx={{ color: '#0D9488' }} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Patient Search & Recent Predictions */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Recent Clinical Predictions</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>Search and review recent patient evaluations</Typography>
          </Box>
          <TextField
            placeholder="Search patient ID..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 260 } }}
          />
        </Box>

        {loading ? (
          <Box>{[...Array(4)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 1, borderRadius: '8px' }} />)}</Box>
        ) : filteredPreds.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography sx={{ color: '#64748B', fontWeight: 600 }}>No prediction records found.</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.72rem', color: '#64748B', border: 'none', py: 1.2 } }}>
                  <TableCell>Patient ID</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Evaluated By</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPreds.slice(0, 8).map((p, i) => (
                  <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 1.3, fontSize: '0.85rem' } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{p.patient_id}</TableCell>
                    <TableCell><RiskBadge level={p.risk_level} /></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{p.readmission_risk_score ? `${round(p.readmission_risk_score * 100)}%` : '—'}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{p.doctor_name || p.predicted_by || 'Dr. Sarah Connor'}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        endIcon={<ArrowForwardRoundedIcon />}
                        onClick={() => navigate('/doctor/predictions')}
                        sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F6CBD' }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  );
}

function round(val) {
  return Math.round(val);
}
