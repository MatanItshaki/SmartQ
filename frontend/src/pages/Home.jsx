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
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      title: 'Easy Scheduling',
      description: 'Book appointments in seconds with our intuitive interface',
      color: '#6366f1',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description: 'Real-time availability and instant confirmations',
      color: '#ec4899',
    },
    {
      icon: <Notifications sx={{ fontSize: 40 }} />,
      title: 'Smart Reminders',
      description: 'Never miss an appointment with automated notifications',
      color: '#14b8a6',
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Manage Staff',
      description: 'Coordinate your team and resources effortlessly',
      color: '#f59e0b',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Analytics',
      description: 'Track performance and grow your business',
      color: '#8b5cf6',
    },
    {
      icon: <Schedule sx={{ fontSize: 40 }} />,
      title: '24/7 Access',
      description: 'Book and manage appointments anytime, anywhere',
      color: '#06b6d4',
    },
  ];

  return (
    <Box sx={{ minHeight: '90vh' }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          className="fade-in"
          sx={{
            textAlign: 'center',
            pt: { xs: 6, md: 10 },
            pb: { xs: 6, md: 8 },
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
              fontWeight: 800,
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #00f2fe 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'fadeIn 0.8s ease-in',
            }}
          >
            Welcome to SmartQ
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              mb: 5,
              maxWidth: '700px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              lineHeight: 1.6,
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
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Why Choose SmartQ?
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    animation: `fadeIn 0.6s ease-in ${index * 0.1}s backwards`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                        color: feature.color,
                        mb: 3,
                        mx: 'auto',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        lineHeight: 1.7,
                      }}
                    >
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
            py: 10,
            px: 4,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mb: 6,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
            }}
          >
            Ready to Transform Your Business?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4,
              fontSize: '1.1rem',
              maxWidth: '600px',
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
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.2rem',
              }}
            >
              Start Free Today
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}

