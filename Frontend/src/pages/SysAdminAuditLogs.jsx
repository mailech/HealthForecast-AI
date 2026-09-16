import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, CircularProgress, Alert, TextField, InputAdornment
} from '@mui/material';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import api from '../api/api';

const ACTION_COLORS = {
  LOGIN: { bg: '#EFF6FF', color: '#1D4ED8' },
  MEMBER_CREATED: { bg: '#ECFDF5', color: '#059669' },
  MEMBER_ACTIVATED: { bg: '#ECFDF5', color: '#059669' },
  MEMBER_DEACTIVATED: { bg: '#FEF2F2', color: '#DC2626' },
  PASSWORD_RESET_BY_SYSADMIN: { bg: '#F3E8FF', color: '#9333EA' },
  PREDICTION_CREATED: { bg: '#FEF3C7', color: '#D97706' },
  PREDICTION_VIEWED: { bg: '#F1F5F9', color: '#475569' },
  PREDICTION_PDF_DOWNLOADED: { bg: '#CCFBF1', color: '#0D9488' },
};

export default function SysAdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/api/v1/audit-logs?limit=300')
      .then(res => setLogs(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("SYSADMIN API ERROR:", err);
        setError('Failed to load system audit logs.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    (l.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', pb: 6 }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A' }}>
          System Audit Logs
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
          Comprehensive security and event logging across system operations
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 3, borderRadius: '18px', border: '1px solid #E2E8F0' }}>
        <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search audit logs..."
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
            Total Log Events: {filtered.length}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={36} sx={{ color: '#0F6CBD' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <FormatListNumberedRoundedIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
            <Typography sx={{ fontWeight: 600, color: '#64748B' }}>No audit events recorded yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.72rem', color: '#64748B', border: 'none', py: 1.4 } }}>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>User Role</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Target Resource</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((l, i) => {
                  const style = ACTION_COLORS[l.action] || { bg: '#F1F5F9', color: '#334155' };
                  const ts = l.timestamp ? new Date(l.timestamp).toLocaleString() : '—';

                  return (
                    <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 1.2, fontSize: '0.82rem' } }}>
                      <TableCell sx={{ color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>{ts}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{l.user_email}</TableCell>
                      <TableCell><Chip label={l.user_role} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700 }} /></TableCell>
                      <TableCell>
                        <Chip label={l.action} size="small" sx={{ bgcolor: style.bg, color: style.color, fontWeight: 800, fontSize: '0.65rem' }} />
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontWeight: 600 }}>{l.target_resource || '—'}</TableCell>
                      <TableCell sx={{ color: '#64748B' }}>{l.details || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
