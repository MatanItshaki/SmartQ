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

export default api;
