import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Paper, Chip, TextField, MenuItem
} from '@mui/material';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';

const MOCK_LOGS = [
  { id: 'LOG-1001', timestamp: '2026-08-30 17:42:10', user: 'doctor@hospital.com', role: 'Doctor', action: 'POST /api/v1/prediction/predict', status: 200, level: 'INFO' },
  { id: 'LOG-1002', timestamp: '2026-08-30 17:39:05', user: 'admin@hospital.com', role: 'Hospital Administrator', action: 'POST /api/v1/treatments', status: 201, level: 'INFO' },
  { id: 'LOG-1003', timestamp: '2026-08-30 17:35:40', user: 'researcher@hospital.com', role: 'Healthcare Researcher', action: 'GET /api/v1/patients', status: 200, level: 'INFO' },
  { id: 'LOG-1004', timestamp: '2026-08-30 17:30:15', user: 'researcher@hospital.com', role: 'Healthcare Researcher', action: 'POST /api/v1/patients', status: 403, level: 'SECURITY' },
  { id: 'LOG-1005', timestamp: '2026-08-30 17:22:00', user: 'sysadmin@hospital.com', role: 'System Administrator', action: 'PUT /api/v1/users/64f1a2b', status: 200, level: 'INFO' },
  { id: 'LOG-1006', timestamp: '2026-08-30 17:15:30', user: 'admin@hospital.com', role: 'Hospital Administrator', action: 'POST /api/v1/prediction/predict', status: 403, level: 'SECURITY' },
  { id: 'LOG-1007', timestamp: '2026-08-30 17:00:12', user: 'doctor@hospital.com', role: 'Doctor', action: 'POST /api/v1/prediction', status: 200, level: 'INFO' },
];

const LEVEL_COLORS = {
  INFO: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  SECURITY: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  WARN: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
};

export default function Logs() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  const filteredLogs = MOCK_LOGS.filter(l => {
    const matchesSearch = l.user.toLowerCase().includes(search.toLowerCase()) ||
                          l.action.toLowerCase().includes(search.toLowerCase()) ||
                          l.id.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || l.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <FormatListNumberedRoundedIcon sx={{ color: '#1D4ED8', fontSize: 26 }} />
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
            System Audit & Access Logs
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
          Real-time security auditing, endpoint access tracking, and RBAC authorization log events
        </Typography>
      </Box>

      <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search by User, Action, or Log ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}
            />
            <TextField
              select
              size="small"
              label="Log Level"
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.85rem' } }}
            >
              <MenuItem value="ALL">All Levels</MenuItem>
              <MenuItem value="INFO">INFO</MenuItem>
              <MenuItem value="SECURITY">SECURITY (403)</MenuItem>
              <MenuItem value="WARN">WARN</MenuItem>
            </TextField>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '10px', border: '1px solid #F1F5F9' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['Log ID', 'Timestamp', 'User Email', 'Role', 'API Endpoint / Action', 'Status', 'Level'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', py: 1.2 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map(row => {
                  const style = LEVEL_COLORS[row.level] || LEVEL_COLORS.INFO;
                  return (
                    <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                      <TableCell><Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#0F172A' }}>{row.id}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>{row.timestamp}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>{row.user}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>{row.role}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#0F172A' }}>{row.action}</Typography></TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            bgcolor: row.status === 200 || row.status === 201 ? '#ECFDF5' : '#FEF2F2',
                            color: row.status === 200 || row.status === 201 ? '#059669' : '#DC2626'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.level}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            bgcolor: style.bg,
                            color: style.color,
                            border: `1px solid ${style.border}`
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
