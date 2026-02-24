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
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    MiscellaneousServices as ServicesIcon,
    CalendarMonth as CalendarIcon,
    Menu as MenuIcon,
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

const DRAWER_WIDTH = 240;

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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Business Panel
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {user?.name || 'Business Owner'}
                </Typography>
            </Box>

            {/* Navigation */}
            <List sx={{ px: 1, py: 1, flexGrow: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={activePanel === item.key}
                            onClick={() => {
                                setActivePanel(item.key);
                                if (isMobile) setMobileOpen(false);
                            }}
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
            {/* Mobile menu toggle */}
            {isMobile && (
                <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1300,
                        bgcolor: 'primary.main',
                        color: '#fff',
                        '&:hover': { bgcolor: 'primary.dark' },
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
                        backgroundColor: '#1a1a2e',
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
                    p: { xs: 2, sm: 3 },
                    minHeight: '100%',
                }}
            >
                {renderPanel()}
            </Box>
        </Box>
    );
}
