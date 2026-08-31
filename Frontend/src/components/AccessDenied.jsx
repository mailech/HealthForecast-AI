import { Box, Typography, Button, Paper } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AccessDenied({ requiredRole }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: '20px',
          border: '1px solid #FECACA',
          bgcolor: '#FEF2F2',
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 10px 30px rgba(220,38,38,0.06)'
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            mx: 'auto',
            mb: 2.5
          }}
        >
          <LockRoundedIcon sx={{ fontSize: 32, color: '#DC2626' }} />
        </Box>
        
        <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#991B1B', mb: 1 }}>
          Access Denied
        </Typography>
        
        <Typography sx={{ fontSize: '0.88rem', color: '#7F1D1D', mb: 1, lineHeight: 1.5 }}>
          Your current account role <strong>"{user?.role || 'Guest'}"</strong> does not have permission to access this module.
        </Typography>

        {requiredRole && (
          <Typography sx={{ fontSize: '0.78rem', color: '#B91C1C', mb: 3, fontWeight: 500 }}>
            Module requires: <strong>{requiredRole}</strong> permission.
          </Typography>
        )}

        <Button
          variant="contained"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/')}
          sx={{
            borderRadius: '10px',
            bgcolor: '#DC2626',
            fontWeight: 700,
            px: 3,
            py: 1,
            boxShadow: '0 4px 14px rgba(220,38,38,0.25)',
            '&:hover': { bgcolor: '#B91C1C' }
          }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
}
