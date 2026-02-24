import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  CalendarMonth,
  Speed,
  Notifications,
  People,
  TrendingUp,
  Schedule
} from '@mui/icons-material';
import useAuthStore from '../store/useAuthStore';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: <CalendarMonth sx={{ fontSize: 36, color: '#5c6bc0' }} />,
      title: 'Easy Scheduling',
      description: 'Book appointments in seconds with our intuitive interface',
    },
    {
      icon: <Speed sx={{ fontSize: 36, color: '#e91e63' }} />,
      title: 'Lightning Fast',
      description: 'Real-time availability and instant confirmations',
    },
    {
      icon: <Notifications sx={{ fontSize: 36, color: '#26a69a' }} />,
      title: 'Smart Reminders',
      description: 'Never miss an appointment with automated notifications',
    },
    {
      icon: <People sx={{ fontSize: 36, color: '#ffa726' }} />,
      title: 'Manage Staff',
      description: 'Coordinate your team and resources effortlessly',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 36, color: '#7e57c2' }} />,
      title: 'Analytics',
      description: 'Track performance and grow your business',
    },
    {
      icon: <Schedule sx={{ fontSize: 36, color: '#29b6f6' }} />,
      title: '24/7 Access',
      description: 'Book and manage appointments anytime, anywhere',
    },
  ];

  return (
    <Box sx={{ minHeight: '90vh' }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            pt: { xs: 6, md: 10 },
            pb: { xs: 6, md: 8 },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: '#e0e0e0',
            }}
          >
            Welcome to SmartQ
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            The intelligent appointment booking system that transforms how you manage your business
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 6 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 600,
            }}
          >
            Why Choose SmartQ?
          </Typography>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', p: 1 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 3,
            mb: 4,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Ready to Transform Your Business?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 3,
              maxWidth: '500px',
              mx: 'auto',
            }}
          >
            Join thousands of businesses already using SmartQ to streamline their appointment scheduling
          </Typography>
          {!isAuthenticated && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
            >
              Start Free Today
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}
