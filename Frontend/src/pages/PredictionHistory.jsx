import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Button, TextField, InputAdornment, Chip, CircularProgress, Alert, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const RISK_BADGES = {
  High: { bg: '#FEF2F2', color: '#DC2626' },
  Moderate: { bg: '#FFFBEB', color: '#D97706' },
  Medium: { bg: '#FFFBEB', color: '#D97706' },
  Low: { bg: '#ECFDF5', color: '#059669' },
};

export default function PredictionHistory() {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const normRole = (role || '').toLowerCase();
  const canDelete = normRole === 'doctor';

  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null); // prediction object to delete
  const [deleting, setDeleting] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);

  const fetchPredictions = () => {
    setLoading(true);
    const endpoint = patient_id
      ? `/api/v1/prediction/patient/${patient_id}`
      : `/api/v1/prediction?limit=200`;

    api.get(endpoint)
      .then(res => setPredictions(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load prediction history.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPredictions();
  }, [patient_id]);

  const handleDownloadPDF = async (predId, patientId) => {
    setDownloadingId(predId);
    try {
      const res = await api.get(`/api/v1/prediction/${predId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prediction_report_${patientId || 'record'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download PDF report.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const predId = deleteTarget._id || deleteTarget.id;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/prediction/${predId}`);
      setPredictions(prev => prev.filter(p => (p._id || p.id) !== predId));
      setSnackMsg('Prediction deleted successfully.');
      setSnackOpen(true);
    } catch (err) {
      setSnackMsg(err?.response?.data?.detail || 'Failed to delete prediction.');
      setSnackOpen(true);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = predictions.filter(p =>
    (p.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.doctor_name || p.predicted_by || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.risk_level || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#0F172A' }}>
            {patient_id ? `Prediction History — Patient ${patient_id}` : 'All Prediction Records'}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
            Historical AI readmission risk evaluation reports and downloadable summaries
          </Typography>
        </Box>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)} sx={{ fontWeight: 700 }}>
          Back
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search by patient name, ID, or doctor..."
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
            sx={{ width: { xs: '100%', sm: 320 } }}
          />
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            Total Records: {filtered.length}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={36} sx={{ color: '#0F6CBD' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <HistoryRoundedIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
            <Typography sx={{ fontWeight: 600, color: '#64748B' }}>No prediction history found.</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.72rem', color: '#64748B', border: 'none', py: 1.2 } }}>
                  <TableCell>Date &amp; Time</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p, i) => {
                  const predId = p._id || p.id;
                  const rb = RISK_BADGES[p.risk_level] || RISK_BADGES.Low;
                  const dateStr = p.prediction_date
                    ? new Date(p.prediction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';

                  const prob = p.model1_probability ?? p.readmission_risk_score ?? 0;
                  const probStr = typeof prob === 'number' ? `${Math.round(prob * 100)}%` : String(prob);

                  return (
                    <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 1.3, fontSize: '0.85rem' } }}>
                      <TableCell sx={{ color: '#475569', fontWeight: 600 }}>{dateStr}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                          {p.patient_name || p.patient_id}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>{p.patient_id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={p.risk_level || 'Low'} size="small" sx={{ bgcolor: rb.bg, color: rb.color, fontWeight: 800, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: rb.color }}>{probStr}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{p.doctor_name || p.predicted_by || '—'}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityRoundedIcon />}
                            onClick={() => navigate(`/doctor/prediction/result/${predId}`, { state: { prediction: p } })}
                            sx={{ fontSize: '0.72rem', fontWeight: 700, borderRadius: '8px', py: 0.4 }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={downloadingId === predId ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <DownloadRoundedIcon />}
                            onClick={() => handleDownloadPDF(predId, p.patient_id)}
                            disabled={downloadingId === predId}
                            sx={{ fontSize: '0.72rem', fontWeight: 700, borderRadius: '8px', py: 0.4, bgcolor: '#0F6CBD' }}
                          >
                            PDF
                          </Button>
                          {canDelete && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineRoundedIcon />}
                              onClick={() => setDeleteTarget(p)}
                              sx={{ fontSize: '0.72rem', fontWeight: 700, borderRadius: '8px', py: 0.4 }}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* ─── Delete Confirmation Dialog ──────────────────────────────────── */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WarningAmberRoundedIcon sx={{ color: '#EF4444', fontSize: 20 }} />
          </Box>
          Delete Prediction?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete this prediction record?
          </Typography>
          {deleteTarget && (
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                {deleteTarget.patient_name || deleteTarget.patient_id}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                {deleteTarget.risk_level} risk &bull; {deleteTarget.prediction_date ? new Date(deleteTarget.prediction_date).toLocaleDateString() : '—'}
              </Typography>
            </Box>
          )}
          <Typography sx={{ fontSize: '0.78rem', color: '#EF4444', mt: 1.5, fontWeight: 600 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} variant="outlined" sx={{ fontWeight: 700, borderRadius: '10px', flex: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            color="error"
            startIcon={deleting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <DeleteOutlineRoundedIcon />}
            sx={{ fontWeight: 700, borderRadius: '10px', flex: 1 }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Success / Error Snackbar ────────────────────────────────────── */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackMsg}
      />
    </Box>
  );
}
