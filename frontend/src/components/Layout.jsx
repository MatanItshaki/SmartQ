import React, { useEffect } from 'react';
import { Container, Box, CssBaseline } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import useAuthStore from '../store/useAuthStore';

export default function Layout({ children }) {
    const { checkAuth } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Admin dashboard has its own layout with sidebar — skip Container wrapping
    const isFullWidthRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/business');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <Navbar />
            {isFullWidthRoute ? (
                <Box component="main" sx={{ flexGrow: 1 }}>
                    {children}
                </Box>
            ) : (
                <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                    {children}
                </Container>
            )}
        </Box>
    );
}
