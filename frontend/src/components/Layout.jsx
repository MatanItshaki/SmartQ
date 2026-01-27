import React, { useEffect } from 'react';
import { Container, Box, CssBaseline } from '@mui/material';
import Navbar from './Navbar';
import useAuthStore from '../store/useAuthStore';

export default function Layout({ children }) {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <Navbar />
            <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                {children}
            </Container>
        </Box>
    );
}
