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
    Search as SearchIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { adminAPI, businessAPI } from '../../../services/api';

export default function BusinessesPanel() {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', niche: '', address: '', phone: '' });
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const fetchBusinesses = async () => {
        try {
            const res = await businessAPI.getAll();
            setBusinesses(res.data.data);
        } catch (err) {
            console.error('Failed to load businesses', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBusinesses(); }, []);

    const handleOpenDialog = (business = null) => {
        if (business) {
            setEditingBusiness(business);
            setFormData({ name: business.name, niche: business.niche || '', address: business.address || '', phone: business.phone || '' });
        } else {
            setEditingBusiness(null);
            setFormData({ name: '', niche: '', address: '', phone: '' });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingBusiness) {
                await adminAPI.updateBusiness(editingBusiness._id, formData);
                setSnack({ open: true, message: 'Business updated successfully!', severity: 'success' });
            } else {
                await adminAPI.createBusiness(formData);
                setSnack({ open: true, message: 'Business created successfully!', severity: 'success' });
            }
            setDialogOpen(false);
            fetchBusinesses();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) return;
        try {
            await adminAPI.deleteBusiness(id);
            setSnack({ open: true, message: 'Business deleted', severity: 'success' });
            fetchBusinesses();
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
        }
    };

    const filtered = businesses.filter(b =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.niche?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        Business Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Create, edit, and manage all businesses on the platform.
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
                    Add Business
                </Button>
            </Box>

            {/* Search */}
            <TextField
                placeholder="Search businesses..."
                size="small"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                    mb: 3,
                    maxWidth: 400,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)',
                    },
                }}
            />

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
                            <TableCell>Business Name</TableCell>
                            <TableCell>Niche</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    <BusinessIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                                    <Typography>No businesses found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((b) => (
                                <TableRow key={b._id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderBottomColor: 'rgba(255,255,255,0.05)' } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <BusinessIcon sx={{ color: '#fff', fontSize: 18 }} />
                                            </Box>
                                            <Typography sx={{ fontWeight: 600 }}>{b.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {b.niche ? <Chip label={b.niche} size="small" sx={{ borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }} /> : '—'}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{b.address || '—'}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{b.phone || '—'}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => handleOpenDialog(b)} sx={{ color: '#818cf8', '&:hover': { background: 'rgba(99,102,241,0.15)' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => handleDelete(b._id)} sx={{ color: '#f43f5e', '&:hover': { background: 'rgba(244,63,94,0.15)' } }}>
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
                    {editingBusiness ? 'Edit Business' : 'Create New Business'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField label="Business Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth />
                        <TextField label="Niche / Category" value={formData.niche} onChange={(e) => setFormData({ ...formData, niche: e.target.value })} fullWidth />
                        <TextField label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} fullWidth />
                        <TextField label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!formData.name.trim()}
                        sx={{ borderRadius: '12px', px: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' } }}
                    >
                        {editingBusiness ? 'Save Changes' : 'Create'}
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
