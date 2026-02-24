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
} from '@mui/material';
import {
    Delete as DeleteIcon,
    People as PeopleIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material';
import { ownerAPI } from '../../../services/api';

export default function OwnerEmployeesPanel() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const fetchEmployees = async () => {
        try {
            const res = await ownerAPI.getEmployees();
            setEmployees(res.data.data || []);
        } catch (err) {
            console.error('Failed to load employees', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleRemove = async (id) => {
        if (!window.confirm('Remove this employee from your business? This cannot be undone.')) return;
        try {
            await ownerAPI.removeEmployee(id);
            setSnack({ open: true, message: 'Employee removed', severity: 'success' });
            fetchEmployees();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Failed to remove', severity: 'error' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress sx={{ color: '#14b8a6' }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Your Employees
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    View and manage employees working at your business. Contact your admin to add new employees.
                </Typography>
            </Box>

            {/* Summary */}
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: '16px',
                    background: 'rgba(20,184,166,0.08)',
                    border: '1px solid rgba(20,184,166,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <PeopleIcon sx={{ color: '#14b8a6' }} />
                <Typography sx={{ fontWeight: 600 }}>
                    {employees.length} employee{employees.length !== 1 ? 's' : ''} registered
                </Typography>
            </Paper>

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
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Joined</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    <PeopleIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                                    <Typography>No employees found</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Ask your system admin to register employees for your business.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.map((emp) => (
                                <TableRow key={emp._id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderBottomColor: 'rgba(255,255,255,0.05)' } }}>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600 }}>{emp.name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{emp.email}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{emp.phone || '—'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={emp.isActive !== false ? 'Active' : 'Inactive'}
                                            size="small"
                                            sx={{
                                                borderRadius: '8px',
                                                background: emp.isActive !== false ? 'rgba(20,184,166,0.15)' : 'rgba(244,63,94,0.15)',
                                                color: emp.isActive !== false ? '#2dd4bf' : '#f43f5e',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                        {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Remove Employee">
                                            <IconButton size="small" onClick={() => handleRemove(emp._id)} sx={{ color: '#f43f5e', '&:hover': { background: 'rgba(244,63,94,0.15)' } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: '12px' }}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
