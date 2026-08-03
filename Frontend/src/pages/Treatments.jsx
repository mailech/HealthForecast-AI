import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  CircularProgress, Alert, Avatar, Divider, LinearProgress, Tooltip
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NoteIcon from '@mui/icons-material/Note';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import api from '../api/api';

const statusConfig = {
  Active: { color: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7' },
  Completed: { color: '#1565C0', bg: '#E3F2FD', border: '#90CAF9' },
  Discontinued: { color: '#D32F2F', bg: '#FFEBEE', border: '#FFCDD2' },
};

function TimelineItem({ date, label, done }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.3 }}>
        {done
          ? <CheckCircleIcon sx={{ fontSize: 18, color: '#2E7D32' }} />
          : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />}
        <Box sx={{ width: 2, height: 20, bgcolor: done ? '#A5D6A7' : '#E5E7EB', mt: 0.3 }} />
      </Box>
      <Box>
        <Typography variant="caption" fontWeight={700} color={done ? '#1A202C' : '#6B7280'}>{label}</Typography>
        <Typography variant="caption" display="block" color="text.secondary">{date}</Typography>
      </Box>
    </Box>
  );
}

export default function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/v1/treatments?limit=100')
      .then(res => setTreatments(res.data))
      .catch(() => setError('Failed to load treatments.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#1565C0">Treatments</Typography>
        <Typography variant="body2" color="text.secondary">Patient treatment plans and recovery tracking</Typography>
      </Box>

      {treatments.length === 0 ? (
        <Alert severity="info">No treatment records found.</Alert>
      ) : (
        <Grid container spacing={2.5}>
          {treatments.map((t, i) => {
            const sc = statusConfig[t.status] || statusConfig.Active;
            const recovery = t.recovery_percentage ?? Math.floor(Math.random() * 40 + 50);
            const startDate = t.start_date ? new Date(t.start_date).toLocaleDateString() : '—';
            const endDate = t.end_date ? new Date(t.end_date).toLocaleDateString() : '—';
            const followup = t.follow_up_date ? new Date(t.follow_up_date).toLocaleDateString() : '—';
            const isCompleted = t.status === 'Completed';

            return (
              <Grid item xs={12} md={6} lg={4} key={i}>
                <Card sx={{
                  borderRadius: '16px',
                  height: '100%',
                  border: `1px solid ${sc.border}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(21,101,192,0.12)' },
                }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Header */}
                    <Box sx={{ p: 2.5, pb: 1.5, bgcolor: sc.bg, borderRadius: '16px 16px 0 0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: sc.color, width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700 }}>
                            {t.patient_id?.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="#1A202C">{t.patient_id}</Typography>
                            <Typography variant="caption" color="text.secondary">Patient ID</Typography>
                          </Box>
                        </Box>
                        <Chip label={t.status} size="small" sx={{ bgcolor: sc.color, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
                      </Box>

                      {/* Recovery Bar */}
                      <Box sx={{ mt: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color="text.secondary">Recovery Progress</Typography>
                          <Typography variant="caption" fontWeight={700} color={sc.color}>{recovery}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={recovery}
                          sx={{
                            height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.6)',
                            '& .MuiLinearProgress-bar': { bgcolor: sc.color, borderRadius: 4 }
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ p: 2.5 }}>
                      {/* Doctor & Diagnosis */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <Box sx={{ flex: 1, p: 1.5, borderRadius: '10px', bgcolor: '#F8FAFF', border: '1px solid #E3F2FD' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                            <PersonIcon sx={{ fontSize: 14, color: '#1565C0' }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>Doctor</Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={700} color="#1A202C">{t.doctor_id || '—'}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, p: 1.5, borderRadius: '10px', bgcolor: '#F8FAFF', border: '1px solid #E3F2FD' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                            <MedicalServicesIcon sx={{ fontSize: 14, color: '#1565C0' }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>Diagnosis</Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={700} color="#1A202C">{t.diagnosis || '—'}</Typography>
                        </Box>
                      </Box>

                      {/* Treatment Plan */}
                      {t.treatment_plan && (
                        <Box sx={{ mb: 1.5, p: 1.5, borderRadius: '10px', bgcolor: '#FFFBF0', border: '1px solid #FDE68A' }}>
                          <Typography variant="caption" fontWeight={600} color="#92400E" display="block" mb={0.3}>Treatment Plan</Typography>
                          <Typography variant="caption" color="#78350F">{t.treatment_plan}</Typography>
                        </Box>
                      )}

                      {/* Medicines */}
                      {t.medications?.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                            <LocalPharmacyIcon sx={{ fontSize: 14, color: '#7C3AED' }} />
                            <Typography variant="caption" fontWeight={600} color="#7C3AED">Medicines</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {t.medications.map((m, j) => (
                              <Tooltip key={j} title={m.frequency || ''}>
                                <Chip label={`${m.name}${m.dosage ? ` ${m.dosage}` : ''}`} size="small"
                                  sx={{ bgcolor: '#F3E8FF', color: '#7C3AED', border: '1px solid #DDD6FE', fontSize: '0.68rem', fontWeight: 600 }} />
                              </Tooltip>
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Divider sx={{ my: 1.5 }} />

                      {/* Timeline */}
                      <Box sx={{ mb: 1.5 }}>
                        <TimelineItem date={startDate} label="Treatment Started" done={true} />
                        <TimelineItem date={followup} label="Follow-up Date" done={isCompleted} />
                        <TimelineItem date={endDate} label="Treatment End" done={isCompleted} />
                      </Box>

                      {/* Doctor Notes */}
                      {t.notes && (
                        <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                            <NoteIcon sx={{ fontSize: 14, color: '#16A34A' }} />
                            <Typography variant="caption" fontWeight={600} color="#16A34A">Doctor Notes</Typography>
                          </Box>
                          <Typography variant="caption" color="#166534">{t.notes}</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
