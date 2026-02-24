import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Chip,
    Tooltip,
    Alert,
    Snackbar,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Search as SearchIcon,
    CalendarMonth as CalendarIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { adminAPI, businessAPI } from '../../../services/api';

const statusConfig = {
    scheduled: { icon: <ScheduleIcon sx={{ fontSize: 14 }} />, color: '#818cf8', bg: 'rgba(99,102,241,0.15)', label: 'Scheduled' },
    completed: { icon: <CheckIcon sx={{ fontSize: 14 }} />, color: '#2dd4bf', bg: 'rgba(20,184,166,0.15)', label: 'Completed' },
    cancelled: { icon: <CancelIcon sx={{ fontSize: 14 }} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', label: 'Cancelled' },
};

export default function AppointmentsPanel() {
    const [appointments, setAppointments] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [businessFilter, setBusinessFilter] = useState('all');
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const fetchAppointments = async () => {
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (businessFilter !== 'all') params.businessId = businessFilter;

            const res = await adminAPI.getAllAppointments(params);
            setAppointments(res.data.data);
        } catch (err) {
            console.error('Failed to load appointments', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBusinesses = async () => {
        try {
            const res = await businessAPI.getAll();
            setBusinesses(res.data.data);
        } catch (err) {
            console.error('Failed to load businesses', err);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchAppointments();
    }, [statusFilter, businessFilter]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await adminAPI.updateAppointmentStatus(id, status);
            setSnack({ open: true, message: `Appointment ${status}`, severity: 'success' });
            fetchAppointments();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Failed to update', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this appointment record?')) return;
        try {
            await adminAPI.deleteAppointment(id);
            setSnack({ open: true, message: 'Appointment deleted', severity: 'success' });
            fetchAppointments();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
        }
    };

    const filtered = appointments.filter(a => {
        const clientName = a.client?.name || '';
        const employeeName = a.employee?.name || '';
        const serviceName = a.service?.name || '';
        return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Appointment Management
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    View and manage all appointments across the system.
                </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search by client, employee, or service..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{
                        minWidth: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.04)',
                        },
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '12px', background: 'rgba(255,255,255,0.04)' } }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '12px', background: 'rgba(255,255,255,0.04)' } }}>
                    <InputLabel>Business</InputLabel>
                    <Select value={businessFilter} label="Business" onChange={(e) => setBusinessFilter(e.target.value)}>
                        <MenuItem value="all">All Businesses</MenuItem>
                        {businesses.map(b => (
                            <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Results Count */}
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Showing {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
            </Typography>

            {/* Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ '& th': { borderBottomColor: 'rgba(255,255,255,0.08)', fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                            <TableCell>Date & Time</TableCell>
                            <TableCell>Client</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Service</TableCell>
                            <TableCell>Business</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    <CalendarIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                                    <Typography>No appointments found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((a) => {
                                const statusInfo = statusConfig[a.status] || statusConfig.scheduled;
                                return (
                                    <TableRow key={a._id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderBottomColor: 'rgba(255,255,255,0.05)' } }}>
                                        <TableCell>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {a.startTime ? new Date(a.startTime).toLocaleDateString('en-GB') : '—'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {a.startTime
                                                        ? `${new Date(a.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} — ${new Date(a.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                                                        : ''}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 500 }}>{a.client?.name || '—'}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{a.client?.email || ''}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{a.employee?.name || '—'}</TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 500 }}>{a.service?.name || '—'}</Typography>
                                            {a.service?.durationMinutes && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{a.service.durationMinutes} min</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={a.businessId?.name || '—'}
                                                size="small"
                                                sx={{ borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={statusInfo.icon}
                                                label={statusInfo.label}
                                                size="small"
                                                sx={{
                                                    borderRadius: '8px',
                                                    background: statusInfo.bg,
                                                    color: statusInfo.color,
                                                    fontWeight: 600,
                                                    '& .MuiChip-icon': { color: 'inherit' },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {a.status === 'scheduled' && (
                                                <>
                                                    <Tooltip title="Mark Completed">
                                                        <IconButton size="small" onClick={() => handleUpdateStatus(a._id, 'completed')} sx={{ color: '#14b8a6', '&:hover': { background: 'rgba(20,184,166,0.15)' } }}>
                                                            <CheckIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Cancel">
                                                        <IconButton size="small" onClick={() => handleUpdateStatus(a._id, 'cancelled')} sx={{ color: '#fb923c', '&:hover': { background: 'rgba(251,146,60,0.15)' } }}>
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDelete(a._id)} sx={{ color: '#f43f5e', '&:hover': { background: 'rgba(244,63,94,0.15)' } }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Snackbar */}
            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: '12px' }}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
