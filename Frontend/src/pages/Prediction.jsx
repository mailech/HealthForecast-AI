import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  MenuItem, CircularProgress, Alert, Snackbar, Chip, Avatar,
  Divider, Paper
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../api/api';

const riskConfig = {
  High: { color: '#D32F2F', bg: '#FFEBEE', border: '#FFCDD2', label: 'High Risk', icon: <WarningAmberIcon />, followup: '1 week', care: 'Immediate Intervention Required' },
  Medium: { color: '#E65100', bg: '#FFF3E0', border: '#FFE0B2', label: 'Medium Risk', icon: <WarningAmberIcon />, followup: '2 weeks', care: 'Close Monitoring Recommended' },
  Low: { color: '#2E7D32', bg: '#E8F5E9', border: '#C8E6C9', label: 'Low Risk', icon: <CheckCircleIcon />, followup: '1 month', care: 'Standard Care Protocol' },
};

function CircularRisk({ score, risk }) {
  const cfg = riskConfig[risk] || riskConfig.Low;
  const pct = Math.round((score || 0) * 100);
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={cfg.color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s ease' }}
          />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h4" fontWeight={800} color={cfg.color}>{pct}%</Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Risk</Typography>
        </Box>
      </Box>
      <Chip
        icon={cfg.icon}
        label={cfg.label}
        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, border: `1px solid ${cfg.border}`, px: 1, '& .MuiChip-icon': { color: cfg.color } }}
      />
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid #F0F2F5' }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
      <Typography variant="caption" fontWeight={700} color="#1A202C">{value || '—'}</Typography>
    </Box>
  );
}

