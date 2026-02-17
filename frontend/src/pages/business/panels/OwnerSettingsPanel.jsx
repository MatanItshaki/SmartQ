import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Grid,
} from '@mui/material';
import {
    Save as SaveIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { ownerAPI } from '../../../services/api';

export default function OwnerSettingsPanel() {
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', niche: '', address: '', phone: '' });
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await ownerAPI.getMyBusiness();
                const biz = res.data.data;
                setBusiness(biz);
                setFormData({
                    name: biz.name || '',
                    niche: biz.niche || '',
                    address: biz.address || '',
                    phone: biz.phone || '',
                });
            } catch (err) {
                console.error('Failed to load business info', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await ownerAPI.updateMyBusiness(formData);
            setSnack({ open: true, message: 'Business info updated!', severity: 'success' });
        } catch (err) {
            setSnack({ open: true, message: err.response?.data?.message || 'Update failed', severity: 'error' });
        } finally {
            setSaving(false);
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
                <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
                    Business Settings
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Update your business information visible to clients.
                </Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    maxWidth: 600,
                }}
            >
                {/* Business Icon Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <BusinessIcon sx={{ color: '#fff', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {business?.name || 'Your Business'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            ID: {business?._id || '—'}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            label="Business Name"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Niche / Category"
                            fullWidth
                            value={formData.niche}
                            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone"
                            fullWidth
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Address"
                            fullWidth
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={!formData.name.trim() || saving}
                        sx={{
                            borderRadius: '12px',
                            px: 4,
                            py: 1.2,
                            background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                            fontWeight: 600,
                            '&:hover': { background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)' },
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Paper>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: '12px' }}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
