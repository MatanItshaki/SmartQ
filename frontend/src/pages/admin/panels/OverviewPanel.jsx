import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    Business as BusinessIcon,
    People as PeopleIcon,
    CalendarMonth as CalendarIcon,
    MiscellaneousServices as ServicesIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../../services/api';

const StatCard = ({ title, value, icon }) => (
    <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
            {icon}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}
        </Typography>
    </Paper>
);

export default function OverviewPanel() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminAPI.getStats();
                setStats(response.data.data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!stats) {
        return (
            <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
                Failed to load dashboard stats.
            </Typography>
        );
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Dashboard Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Welcome back! Here's what's happening with SmartQ today.
            </Typography>

            {/* Main Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Businesses"
                        value={stats.businesses}
                        icon={<BusinessIcon color="primary" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Clients"
                        value={stats.clients}
                        icon={<PeopleIcon color="secondary" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Appointments"
                        value={stats.appointments?.total || 0}
                        icon={<CalendarIcon color="success" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Services"
                        value={stats.services}
                        icon={<ServicesIcon sx={{ color: '#ffa726' }} />}
                    />
                </Grid>
            </Grid>

            {/* Appointment Breakdown */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Appointment Status
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2">
                                Scheduled: <strong>{stats.appointments?.scheduled || 0}</strong>
                            </Typography>
                            <Typography variant="body2">
                                Completed: <strong>{stats.appointments?.completed || 0}</strong>
                            </Typography>
                            <Typography variant="body2">
                                Cancelled: <strong>{stats.appointments?.cancelled || 0}</strong>
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            User Breakdown
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2">
                                Clients: <strong>{stats.clients}</strong>
                            </Typography>
                            <Typography variant="body2">
                                Employees: <strong>{stats.employees}</strong>
                            </Typography>
                            <Typography variant="body2">
                                Owners: <strong>{stats.businessOwners}</strong>
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
