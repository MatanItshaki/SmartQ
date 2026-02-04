import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowBack } from '@mui/icons-material';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        className="fade-in"
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', md: '10rem' },
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          404
        </Typography>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            color: 'text.primary',
          }}
        >
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: '500px',
          }}
        >
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
            }}
          >
            Go Home
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

