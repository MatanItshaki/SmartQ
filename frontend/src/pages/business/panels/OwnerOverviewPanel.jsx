import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    People as PeopleIcon,
    CalendarMonth as CalendarIcon,
    MiscellaneousServices as ServicesIcon,
    AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { ownerAPI } from '../../../services/api';

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

export default function OwnerOverviewPanel() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await ownerAPI.getStats();
                setStats(res.data.data);
            } catch (err) {
                console.error('Failed to fetch business stats:', err);
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
                Failed to load business stats.
            </Typography>
        );
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {stats.business?.name || 'Business'} Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Here's an overview of your business activity.
            </Typography>

            {/* Main Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Today's Appointments"
                        value={stats.todayAppointments}
                        icon={<CalendarIcon color="primary" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Employees"
                        value={stats.employees}
                        icon={<PeopleIcon color="secondary" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active Services"
                        value={stats.services}
                        icon={<ServicesIcon sx={{ color: '#ffa726' }} />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Revenue"
                        value={`₪${stats.totalRevenue?.toLocaleString() || 0}`}
                        icon={<MoneyIcon color="success" />}
                    />
                </Grid>
            </Grid>

            {/* Breakdown */}
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
                            Quick Summary
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2">
                                Total Bookings: <strong>{stats.appointments?.total || 0}</strong>
                            </Typography>
                            <Typography variant="body2">
                                This Week: <strong>{stats.weeklyAppointments || 0}</strong>
                            </Typography>
                            <Typography variant="body2">
                                Completion Rate: <strong>{stats.appointments?.total > 0 ? `${Math.round((stats.appointments.completed / stats.appointments.total) * 100)}%` : '—'}</strong>
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
