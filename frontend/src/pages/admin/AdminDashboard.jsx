import React, { useState } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    useMediaQuery,
    IconButton,
    Divider,
    Avatar,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    People as PeopleIcon,
    MiscellaneousServices as ServicesIcon,
    CalendarMonth as CalendarIcon,
    Menu as MenuIcon,
    AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../store/useAuthStore';

// Sub-panels
import OverviewPanel from './panels/OverviewPanel';
import BusinessesPanel from './panels/BusinessesPanel';
import UsersPanel from './panels/UsersPanel';
import ServicesPanel from './panels/ServicesPanel';
import AppointmentsPanel from './panels/AppointmentsPanel';

const DRAWER_WIDTH = 280;

const navItems = [
    { key: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { key: 'businesses', label: 'Businesses', icon: <BusinessIcon /> },
    { key: 'users', label: 'Users', icon: <PeopleIcon /> },
    { key: 'services', label: 'Services', icon: <ServicesIcon /> },
    { key: 'appointments', label: 'Appointments', icon: <CalendarIcon /> },
];

const panelMap = {
    overview: OverviewPanel,
    businesses: BusinessesPanel,
    users: UsersPanel,
    services: ServicesPanel,
    appointments: AppointmentsPanel,
};

export default function AdminDashboard() {
    const [activePanel, setActivePanel] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuthStore();

    const ActiveComponent = panelMap[activePanel] || OverviewPanel;

    const handleNavClick = (key) => {
        setActivePanel(key);
        if (isMobile) setMobileOpen(false);
    };

    const drawerContent = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Logo / Header */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <Avatar
                    sx={{
                        width: 44,
                        height: 44,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                    }}
                >
                    <AdminIcon />
                </Avatar>
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '1.1rem',
                        }}
                    >
                        SmartQ Admin
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        System Control Panel
                    </Typography>
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 2, py: 2 }}>
                {navItems.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={activePanel === item.key}
                            onClick={() => handleNavClick(item.key)}
                            sx={{
                                borderRadius: '12px',
                                py: 1.5,
                                px: 2,
                                transition: 'all 0.2s ease',
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(118,75,162,0.2) 100%)',
                                    borderLeft: '3px solid #667eea',
                                    '& .MuiListItemIcon-root': {
                                        color: '#818cf8',
                                    },
                                    '& .MuiListItemText-primary': {
                                        color: '#f1f5f9',
                                        fontWeight: 600,
                                    },
                                },
                                '&:hover': {
                                    background: 'rgba(99,102,241,0.1)',
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 40,
                                    color: activePanel === item.key ? '#818cf8' : 'text.secondary',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontSize: '0.95rem',
                                    fontWeight: activePanel === item.key ? 600 : 400,
                                }}
                            />
                            {activePanel === item.key && (
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)',
                                    }}
                                />
                            )}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Footer - Admin Info */}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                    sx={{
                        width: 36,
                        height: 36,
                        background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                    }}
                >
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }} noWrap>
                        {user?.name || 'Admin'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }} noWrap>
                        {user?.email || 'admin@smartq.com'}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            {/* Mobile Menu Toggle */}
            {isMobile && (
                <IconButton
                    onClick={() => setMobileOpen(!mobileOpen)}
                    sx={{
                        position: 'fixed',
                        top: 76,
                        left: 16,
                        zIndex: 1300,
                        background: 'rgba(99, 102, 241, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#818cf8',
                        '&:hover': {
                            background: 'rgba(99, 102, 241, 0.3)',
                        },
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            {/* Sidebar Drawer */}
            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? mobileOpen : true}
                onClose={() => setMobileOpen(false)}
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        background: 'transparent',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        position: isMobile ? 'fixed' : 'relative',
                        height: isMobile ? '100vh' : 'auto',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    p: { xs: 2, sm: 3, md: 4 },
                    pl: { xs: isMobile ? 2 : 0, md: 4 },
                    maxWidth: '100%',
                    overflow: 'auto',
                }}
            >
                <ActiveComponent />
            </Box>
        </Box>
    );
}
