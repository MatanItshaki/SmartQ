import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { PowerSettingsNew, Dashboard as DashboardIcon, AdminPanelSettings as AdminIcon, Business as BusinessIcon } from '@mui/icons-material';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'admin';
    const isBusiness = user?.role === 'business';
    const dashboardPath = isAdmin ? '/admin' : isBusiness ? '/business' : '/dashboard';
    const dashboardLabel = isAdmin ? 'Admin Panel' : isBusiness ? 'My Business' : 'Dashboard';
    const DashIcon = isAdmin ? AdminIcon : isBusiness ? BusinessIcon : DashboardIcon;

    return (
        <AppBar position="static" elevation={1}>
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, fontWeight: 600 }}
                >
                    <Link
                        to="/"
                        style={{
                            textDecoration: 'none',
                            color: '#90caf9',
                        }}
                    >
                        SmartQ
                    </Link>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to={dashboardPath}
                                startIcon={<DashIcon />}
                            >
                                {dashboardLabel}
                            </Button>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    display: { xs: 'none', sm: 'block' },
                                    mx: 1,
                                }}
                            >
                                {user?.name}
                            </Typography>
                            {isAdmin && (
                                <Chip
                                    label="Admin"
                                    size="small"
                                    color="primary"
                                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                                />
                            )}
                            {isBusiness && (
                                <Chip
                                    label="Owner"
                                    size="small"
                                    color="success"
                                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                                />
                            )}
                            <Button
                                color="error"
                                onClick={handleLogout}
                                startIcon={<PowerSettingsNew />}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/login"
                            >
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                component={Link}
                                to="/register"
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
