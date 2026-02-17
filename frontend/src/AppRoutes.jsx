import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import BusinessDashboard from './pages/business/BusinessDashboard';
import Layout from './components/Layout';
import useAuthStore from './store/useAuthStore';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin-only Route Wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Business Owner Route Wrapper
const BusinessRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'business') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Smart Dashboard Redirect — routes each role to their own dashboard
const SmartDashboardRedirect = () => {
  const { user } = useAuthStore();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'business') {
    return <Navigate to="/business" replace />;
  }

  return <Dashboard />;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SmartDashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/business"
            element={
              <BusinessRoute>
                <BusinessDashboard />
              </BusinessRoute>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
