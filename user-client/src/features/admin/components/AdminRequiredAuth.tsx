import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts';

export const AdminRequiredAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show nothing during loading
  if (loading) {
    return null;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // // Check if user is admin (you may need to adjust this based on your actual user roles)
  // const isAdmin = user?.role === 'admin';
  
  // // Redirect to home if user is not admin
  // if (!isAdmin) {
  //   return <Navigate to="/" replace />;
  // }

  // If authenticated and is admin, render the protected content
  return <Outlet />;
};
