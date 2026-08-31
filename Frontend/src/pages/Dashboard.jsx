import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Alert,
  Avatar, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import api from '../api/api';

const RISK = {
  High:   { color: '#EF4444', bg: '#FEF2F2', text: '#DC2626', bar: '#EF4444' },
  Medium: { color: '#F59E0B', bg: '#FFFBEB', text: '#D97706', bar: '#F59E0B' },
  Low:    { color: '#10B981', bg: '#ECFDF5', text: '#059669', bar: '#10B981' },
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

function MetricCard({ title, value, sub, icon, color, loading }) {
  return (
    <Card sx={{
      borderRadius: '14px', border: '1px solid #E2E8F0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'all 0.2s',
      '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
              {title}
            </Typography>
            {loading
              ? <Skeleton width={56} height={38} />
              : <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{value ?? '—'}</Typography>
            }
            {sub && <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', mt: 0.4 }}>{sub}</Typography>}
          </Box>
          <Box sx={{ width: 40, height: 40, borderRadius: '11px', bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/v1/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>;

  const rb = stats?.risk_breakdown || {};
  const recentPreds = stats?.recent_predictions || [];
  const total = (rb.High || 0) + (rb.Medium || 0) + (rb.Low || 0);

  const metrics = [
    { title: 'Total Patients',    value: stats?.total_patients,    sub: 'Registered patients',        icon: <PeopleRoundedIcon sx={{ fontSize: 20, color: '#3B82F6' }} />,      color: '#3B82F6' },
    { title: 'Total Predictions', value: stats?.total_predictions, sub: 'AI assessments',             icon: <PsychologyRoundedIcon sx={{ fontSize: 20, color: '#8B5CF6' }} />,   color: '#8B5CF6' },
    { title: 'High Risk',         value: stats?.high_risk_count,   sub: 'Patients requiring attention', icon: <WarningAmberRoundedIcon sx={{ fontSize: 20, color: '#EF4444' }} />, color: '#EF4444' },
    { title: 'Active Treatments', value: stats?.total_treatments,  sub: 'Currently active',           icon: <MedicalServicesRoundedIcon sx={{ fontSize: 20, color: '#10B981' }} />, color: '#10B981' },
  ];

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>Hospital Analytics</Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>Real-time overview of patient health and readmission risk</Typography>
      </Box>

      {/* 4 Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((m) => (
          <Grid item xs={12} sm={6} md={3} key={m.title}>
            <MetricCard {...m} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Bottom Row: Risk Overview + Recent Predictions */}
      <Grid container spacing={2.5}>
        {/* Risk Overview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', mb: 0.3 }}>Risk Overview</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 2.5 }}>Patient risk distribution</Typography>

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[...Array(3)].map((_, i) => <Skeleton key={i} height={36} sx={{ borderRadius: '8px' }} />)}
                </Box>
              ) : total === 0 ? (
                <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 36, color: '#CBD5E1' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', textAlign: 'center' }}>No prediction data available</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { label: 'High Risk',   count: rb.High   || 0, key: 'High' },
                    { label: 'Medium Risk', count: rb.Medium || 0, key: 'Medium' },
                    { label: 'Low Risk',    count: rb.Low    || 0, key: 'Low' },
                  ].map(({ label, count, key }) => {
                    const r = RISK[key];
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <Box key={key}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.color }} />
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{label}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>{count}</Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>({pct}%)</Typography>
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 7, borderRadius: 4,
                            bgcolor: `${r.color}18`,
                            '& .MuiLinearProgress-bar': { bgcolor: r.color, borderRadius: 4 },
                          }}
                        />
                      </Box>
                    );
                  })}
                  <Box sx={{ mt: 1, pt: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>Total assessed</Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>{total}</Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Predictions */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', mb: 0.3 }}>Recent Predictions</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 2 }}>Latest AI risk assessments</Typography>

              {loading ? (
                <Box>{[...Array(4)].map((_, i) => <Skeleton key={i} height={44} sx={{ mb: 0.5, borderRadius: '8px' }} />)}</Box>
              ) : recentPreds.length === 0 ? (
                <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <PsychologyRoundedIcon sx={{ fontSize: 38, color: '#CBD5E1' }} />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>No predictions yet</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center' }}>Run an AI assessment to start building your risk analytics.</Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', py: 1.2 } }}>
                        <TableCell>Patient ID</TableCell>
                        <TableCell>Risk Level</TableCell>
                        <TableCell>Risk Score</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentPreds.slice(0, 5).map((p, i) => (
                        <TableRow key={i} sx={{ '& td': { border: 'none', py: 1.2, fontSize: '0.82rem' }, '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 26, height: 26, bgcolor: '#EFF6FF', color: '#1D4ED8', fontSize: '0.62rem', fontWeight: 700 }}>
                                {p.patient_id?.slice(-2)}
                              </Avatar>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' }}>{p.patient_id}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell><RiskBadge level={p.risk_level} /></TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: RISK[p.risk_level]?.text || '#0F172A' }}>
                              {p.readmission_risk_score ? `${(p.readmission_risk_score * 100).toFixed(1)}%` : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '0.78rem' }}>
                            {p.prediction_date ? new Date(p.prediction_date).toLocaleDateString() : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
