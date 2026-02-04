import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { PowerSettingsNew, Dashboard as DashboardIcon } from '@mui/icons-material';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" elevation={0}>
            <Toolbar sx={{ py: 1 }}>
                <Typography
                    variant="h5"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                    }}
                >
                    <Link
                        to="/"
                        style={{
                            textDecoration: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        SmartQ
                    </Link>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/dashboard"
                                startIcon={<DashboardIcon />}
                                sx={{
                                    borderRadius: '10px',
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                    },
                                }}
                            >
                                Dashboard
                            </Button>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    px: 1,
                                    display: { xs: 'none', sm: 'block' },
                                }}
                            >
                                {user?.name}
                            </Typography>
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                startIcon={<PowerSettingsNew />}
                                sx={{
                                    borderRadius: '10px',
                                    px: 2,
                                    background: 'rgba(244, 63, 94, 0.1)',
                                    '&:hover': {
                                        background: 'rgba(244, 63, 94, 0.2)',
                                    },
                                }}
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
                                sx={{
                                    borderRadius: '10px',
                                    px: 3,
                                    '&:hover': {
                                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                    },
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                component={Link}
                                to="/register"
                                sx={{
                                    borderRadius: '10px',
                                    px: 3,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                    },
                                }}
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

