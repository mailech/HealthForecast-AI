import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Alert,
  Skeleton, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress, Button, Chip
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
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

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/v1/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load researcher analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const rb = stats?.risk_breakdown || {};
  const totalPreds = stats?.total_predictions || 0;
  const recentPreds = stats?.recent_predictions || [];

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Banner */}
      <Box sx={{
        mb: 3.5, p: 3, borderRadius: '18px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
        color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(79,70,229,0.2)'
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.4rem' }}>Healthcare Research Analytics</Typography>
            <Chip label="Read-Only Analytics Mode" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '0.65rem' }} />
          </Box>
          <Typography sx={{ fontSize: '0.85rem', opacity: 0.9 }}>
            Study population readmission patterns, evaluate epidemiological risk distribution, and export analytical datasets.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AssessmentRoundedIcon />}
          onClick={() => navigate('/researcher/predictions')}
          sx={{
            bgcolor: '#FFFFFF', color: '#4F46E5', fontWeight: 700, px: 2.5, py: 1.1,
            borderRadius: '11px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#F8FAFC' }
          }}
        >
          View Prediction History
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Data Records / Patients</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{stats?.total_patients ?? 0}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PeopleRoundedIcon sx={{ color: '#3B82F6' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Existing Predictions</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{totalPreds}</Typography>}
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
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>High Risk Cohort</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626' }}>{rb.High || 0}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScienceRoundedIcon sx={{ color: '#EF4444' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Low / Moderate Cohort</Typography>
                {loading ? <Skeleton width={60} height={36} /> : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>{(rb.Low || 0) + (rb.Medium || 0)}</Typography>}
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AssessmentRoundedIcon sx={{ color: '#10B981' }} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Grid: Risk Breakdown + Recent Predictions */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 3, height: '100%' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', mb: 0.5 }}>Risk Distribution Statistics</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mb: 3 }}>Aggregated from recorded predictions</Typography>

            {loading ? <Skeleton height={150} /> : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {[
                  { label: 'High Risk', count: rb.High || 0, key: 'High' },
                  { label: 'Medium Risk', count: rb.Medium || 0, key: 'Medium' },
                  { label: 'Low Risk', count: rb.Low || 0, key: 'Low' },
                ].map(({ label, count, key }) => {
                  const r = RISK[key];
                  const pct = totalPreds > 0 ? Math.round((count / totalPreds) * 100) : 0;
                  return (
                    <Box key={key}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>{label}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: r.text }}>{count} ({pct}%)</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ height: 8, borderRadius: 4, bgcolor: `${r.color}20`, '& .MuiLinearProgress-bar': { bgcolor: r.color, borderRadius: 4 } }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Saved Prediction Dataset</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Historical readmission risk calculations for research analysis</Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate('/researcher/predictions')}
                sx={{ fontWeight: 700, color: '#4F46E5' }}
              >
                View History Log
              </Button>
            </Box>

            {loading ? <Skeleton height={200} /> : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.72rem', color: '#64748B', border: 'none', py: 1.2 } }}>
                    <TableCell>Patient ID</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Evaluated By</TableCell>
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
        </Grid>
      </Grid>
    </Box>
  );
}