export default function Prediction() {
  const [patients, setPatients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState({ blood_sugar: '', systolic_bp: '', diastolic_bp: '', num_medications: '', comorbidity_count: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  useEffect(() => {
    api.get('/api/v1/patients?limit=200')
      .then(res => setPatients(res.data))
      .finally(() => setLoadingPatients(false));
    api.get('/api/v1/prediction?limit=50')
      .then(res => setPredictions(res.data))
      .finally(() => setLoadingPredictions(false));
  }, []);

  const handlePatientSelect = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    setResult(null);
    const p = patients.find(pt => pt.patient_id === id);
    setPatient(p || null);
    if (p) {
      setVitals({
        blood_sugar: p.blood_sugar || '',
        systolic_bp: p.systolic_bp || '',
        diastolic_bp: p.diastolic_bp || '',
        num_medications: p.num_medications || '',
        comorbidity_count: p.comorbidity_count || '',
      });
    }
  };

  const handleVitalChange = (e) => setVitals(v => ({ ...v, [e.target.name]: e.target.value }));

  const handlePredict = async () => {
    if (!patient) return;
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        patient_id: patient.patient_id,
        gender: patient.gender || 'Male',
        age: Number(patient.age) || 0,
        length_of_stay: Number(patient.length_of_stay) || 0,
        num_previous_admissions: Number(patient.num_previous_admissions) || 0,
        num_medications: Number(vitals.num_medications) || 0,
        systolic_bp: Number(vitals.systolic_bp) || 0,
        diastolic_bp: Number(vitals.diastolic_bp) || 0,
        blood_sugar: Number(vitals.blood_sugar) || 0,
        comorbidity_count: Number(vitals.comorbidity_count) || 0,
      };
      const res = await api.post('/api/v1/prediction/predict', payload);
      setResult(res.data);
      setPredictions(prev => [res.data, ...prev]);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Prediction failed.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const cfg = result ? (riskConfig[result.risk_level] || riskConfig.Low) : null;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="#1A202C">Readmission Risk Prediction</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.3}>AI-powered patient readmission risk assessment</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: '16px', mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PersonIcon sx={{ color: '#1565C0' }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>Select Patient</Typography>
              </Box>

              <TextField
                select
                fullWidth
                size="small"
                label="Choose Patient"
                value={selectedPatientId}
                onChange={handlePatientSelect}
                disabled={loadingPatients}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              >
                {patients.map(p => (
                  <MenuItem key={p.patient_id} value={p.patient_id}>
                    {p.patient_id} — {p.first_name} {p.last_name}
                  </MenuItem>
                ))}
              </TextField>

              {patient && (
                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F0F7FF', border: '1px solid #BBDEFB' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#1565C0', width: 44, height: 44, fontSize: '1rem', fontWeight: 700 }}>
                      {patient.first_name?.[0]}{patient.last_name?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{patient.first_name} {patient.last_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{patient.patient_id}</Typography>
                    </Box>
                  </Box>
                  <InfoRow label="Age" value={patient.age} />
                  <InfoRow label="Gender" value={patient.gender} />
                  <InfoRow label="Blood Group" value={patient.blood_group} />
                  <InfoRow label="Hospital" value={patient.hospital} />
                  <InfoRow label="Prev. Admissions" value={patient.num_previous_admissions} />
                  <InfoRow label="Diabetes" value={patient.diabetes ? 'Yes' : 'No'} />
                  <InfoRow label="Hypertension" value={patient.hypertension ? 'Yes' : 'No'} />
                </Box>
              )}
            </CardContent>
          </Card>

          {patient && (
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FavoriteIcon sx={{ color: '#2E7D32' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Current Vitals</Typography>
                    <Typography variant="caption" color="text.secondary">Edit values before prediction</Typography>
                  </Box>
                </Box>
                <Grid container spacing={1.5}>
                  {[
                    { name: 'blood_sugar', label: 'Blood Sugar (mg/dL)' },
                    { name: 'systolic_bp', label: 'Systolic BP (mmHg)' },
                    { name: 'diastolic_bp', label: 'Diastolic BP (mmHg)' },
                    { name: 'num_medications', label: 'Medication Count' },
                    { name: 'comorbidity_count', label: 'Comorbidity Count' },
                  ].map(({ name, label }) => (
                    <Grid item xs={12} key={name}>
                      <TextField
                        name={name}
                        label={label}
                        type="number"
                        fullWidth
                        size="small"
                        value={vitals[name]}
                        onChange={handleVitalChange}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePredict}
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <PsychologyIcon />}
                  sx={{ mt: 2.5, bgcolor: '#1565C0', borderRadius: '12px', py: 1.3, fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 6px 20px rgba(21,101,192,0.3)' }}
                >
                  {submitting ? 'Analyzing...' : 'Run Prediction'}
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} md={7}>
          {!patient && !result && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, bgcolor: 'white', borderRadius: '16px', border: '2px dashed #BBDEFB' }}>
              <PsychologyIcon sx={{ fontSize: 64, color: '#BBDEFB', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>Select a Patient to Begin</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>Choose a patient from the dropdown to run AI prediction</Typography>
            </Box>
          )}

          {patient && !result && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, bgcolor: 'white', borderRadius: '16px', border: '2px dashed #C8E6C9' }}>
              <MedicalServicesIcon sx={{ fontSize: 64, color: '#A5D6A7', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>Ready to Predict</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>Review vitals and click "Run Prediction"</Typography>
            </Box>
          )}

          {result && cfg && (
            <Card sx={{ borderRadius: '16px', border: `2px solid ${cfg.border}`, bgcolor: cfg.bg, overflow: 'visible' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} color={cfg.color} mb={2.5}>
                  Prediction Result — {result.patient_id}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, mb: 3 }}>
                  <CircularRisk score={result.readmission_risk_score} risk={result.risk_level} />
                  <Box sx={{ flex: 1 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.8)', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Recommended Follow-up</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="#1A202C">Within {cfg.followup}</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.8)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <MedicalServicesIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Suggested Care</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="#1A202C">{cfg.care}</Typography>
                    </Paper>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2, borderColor: `${cfg.color}30` }} />

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Readmission Probability</Typography>
                      <Typography variant="h5" fontWeight={800} color={cfg.color} mt={0.5}>
                        {(result.readmission_risk_score * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Risk Category</Typography>
                      <Typography variant="h5" fontWeight={800} color={cfg.color} mt={0.5}>{result.risk_level}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Health Score</Typography>
                      <Typography variant="h5" fontWeight={800} color="#2E7D32" mt={0.5}>
                        {((1 - result.readmission_risk_score) * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`Risk: ${result.risk_level}`} size="small" sx={{ bgcolor: cfg.color, color: '#fff', fontWeight: 700 }} />
                  <Chip label={new Date(result.prediction_date).toLocaleString()} variant="outlined" size="small" />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Prediction History */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1A202C" mb={1.5}>Recent Predictions</Typography>
            {loadingPredictions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={1.5}>
                {predictions.slice(0, 6).map((p, i) => {
                  const c = riskConfig[p.risk_level] || riskConfig.Low;
                  return (
                    <Grid item xs={12} sm={6} key={i}>
                      <Card sx={{ borderRadius: '12px', borderLeft: `4px solid ${c.color}`, '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }, transition: 'all 0.2s' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight={700}>{p.patient_id}</Typography>
                            <Chip label={p.risk_level} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.7rem' }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">{new Date(p.prediction_date).toLocaleDateString()}</Typography>
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#E5E7EB', overflow: 'hidden' }}>
                              <Box sx={{ height: '100%', width: `${(p.readmission_risk_score * 100).toFixed(0)}%`, bgcolor: c.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                            </Box>
                            <Typography variant="caption" fontWeight={700}>{(p.readmission_risk_score * 100).toFixed(0)}%</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
