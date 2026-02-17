import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    Business as BusinessIcon,
    People as PeopleIcon,
    CalendarMonth as CalendarIcon,
    MiscellaneousServices as ServicesIcon,
    TrendingUp as TrendingUpIcon,
    PersonAdd as PersonAddIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../../services/api';

const StatCard = ({ title, value, icon, gradient, subLabel, subValue }) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                transform: 'translateY(-4px)',
                background: 'rgba(255,255,255,0.07)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                borderColor: 'rgba(255,255,255,0.12)',
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: gradient,
            },
        }}
    >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, fontSize: '2.2rem', lineHeight: 1.1 }}>
                    {value}
                </Typography>
            </Box>
            <Box
                sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 20px ${gradient.includes('#667eea') ? 'rgba(99,102,241,0.3)' : gradient.includes('#ec4899') ? 'rgba(236,72,153,0.3)' : gradient.includes('#14b8a6') ? 'rgba(20,184,166,0.3)' : 'rgba(251,146,60,0.3)'}`,
                }}
            >
                {icon}
            </Box>
        </Box>
        {subLabel && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: '#14b8a6' }} />
                <Typography variant="caption" sx={{ color: '#14b8a6', fontWeight: 600 }}>
                    {subValue}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {subLabel}
                </Typography>
            </Box>
        )}
    </Paper>
);

const MiniStatCard = ({ label, value, icon, color }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.2s ease',
            '&:hover': {
                background: 'rgba(255,255,255,0.06)',
            },
        }}
    >
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: `rgba(${color}, 0.15)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.2 }}>
                {value}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {label}
            </Typography>
        </Box>
    </Box>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#667eea' }} />
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
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5,
                    }}
                >
                    Dashboard Overview
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Welcome back! Here's what's happening with SmartQ today.
                </Typography>
            </Box>

            {/* Main Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Businesses"
                        value={stats.businesses}
                        icon={<BusinessIcon sx={{ color: '#fff', fontSize: 26 }} />}
                        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Clients"
                        value={stats.clients}
                        icon={<PeopleIcon sx={{ color: '#fff', fontSize: 26 }} />}
                        gradient="linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)"
                        subLabel="new this week"
                        subValue={`+${stats.recent?.users || 0}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Appointments"
                        value={stats.appointments?.total || 0}
                        icon={<CalendarIcon sx={{ color: '#fff', fontSize: 26 }} />}
                        gradient="linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)"
                        subLabel="this week"
                        subValue={`+${stats.recent?.appointments || 0}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Services"
                        value={stats.services}
                        icon={<ServicesIcon sx={{ color: '#fff', fontSize: 26 }} />}
                        gradient="linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)"
                    />
                </Grid>
            </Grid>

            {/* Secondary Stats */}
            <Grid container spacing={3}>
                {/* Appointment Breakdown */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '20px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: '1.1rem' }}>
                            Appointment Status Breakdown
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <MiniStatCard
                                    label="Scheduled"
                                    value={stats.appointments?.scheduled || 0}
                                    icon={<ScheduleIcon sx={{ color: '#667eea', fontSize: 20 }} />}
                                    color="99,102,241"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <MiniStatCard
                                    label="Completed"
                                    value={stats.appointments?.completed || 0}
                                    icon={<CheckIcon sx={{ color: '#14b8a6', fontSize: 20 }} />}
                                    color="20,184,166"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <MiniStatCard
                                    label="Cancelled"
                                    value={stats.appointments?.cancelled || 0}
                                    icon={<CancelIcon sx={{ color: '#f43f5e', fontSize: 20 }} />}
                                    color="244,63,94"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* User Breakdown */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '20px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: '1.1rem' }}>
                            User Breakdown
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <MiniStatCard
                                    label="Clients"
                                    value={stats.clients}
                                    icon={<PeopleIcon sx={{ color: '#ec4899', fontSize: 20 }} />}
                                    color="236,72,153"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <MiniStatCard
                                    label="Employees"
                                    value={stats.employees}
                                    icon={<PersonAddIcon sx={{ color: '#fb923c', fontSize: 20 }} />}
                                    color="251,146,60"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <MiniStatCard
                                    label="Owners"
                                    value={stats.businessOwners}
                                    icon={<BusinessIcon sx={{ color: '#667eea', fontSize: 20 }} />}
                                    color="99,102,241"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
