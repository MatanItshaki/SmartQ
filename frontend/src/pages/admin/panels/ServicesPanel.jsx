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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    MiscellaneousServices as ServicesIcon,
} from '@mui/icons-material';
import { adminAPI, businessAPI, serviceAPI } from '../../../services/api';

export default function ServicesPanel() {
    const [services, setServices] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [businessFilter, setBusinessFilter] = useState('all');
    const [formData, setFormData] = useState({ business: '', name: '', description: '', durationMinutes: '', price: '', category: '' });
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const fetchServices = async () => {
        try {
            const res = await serviceAPI.getByBusiness('');
            // The existing service API uses params, calling getAllServices when no business is specified
            const allRes = await fetch('http://localhost:5000/api/services', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const allData = await allRes.json();
            setServices(allData.data || []);
        } catch (err) {
            console.error('Failed to load services', err);
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
        fetchServices();
        fetchBusinesses();
    }, []);

    const handleOpenDialog = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                business: service.business?._id || service.business || '',
                name: service.name || '',
                description: service.description || '',
                durationMinutes: service.durationMinutes || '',
                price: service.price || '',
                category: service.category || '',
            });
        } else {
            setEditingService(null);
            setFormData({ business: '', name: '', description: '', durationMinutes: '', price: '', category: '' });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                durationMinutes: Number(formData.durationMinutes),
                price: Number(formData.price),
            };

            if (editingService) {
                await adminAPI.updateService(editingService._id, payload);
                setSnack({ open: true, message: 'Service updated!', severity: 'success' });
            } else {
                await adminAPI.createService(payload);
                setSnack({ open: true, message: 'Service created!', severity: 'success' });
            }
            setDialogOpen(false);
            fetchServices();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this service?')) return;
        try {
            await adminAPI.deleteService(id);
            setSnack({ open: true, message: 'Service deleted', severity: 'success' });
            fetchServices();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
        }
    };

    const filtered = services.filter(s => {
        const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBusiness = businessFilter === 'all' ||
            (s.business?._id || s.business) === businessFilter;
        return matchesSearch && matchesBusiness;
    });

    const getBusinessName = (service) => {
        if (service.business?.name) return service.business.name;
        const found = businesses.find(b => b._id === service.business);
        return found?.name || '—';
    };

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
                        Service Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Create, edit, and manage all services across businesses.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        borderRadius: '12px',
                        px: 3,
                        py: 1.2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 600,
                        '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
                    }}
                >
                    Add Service
                </Button>
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search services..."
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
                <FormControl size="small" sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '12px', background: 'rgba(255,255,255,0.04)' } }}>
                    <InputLabel>Filter by Business</InputLabel>
                    <Select
                        value={businessFilter}
                        label="Filter by Business"
                        onChange={(e) => setBusinessFilter(e.target.value)}
                    >
                        <MenuItem value="all">All Businesses</MenuItem>
                        {businesses.map(b => (
                            <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                            <TableCell>Service Name</TableCell>
                            <TableCell>Business</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    <ServicesIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                                    <Typography>No services found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((s) => (
                                <TableRow key={s._id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderBottomColor: 'rgba(255,255,255,0.05)' } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ServicesIcon sx={{ color: '#fff', fontSize: 18 }} />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600 }}>{s.name}</Typography>
                                                {s.description && (
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {s.description.length > 50 ? s.description.substring(0, 50) + '...' : s.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={getBusinessName(s)} size="small" sx={{ borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }} />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{s.category || '—'}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{s.durationMinutes} min</TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600, color: '#14b8a6' }}>₪{s.price}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => handleOpenDialog(s)} sx={{ color: '#818cf8', '&:hover': { background: 'rgba(99,102,241,0.15)' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => handleDelete(s._id)} sx={{ color: '#f43f5e', '&:hover': { background: 'rgba(244,63,94,0.15)' } }}>
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

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                    {editingService ? 'Edit Service' : 'Create New Service'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Business</InputLabel>
                            <Select
                                value={formData.business}
                                label="Business"
                                onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                                disabled={!!editingService}
                            >
                                {businesses.map(b => (
                                    <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField label="Service Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth />
                        <TextField label="Description" multiline rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Duration (min)" type="number" required value={formData.durationMinutes} onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })} fullWidth />
                            <TextField label="Price (₪)" type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} fullWidth />
                        </Box>
                        <TextField label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!formData.business || !formData.name || !formData.durationMinutes || !formData.price}
                        sx={{ borderRadius: '12px', px: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' } }}
                    >
                        {editingService ? 'Save Changes' : 'Create'}
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
