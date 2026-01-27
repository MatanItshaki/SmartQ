import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { Container, Typography, Stepper, Step, StepLabel, Button, Box, Paper, Grid, Card, CardActionArea, CardContent, FormControl, InputLabel, Select, MenuItem, TextField, Alert } from '@mui/material';
import { businessAPI, serviceAPI, appointmentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const steps = ['Select Business', 'Select Service', 'Select Date & Time', 'Confirm'];

export default function BookAppointment() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [businesses, setBusinesses] = useState([]);
    const [services, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedTime, setSelectedTime] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load businesses on mount
        const loadBusinesses = async () => {
            try {
                const res = await businessAPI.getAll();
                console.log("Business API Response:", res);
                setBusinesses(res.data.data || []);
            } catch (err) {
                console.error(err);
                setError("Error loading businesses");
            }
        };
        loadBusinesses();
    }, []);

    useEffect(() => {
        if (selectedBusiness) {
            const loadServices = async () => {
                try {
                    // Note: Adjust param name based on backend. Assuming query param ?businessId=...
                    const res = await serviceAPI.getByBusiness(selectedBusiness._id);
                    setServices(res.data.data);
                } catch (err) {
                    console.error(err);
                    // Fallback empty if fail
                    setServices([]);
                }
            };
            loadServices();
        }
    }, [selectedBusiness]);

    // Fetch employees when business is selected
    useEffect(() => {
        if (selectedBusiness) {
            const loadEmployees = async () => {
                try {
                    const res = await businessAPI.getEmployees(selectedBusiness._id);
                    // Use res.data.data because that's our backend format
                    const emps = res.data.data || [];
                    setEmployees(emps);
                } catch (err) {
                    console.error("Error loading employees", err);
                }
            };
            loadEmployees();
        }
    }, [selectedBusiness]);

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            // Submit booking
            setLoading(true);
            try {
                // Construct startTime. selectedDate is now a dayjs object
                const dateStr = selectedDate.format('YYYY-MM-DD');
                const startDateTime = new Date(`${dateStr}T${selectedTime}`);
                // Simple end time calculation (add duration)
                const endTime = new Date(startDateTime.getTime() + selectedService.durationMinutes * 60000);

                await appointmentAPI.book({

                    businessId: selectedBusiness._id,
                    serviceId: selectedService._id,
                    employeeId: employees.length > 0 ? employees[0]._id : undefined,
                    startTime: startDateTime.toISOString(),
                    endTime: endTime.toISOString(),
                    notes: "Booked via Web App"
                });
                navigate('/dashboard');
            } catch (err) {
                setError(err.response?.data?.message || "Booking failed");
                setLoading(false);
            }
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        {businesses.map((biz) => (
                            <Grid item xs={12} sm={6} key={biz._id}>
                                <Card
                                    variant={selectedBusiness?._id === biz._id ? "outlined" : "elevation"}
                                    sx={{ border: selectedBusiness?._id === biz._id ? '2px solid primary.main' : undefined }}
                                >
                                    <CardActionArea onClick={() => setSelectedBusiness(biz)}>
                                        <CardContent>
                                            <Typography variant="h6">{biz.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">{biz.niche}</Typography>
                                            <Typography variant="body2">{biz.address}</Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={2}>
                        {services.map((svc) => (
                            <Grid item xs={12} sm={6} key={svc._id}>
                                <Card
                                    variant={selectedService?._id === svc._id ? "outlined" : "elevation"}
                                    sx={{ border: selectedService?._id === svc._id ? '2px solid primary.main' : undefined }}
                                >
                                    <CardActionArea onClick={() => setSelectedService(svc)}>
                                        <CardContent>
                                            <Typography variant="h6">{svc.name}</Typography>
                                            <Typography variant="body2">{svc.durationMinutes} minutes | ₪{svc.price}</Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                        {services.length === 0 && <Typography>No services found for this business.</Typography>}
                    </Grid>
                );
            case 2:
                return (

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400, mx: 'auto', alignItems: 'center' }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateCalendar
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                disablePast
                            />
                        </LocalizationProvider>
                        <TextField
                            type="time"
                            label="Time"
                            InputLabelProps={{ shrink: true }}
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                        />
                    </Box>
                );
            case 3:
                return (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Booking Summary</Typography>
                        <Typography>Business: {selectedBusiness?.name}</Typography>
                        <Typography>Service: {selectedService?.name}</Typography>
                        <Typography>Price: ₪{selectedService?.price}</Typography>
                        <Typography>Date: {selectedDate.format('DD/MM/YYYY')}</Typography>
                        <Typography>Time: {selectedTime}</Typography>
                    </Paper>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Book New Appointment</Typography>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 4 }}>
                {getStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={
                        (activeStep === 0 && !selectedBusiness) ||
                        (activeStep === 1 && !selectedService) ||
                        (activeStep === 2 && (!selectedDate || !selectedTime)) ||
                        loading
                    }
                >
                    {activeStep === steps.length - 1 ? (loading ? 'Booking...' : 'Confirm') : 'Next'}
                </Button>
            </Box>
        </Container>
    );
}
