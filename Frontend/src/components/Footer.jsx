import { Box, Typography, Container, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #F0F2F5',
        py: 3,
        px: 3,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1440, mx: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospitalIcon sx={{ fontSize: 18, color: '#0F6CBD' }} />
            <Typography
              variant="caption"
              sx={{
                color: '#6B7280',
                fontWeight: 500,
              }}
            >
              Health Forecast AI
            </Typography>
            <Typography variant="caption" sx={{ color: '#D1D5DB' }}>|</Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Patient Risk Intelligence System
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: '#9CA3AF',
              fontWeight: 400,
            }}
          >
            &copy; {new Date().getFullYear()} All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

