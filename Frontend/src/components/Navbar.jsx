import { useState } from 'react';
import {
  AppBar, Toolbar, Box, IconButton, Avatar, Badge,
  Menu, MenuItem, ListItemIcon, Divider, Typography, useMediaQuery, useTheme, Chip
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/prediction': 'Prediction',
  '/treatments': 'Treatments',
  '/reports': 'Reports',
  '/users': 'Users',
};

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Health Forecast AI';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleLogout = () => { setAnchorEl(null); logout(); navigate('/login'); };

  return (
    <AppBar position="fixed" elevation={0} sx={{
      zIndex: (t) => t.zIndex.drawer + 1,
      bgcolor: '#FFFFFF',
      borderBottom: '1px solid #E8EDF2',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      ml: { md: '220px' },
      width: { md: 'calc(100% - 220px)' },
    }}>
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: '60px !important' }}>
        {isMobile && (
          <IconButton edge="start" onClick={onMenuClick} size="small" sx={{ mr: 1, color: '#475569', '&:hover': { bgcolor: '#F1F5F9' } }}>
            <MenuRoundedIcon />
          </IconButton>
        )}

        {/* Page title */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', lineHeight: 1.2 }}>
            {pageTitle}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 500 }}>{today}</Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Notifications */}
        <IconButton size="small" sx={{ color: '#64748B', mr: 0.5, '&:hover': { bgcolor: '#F1F5F9', color: '#3B82F6' } }}>
          <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', height: 14, minWidth: 14 } }}>
            <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
          </Badge>
        </IconButton>

        {/* User */}
        {user && (
          <>
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
                px: 1, py: 0.5, borderRadius: '10px', border: '1.5px solid #E2E8F0',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700 }}>
                {user.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                  {user.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: '#64748B' }}>{user.role}</Typography>
              </Box>
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ elevation: 0, sx: {
                mt: 1, minWidth: 200, borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #F1F5F9',
              }}}>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' }}>{user.full_name || user.email}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{user.email}</Typography>
                <Chip label={user.role} size="small" sx={{ mt: 0.5, bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, fontSize: '0.65rem' }} />
              </Box>
              <Divider sx={{ borderColor: '#F1F5F9' }} />
              <MenuItem onClick={() => setAnchorEl(null)} sx={{ borderRadius: '8px', mx: 0.5, my: 0.3, fontSize: '0.82rem' }}>
                <ListItemIcon><PersonOutlineRoundedIcon fontSize="small" sx={{ color: '#64748B' }} /></ListItemIcon>
                Profile
              </MenuItem>
              <Divider sx={{ borderColor: '#F1F5F9' }} />
              <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', mx: 0.5, my: 0.3, color: '#EF4444', fontSize: '0.82rem', '&:hover': { bgcolor: '#FEF2F2' } }}>
                <ListItemIcon><LogoutRoundedIcon fontSize="small" sx={{ color: '#EF4444' }} /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
