import { useState } from 'react';
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
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

const DRAWER_WIDTH = 230;

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, role, user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const normRole = (role || '').toLowerCase().replace(/ /g, '');

  let navItems = [];

  if (normRole === 'doctor') {
    navItems = [
      { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/doctor/dashboard' },
      { label: 'Patients', icon: <PeopleRoundedIcon />, path: '/doctor/patients' },
      { label: 'Treatment', icon: <MedicalServicesRoundedIcon />, path: '/doctor/treatment' },
      { label: 'AI Prediction', icon: <PsychologyRoundedIcon />, path: '/doctor/prediction' },
      { label: 'Prediction History', icon: <HistoryRoundedIcon />, path: '/doctor/predictions' },
      { label: 'Reports', icon: <AssessmentRoundedIcon />, path: '/doctor/reports' },
    ];
  } else if (normRole === 'researcher' || normRole === 'healthcareresearcher') {
    navItems = [
      { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/researcher/dashboard' },
      { label: 'Patients / Data', icon: <PeopleRoundedIcon />, path: '/researcher/patients' },
      { label: 'Prediction History', icon: <HistoryRoundedIcon />, path: '/researcher/predictions' },
    ];
  } else if (normRole === 'admin' || normRole === 'hospitaladministrator' || normRole === 'hospitaladmin') {
    navItems = [
      { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/admin/dashboard' },
      { label: 'Patients / Data', icon: <PeopleRoundedIcon />, path: '/admin/patients' },
      { label: 'Predictions', icon: <PsychologyRoundedIcon />, path: '/admin/predictions' },
    ];
  } else if (normRole === 'sysadmin' || normRole === 'systemadministrator') {
    navItems = [
      { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/sysadmin/dashboard' },
      { label: 'Members', icon: <ManageAccountsRoundedIcon />, path: '/sysadmin/members' },
      { label: 'Add Member', icon: <PersonAddRoundedIcon />, path: '/sysadmin/members/add' },
      { label: 'Role Management', icon: <SecurityRoundedIcon />, path: '/sysadmin/roles' },
      { label: 'System Config', icon: <SettingsRoundedIcon />, path: '/sysadmin/system-config' },
      { label: 'Audit Logs', icon: <FormatListNumberedRoundedIcon />, path: '/sysadmin/logs' },
    ];
  } else {
    navItems = [
      { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/doctor/dashboard' },
    ];
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', borderRight: '1px solid #E8EDF2' }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'linear-gradient(135deg, #0F6CBD 0%, #18A999 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(15,108,189,0.25)'
        }}>
          <MonitorHeartRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem', lineHeight: 1.2 }}>
            Health Forecast AI
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 600, lineHeight: 1.3 }}>
            {user?.role || 'Clinical Intelligence'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mx: 2, borderBottom: '1px solid #F1F5F9' }} />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, pt: 1.5 }} dense>
        {navItems.map(({ label, icon, path, chip }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));

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
                  color: active ? '#0F6CBD' : '#94A3B8',
                  '& .MuiSvgIcon-root': { fontSize: 19 },
                }}>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: active ? 700 : 500, color: active ? '#0F6CBD' : '#475569' }}>
                        {label}
                      </Typography>
                      {chip && (
                        <Chip label={chip} size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#64748B' }} />
                      )}
                    </Box>
                  }
                />
                {active && (
                  <Box sx={{ width: 3.5, height: 18, borderRadius: 2, bgcolor: '#0F6CBD', ml: 0.5 }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User + Profile + Logout */}
      <Box sx={{ px: 1.5, pb: 2 }}>
        <Box sx={{ mx: 0, borderBottom: '1px solid #F1F5F9', mb: 1.5 }} />
        {user && (
          <Box sx={{ px: 1.5, py: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={user.profile_picture || undefined}
              sx={{ width: 32, height: 32, bgcolor: '#0F6CBD', fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}
            >
              {!user.profile_picture && (user.full_name?.charAt(0) || user.email?.charAt(0))?.toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flex: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.full_name || user.email}
              </Typography>
              <Typography sx={{ fontSize: '0.64rem', fontWeight: 600, color: '#0F6CBD' }}>
                {user.role}
              </Typography>
            </Box>
          </Box>
        )}

        <ListItemButton
          onClick={() => setProfileOpen(true)}
          sx={{
            borderRadius: '9px', py: 0.8, px: 1.5, mb: 0.5,
            '&:hover': { bgcolor: '#F1F5F9' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#64748B', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
            <AccountCircleRoundedIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500, color: '#475569' }} />
        </ListItemButton>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '9px', py: 0.8, px: 1.5,
            '&:hover': { bgcolor: '#FEF2F2' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#EF4444', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600, color: '#EF4444' }} />
        </ListItemButton>
      </Box>

      {/* Profile Modal */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
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
