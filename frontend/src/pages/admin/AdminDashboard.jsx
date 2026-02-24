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
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    People as PeopleIcon,
    MiscellaneousServices as ServicesIcon,
    CalendarMonth as CalendarIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../store/useAuthStore';

// Sub-panels
import OverviewPanel from './panels/OverviewPanel';
import BusinessesPanel from './panels/BusinessesPanel';
import UsersPanel from './panels/UsersPanel';
import ServicesPanel from './panels/ServicesPanel';
import AppointmentsPanel from './panels/AppointmentsPanel';

const DRAWER_WIDTH = 240;

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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    SmartQ Admin
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {user?.name || 'Admin'}
                </Typography>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 1, py: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={activePanel === item.key}
                            onClick={() => handleNavClick(item.key)}
                            sx={{ borderRadius: '6px' }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
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
                        bgcolor: 'background.paper',
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
                        position: isMobile ? 'fixed' : 'relative',
                        height: isMobile ? '100vh' : 'auto',
                        backgroundColor: '#1a1a2e',
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
                    p: { xs: 2, sm: 3 },
                    maxWidth: '100%',
                    overflow: 'auto',
                }}
            >
                <ActiveComponent />
            </Box>
        </Box>
    );
}
