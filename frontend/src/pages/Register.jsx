import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography, Container, Alert, Paper } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { PersonAdd, Person, Email, Lock, Phone } from '@mui/icons-material';

const validationSchema = Yup.object({
    name: Yup.string().required('Full Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    phone: Yup.string().matches(/^[0-9]+$/, "Phone number must contain digits only").min(9, 'Phone number too short').max(15, 'Phone number too long').required('Phone number is required'),
});

export default function Register() {
    const { register, error, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const success = await register(values);
            if (success) {
                navigate('/dashboard');
            }
        },
    });

    return (
        <Container component="main" maxWidth="xs">
            <Box
                className="fade-in"
                sx={{
                    minHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 4,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        p: 5,
                        borderRadius: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                            }}
                        >
                            <PersonAdd sx={{ fontSize: 32, color: 'primary.main' }} />
                        </Box>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                            }}
                        >
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign up to get started with SmartQ
                        </Typography>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: '12px',
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Full Name"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            InputProps={{
                                startAdornment: (
                                    <Person sx={{ color: 'text.secondary', mr: 1 }} />
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            InputProps={{
                                startAdornment: (
                                    <Email sx={{ color: 'text.secondary', mr: 1 }} />
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="phone"
                            label="Phone Number"
                            name="phone"
                            autoComplete="tel"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                            helperText={formik.touched.phone && formik.errors.phone}
                            InputProps={{
                                startAdornment: (
                                    <Phone sx={{ color: 'text.secondary', mr: 1 }} />
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            InputProps={{
                                startAdornment: (
                                    <Lock sx={{ color: 'text.secondary', mr: 1 }} />
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            sx={{
                                py: 1.5,
                                mb: 3,
                                fontSize: '1.1rem',
                            }}
                        >
                            {isLoading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    style={{
                                        color: '#818cf8',
                                        fontWeight: 600,
                                    }}
                                >
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

