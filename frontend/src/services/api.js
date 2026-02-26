import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if backend runs on a different port/URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors (like unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem('token');
      // Optional: Redirect to login or dispatch a logout action
      // window.location.href = '/login'; 
      // dispatch(logout()); // If we had access to store dispatch here
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const businessAPI = {
  getAll: () => api.get('/business'),
  getById: (id) => api.get(`/business/${id}`),
  getEmployees: (businessId) => api.get(`/business/${businessId}/employees`), // Assuming this route exists or I need to find the right one
};

export const serviceAPI = {
  getByBusiness: (businessId) => api.get(`/services`, { params: { business: businessId } }),
};

export const appointmentAPI = {
  book: (appointmentData) => api.post('/appointments', appointmentData),
  getMyAppointments: () => api.get('/appointments/me'),
  cancel: (id) => api.patch(`/appointments/${id}/status`, { status: "cancelled" }),
};

// Admin-specific API endpoints
export const adminAPI = {
  // Dashboard stats
  getStats: () => api.get('/admin/stats'),

  // User management
  getAllUsers: (role) => api.get('/admin/users', { params: role ? { role } : {} }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Business management (already exists via businessAPI but admin-specific routes)
  createBusiness: (data) => api.post('/business', data),
  updateBusiness: (id, data) => api.patch(`/business/${id}`, data),
  deleteBusiness: (id) => api.delete(`/business/${id}`),

  // Service management
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),

  // Appointment management
  getAllAppointments: (params) => api.get('/admin/appointments', { params }),
  updateAppointmentStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),

  // Employee / Business Owner registration
  registerEmployee: (data) => api.post('/auth/register-employee', data),
  registerBusinessOwner: (data) => api.post('/auth/register-business', data),
};

// Business Owner API endpoints
export const ownerAPI = {
  // Dashboard stats
  getStats: () => api.get('/owner/stats'),

  // Business info
  getMyBusiness: () => api.get('/owner/my-business'),
  updateMyBusiness: (data) => api.patch('/owner/my-business', data),

  // Employees
  getEmployees: () => api.get('/owner/employees'),
  removeEmployee: (id) => api.delete(`/owner/employees/${id}`),

  // Services
  getServices: () => api.get('/owner/services'),
  createService: (data) => api.post('/owner/services', data),
  updateService: (id, data) => api.put(`/owner/services/${id}`, data),
  deleteService: (id) => api.delete(`/owner/services/${id}`),

  // Appointments
  getAppointments: (params) => api.get('/owner/appointments', { params }),
  updateAppointmentStatus: (id, status) => api.patch(`/owner/appointments/${id}/status`, { status }),
};

export default api;
