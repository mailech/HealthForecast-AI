import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, useMediaQuery, useTheme, Avatar, Chip
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 220;

const ALL_NAV_ITEMS = [
  { label: 'Dashboard',   icon: <DashboardRoundedIcon />,        path: '/',         roles: ['Doctor', 'Hospital Administrator', 'Healthcare Researcher', 'System Administrator'] },
  { label: 'Patients',    icon: <PeopleRoundedIcon />,           path: '/patients', roles: ['Doctor', 'Hospital Administrator', 'Healthcare Researcher', 'System Administrator'] },
  { label: 'Prediction',  icon: <PsychologyRoundedIcon />,       path: '/prediction', roles: ['Doctor', 'Healthcare Researcher'] },
  { label: 'Treatments',  icon: <MedicalServicesRoundedIcon />,  path: '/treatments', roles: ['Doctor', 'Hospital Administrator', 'System Administrator'] },
  { label: 'Reports',     icon: <AssessmentRoundedIcon />,       path: '/reports',  roles: ['Doctor', 'Hospital Administrator', 'Healthcare Researcher', 'System Administrator'] },
  { label: 'User Management', icon: <ManageAccountsRoundedIcon />, path: '/users',   roles: ['System Administrator'] },
  { label: 'System Settings', icon: <SettingsRoundedIcon />,       path: '/settings', roles: ['System Administrator'] },
  { label: 'System Logs',     icon: <FormatListNumberedRoundedIcon />, path: '/logs', roles: ['System Administrator'] },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, role, user } = useAuth();

  // Normalize role string comparison
  const normalizedUserRole = (role || '').toLowerCase().replace(/ /g, '_');

  const navItems = ALL_NAV_ITEMS.filter(item => {
    return item.roles.some(r => {
      const norm = r.toLowerCase().replace(/ /g, '_');
      return r === role || norm === normalizedUserRole;
    });
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', borderRight: '1px solid #E8EDF2' }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: '10px',
          background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <MonitorHeartRoundedIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem', lineHeight: 1.2 }}>
            Health Forecast AI
          </Typography>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.62rem', fontWeight: 500, lineHeight: 1.3 }}>
            Risk Intelligence System
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mx: 2, borderBottom: '1px solid #F1F5F9' }} />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, pt: 1.5 }} dense>
        {navItems.map(({ label, icon, path }) => {
          const active = location.pathname === path;
          const isViewOnlyPatients = path === '/patients' && role === 'Healthcare Researcher';

          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={active}
                onClick={() => { navigate(path); if (isMobile) onClose(); }}
                sx={{
                  borderRadius: '9px', py: 1, px: 1.5,
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: '#F1F5F9' },
                  '&.Mui-selected': {
                    bgcolor: '#EFF6FF',
                    '&:hover': { bgcolor: '#DBEAFE' },
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 32,
                  color: active ? '#2563EB' : '#94A3B8',
                  '& .MuiSvgIcon-root': { fontSize: 18 },
                }}>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: active ? 600 : 500, color: active ? '#1D4ED8' : '#475569' }}>
                        {label}
                      </Typography>
                      {isViewOnlyPatients && (
                        <Chip label="Read-only" size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#64748B' }} />
                      )}
                    </Box>
                  }
                />
                {active && (
                  <Box sx={{ width: 3, height: 16, borderRadius: 2, bgcolor: '#3B82F6', ml: 0.5 }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User + Logout */}
      <Box sx={{ px: 1.5, pb: 2 }}>
        <Box sx={{ mx: 0, borderBottom: '1px solid #F1F5F9', mb: 1.5 }} />
        {user && (
          <Box sx={{ px: 1.5, py: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>
              {user.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.full_name || user.email}
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#2563EB' }}>
                {user.role}
              </Typography>
            </Box>
          </Box>
        )}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '9px', py: 1, px: 1.5,
            '&:hover': { bgcolor: '#FEF2F2' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#EF4444', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600, color: '#EF4444' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer variant="temporary" open={mobileOpen} onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}>
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer variant="permanent"
          sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: '1px 0 0 #E8EDF2' } }}>
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
