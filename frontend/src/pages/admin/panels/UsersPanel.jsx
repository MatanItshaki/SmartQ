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
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Chip,
    Tooltip,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Search as SearchIcon,
    People as PeopleIcon,
    PersonAdd as PersonAddIcon,
    Block as BlockIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { adminAPI, businessAPI } from '../../../services/api';

const roleColors = {
    client: { bg: 'rgba(236,72,153,0.15)', color: '#f472b6' },
    employee: { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
    business: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    admin: { bg: 'rgba(20,184,166,0.15)', color: '#2dd4bf' },
};

export default function UsersPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('employee'); // 'employee' | 'business'
    const [businesses, setBusinesses] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', businessId: '' });
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const fetchUsers = async () => {
        try {
            const res = await adminAPI.getAllUsers();
            setUsers(res.data.data);
        } catch (err) {
            console.error('Failed to load users', err);
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
        fetchUsers();
        fetchBusinesses();
    }, []);

    const handleOpenDialog = (type) => {
        setDialogType(type);
        setFormData({ name: '', email: '', password: '', phone: '', businessId: '' });
        setDialogOpen(true);
    };

    const handleRegister = async () => {
        try {
            if (dialogType === 'employee') {
                await adminAPI.registerEmployee(formData);
                setSnack({ open: true, message: 'Employee registered successfully!', severity: 'success' });
            } else {
                await adminAPI.registerBusinessOwner(formData);
                setSnack({ open: true, message: 'Business owner registered successfully!', severity: 'success' });
            }
            setDialogOpen(false);
            fetchUsers();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Registration failed', severity: 'error' });
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await adminAPI.toggleUserStatus(id);
            setSnack({ open: true, message: res.data.message, severity: 'success' });
            fetchUsers();
        } catch (err) {
            setSnack({ open: true, message: 'Failed to update status', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await adminAPI.deleteUser(id);
            setSnack({ open: true, message: 'User deleted', severity: 'success' });
            fetchUsers();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
        }
    };

    const filtered = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
                        User Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Manage all users, register employees, and create business owners.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        onClick={() => handleOpenDialog('employee')}
                        sx={{
                            borderRadius: '12px',
                            px: 2.5,
                            borderColor: 'rgba(99,102,241,0.5)',
                            color: '#818cf8',
                            '&:hover': { borderColor: '#667eea', background: 'rgba(99,102,241,0.1)' },
                        }}
                    >
                        Add Employee
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        onClick={() => handleOpenDialog('business')}
                        sx={{
                            borderRadius: '12px',
                            px: 2.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
                        }}
                    >
                        Add Business Owner
                    </Button>
                </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search users..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{
                        minWidth: 300,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.04)',
                        },
                    }}
                />
                <Tabs
                    value={roleFilter}
                    onChange={(_, val) => setRoleFilter(val)}
                    sx={{
                        minHeight: 40,
                        '& .MuiTab-root': {
                            minHeight: 40,
                            borderRadius: '10px',
                            textTransform: 'none',
                            mx: 0.5,
                            fontSize: '0.85rem',
                        },
                        '& .Mui-selected': {
                            background: 'rgba(99,102,241,0.15)',
                        },
                    }}
                >
                    <Tab label={`All (${users.length})`} value="all" />
                    <Tab label={`Clients (${users.filter(u => u.role === 'client').length})`} value="client" />
                    <Tab label={`Employees (${users.filter(u => u.role === 'employee').length})`} value="employee" />
                    <Tab label={`Owners (${users.filter(u => u.role === 'business').length})`} value="business" />
                </Tabs>
            </Box>

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
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Joined</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    <PeopleIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                                    <Typography>No users found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((u) => (
                                <TableRow key={u._id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderBottomColor: 'rgba(255,255,255,0.05)' } }}>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{u.email}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{u.phone || '—'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={u.role}
                                            size="small"
                                            sx={{
                                                borderRadius: '8px',
                                                background: roleColors[u.role]?.bg || 'rgba(255,255,255,0.1)',
                                                color: roleColors[u.role]?.color || '#fff',
                                                fontWeight: 600,
                                                textTransform: 'capitalize',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={u.isActive ? <CheckIcon sx={{ fontSize: 14 }} /> : <BlockIcon sx={{ fontSize: 14 }} />}
                                            label={u.isActive ? 'Active' : 'Inactive'}
                                            size="small"
                                            sx={{
                                                borderRadius: '8px',
                                                background: u.isActive ? 'rgba(20,184,166,0.15)' : 'rgba(244,63,94,0.15)',
                                                color: u.isActive ? '#2dd4bf' : '#f43f5e',
                                                fontWeight: 600,
                                                '& .MuiChip-icon': { color: 'inherit' },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={u.isActive ? 'Deactivate' : 'Activate'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleStatus(u._id)}
                                                sx={{ color: u.isActive ? '#fb923c' : '#14b8a6', '&:hover': { background: u.isActive ? 'rgba(251,146,60,0.15)' : 'rgba(20,184,166,0.15)' } }}
                                            >
                                                {u.isActive ? <BlockIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                        {u.role !== 'admin' && (
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDelete(u._id)} sx={{ color: '#f43f5e', '&:hover': { background: 'rgba(244,63,94,0.15)' } }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Register Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                    {dialogType === 'employee' ? 'Register New Employee' : 'Register Business Owner'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField label="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth />
                        <TextField label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth />
                        <TextField label="Password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} fullWidth />
                        <TextField label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
                        <FormControl fullWidth required>
                            <InputLabel>Business</InputLabel>
                            <Select
                                value={formData.businessId}
                                label="Business"
                                onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                            >
                                {businesses.map(b => (
                                    <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleRegister}
                        disabled={!formData.name || !formData.email || !formData.password || !formData.businessId}
                        sx={{ borderRadius: '12px', px: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' } }}
                    >
                        Register
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: '12px' }}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
