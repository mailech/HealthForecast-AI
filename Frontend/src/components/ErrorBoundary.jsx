import { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              border: '1px solid #FECACA',
              bgcolor: '#FEF2F2',
              maxWidth: 600,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 40, color: '#DC2626', mb: 1 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#991B1B', mb: 1 }}>
              Something went wrong loading this component
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#7F1D1D', mb: 2.5, wordBreak: 'break-word' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              sx={{ bgcolor: '#DC2626', borderRadius: '10px', fontWeight: 700, '&:hover': { bgcolor: '#B91C1C' } }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
