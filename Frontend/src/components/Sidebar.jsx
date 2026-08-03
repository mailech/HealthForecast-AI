import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Box, Typography, useMediaQuery, useTheme, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

const ALL_NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Patients', icon: <PeopleIcon />, path: '/patients' },
  { label: 'Prediction', icon: <PsychologyIcon />, path: '/prediction' },
  { label: 'Treatments', icon: <MedicalServicesIcon />, path: '/treatments' },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { label: 'Users', icon: <ManageAccountsIcon />, path: '/users', adminOnly: true },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, isAdmin } = useAuth();

  const navItems = ALL_NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
        borderRight: '1px solid #F0F2F5',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2,
          minHeight: 64,
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
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#1A202C',
              lineHeight: 1.2,
              fontSize: '0.9rem',
            }}
          >
            Health Forecast AI
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#6B7280',
              fontWeight: 500,
              fontSize: '0.65rem',
            }}
          >
            Healthcare Dashboard
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#F0F2F5', mx: 2 }} />

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 1.5, pt: 2 }} dense>
        {navItems.map(({ label, icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(path);
                  if (isMobile) onClose();
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1.1,
                  px: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#F4F8FC',
                    transform: 'translateX(3px)',
                  },
                  '&.Mui-selected': {
                    bgcolor: '#E9F0FF',
                    color: '#0F6CBD',
                    '& .MuiListItemIcon-root': {
                      color: '#0F6CBD',
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                    },
                    '&:hover': {
                      bgcolor: '#D4E6FF',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#0F6CBD' : '#6B7280',
                    transition: 'color 0.2s ease',
                    '& .MuiSvgIcon-root': {
                      fontSize: 20,
                    },
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0F6CBD' : '#4B5563',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout Button */}
      <Box sx={{ px: 1.5, pb: 2 }}>
        <Divider sx={{ borderColor: '#F0F2F5', mb: 1.5 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            py: 1.1,
            px: 1.5,
            color: '#D32F2F',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#FFEBEE',
              transform: 'translateX(3px)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: '#D32F2F',
              '& .MuiSvgIcon-root': { fontSize: 20 },
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              boxShadow: '0 8px 32px rgba(15,108,189,0.12)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: '#FFFFFF',
              borderRight: '1px solid #F0F2F5',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}

