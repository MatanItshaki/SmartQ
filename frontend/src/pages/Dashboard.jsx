import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Button, Box, CircularProgress, Card, CardContent, CardActions } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { appointmentAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentAPI.getMyAppointments();
        setAppointments(response.data.appointments);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentAPI.cancel(id);
      // Optimistic update or refresh
      setAppointments((prev) =>
        prev.map(apt => apt._id === id ? { ...apt, status: 'cancelled' } : apt)
      );
    } catch (err) {
      console.error("Failed to cancel", err);
      alert("Failed to cancel appointment");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Hello, {user?.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/book-appointment')}
        >
          Book New Appointment
        </Button>
      </Box>

      <Typography variant="h5" sx={{ mb: 2 }}>
        My Appointments
      </Typography>

      {appointments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            You have no upcoming appointments.
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/book-appointment')}>
            Book Now
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {appointments.map((apt) => (
            <Grid item xs={12} sm={6} md={4} key={apt._id}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {apt.service?.name}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {new Date(apt.startTime).toLocaleDateString('en-US')} at {new Date(apt.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="body2">
                    Business: {apt.businessId?.name}
                    <br />
                    Employee: {apt.employee?.name}
                  </Typography>
                  <Typography variant="body2">
                    Status: <span style={{ color: apt.status === 'cancelled' ? 'red' : 'green', fontWeight: 'bold' }}>{apt.status}</span>
                  </Typography>
                </CardContent>
                <CardActions>
                  {apt.status !== 'cancelled' && (
                    <Button size="small" color="error" onClick={() => handleCancel(apt._id)}>
                      Cancel
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )
      }
    </Container >
  );
}
