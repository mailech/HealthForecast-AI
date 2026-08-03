import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, IconButton,
  useMediaQuery, useTheme, Avatar, Badge, InputBase,
  Menu, MenuItem, ListItemIcon, Divider
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #F0F2F5',
        boxShadow: '0 1px 3px rgba(15,108,189,0.06)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: '64px !important' }}>
        {/* Mobile Menu Icon */}
        {isMobile && (
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{
              mr: 1,
              color: '#1A202C',
              '&:hover': { bgcolor: '#F4F8FC' },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo + Title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mr: 3,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0F6CBD 0%, #18A999 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(15,108,189,0.25)',
              flexShrink: 0,
            }}
          >
            <LocalHospitalIcon sx={{ color: '#FFFFFF', fontSize: 20 }} />
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: '#1A202C',
                lineHeight: 1.2,
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
              }}
            >
              Health Forecast AI
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#6B7280',
                fontWeight: 500,
                fontSize: '0.7rem',
                display: { xs: 'none', md: 'block' },
              }}
            >
              Patient Risk Intelligence System
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            bgcolor: '#F4F8FC',
            borderRadius: '10px',
            px: 2,
            py: 0.5,
            flex: 1,
            maxWidth: 400,
            border: '1.5px solid transparent',
            transition: 'all 0.3s ease',
            '&:focus-within': {
              borderColor: '#0F6CBD',
              bgcolor: '#FFFFFF',
              boxShadow: '0 0 0 4px rgba(15,108,189,0.1)',
            },
          }}
        >
          <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search patients, predictions..."
            sx={{
              fontSize: '0.85rem',
              color: '#1A202C',
              width: '100%',
              '& .MuiInputBase-input::placeholder': {
                color: '#9CA3AF',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Notification Bell */}
          <IconButton
            sx={{
              color: '#6B7280',
              '&:hover': { bgcolor: '#F4F8FC', color: '#0F6CBD' },
              transition: 'all 0.2s ease',
            }}
          >
            <Badge
              badgeContent={3}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  height: 16,
                  minWidth: 16,
                  borderRadius: '8px',
                },
              }}
            >
              <NotificationsIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          {/* User Avatar / Profile */}
          {user && (
            <>
              <IconButton
                onClick={handleMenu}
                sx={{
                  ml: 0.5,
                  p: 0.5,
                  border: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#0F6CBD',
                    bgcolor: '#F4F8FC',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#0F6CBD',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(15,108,189,0.12)',
                    border: '1px solid #F0F2F5',
                    overflow: 'visible',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -6,
                      right: 16,
                      width: 12,
                      height: 12,
                      bgcolor: '#FFFFFF',
                      transform: 'rotate(45deg)',
                      borderLeft: '1px solid #F0F2F5',
                      borderTop: '1px solid #F0F2F5',
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ color: '#1A202C', fontWeight: 600 }}>
                    {user.email || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {user.role || 'Healthcare Professional'}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: '#F0F2F5' }} />
                <MenuItem onClick={handleClose} sx={{ borderRadius: '8px', mx: 0.5, my: 0.3 }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" sx={{ color: '#6B7280' }} />
                  </ListItemIcon>
                  <Typography variant="body2">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleClose} sx={{ borderRadius: '8px', mx: 0.5, my: 0.3 }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" sx={{ color: '#6B7280' }} />
                  </ListItemIcon>
                  <Typography variant="body2">Settings</Typography>
                </MenuItem>
                <Divider sx={{ borderColor: '#F0F2F5' }} />
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '8px',
                    mx: 0.5,
                    my: 0.3,
                    color: '#D32F2F',
                    '&:hover': { bgcolor: '#FFEBEE' },
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: '#D32F2F' }} />
                  </ListItemIcon>
                  <Typography variant="body2">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

