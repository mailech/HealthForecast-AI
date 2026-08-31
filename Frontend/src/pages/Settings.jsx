import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Switch, FormControlLabel,
  TextField, Button, Divider, Alert, Snackbar, Chip, Paper
} from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

export default function Settings() {
  const [config, setConfig] = useState({
    systemName: 'Health Forecast AI',
    maintenanceMode: false,
    auditLogging: true,
    autoBackup: true,
    sessionTimeoutMins: 60,
    apiRateLimit: 120,
    modelThreshold: 0.50,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = () => {
    setSnackbar({ open: true, message: 'System configuration updated successfully.', severity: 'success' });
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <SettingsRoundedIcon sx={{ color: '#1D4ED8', fontSize: 26 }} />
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
            System Settings & Administration
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
          Configure global application parameters, security policies, and AI engine thresholds
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Core System Configuration */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityRoundedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                  System Security & Operations
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="System Application Name"
                  value={config.systemName}
                  onChange={e => setConfig(c => ({ ...c, systemName: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.88rem' } }}
                />

                <TextField
                  label="Session Timeout (Minutes)"
                  type="number"
                  value={config.sessionTimeoutMins}
                  onChange={e => setConfig(c => ({ ...c, sessionTimeoutMins: Number(e.target.value) }))}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.88rem' } }}
                />

                <TextField
                  label="API Rate Limit (Requests/Min)"
                  type="number"
                  value={config.apiRateLimit}
                  onChange={e => setConfig(c => ({ ...c, apiRateLimit: Number(e.target.value) }))}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.88rem' } }}
                />

                <Divider sx={{ my: 0.5 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.maintenanceMode}
                      onChange={e => setConfig(c => ({ ...c, maintenanceMode: e.target.checked }))}
                      color="error"
                    />
                  }
                  label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Maintenance Mode</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.auditLogging}
                      onChange={e => setConfig(c => ({ ...c, auditLogging: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Comprehensive Audit Logging</Typography>}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI & ML Parameters */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MemoryRoundedIcon sx={{ color: '#059669', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                  Trained ML Engine Status
                </Typography>
              </Box>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1 }}>
                  Active Model Artifacts
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Model 1 (patient_risk_model.pkl)</Typography>
                    <Chip label="ONLINE" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.65rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Model 2 (readmission_model.pkl)</Typography>
                    <Chip label="ONLINE" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.65rem' }} />
                  </Box>
                </Box>
              </Paper>

              <TextField
                label="High Risk Classification Threshold"
                type="number"
                inputProps={{ step: 0.05, min: 0.1, max: 0.9 }}
                value={config.modelThreshold}
                onChange={e => setConfig(c => ({ ...c, modelThreshold: Number(e.target.value) }))}
                fullWidth
                size="small"
                helperText="Probability cutoff above which a patient is flagged as High Risk"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.88rem' } }}
              />

              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SaveRoundedIcon />}
                  onClick={handleSave}
                  sx={{
                    borderRadius: '10px',
                    bgcolor: '#1D4ED8',
                    py: 1.2,
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    '&:hover': { bgcolor: '#1E40AF' }
                  }}
                >
                  Save System Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ borderRadius: '10px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
