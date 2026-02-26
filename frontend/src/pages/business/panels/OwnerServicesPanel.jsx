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
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MiscellaneousServices as ServicesIcon,
} from '@mui/icons-material';
import { ownerAPI } from '../../../services/api';

export default function OwnerServicesPanel() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', durationMinutes: '', price: '', category: '' });
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const fetchServices = async () => {
        try {
            const res = await ownerAPI.getServices();
            setServices(res.data.data || []);
        } catch (err) {
            console.error('Failed to load services', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleOpenDialog = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name || '',
                description: service.description || '',
                durationMinutes: service.durationMinutes || '',
                price: service.price || '',
                category: service.category || '',
            });
        } else {
            setEditingService(null);
            setFormData({ name: '', description: '', durationMinutes: '', price: '', category: '' });
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
                await ownerAPI.updateService(editingService._id, payload);
                setSnack({ open: true, message: 'Service updated!', severity: 'success' });
            } else {
                await ownerAPI.createService(payload);
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
            await ownerAPI.deleteService(id);
            setSnack({ open: true, message: 'Service deleted', severity: 'success' });
            fetchServices();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
                        Your Services
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Manage the services your business offers to clients.
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
                        background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                        fontWeight: 600,
                        '&:hover': { background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)' },
                    }}
                >
                    Add Service
                </Button>
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
                            <TableCell>Category</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {services.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    <ServicesIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                                    <Typography>No services yet</Typography>
                                    <Typography variant="caption">Click "Add Service" to create your first service.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            services.map((s) => (
                                <TableRow key={s._id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderBottomColor: 'rgba(255,255,255,0.05)' } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ServicesIcon sx={{ color: '#fff', fontSize: 18 }} />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600 }}>{s.name}</Typography>
                                                {s.description && (
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {s.description.length > 60 ? s.description.substring(0, 60) + '...' : s.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {s.category ? <Chip label={s.category} size="small" sx={{ borderRadius: '8px', background: 'rgba(20,184,166,0.15)', color: '#2dd4bf' }} /> : '—'}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{s.durationMinutes} min</TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600, color: '#14b8a6' }}>₪{s.price}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => handleOpenDialog(s)} sx={{ color: '#06b6d4', '&:hover': { background: 'rgba(6,182,212,0.15)' } }}>
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
                        disabled={!formData.name || !formData.durationMinutes || !formData.price}
                        sx={{ borderRadius: '12px', px: 3, background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)', '&:hover': { background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)' } }}
                    >
                        {editingService ? 'Save Changes' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: '12px' }}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
