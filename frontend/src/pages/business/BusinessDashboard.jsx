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
    People as PeopleIcon,
    MiscellaneousServices as ServicesIcon,
    CalendarMonth as CalendarIcon,
    Menu as MenuIcon,
    Business as BusinessIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../store/useAuthStore';

// Sub-panels
import OwnerOverviewPanel from './panels/OwnerOverviewPanel';
import OwnerEmployeesPanel from './panels/OwnerEmployeesPanel';
import OwnerServicesPanel from './panels/OwnerServicesPanel';
import OwnerAppointmentsPanel from './panels/OwnerAppointmentsPanel';
import OwnerSettingsPanel from './panels/OwnerSettingsPanel';

const DRAWER_WIDTH = 280;

const navItems = [
    { key: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { key: 'employees', label: 'Employees', icon: <PeopleIcon /> },
    { key: 'services', label: 'Services', icon: <ServicesIcon /> },
    { key: 'appointments', label: 'Appointments', icon: <CalendarIcon /> },
    { key: 'settings', label: 'Business Settings', icon: <SettingsIcon /> },
];

export default function BusinessDashboard() {
    const [activePanel, setActivePanel] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuthStore();

    const renderPanel = () => {
        switch (activePanel) {
            case 'overview': return <OwnerOverviewPanel />;
            case 'employees': return <OwnerEmployeesPanel />;
            case 'services': return <OwnerServicesPanel />;
            case 'appointments': return <OwnerAppointmentsPanel />;
            case 'settings': return <OwnerSettingsPanel />;
            default: return <OwnerOverviewPanel />;
        }
    };

    const drawerContent = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, rgba(20,184,166,0.08) 0%, rgba(6,182,212,0.04) 50%, transparent 100%)',
            }}
        >
            {/* Logo Section */}
            <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(20,184,166,0.3)',
                        }}
                    >
                        <BusinessIcon sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Business Panel
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            SmartQ Management
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

            {/* Navigation */}
            <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={activePanel === item.key}
                            onClick={() => {
                                setActivePanel(item.key);
                                if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                                borderRadius: '12px',
                                py: 1.3,
                                px: 2,
                                transition: 'all 0.2s ease',
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.1) 100%)',
                                    borderLeft: '3px solid #14b8a6',
                                    '& .MuiListItemIcon-root': { color: '#14b8a6' },
                                    '& .MuiListItemText-primary': { color: '#fff', fontWeight: 700 },
                                },
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.05)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

            {/* User Info Footer */}
            <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                        }}
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {user?.name || 'Business Owner'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#14b8a6', fontWeight: 600 }}>
                            Owner
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            {/* Mobile menu toggle */}
            {isMobile && (
                <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1300,
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                        color: '#fff',
                        boxShadow: '0 8px 25px rgba(20,184,166,0.4)',
                        '&:hover': { background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)' },
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            {/* Sidebar */}
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
                        position: isMobile ? 'fixed' : 'relative',
                        height: isMobile ? '100vh' : 'auto',
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3, md: 4 },
                    minHeight: '100%',
                    background: 'rgba(15, 23, 42, 0.4)',
                }}
            >
                {renderPanel()}
            </Box>
        </Box>
    );
}
